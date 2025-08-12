import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './LinkTree.css';

function PublicTreeNode({ node, onNodeUpdate, onNodeDelete, onAddChild, path = [], isAdmin = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);
  const [editUrlValue, setEditUrlValue] = useState(node.link || '');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addingFolder, setAddingFolder] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const hasChildren = node.children && node.children.length > 0;
  const addMenuRef = useRef(null);

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAddMenu]);

  const handleEdit = () => {
    setEditValue(node.name);
    setEditUrlValue(node.link || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      const updatedNode = { ...node, name: editValue.trim() };
      // If it's a link, also update the URL
      if (node.link !== undefined) {
        updatedNode.link = editUrlValue.trim();
      }
      onNodeUpdate([...path], updatedNode);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(node.name);
    setEditUrlValue(node.link || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onNodeDelete(path);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleAddFolder = () => {
    setAddingFolder(true);
    setShowAddMenu(false);
  };

  const handleAddLink = () => {
    setAddingLink(true);
    setShowAddMenu(false);
  };

  const saveFolderAdd = () => {
    if (newFolderName.trim()) {
      onAddChild(path, { name: newFolderName.trim(), children: [] });
      setNewFolderName('');
    }
    setAddingFolder(false);
  };

  const saveLinkAdd = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      onAddChild(path, { name: newLinkName.trim(), link: newLinkUrl.trim() });
      setNewLinkName('');
      setNewLinkUrl('');
    }
    setAddingLink(false);
  };

  const cancelAdd = () => {
    setAddingFolder(false);
    setAddingLink(false);
    setNewFolderName('');
    setNewLinkName('');
    setNewLinkUrl('');
  };

  return (
    <div className="linktree-node" style={{ marginLeft: path.length > 0 ? 20 : 0 }}>
      <div className="node-content">
        {hasChildren && (
          <button 
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        )}
        
        {isEditing && isAdmin ? (
          <div className="edit-controls">
            <input
              className="edit-input"
              placeholder="Name"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !node.link && handleSave()}
              autoFocus
            />
            {node.link && (
              <input
                className="edit-input"
                placeholder="URL (https://...)"
                value={editUrlValue}
                onChange={(e) => setEditUrlValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
            )}
            <button className="save-button" onClick={handleSave}>✓</button>
            <button className="cancel-button" onClick={handleCancel}>✗</button>
          </div>
        ) : showDeleteConfirm && isAdmin ? (
          <div className="delete-confirm">
            <span>Delete "{node.name}"?</span>
            <button className="confirm-delete-button" onClick={confirmDelete}>Yes</button>
            <button className="cancel-delete-button" onClick={cancelDelete}>Cancel</button>
          </div>
        ) : (
          <div className="node-display">
            {node.link ? (
              <a href={node.link} target="_blank" rel="noopener noreferrer" className="node-link">
                {node.name}
              </a>
            ) : (
              <span className="node-folder">{node.name}</span>
            )}
            {isAdmin && (
              <div className="node-actions">
                <button className="edit-button" onClick={handleEdit} title="Edit">
                  ✏️
                </button>
                <button className="delete-button" onClick={handleDelete} title="Delete">
                  🗑️
                </button>
                {!node.link && (
                  <div className="add-menu" ref={addMenuRef}>
                    <button 
                      className="add-button" 
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      title="Add item"
                    >
                      ➕
                    </button>
                    {showAddMenu && (
                      <div className="add-dropdown">
                        <button onClick={handleAddFolder}>📁 Add Folder</button>
                        <button onClick={handleAddLink}>🔗 Add Link</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {hasChildren && !collapsed && (
        <div className="node-children">
          {node.children.map((child, idx) => (
            <PublicTreeNode 
              key={idx} 
              node={child} 
              onNodeUpdate={onNodeUpdate}
              onNodeDelete={onNodeDelete}
              onAddChild={onAddChild}
              path={[...path, 'children', idx]}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
      
      {addingFolder && isAdmin && (
        <div className="add-form">
          <div className="add-form-header">📁 Add Folder</div>
          <input
            className="add-form-input"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveFolderAdd()}
            autoFocus
          />
          <div className="add-form-actions">
            <button className="save-add-button" onClick={saveFolderAdd}>Add</button>
            <button className="cancel-add-button" onClick={cancelAdd}>Cancel</button>
          </div>
        </div>
      )}
      
      {addingLink && isAdmin && (
        <div className="add-form">
          <div className="add-form-header">🔗 Add Link</div>
          <input
            className="add-form-input"
            placeholder="Link name"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            autoFocus
          />
          <input
            className="add-form-input"
            placeholder="URL (https://...)"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveLinkAdd()}
          />
          <div className="add-form-actions">
            <button className="save-add-button" onClick={saveLinkAdd}>Add</button>
            <button className="cancel-add-button" onClick={cancelAdd}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const PublicLinks = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingRootFolder, setAddingRootFolder] = useState(false);
  const [addingRootLink, setAddingRootLink] = useState(false);
  const [newRootFolderName, setNewRootFolderName] = useState('');
  const [newRootLinkName, setNewRootLinkName] = useState('');
  const [newRootLinkUrl, setNewRootLinkUrl] = useState('');

  const isAdmin = user?.profile?.email === 'ayushmaurya2003@gmail.com';

  useEffect(() => {
    fetchPublicLinks();
  }, []);

  const fetchPublicLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/public-links');
      setTreeData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching public links:', err);
      setError('Failed to load public links');
    } finally {
      setLoading(false);
    }
  };

  const savePublicLinks = async (newTreeData) => {
    if (!isAdmin) return;
    
    try {
      await api.put('/public-links', { treeData: newTreeData });
      setTreeData(newTreeData);
    } catch (err) {
      console.error('Error saving public links:', err);
      setError('Failed to save changes');
    }
  };

  const updateNode = (path, updatedNode) => {
    if (!isAdmin) return;
    
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    if (path.length > 0) {
      current[path[path.length - 1]] = updatedNode;
    }
    
    savePublicLinks(newTreeData);
  };

  const deleteNode = (path) => {
    if (!isAdmin) return;
    
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    if (path.length === 1) {
      newTreeData.splice(path[0], 1);
    } else {
      current.splice(path[path.length - 1], 1);
    }
    
    savePublicLinks(newTreeData);
  };

  const addChild = (path, newChild) => {
    if (!isAdmin) return;
    
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    if (!current.children) {
      current.children = [];
    }
    
    current.children.push(newChild);
    savePublicLinks(newTreeData);
  };

  const addRootItem = (type) => {
    if (!isAdmin) return;
    
    if (type === 'folder') {
      setAddingRootFolder(true);
    } else {
      setAddingRootLink(true);
    }
  };

  const saveRootFolder = () => {
    if (!isAdmin) return;
    
    if (newRootFolderName.trim()) {
      const newTreeData = [...treeData, { name: newRootFolderName.trim(), children: [] }];
      savePublicLinks(newTreeData);
      setNewRootFolderName('');
    }
    setAddingRootFolder(false);
  };

  const saveRootLink = () => {
    if (!isAdmin) return;
    
    if (newRootLinkName.trim() && newRootLinkUrl.trim()) {
      const newTreeData = [...treeData, { name: newRootLinkName.trim(), link: newRootLinkUrl.trim() }];
      savePublicLinks(newTreeData);
      setNewRootLinkName('');
      setNewRootLinkUrl('');
    }
    setAddingRootLink(false);
  };

  const cancelRootAdd = () => {
    setAddingRootFolder(false);
    setAddingRootLink(false);
    setNewRootFolderName('');
    setNewRootLinkName('');
    setNewRootLinkUrl('');
  };

  if (loading) {
    return <div className={`linktree-loading theme-${currentTheme}`}>Loading public links...</div>;
  }

  if (error) {
    return (
      <div className={`linktree-error theme-${currentTheme}`}>
        <span>{error}</span>
        <button className="retry-button" onClick={fetchPublicLinks}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`linktree-container theme-${currentTheme}`}>
      <div className="linktree-header">
        <h3>Public Links</h3>
        {isAdmin && (
          <div className="header-actions">
            <div className="add-root-menu">
              <button className="add-root-button" onClick={() => addRootItem('folder')}>
                📁 Add Folder
              </button>
              <button className="add-root-button" onClick={() => addRootItem('link')}>
                🔗 Add Link
              </button>
            </div>
          </div>
        )}
      </div>
      
      {treeData.length > 0 ? (
        <div className="linktree-nodes">
          {treeData.map((node, idx) => (
            <PublicTreeNode 
              key={idx} 
              node={node} 
              onNodeUpdate={updateNode}
              onNodeDelete={deleteNode}
              onAddChild={addChild}
              path={[idx]}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{isAdmin ? "No public links yet. Add some above!" : "No public links available yet."}</p>
        </div>
      )}
      
      {addingRootFolder && isAdmin && (
        <div className="root-add-form">
          <div className="add-form-header">📁 Add Folder</div>
          <input
            className="add-form-input"
            placeholder="Folder name"
            value={newRootFolderName}
            onChange={(e) => setNewRootFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveRootFolder()}
            autoFocus
          />
          <div className="add-form-actions">
            <button className="save-add-button" onClick={saveRootFolder}>Add</button>
            <button className="cancel-add-button" onClick={cancelRootAdd}>Cancel</button>
          </div>
        </div>
      )}
      
      {addingRootLink && isAdmin && (
        <div className="root-add-form">
          <div className="add-form-header">🔗 Add Link</div>
          <input
            className="add-form-input"
            placeholder="Link name"
            value={newRootLinkName}
            onChange={(e) => setNewRootLinkName(e.target.value)}
            autoFocus
          />
          <input
            className="add-form-input"
            placeholder="URL (https://...)"
            value={newRootLinkUrl}
            onChange={(e) => setNewRootLinkUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveRootLink()}
          />
          <div className="add-form-actions">
            <button className="save-add-button" onClick={saveRootLink}>Add</button>
            <button className="cancel-add-button" onClick={cancelRootAdd}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLinks;
