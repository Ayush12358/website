import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    "/api/blog": async req => {
      try {
        const blogDir = new URL("../public/blog/", import.meta.url).pathname;
        const files = [...new Bun.Glob("*.md").scanSync(blogDir)];

        const posts = await Promise.all(
          files.map(async file => {
            const filePath = `${blogDir}${file}`;
            const content = await Bun.file(filePath).text();

            // Parse frontmatter for date
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

            // Extract title from first line if it's a markdown heading
            let title = file.replace(/\.md$/, "");
            const firstLine = markdown.split("\n")[0];
            if (firstLine.startsWith("#")) {
              title = firstLine.replace(/^#+\s*/, "");
            }

            return {
              title,
              filename: file,
              content: markdown,
              date: date || file.replace(/\.md$/, ""),
            };
          })
        );

        // Sort by date descending
        posts.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });

        return Response.json(posts);
      } catch (error) {
        console.error("Error reading blog posts:", error);
        return Response.json({ error: "Failed to read blog posts" }, { status: 500 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
