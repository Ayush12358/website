import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentBaseURL } from '../utils/api';
import './BlogAdminPage.css';

const BlogAdminPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentStatus = searchParams.get('status') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pagination, setPagination] = useState({});

  const fetchBlogs = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const baseURL = getCurrentBaseURL();
      
      // Build query string
      const params = new URLSearchParams();
      if (currentPage > 1) params.append('page', currentPage);
      if (currentStatus) params.append('status', currentStatus);
      if (currentCategory) params.append('category', currentCategory);
      if (currentSearch) params.append('search', currentSearch);
      params.append('limit', '10');

      const response = await fetch(`${baseURL}/blog/admin?${params}`, {
        credentials: 'include'
      });
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
  }, [currentPage, currentStatus, currentCategory, currentSearch, user]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchBlogs(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'archived':
        return 'status-archived';
      default:
        return 'status-draft';
    }
  };

  if (!user) {
    return (
      <div className="blog-admin-page">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You need to be logged in to access this page.</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blog-admin-page">
        <div className="blog-loading">
          <div className="loading-spinner"></div>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-admin-page">
      <div className="blog-admin-nav">
        <div className="nav-buttons">
          <Link to="/" className="back-to-main">
            ← Back to Main Site
          </Link>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="back-button"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
      
      <div className="blog-admin-header">
        <h1>Blog Management</h1>
        <div className="blog-admin-actions">
          <Link to="/blog" className="btn btn-secondary">
            View Blog
          </Link>
          <Link to="/blog/new" className="btn btn-primary">
            New Post
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="blog-admin-filters">
        <form onSubmit={handleSearch} className="blog-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="blog-filter-controls">
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="technology">Technology</option>
            <option value="tutorial">Tutorial</option>
            <option value="personal">Personal</option>
          </select>

          {(currentStatus || currentCategory || currentSearch) && (
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

      {/* Blog Posts Table */}
      <div className="blog-admin-table-wrapper">
        {blogs.length === 0 ? (
          <div className="blog-empty">
            <h3>No blog posts found</h3>
            <p>
              {currentSearch || currentStatus || currentCategory
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first blog post to get started.'}
            </p>
            <Link to="/blog/new" className="btn btn-primary">
              Create First Post
            </Link>
          </div>
        ) : (
          <table className="blog-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Views</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id}>
                  <td className="blog-title-cell">
                    <div className="blog-title-info">
                      <strong>{blog.title}</strong>
                      {blog.excerpt && (
                        <p className="blog-excerpt">{blog.excerpt.substring(0, 100)}...</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(blog.status)}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td>{blog.category}</td>
                  <td>{blog.viewCount}</td>
                  <td>{formatDate(blog.createdAt)}</td>
                  <td>{formatDate(blog.updatedAt)}</td>
                  <td className="blog-actions">
                    {blog.status === 'published' && (
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="action-btn view-btn"
                        title="View post"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      to={`/blog/edit/${blog.id}`}
                      className="action-btn edit-btn"
                      title="Edit post"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id, blog.title)}
                      className="action-btn delete-btn"
                      title="Delete post"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default BlogAdminPage;
