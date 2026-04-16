import { getAllBlogPosts } from "./api/db";

const posts = await getAllBlogPosts();
console.log("📚 Blog posts in database:");
console.log(JSON.stringify(posts, null, 2));
