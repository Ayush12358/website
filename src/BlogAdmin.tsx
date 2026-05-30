import { useState } from "react";
import "./BlogAdmin.css";

export type BlogPost = {
  title: string;
  filename: string;
  content: string;
  date: string;
  is_public?: boolean;
};

interface BlogAdminProps {
  isOpen: boolean;
  onClose: () => void;
  onPostsUpdate: () => void;
}

export function BlogAdmin({ isOpen, onClose, onPostsUpdate }: BlogAdminProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPosts, setAdminPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    filename: "",
    content: "",
    date: new Date().toISOString().substring(0, 10),
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadAdminPosts = async (password: string) => {
    const response = await fetch("/api/manage-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list", password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to load posts");
    }

    const allPosts = (await response.json()) as BlogPost[];
    setAdminPosts(allPosts);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await loadAdminPosts(passwordInput);
      setAdminPassword(passwordInput);
      setIsAuthenticated(true);
      setPasswordInput("");
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const action = mode === "create" ? "create" : "update";
      const response = await fetch("/api/manage-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          password: adminPassword,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
        return;
      }

      setMessage(
        mode === "create"
          ? "Blog post created successfully!"
          : "Blog post updated successfully!"
      );
      setFormData({ 
        title: "", 
        filename: "", 
        content: "", 
        date: new Date().toISOString().substring(0, 10),
        is_public: true,
      });
      setSelectedPost(null);
      setMode("list");
      await Promise.all([onPostsUpdate(), loadAdminPosts(adminPassword)]);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/manage-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          password: adminPassword,
          filename,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
        return;
      }

      setMessage("Blog post deleted successfully!");
      await Promise.all([onPostsUpdate(), loadAdminPosts(adminPassword)]);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData(post);
    setMode("edit");
  };

  const handleToggleVisibility = async (post: BlogPost) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/manage-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          password: adminPassword,
          filename: post.filename,
          title: post.title,
          content: post.content,
          date: post.date,
          is_public: !(post.is_public ?? true),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
        return;
      }

      setMessage("Visibility updated successfully!");
      await Promise.all([onPostsUpdate(), loadAdminPosts(adminPassword)]);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blog-admin-overlay">
      <div className="blog-admin-modal">
        <div className="blog-admin-header">
          <h2>Blog Management</h2>
          <button className="blog-admin-close" onClick={onClose} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
            [X]
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="blog-admin-password-form">
            <div className="blog-admin-form-group">
              <label htmlFor="password">Enter Password</label>
              <input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter blog password"
                autoFocus
              />
            </div>
            <button type="submit" className="blog-admin-btn blog-admin-btn-primary">
              Unlock
            </button>
          </form>
        ) : (
          <div className="blog-admin-content">
            {message && (
              <div className={`blog-admin-message ${message.includes("Error") ? "error" : "success"}`}>
                {message}
              </div>
            )}

            <div className="blog-admin-tabs">
              <button
                className={`blog-admin-tab ${mode === "list" ? "active" : ""}`}
                onClick={() => setMode("list")}
              >
                Posts ({adminPosts.length})
              </button>
              <button
                className={`blog-admin-tab ${mode === "create" ? "active" : ""}`}
                onClick={() => {
                  setMode("create");
                  setFormData({
                    title: "",
                    filename: "",
                    content: "",
                    date: new Date().toISOString().substring(0, 10),
                    is_public: true,
                  });
                }}
              >
                New Post
              </button>
            </div>

            {mode === "list" && (
              <div className="blog-admin-list">
                {adminPosts.length === 0 ? (
                  <p className="blog-admin-empty">No blog posts yet</p>
                ) : (
                  <ul>
                    {adminPosts.map((post) => (
                      <li key={post.filename} className="blog-admin-list-item">
                        <div className="blog-admin-list-content">
                          <div className="blog-admin-list-header">
                            <h3>{post.title}</h3>
                            <span className={`blog-admin-badge ${post.is_public ? "public" : "private"}`}>
                              {post.is_public ? "🌍 Public" : "🔒 Private"}
                            </span>
                          </div>
                          <p className="blog-admin-list-meta">{post.filename} • {post.date}</p>
                        </div>
                        <div className="blog-admin-list-actions">
                          <button
                            className="blog-admin-btn blog-admin-btn-secondary"
                            onClick={() => handleToggleVisibility(post)}
                            disabled={loading}
                          >
                            {post.is_public ? "Make Private" : "Make Public"}
                          </button>
                          <button
                            className="blog-admin-btn blog-admin-btn-secondary"
                            onClick={() => handleEditClick(post)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="blog-admin-btn blog-admin-btn-danger"
                            onClick={() => handleDelete(post.filename)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {(mode === "create" || mode === "edit") && (
              <form onSubmit={handleCreateEdit} className="blog-admin-form">
                <div className="blog-admin-form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Post title"
                    required
                  />
                </div>

                <div className="blog-admin-form-group">
                  <label htmlFor="filename">Filename</label>
                  <input
                    id="filename"
                    type="text"
                    value={formData.filename}
                    onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                    placeholder="filename.md"
                    required
                    disabled={mode === "edit"}
                  />
                </div>

                <div className="blog-admin-form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="blog-admin-form-group">
                  <label htmlFor="is_public" className="checkbox-label">
                    <input
                      id="is_public"
                      type="checkbox"
                      checked={formData.is_public ?? true}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    />
                    <span>Make this post public (visible on blog page)</span>
                  </label>
                </div>

                <div className="blog-admin-form-group">
                  <label htmlFor="content">Content (Markdown)</label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog post in Markdown..."
                    rows={12}
                    required
                  />
                </div>

                <div className="blog-admin-form-actions">
                  <button
                    type="button"
                    className="blog-admin-btn blog-admin-btn-secondary"
                    onClick={() => {
                      setMode("list");
                      setSelectedPost(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="blog-admin-btn blog-admin-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : mode === "create" ? "Create Post" : "Update Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
