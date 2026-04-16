import { neon } from "@neondatabase/serverless";

export type BlogPost = {
  id: string;
  title: string;
  filename: string;
  content: string;
  date: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export const getNeonConnection = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
};

export const initializeDatabase = async () => {
  const db = getNeonConnection();
  
  await db`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      date DATE NOT NULL,
      is_public BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Add is_public column if it doesn't exist (for existing databases)
  try {
    await db`
      ALTER TABLE blog_posts ADD COLUMN is_public BOOLEAN DEFAULT true
    `;
  } catch {
    // Column already exists, ignore error
  }
};

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const db = getNeonConnection();
  
  const posts = await db`
    SELECT id, title, filename, content, date, is_public, created_at, updated_at
    FROM blog_posts
    WHERE is_public = true
    ORDER BY date DESC
  `;
  
  return posts as BlogPost[];
};

export const getAllBlogPostsAdmin = async (): Promise<BlogPost[]> => {
  const db = getNeonConnection();
  
  const posts = await db`
    SELECT id, title, filename, content, date, is_public, created_at, updated_at
    FROM blog_posts
    ORDER BY date DESC
  `;
  
  return posts as BlogPost[];
};

export const getBlogPostByFilename = async (
  filename: string
): Promise<BlogPost | null> => {
  const db = getNeonConnection();
  
  const posts = await db`
    SELECT id, title, filename, content, date, is_public, created_at, updated_at
    FROM blog_posts
    WHERE filename = ${filename}
  `;
  
  return posts.length > 0 ? (posts[0] as BlogPost) : null;
};

export const createBlogPost = async (
  title: string,
  filename: string,
  content: string,
  date: string,
  is_public: boolean = true
): Promise<BlogPost> => {
  const db = getNeonConnection();
  
  const posts = await db`
    INSERT INTO blog_posts (title, filename, content, date, is_public)
    VALUES (${title}, ${filename}, ${content}, ${date}, ${is_public})
    RETURNING id, title, filename, content, date, is_public, created_at, updated_at
  `;
  
  return posts[0] as BlogPost;
};

export const updateBlogPost = async (
  filename: string,
  title: string,
  content: string,
  date: string,
  is_public: boolean = true
): Promise<BlogPost> => {
  const db = getNeonConnection();
  
  const posts = await db`
    UPDATE blog_posts
    SET title = ${title}, content = ${content}, date = ${date}, is_public = ${is_public}, updated_at = CURRENT_TIMESTAMP
    WHERE filename = ${filename}
    RETURNING id, title, filename, content, date, is_public, created_at, updated_at
  `;
  
  return posts[0] as BlogPost;
};

export const deleteBlogPost = async (filename: string): Promise<boolean> => {
  const db = getNeonConnection();
  
  const result = await db`
    DELETE FROM blog_posts
    WHERE filename = ${filename}
  `;
  
  return result.count > 0;
};
