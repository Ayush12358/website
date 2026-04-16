import { getAllBlogPosts, initializeDatabase } from "./db";

type BlogPost = {
  title: string;
  filename: string;
  content: string;
  date: string;
};

export default {
  async fetch(_request: Request) {
    try {
      // Initialize database on first request
      await initializeDatabase();
      
      const posts = await getAllBlogPosts();
      
      // Transform response to match frontend expectations
      const response: BlogPost[] = posts.map(post => ({
        title: post.title,
        filename: post.filename,
        content: post.content,
        date: post.date,
      }));

      return Response.json(response);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
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