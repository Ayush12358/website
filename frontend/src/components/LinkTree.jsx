import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import './LinkTree.css';

function TreeNode({ node, onNodeUpdate, onNodeDelete, onAddChild, path = [] }) {
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
        
        {isEditing ? (
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
        ) : showDeleteConfirm ? (
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
                      <button onClick={handleAddFolder}>Add Folder</button>
                      <button onClick={handleAddLink}>Add Link</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {hasChildren && !collapsed && (
        <div className="node-children">
          {node.children.map((child, idx) => (
            <TreeNode 
              key={idx} 
              node={child} 
              onNodeUpdate={onNodeUpdate}
              onNodeDelete={onNodeDelete}
              onAddChild={onAddChild}
              path={[...path, 'children', idx]}
            />
          ))}
        </div>
      )}
      
      {addingFolder && (
        <div className="add-form">
          <div className="add-form-header">Add Folder</div>
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
      
      {addingLink && (
        <div className="add-form">
          <div className="add-form-header">Add Link</div>
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

const LinkTree = () => {
  const { isDarkMode, currentTheme } = useTheme();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingRootFolder, setAddingRootFolder] = useState(false);
  const [addingRootLink, setAddingRootLink] = useState(false);
  const [newRootFolderName, setNewRootFolderName] = useState('');
  const [newRootLinkName, setNewRootLinkName] = useState('');
  const [newRootLinkUrl, setNewRootLinkUrl] = useState('');

  useEffect(() => {
    fetchLinktree();
  }, []);

  const fetchLinktree = async () => {
    try {
      setLoading(true);
      const response = await api.get('/linktree');
      setTreeData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching linktree:', err);
      setError('Failed to load linktree');
    } finally {
      setLoading(false);
    }
  };

  const saveLinktree = async (newTreeData) => {
    try {
      await api.put('/linktree', { treeData: newTreeData });
      setTreeData(newTreeData);
    } catch (err) {
      console.error('Error saving linktree:', err);
      setError('Failed to save changes');
    }
  };

  const updateNode = (path, updatedNode) => {
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    // Navigate to the parent of the node to update
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Update the node
    if (path.length > 0) {
      current[path[path.length - 1]] = updatedNode;
    }
    
    saveLinktree(newTreeData);
  };

  const deleteNode = (path) => {
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    // Navigate to the parent of the node to delete
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Delete the node
    if (path.length === 1) {
      // Deleting from root level
      newTreeData.splice(path[0], 1);
    } else {
      // Deleting from nested level
      current.splice(path[path.length - 1], 1);
    }
    
    saveLinktree(newTreeData);
  };

  const addChild = (path, newChild) => {
    const newTreeData = JSON.parse(JSON.stringify(treeData));
    let current = newTreeData;
    
    // Navigate to the node to add child to
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    // Ensure the node has a children array
    if (!current.children) {
      current.children = [];
    }
    
    // Add the new child
    current.children.push(newChild);
    
    saveLinktree(newTreeData);
  };

  const addRootItem = (type) => {
    if (type === 'folder') {
      setAddingRootFolder(true);
    } else {
      setAddingRootLink(true);
    }
  };

  const saveRootFolder = () => {
    if (newRootFolderName.trim()) {
      const newTreeData = [...treeData, { name: newRootFolderName.trim(), children: [] }];
      saveLinktree(newTreeData);
      setNewRootFolderName('');
    }
    setAddingRootFolder(false);
  };

  const saveRootLink = () => {
    if (newRootLinkName.trim() && newRootLinkUrl.trim()) {
      const newTreeData = [...treeData, { name: newRootLinkName.trim(), link: newRootLinkUrl.trim() }];
      saveLinktree(newTreeData);
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
    return <div className={`linktree-loading theme-${currentTheme}`}>Loading linktree...</div>;
  }

  if (error) {
    return (
      <div className={`linktree-error theme-${currentTheme}`}>
        <span>{error}</span>
        <button className="retry-button" onClick={fetchLinktree}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`linktree-container theme-${currentTheme}`}>
      <div className="linktree-header">
        <h3>My Links</h3>
        <div className="header-actions">
          <div className="add-root-menu">
            <button className="add-root-button" onClick={() => addRootItem('folder')}>
              Add Folder
            </button>
            <button className="add-root-button" onClick={() => addRootItem('link')}>
              Add Link
            </button>
          </div>
        </div>
      </div>
      
      {treeData.length > 0 ? (
        <div className="linktree-nodes">
          {treeData.map((node, idx) => (
            <TreeNode 
              key={idx} 
              node={node} 
              onNodeUpdate={updateNode}
              onNodeDelete={deleteNode}
              onAddChild={addChild}
              path={[idx]}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No links yet. Add your first folder or link above!</p>
        </div>
      )}
      
      {addingRootFolder && (
        <div className="root-add-form">
          <div className="add-form-header">Add Folder</div>
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
      
      {addingRootLink && (
        <div className="root-add-form">
          <div className="add-form-header">Add Link</div>
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

export default LinkTree;
