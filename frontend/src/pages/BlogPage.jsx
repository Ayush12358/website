import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentBaseURL } from '../utils/api';
import './BlogPage.css';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pagination, setPagination] = useState({});

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const baseURL = getCurrentBaseURL();
      
      // Build query string
      const params = new URLSearchParams();
      if (currentPage > 1) params.append('page', currentPage);
      if (currentCategory) params.append('category', currentCategory);
      if (currentTag) params.append('tag', currentTag);
      if (currentSearch) params.append('search', currentSearch);
      params.append('limit', '6');

      const response = await fetch(`${baseURL}/blog?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBlogs(data.blogs);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentCategory, currentTag, currentSearch]);

  const fetchCategories = useCallback(async () => {
    try {
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog/categories`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog/tags`);
      const data = await response.json();
      if (response.ok) {
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    fetchTags();
  }, [fetchBlogs, fetchCategories, fetchTags]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page
    setSearchParams(params);
  };

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    params.delete('page'); // Reset to first page
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page);
    } else {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-loading">
          <div className="loading-spinner"></div>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-nav">
        <Link to="/" className="back-to-main">
          ← Back to Main Site
        </Link>
      </div>
      
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Thoughts, tutorials, and insights</p>
        
        {user && (
          <div className="blog-admin-actions">
            <Link to="/blog/admin" className="btn btn-secondary">
              Manage Posts
            </Link>
            <Link to="/blog/new" className="btn btn-primary">
              Write New Post
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="blog-filters">
        <form onSubmit={handleSearch} className="blog-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blog posts..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="blog-filter-controls">
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={currentTag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {(currentCategory || currentTag || currentSearch) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="blog-error">
          <p>{error}</p>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="blog-grid">
        {blogs.length === 0 ? (
          <div className="blog-empty">
            <h3>No blog posts found</h3>
            <p>
              {currentSearch || currentCategory || currentTag
                ? 'Try adjusting your filters or search terms.'
                : 'Check back later for new content.'}
            </p>
          </div>
        ) : (
          blogs.map(blog => (
            <article key={blog.id} className="blog-card">
              {blog.featuredImage && (
                <div className="blog-card-image">
                  <img src={blog.featuredImage} alt={blog.title} />
                </div>
              )}
              
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-category">{blog.category}</span>
                  <span className="blog-date">{formatDate(blog.publishedAt)}</span>
                </div>
                
                <h2 className="blog-card-title">
                  <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h2>
                
                {(blog.excerptHtml || blog.excerpt) && (
                  <div 
                    className="blog-card-excerpt"
                    dangerouslySetInnerHTML={{ 
                      __html: blog.excerptHtml || blog.excerpt 
                    }}
                  />
                )}
                
                <div className="blog-card-footer">
                  <div className="blog-card-author">
                    By {blog.author.name}
                  </div>
                  
                  <div className="blog-card-stats">
                    {blog.readTime && (
                      <span className="read-time">{blog.readTime} min read</span>
                    )}
                    <span className="view-count">{blog.viewCount} views</span>
                  </div>
                </div>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-card-tags">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="blog-tag"
                        onClick={() => handleFilterChange('tag', tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="blog-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            <span className="total-posts">({pagination.totalPosts} posts)</span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
