import "./index.css";
import "./App.css";
import { useEffect, useState } from "react";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  title: string;
  content: string;
  filename: string;
  date: string;
}

interface BlogProps {
  slug?: string;
}

export function Blog({ slug }: BlogProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("theme-mode");
    if (savedMode === "light") {
      setIsDarkMode(false);
      return;
    }

    setIsDarkMode(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog");
        const data = await response.json();
        setPosts(data);

        // If slug is provided, find and select that post
        if (slug) {
          const slugWithoutExt = slug.replace(/\.md$/, "");
          const post = data.find(
            (p: BlogPost) =>
              p.filename.replace(/\.md$/, "").toLowerCase() ===
              slugWithoutExt.toLowerCase()
          );
          if (post) {
            setSelectedPost(post);
          }
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [slug]);

  const handleBack = () => {
    window.location.href = "/";
  };

  const handleBackToList = () => {
    window.location.href = "/blog";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getExcerpt = (content: string) => {
    // Extract first non-empty paragraph
    const paragraphs = content
      .split("\n")
      .filter(line => line.trim() && !line.startsWith("#"));
    return paragraphs.slice(0, 2).join(" ").substring(0, 150);
  };

  const getSlugFromFilename = (filename: string) => {
    return filename.replace(/\.md$/, "").toLowerCase();
  };

  return (
    <div className={`resume-container${isDarkMode ? " dark-mode" : ""}`}>
      <header className="resume-header blog-header">
        <div className="blog-header-top">
          <p className="hero-kicker animate-fade-in">Blog</p>
          <button
            type="button"
            className="header-back-button animate-fade-in"
            onClick={handleBack}
          >
            ← Back to Portfolio
          </button>
        </div>
        <h1 className="animate-fade-in">
          {selectedPost ? selectedPost.title : "Articles & Thoughts"}
        </h1>
        <p className="resume-subtitle animate-fade-in">
          {selectedPost
            ? formatDate(selectedPost.date)
            : "Exploring ideas at the intersection of technology, design, and human sciences."}
        </p>
      </header>

      <div className="resume-content">
        <div className="resume-main">
          {isLoading ? (
            <section className="resume-section animate-fade-in">
              <p>Loading blog posts...</p>
            </section>
          ) : selectedPost ? (
            <article className="resume-section animate-fade-in blog-article">
              <button
                type="button"
                className="back-button"
                onClick={handleBackToList}
              >
                <ArrowLeft size={16} />
                Back to posts
              </button>
              <div className="blog-article-header">
                <h2>{selectedPost.title}</h2>
                <time className="blog-date">
                  {formatDate(selectedPost.date)}
                </time>
              </div>
              <div className="blog-content">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.content}
                </Markdown>
              </div>
            </article>
          ) : (
            <section className="resume-section animate-fade-in">
              <h2>Latest Posts</h2>
              {posts.length === 0 ? (
                <p>No blog posts found.</p>
              ) : (
                <div className="blog-posts-list">
                  {posts.map(post => (
                    <a
                      key={post.filename}
                      href={`/blog/${getSlugFromFilename(post.filename)}`}
                      className="blog-post-card"
                    >
                      <div className="blog-card-header">
                        <h3>{post.title}</h3>
                        <time className="blog-card-date">
                          {formatDate(post.date)}
                        </time>
                      </div>
                      <p className="blog-excerpt">{getExcerpt(post.content)}...</p>
                      <span className="read-more">Read more →</span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="resume-sidebar">
          <div className="sidebar-controls">
          </div>
        </div>
      </div>

      <button
        type="button"
        className="theme-toggle-floating theme-toggle-corner"
        onClick={() => setIsDarkMode(prev => !prev)}
        role="switch"
        aria-checked={isDarkMode}
        aria-label="Toggle dark mode"
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
        </span>
        <span className={`theme-toggle-track${isDarkMode ? " active" : ""}`}>
          <span className="theme-toggle-thumb" />
        </span>
      </button>
    </div>
  );
}

export default Blog;
