import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentBaseURL } from '../utils/api';
import { marked } from 'marked';
import './BlogEditorPage.css';

const BlogEditorPage = () => {
  const { id } = useParams(); // For editing existing posts
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    category: 'general',
    tags: [],
    featuredImage: '',
    metaDescription: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Configure marked for consistent rendering
  marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true
  });

  const categories = [
    'general',
    'technology',
    'tutorial',
    'personal',
    'project',
    'review',
    'announcement'
  ];

  const fetchBlogPost = useCallback(async () => {
    if (!isEditing) return;
    
    try {
      setLoading(true);
      const baseURL = getCurrentBaseURL();
      const response = await fetch(`${baseURL}/blog/admin/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          status: data.status || 'draft',
          category: data.category || 'general',
          tags: data.tags || [],
          featuredImage: data.featuredImage || '',
          metaDescription: data.metaDescription || ''
        });
      } else {
        setError(data.message || 'Failed to fetch blog post');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchBlogPost();
  }, [fetchBlogPost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const baseURL = getCurrentBaseURL();
      const url = isEditing ? `${baseURL}/blog/${id}` : `${baseURL}/blog`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect based on status
        if (formData.status === 'published') {
          navigate(`/blog/${data.slug}`);
        } else {
          navigate('/blog/admin');
        }
      } else {
        console.error('Server error response:', data);
        if (data.errors && Array.isArray(data.errors)) {
          setError(`Validation errors: ${data.errors.join(', ')}`);
        } else {
          setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} blog post`);
        }
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} blog post`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const originalStatus = formData.status;
    setFormData(prev => ({ ...prev, status: 'draft' }));
    
    // Create a synthetic form submit event
    const syntheticEvent = {
      preventDefault: () => {}
    };
    
    await handleSubmit(syntheticEvent);
    
    // Restore original status if save failed
    if (error) {
      setFormData(prev => ({ ...prev, status: originalStatus }));
    }
  };

  const generateExcerpt = () => {
    if (formData.content) {
      // Convert markdown to plain text by removing markdown syntax
      let textContent = formData.content
        .replace(/^#+\s+/gm, '') // Remove headings
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/^[>+*-]\s+/gm, '') // Remove blockquotes and lists
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      const excerpt = textContent.substring(0, 150).trim();
      setFormData(prev => ({
        ...prev,
        excerpt: excerpt + (textContent.length > 150 ? '...' : '')
      }));
    }
  };

  if (!user) {
    return (
      <div className="blog-editor-page">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You need to be logged in to create or edit blog posts.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blog-editor-page">
        <div className="blog-loading">
          <div className="loading-spinner"></div>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-editor-page">
      <div className="blog-editor-nav">
        <div className="nav-buttons">
          <Link to="/" className="back-to-main">
            ← Back to Main Site
          </Link>
          <button
            type="button"
            onClick={() => navigate('/blog/admin')}
            className="back-button"
          >
            ← Back to Admin
          </button>
        </div>
      </div>
      
      <div className="blog-editor-header">
        <h1>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <div className="editor-actions">
          <button
            type="button"
            onClick={() => navigate('/blog/admin')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn btn-outline"
          >
            Save Draft
          </button>
        </div>
      </div>

      {error && (
        <div className="blog-error">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-editor-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter blog post title..."
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="excerpt">
              Excerpt
              <button
                type="button"
                onClick={generateExcerpt}
                className="generate-excerpt-btn"
                title="Auto-generate excerpt from content"
              >
                Auto-generate
              </button>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Brief description of the blog post (Markdown supported)..."
              rows="3"
              className="form-textarea"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="content">Content * (Markdown)</label>
            <div className="markdown-editor">
              <div className="editor-tabs">
                <button
                  type="button"
                  className={`tab-button ${!previewMode ? 'active' : ''}`}
                  onClick={() => setPreviewMode(false)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`tab-button ${previewMode ? 'active' : ''}`}
                  onClick={() => setPreviewMode(true)}
                >
                  Preview
                </button>
              </div>
              
              {!previewMode ? (
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your blog post content here using Markdown..."
                  rows="20"
                  required
                  className="form-textarea content-textarea markdown-textarea"
                />
              ) : (
                <div 
                  className="markdown-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content ? marked(formData.content) : '<p>Start writing to see preview...</p>' 
                  }}
                />
              )}
            </div>
            <small className="form-help">
              Use Markdown for formatting: **bold**, *italic*, # headings, [links](url), 
              ```code blocks```, {'>'}blockquotes, and lists with - or 1.
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Add tags (press Enter or comma to add)"
                className="form-input"
              />
              <button
                type="button"
                onClick={addTag}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-display">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="featuredImage">Featured Image URL</label>
            <input
              type="url"
              id="featuredImage"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metaDescription">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              placeholder="SEO description (max 160 characters)"
              maxLength="160"
              rows="2"
              className="form-textarea"
            />
            <small className="form-help">
              {formData.metaDescription.length}/160 characters
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditorPage;
