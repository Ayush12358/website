import { getAllBlogPosts, initializeDatabase } from "./db";

type BlogPost = {
  title: string;
  filename: string;
  content: string;
  date: string;
};

const MOCK_POSTS: BlogPost[] = [
  {
    title: "Simulating Public Choice: The Math Behind ElectoralSim",
    filename: "electoral-simulations.md",
    content: "# Simulating Public Choice: The Math Behind ElectoralSim\n\nSimulating voting methods is crucial to understanding public choice theory and the math behind elections. In this article, we explore how the Python library ElectoralSim helps researchers model different voting systems like ranked-choice, first-past-the-post, and quadratic voting under varying agent behaviors.",
    date: "2026-05-15",
  },
  {
    title: "Design for Social Innovation in Resource-Constrained Environments",
    filename: "social-innovation-tafea.md",
    content: "# Design for Social Innovation in Resource-Constrained Environments\n\nDesigning educational technology for Teach For India fellows requires deep empathy for resource-constrained environments. This paper highlights key insights from the design of TAFEA, an AI-powered extracurricular lesson planner.",
    date: "2026-05-10",
  }
];

export default {
  async fetch(_request: Request) {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL environment variable is not set. Using local fallback posts.");
      return Response.json(MOCK_POSTS);
    }

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
      console.error("Failed to fetch blog posts from database:", error);
      return Response.json(MOCK_POSTS);
    }
  },
};