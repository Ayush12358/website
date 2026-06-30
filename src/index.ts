import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/song.mp3": {
      async GET() {
        return new Response(Bun.file("public/song.mp3"), {
          headers: {
            "Content-Type": "audio/mpeg",
          },
        });
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
