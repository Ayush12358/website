# Neon Serverless Blog Setup Guide

## Overview
Your blog has been migrated from the `public/blog` folder to Neon Serverless PostgreSQL database. This provides better scalability and easier content management.

## Setup Steps

### 1. Create a Neon Project
- Go to [Neon Console](https://console.neon.tech)
- Sign up or log in
- Create a new project
- Copy the connection string (looks like `postgresql://...`)

### 2. Set Environment Variable
- In Vercel: Add `DATABASE_URL` to your project environment variables
- Locally: Create a `.env.local` file with:
  ```
  DATABASE_URL=postgresql://your_connection_string
  ```

### 3. Install Dependencies
```bash
bun install
```

### 4. Migrate Existing Blog Posts
```bash
bun migrate
```

This will:
- Create the `blog_posts` table in your Neon database
- Read all markdown files from `public/blog/`
- Insert them into the database
- Preserve frontmatter dates and extract titles

### 5. Deploy to Vercel
```bash
vercel deploy
```

Vercel will automatically use the `DATABASE_URL` from your environment variables.

## Database Schema

The `blog_posts` table has the following structure:
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Available API Operations

The backend now supports:
- `GET /api/blog` - Fetch all blog posts (ordered by date DESC)
- The API automatically initializes the database schema on first request

## Adding New Blog Posts

### Option 1: Via Code
```typescript
import { createBlogPost } from "./api/db";

await createBlogPost(
  "My New Post",
  "my-new-post.md",
  "# My New Post\n\nContent here...",
  "2026-04-17"
);
```

### Option 2: Directly in Database
You can use Neon's SQL editor to insert posts directly:
```sql
INSERT INTO blog_posts (title, filename, content, date)
VALUES ('Title', 'filename.md', 'content', '2026-04-17');
```

## Notes
- The markdown files in `public/blog/` are no longer used for serving content
- You can keep them as backups or delete them once migration is confirmed
- The database connection is automatically created on the first API request
- Neon provides a free tier with generous limits for side projects
