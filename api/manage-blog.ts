import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllBlogPostsAdmin,
  initializeDatabase,
} from "./db";

type BlogManagementRequest = {
  action: "create" | "update" | "delete" | "list";
  password: string;
  title?: string;
  filename?: string;
  content?: string;
  date?: string;
  is_public?: boolean;
};

const verifyPassword = (password: string): boolean => {
  const correctPassword = process.env.BLOG_PASSWORD;
  if (!correctPassword) {
    console.error("BLOG_PASSWORD environment variable not set");
    return false;
  }
  return password === correctPassword;
};

export default {
  async fetch(request: Request) {
    if (request.method === "POST") {
      try {
        await initializeDatabase();

        const data: BlogManagementRequest = await request.json();

        if (!verifyPassword(data.password)) {
          return Response.json(
            { error: "Invalid password" },
            { status: 401 }
          );
        }

        switch (data.action) {
          case "list":
            const allPosts = await getAllBlogPostsAdmin();
            return Response.json(allPosts);

          case "create":
            if (!data.title || !data.filename || !data.content || !data.date) {
              return Response.json(
                { error: "Missing required fields: title, filename, content, date" },
                { status: 400 }
              );
            }
            const newPost = await createBlogPost(
              data.title,
              data.filename,
              data.content,
              data.date,
              data.is_public ?? true
            );
            return Response.json(newPost, { status: 201 });

          case "update":
            if (!data.filename || !data.title || !data.content || !data.date) {
              return Response.json(
                { error: "Missing required fields: filename, title, content, date" },
                { status: 400 }
              );
            }
            const updatedPost = await updateBlogPost(
              data.filename,
              data.title,
              data.content,
              data.date,
              data.is_public ?? true
            );
            return Response.json(updatedPost);

          case "delete":
            if (!data.filename) {
              return Response.json(
                { error: "Missing required field: filename" },
                { status: 400 }
              );
            }
            const success = await deleteBlogPost(data.filename);
            if (!success) {
              return Response.json(
                { error: "Blog post not found" },
                { status: 404 }
              );
            }
            return Response.json({ success: true });

          default:
            return Response.json(
              { error: "Invalid action" },
              { status: 400 }
            );
        }
      } catch (error) {
        console.error("Blog management error:", error);
        return Response.json(
          {
            error: "Failed to manage blog",
            details: String(error),
          },
          { status: 500 }
        );
      }
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  },
};
