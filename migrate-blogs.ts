#!/usr/bin/env bun

import { createBlogPost, initializeDatabase, getBlogPostByFilename } from "./api/db";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const parsePost = (
  filename: string,
  content: string
): { title: string; date: string; markdown: string } => {
  let date = "2026-04-01";
  let markdown = content;

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const markdownContent = frontmatterMatch[2];
    if (frontmatter && markdownContent) {
      const dateMatch = frontmatter.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const dateVal = dateMatch[1];
        if (dateVal) {
          date = dateVal;
        }
      }
      markdown = markdownContent;
    }
  }

  let title = filename.replace(/\.md$/, "");
  const firstLine = markdown.split("\n")[0];
  if (firstLine && firstLine.startsWith("#")) {
    title = firstLine.replace(/^#+\s*/, "");
  }

  return { title, date, markdown };
};

const migrateBlogs = async () => {
  try {
    console.log("🚀 Starting blog migration to Neon...");

    // Initialize database
    await initializeDatabase();
    console.log("✅ Database initialized");

    // Read blog files
    const blogDir = join(process.cwd(), "public", "blog");
    const files = await readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith(".md"));

    console.log(`📁 Found ${mdFiles.length} blog posts`);

    // Migrate each blog post
    for (const filename of mdFiles) {
      try {
        const filePath = join(blogDir, filename);
        const fileContent = await readFile(filePath, "utf-8");
        const { title, date, markdown } = parsePost(filename, fileContent);

        // Check if post already exists
        const existing = await getBlogPostByFilename(filename);
        if (!existing) {
          await createBlogPost(title, filename, markdown, date);
          console.log(`✅ Migrated: ${filename}`);
        } else {
          console.log(`⏭️  Skipped (already exists): ${filename}`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate ${filename}:`, error);
      }
    }

    console.log("✨ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateBlogs();
