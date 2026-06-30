import "./index.css";
import "./App.css";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { posts, type Post } from "./posts";

interface BlogProps {
  slug?: string;
}

export function Blog({ slug }: BlogProps) {
  const [themeMode, setThemeMode] = useState<"stark" | "green" | "amber">("green");

  const selectedPost: Post | null = slug
    ? posts.find(
        p =>
          p.filename.replace(/\.md$/, "").toLowerCase() ===
          decodeURIComponent(slug).replace(/\.md$/, "").toLowerCase(),
      ) ?? null
    : null;

  const handleBackToList = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "/blog";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getExcerpt = (content: string) => {
    const paragraphs = content
      .split("\n")
      .filter(line => line.trim() && !line.startsWith("#"));
    return paragraphs.slice(0, 2).join(" ").substring(0, 120);
  };

  return (
    <div className={`resume-container theme-${themeMode}`}>

      <header className="resume-header blog-header">
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <p className="hero-kicker animate-fade-in">Articles & Logs</p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Phosphor:</span>
            {[
              { id: 'stark', label: 'STARK' },
              { id: 'green', label: 'GREEN' },
              { id: 'amber', label: 'AMBER' },
            ].map(theme => (
              <button
                key={theme.id}
                type="button"
                style={{
                  fontSize: '0.65rem',
                  border: '1px solid var(--stroke)',
                  background: themeMode === theme.id ? 'var(--stroke)' : 'transparent',
                  color: themeMode === theme.id ? 'var(--brand)' : 'var(--ink-soft)',
                  padding: '0.2rem 0.4rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                onClick={() => setThemeMode(theme.id as "stark" | "green" | "amber")}
              >
                {theme.label}
              </button>
            ))}


          </div>
        </div>

        <div className="blog-header-top">
          <div className="blog-header-actions animate-fade-in" style={{ flexDirection: 'row', gap: '0.5rem' }}>
            <button
              type="button"
              className="header-back-button"
              onClick={() => { window.location.href = "/"; }}
            >
              [ ← ESC: Portfolio ]
            </button>
            {selectedPost ? (
              <button
                type="button"
                className="header-back-button"
                onClick={handleBackToList}
              >
                [ ← BACK: Posts ]
              </button>
            ) : null}
          </div>
        </div>

        <h1 className="animate-fade-in" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
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
          {selectedPost ? (
            <article className="resume-section animate-fade-in blog-article">
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
                      href={`/blog/${encodeURIComponent(post.filename.replace(/\.md$/, "").toLowerCase())}`}
                      className="blog-post-card"
                    >
                      <div className="blog-card-header">
                        <h3>{post.title}</h3>
                        <time className="blog-card-date">
                          {formatDate(post.date)}
                        </time>
                      </div>
                      <p className="blog-excerpt">{getExcerpt(post.content)}...</p>
                      <span className="read-more">Read post</span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="resume-sidebar">
          {/* Keep sidebar placeholder aligned */}
        </div>
      </div>
    </div>
  );
}

export default Blog;
