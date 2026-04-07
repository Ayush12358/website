type BlogPost = {
  title: string;
  filename: string;
  content: string;
  date: string;
};

const parsePost = (filename: string, content: string): BlogPost => {
  let date: string | null = null;
  let markdown = content;

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const dateMatch = frontmatter.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      date = dateMatch[1];
    }
    markdown = frontmatterMatch[2];
  }

  let title = filename.replace(/\.md$/, "");
  const firstLine = markdown.split("\n")[0];
  if (firstLine.startsWith("#")) {
    title = firstLine.replace(/^#+\s*/, "");
  }

  return {
    title,
    filename,
    content: markdown,
    date: date || filename.replace(/\.md$/, ""),
  };
};

const findBlogDirectory = async (): Promise<string | null> => {
  const urlCandidates = [
    new URL("../public/blog/", import.meta.url).pathname,
    new URL("../../public/blog/", import.meta.url).pathname,
  ];

  const cwdCandidates = [
    `${process.cwd()}/public/blog`,
    `${process.cwd()}/blog`,
    `${process.cwd()}/dist/blog`,
  ];

  const candidates = [...new Set([...urlCandidates, ...cwdCandidates])];

  for (const candidate of candidates) {
    try {
      const files = [...new Bun.Glob("*.md").scanSync(candidate)];
      if (files.length > 0) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
};

export default {
  async fetch() {
    try {
      const blogDir = await findBlogDirectory();

      if (!blogDir) {
        return Response.json({ error: "Blog directory not found" }, { status: 404 });
      }

      const files = [...new Bun.Glob("*.md").scanSync(blogDir)];
      const posts = await Promise.all(
        files.map(async filename => {
          const content = await Bun.file(`${blogDir}/${filename}`).text();
          return parsePost(filename, content);
        })
      );

      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return Response.json(posts);
    } catch (error) {
      return Response.json(
        {
          error: "Failed to read blog posts",
          details: String(error),
        },
        { status: 500 }
      );
    }
  },
};