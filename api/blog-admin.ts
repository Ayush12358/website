import { 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  initializeDatabase 
} from "./db";

const BLOG_PASSWORD = process.env.BLOG_PASSWORD || "";

const verifyPassword = (password: string): boolean => {
  return password === BLOG_PASSWORD;
};

export default {
  async fetch(request: Request) {
    try {
      await initializeDatabase();

      const method = request.method;
      const url = new URL(request.url);

      // Check password in Authorization header
      const authHeader = request.headers.get("Authorization");
      const password = authHeader?.replace("Bearer ", "") || "";

      if (!verifyPassword(password)) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (method === "POST") {
        // Create new blog post
        const body = await request.json();
        const { title, filename, content, date } = body;

        if (!title || !filename || !content || !date) {
          return Response.json(
            { error: "Missing required fields: title, filename, content, date" },
            { status: 400 }
          );
        }

        const post = await createBlogPost(title, filename, content, date);
        return Response.json(post);
      } else if (method === "PUT") {
        // Update blog post
        const body = await request.json();
        const { filename, title, content, date } = body;

        if (!filename || !title || !content || !date) {
          return Response.json(
            { error: "Missing required fields: filename, title, content, date" },
            { status: 400 }
          );
        }

        const post = await updateBlogPost(filename, title, content, date);
        return Response.json(post);
      } else if (method === "DELETE") {
        // Delete blog post
        const body = await request.json();
        const { filename } = body;

        if (!filename) {
          return Response.json(
            { error: "Missing required field: filename" },
            { status: 400 }
          );
        }

        const deleted = await deleteBlogPost(filename);
        if (!deleted) {
          return Response.json(
            { error: "Blog post not found" },
            { status: 404 }
          );
        }

        return Response.json({ success: true, filename });
      } else {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }
    } catch (error) {
      console.error("Admin API error:", error);
      return Response.json(
        {
          error: "Failed to process request",
          details: String(error),
        },
        { status: 500 }
      );
    }
  },
};
