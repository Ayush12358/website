import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCurrentBaseURL } from '../utils/api';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);

  const fetchBlogPost = useCallback(async () => {
    try {
      setLoading(true);
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setBlog(data);
      } else {
        setError(data.message || 'Blog post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchRelatedPosts = useCallback(async () => {
    if (!blog) return;
    
    try {
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog?category=${blog.category}&limit=3`);
      const data = await response.json();

      if (response.ok) {
        // Filter out current post
        const related = data.blogs.filter(post => post.id !== blog.id).slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  }, [blog]);

  useEffect(() => {
    fetchBlogPost();
  }, [fetchBlogPost]);

  useEffect(() => {
    if (blog) {
      fetchRelatedPosts();
      // Update page title and meta description
      document.title = `${blog.title} | Blog`;
      if (blog.metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', blog.metaDescription);
        }
      }
    }
  }, [blog, fetchRelatedPosts]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagClick = (tag) => {
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/blog?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-loading">
          <div className="loading-spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-page">
        <div className="blog-post-error">
          <h1>Post Not Found</h1>
          <p>{error}</p>
          <Link to="/blog" className="btn btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-nav">
        <div className="nav-buttons">
          <Link to="/" className="back-to-main">
            ← Back to Main Site
          </Link>
          <Link to="/blog" className="back-to-blog">
            ← Back to Blog
          </Link>
        </div>
      </div>

      <article className="blog-post">
        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span 
              className="blog-post-category"
              onClick={() => handleCategoryClick(blog.category)}
            >
              {blog.category}
            </span>
            <span className="blog-post-date">
              {formatDate(blog.publishedAt)}
            </span>
          </div>

          <h1 className="blog-post-title">{blog.title}</h1>

          {blog.excerpt && (
            <p className="blog-post-excerpt">{blog.excerpt}</p>
          )}

          <div className="blog-post-info">
            <div className="blog-post-author">
              By <strong>{blog.author.name}</strong>
            </div>
            
            <div className="blog-post-stats">
              {blog.readTime && (
                <span className="read-time">{blog.readTime} min read</span>
              )}
              <span className="view-count">{blog.viewCount} views</span>
            </div>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-post-tags">
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className="blog-tag"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {blog.featuredImage && (
          <div className="blog-post-featured-image">
            <img src={blog.featuredImage} alt={blog.title} />
          </div>
        )}

        <div className="blog-post-content">
          <div 
            dangerouslySetInnerHTML={{ __html: blog.contentHtml || blog.content }}
            className="blog-content-body"
          />
        </div>

        <footer className="blog-post-footer">
          <div className="blog-post-share">
            <span>Share this post:</span>
            <div className="share-buttons">
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = `Check out this blog post: ${blog.title}`;
                  if (navigator.share) {
                    navigator.share({ title: blog.title, text, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="share-btn"
              >
                Share
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Related Posts</h2>
          <div className="related-posts-grid">
            {relatedPosts.map(post => (
              <div key={post.id} className="related-post-card">
                {post.featuredImage && (
                  <div className="related-post-image">
                    <img src={post.featuredImage} alt={post.title} />
                  </div>
                )}
                <div className="related-post-content">
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="related-post-meta">
                    {formatDate(post.publishedAt)} • {post.readTime} min read
                  </p>
                  {post.excerpt && (
                    <p className="related-post-excerpt">{post.excerpt}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostPage;
