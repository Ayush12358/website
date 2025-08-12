import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Chat from '../components/Chat';
import AdminChatComponent from '../components/AdminChatComponent';
import ThemeButton from '../components/ThemeButton';
import LinkTree from '../components/LinkTree';
import PublicLinks from '../components/PublicLinks';
import './DashboardPage.css';

const DashboardPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [userProfile, setUserProfile] = useState(null);
  const [isDev, setIsDev] = useState(false);
  const [customPorts, setCustomPorts] = useState([]);
  const [allServerPorts, setAllServerPorts] = useState([]);
  const [showAddPort, setShowAddPort] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [newPortData, setNewPortData] = useState({ port: '', name: '', description: '', isPublic: false });


  useEffect(() => {
    if (user?.profile) {
      setUserProfile(user.profile);
      const devStatus = user.profile.email === 'ayushmaurya2003@gmail.com';
      setIsDev(devStatus);
    } else {
      fetchUserProfile();
    }
    loadAllPorts();
  }, [user]);

  useEffect(() => {
    // Load custom ports when isDev status is determined
    loadCustomPorts();
  }, [isDev]);

  const loadAllPorts = async () => {
    try {
      // Load all accessible ports from server (public for regular users, all for devs)
      console.log('Loading all ports from server...');
      const response = await api.get('/ports');
      console.log('All ports loaded:', response.data);
      setAllServerPorts(response.data);
    } catch (error) {
      console.error('Failed to load all ports:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // If authentication fails, still allow fallback to default ports
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Authentication issue when loading ports, falling back to default ports only');
      }
      setAllServerPorts([]);
    }
  };

  const loadCustomPorts = async () => {
    if (!isDev) {
      // Regular users don't have custom ports
      setCustomPorts([]);
      return;
    }
    
    try {
      // Load custom ports from server for developers
      console.log('Loading custom ports from server...');
      const response = await api.get('/ports/my-ports');
      console.log('Custom ports loaded:', response.data);
      setCustomPorts(response.data);
    } catch (error) {
      console.error('Failed to load custom ports:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.warn('Authentication failed when loading custom ports');
      }
      setCustomPorts([]);
    }
  };

  const handleAddPort = async () => {
    if (!isDev) {
      alert('Only developers can add ports.');
      return;
    }
    
    if (newPortData.port && newPortData.name) {
      try {
        console.log('Attempting to add port:', newPortData);
        const response = await api.post('/ports', {
          port: newPortData.port,
          name: newPortData.name,
          description: newPortData.description,
          isPublic: newPortData.isPublic
        });
        
        console.log('Port added successfully:', response.data);
        
        // Reload ports from server
        await loadCustomPorts();
        await loadAllPorts();
        setNewPortData({ port: '', name: '', description: '', isPublic: false });
        setShowAddPort(false);
        alert('Port added successfully!');
      } catch (error) {
        console.error('Failed to add port:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        
        if (error.response?.status === 401) {
          alert('Authentication failed. Please log out and log back in.');
        } else if (error.response?.status === 403) {
          alert('Access denied. You do not have permission to add ports.');
        } else if (error.response?.data?.message) {
          alert(`Error: ${error.response.data.message}`);
        } else if (error.response?.data?.error) {
          alert(`Error: ${error.response.data.error}`);
        } else if (error.code === 'ERR_NETWORK') {
          alert('Network error. Please check if the server is running.');
        } else {
          alert('Failed to add port. Please check the console for more details.');
        }
      }
    }
  };

  const handleEditPort = (portId) => {
    if (!isDev) {
      alert('Only developers can edit ports.');
      return;
    }
    
    const portToEdit = customPorts.find(p => p.id === portId);
    if (portToEdit) {
      setNewPortData({
        port: portToEdit.port,
        name: portToEdit.name,
        description: portToEdit.description,
        isPublic: portToEdit.isPublic || false
      });
      setEditingPort(portId);
      setShowAddPort(true);
    }
  };

  const handleUpdatePort = async () => {
    if (!isDev) {
      alert('Only developers can update ports.');
      return;
    }
    
    if (newPortData.port && newPortData.name && editingPort) {
      try {
        await api.put(`/ports/${editingPort}`, {
          port: newPortData.port,
          name: newPortData.name,
          description: newPortData.description,
          isPublic: newPortData.isPublic
        });
        
        // Reload ports from server
        await loadCustomPorts();
        await loadAllPorts();
        setNewPortData({ port: '', name: '', description: '', isPublic: false });
        setEditingPort(null);
        setShowAddPort(false);
        alert('Port updated successfully!');
      } catch (error) {
        console.error('Failed to update port:', error);
        
        if (error.response?.status === 401) {
          alert('Authentication failed. Please log out and log back in.');
        } else if (error.response?.status === 403) {
          alert('Access denied. You do not have permission to update ports.');
        } else if (error.response?.data?.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert('Failed to update port. Please check the console for more details.');
        }
      }
    }
  };

  const handleDeletePort = async (portId) => {
    if (!isDev) {
      alert('Only developers can delete ports.');
      return;
    }
    
    try {
      await api.delete(`/ports/${portId}`);
      // Reload ports from server
      await loadCustomPorts();
      await loadAllPorts();
      alert('Port deleted successfully!');
    } catch (error) {
      console.error('Failed to delete port:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log out and log back in.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You do not have permission to delete ports.');
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to delete port. Please check the console for more details.');
      }
    }
  };

  const cancelPortEdit = () => {
    setNewPortData({ port: '', name: '', description: '', isPublic: false });
    setEditingPort(null);
    setShowAddPort(false);
  };



  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUserProfile(response.data);
      setIsDev(response.data.email === 'ayushmaurya2003@gmail.com');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const defaultPorts = [
    { port: '3000', name: 'React Dev Server', description: 'Default React development server', isCustom: false, isPublic: false },
    { port: '5001', name: 'Backend API', description: 'Node.js/Express backend server', isCustom: false, isPublic: false },
    { port: '8000', name: 'Frontend App', description: 'Current frontend application', isCustom: false, isPublic: true },
    { port: '3001', name: 'Alternative React', description: 'Secondary React development port', isCustom: false, isPublic: false },
    { port: '4000', name: 'GraphQL Server', description: 'GraphQL API server', isCustom: false, isPublic: false },
    { port: '8080', name: 'HTTP Server', description: 'Common HTTP server port', isCustom: false, isPublic: false },
    { port: '9000', name: 'Development Server', description: 'General development server', isCustom: false, isPublic: false }
  ];

  // Combine default ports with server ports, avoiding duplicates
  const allPorts = [
    ...defaultPorts,
    ...allServerPorts.filter(serverPort => 
      !defaultPorts.some(defaultPort => defaultPort.port === serverPort.port)
    )
  ];
  
  // Filter ports based on user access
  const accessiblePorts = allPorts.filter(portInfo => {
    if (isDev) return true; // Devs can access all ports
    return portInfo.isPublic; // Regular users can only access public ports
  });

  const tabs = isDev ? [
    { id: 'chat', label: 'Chat with Me', icon: '' },
    { id: 'linktree', label: 'Linktree', icon: '' },
    { id: 'port-view', label: 'Port View', icon: '' }
  ] : [
    { id: 'chat', label: 'Chat', icon: '' },
    { id: 'linktree', label: 'Linktree', icon: '' },
    ...(accessiblePorts.length > 0 ? [{ id: 'port-view', label: 'Port View', icon: '' }] : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        if (isDev) {
          // Admin chat interface for developer
          return (
            <div>
              <AdminChatComponent />
            </div>
          );
        } else {
          // Regular user chat interface
          return (
            <div>
              <Chat />
            </div>
          );
        }

      case 'linktree':
        return (
          <div>
            <h3>My Linktree</h3>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: '20px'}}>
              Organize and manage your important links in a tree structure.
            </p>
            <LinkTree />
            
            {/* Public Links Section */}
            <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--color-border)'}}>
              <h3>Public Links</h3>
              <p style={{color: 'var(--color-text-secondary)', marginBottom: '20px'}}>
                {isDev 
                  ? 'Manage public links that are visible to all users.' 
                  : 'Browse links and resources shared by the admin.'}
              </p>
              <PublicLinks />
            </div>
          </div>
        );

      case 'port-view':
        return (
          <div>
            <h3>Port View</h3>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: '20px'}}>
              {isDev 
                ? 'Monitor different localhost ports and services running on your development machine.' 
                : 'Access available public ports and services.'}
            </p>
            
            <div className="port-management">
              {isDev && (
                <>
                  <div className="port-management-header">
                    <h4>Port Management</h4>
                    <button 
                      className="btn btn-sm add-port-btn"
                      onClick={() => setShowAddPort(true)}
                      style={{backgroundColor: 'var(--color-success)', color: 'var(--color-surface)'}}
                    >
                      Add Custom Port
                    </button>
                  </div>

                  {showAddPort && (
                    <div className="add-port-form">
                      <h5>{editingPort ? 'Edit Port' : 'Add New Port'}</h5>
                      <div className="form-row">
                        <input
                          type="number"
                          placeholder="Port number (e.g., 3000)"
                          value={newPortData.port}
                          onChange={(e) => setNewPortData({...newPortData, port: e.target.value})}
                          style={{padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginRight: '10px', background: 'var(--color-surface)', color: 'var(--color-text)'}}
                        />
                        <input
                          type="text"
                          placeholder="Service name (e.g., My API)"
                          value={newPortData.name}
                          onChange={(e) => setNewPortData({...newPortData, name: e.target.value})}
                          style={{padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginRight: '10px', background: 'var(--color-surface)', color: 'var(--color-text)'}}
                        />
                      </div>
                      <div className="form-row" style={{marginTop: '10px'}}>
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={newPortData.description}
                          onChange={(e) => setNewPortData({...newPortData, description: e.target.value})}
                          style={{padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', marginRight: '10px', width: '300px', background: 'var(--color-surface)', color: 'var(--color-text)'}}
                        />
                      </div>
                      <div className="form-row" style={{marginTop: '10px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                          <input
                            type="checkbox"
                            checked={newPortData.isPublic}
                            onChange={(e) => setNewPortData({...newPortData, isPublic: e.target.checked})}
                            style={{margin: 0}}
                          />
                          <span>Make this port available to all users</span>
                        </label>
                      </div>
                      <div className="form-actions" style={{marginTop: '15px'}}>
                        <button 
                          className="btn btn-sm"
                          onClick={editingPort ? handleUpdatePort : handleAddPort}
                          style={{backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)'}}
                        >
                          {editingPort ? 'Update Port' : 'Add Port'}
                        </button>
                        <button 
                          className="btn btn-sm"
                          onClick={cancelPortEdit}
                          style={{backgroundColor: 'var(--color-text-secondary)', color: 'var(--color-surface)'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="port-selector">
              <h4>{isDev ? 'Port Quick Access:' : 'Available Ports:'}</h4>
              <p style={{color: 'var(--color-text-secondary)', marginBottom: '15px', fontSize: '14px'}}>
                {isDev 
                  ? 'Click on any port to open it in a dedicated view'
                  : 'Click on any available port to open it in a dedicated view'}
              </p>
              <div className="port-buttons">
                {accessiblePorts.map(portInfo => (
                  <div key={portInfo.isCustom ? portInfo.id : portInfo.port} className="port-button-container">
                    <Link
                      to={`/port/${portInfo.port}`}
                      className="port-button"
                    >
                      <strong>:{portInfo.port}</strong>
                      <span>
                        {portInfo.name}
                        {portInfo.isPublic && <span className="public-badge">👥</span>}
                        {portInfo.User && portInfo.User.name && (
                          <span className="port-owner"> by {portInfo.User.name}</span>
                        )}
                      </span>
                    </Link>
                    {/* Only show edit/delete for developers on their own custom ports */}
                    {isDev && portInfo.isCustom && portInfo.userId === user?.profile?.id && (
                      <div className="port-actions">
                        <button 
                          className="port-action-btn edit-btn"
                          onClick={() => handleEditPort(portInfo.id)}
                          title="Edit port"
                        >
                          Edit
                        </button>
                        <button 
                          className="port-action-btn delete-btn"
                          onClick={() => handleDeletePort(portInfo.id)}
                          title="Delete port"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="custom-port">
                {isDev && (
                  <>
                    <input
                      type="number"
                      placeholder="Quick port access..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          navigate(`/port/${e.target.value}`);
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderRadius: '4px',
                        marginRight: '10px'
                      }}
                    />
                    <span style={{color: 'var(--color-text-secondary)', fontSize: '12px'}}>Press Enter to navigate to any port</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {isDev ? 'Developer Dashboard' : 'User Dashboard'}
          {isDev && <span className="dev-badge">DEV</span>}
        </h1>
        <div className="user-info">
          Welcome back, <strong>{userProfile?.name || 'User'}</strong> ({userProfile?.email})
        </div>
        <div className="dashboard-actions">
          <Link to="/profile" className="btn btn-sm">
            Profile
          </Link>
          <a href="/" className="btn btn-sm" style={{backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text)'}}>
            Public Site
          </a>
          <button className="btn btn-sm" onClick={handleLogout} style={{backgroundColor: 'var(--color-error)', color: 'var(--color-surface)'}}>
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
