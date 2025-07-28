import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Chat from '../components/Chat';
import AdminChatComponent from '../components/AdminChatComponent';
import ThemeButton from '../components/ThemeButton';
import './DashboardPage.css';

const DashboardPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [userProfile, setUserProfile] = useState(null);
  const [isDev, setIsDev] = useState(false);
  const [selectedPort, setSelectedPort] = useState('5001');
  const [customPorts, setCustomPorts] = useState([]);
  const [showAddPort, setShowAddPort] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [newPortData, setNewPortData] = useState({ port: '', name: '', description: '' });


  useEffect(() => {
    if (user?.profile) {
      setUserProfile(user.profile);
      setIsDev(user.profile.email === 'ayushmaurya2003@gmail.com');
    } else {
      fetchUserProfile();
    }
    loadCustomPorts();
  }, [user]);

  const loadCustomPorts = () => {
    const savedPorts = localStorage.getItem('customPorts');
    if (savedPorts) {
      setCustomPorts(JSON.parse(savedPorts));
    }
  };

  const saveCustomPorts = (ports) => {
    localStorage.setItem('customPorts', JSON.stringify(ports));
    setCustomPorts(ports);
  };

  const handleAddPort = () => {
    if (newPortData.port && newPortData.name) {
      const newPort = {
        id: Date.now().toString(),
        port: newPortData.port,
        name: newPortData.name,
        description: newPortData.description,
        isCustom: true
      };
      const updatedPorts = [...customPorts, newPort];
      saveCustomPorts(updatedPorts);
      setNewPortData({ port: '', name: '', description: '' });
      setShowAddPort(false);
    }
  };

  const handleEditPort = (portId) => {
    const portToEdit = customPorts.find(p => p.id === portId);
    if (portToEdit) {
      setNewPortData({
        port: portToEdit.port,
        name: portToEdit.name,
        description: portToEdit.description
      });
      setEditingPort(portId);
      setShowAddPort(true);
    }
  };

  const handleUpdatePort = () => {
    if (newPortData.port && newPortData.name && editingPort) {
      const updatedPorts = customPorts.map(p => 
        p.id === editingPort 
          ? { ...p, port: newPortData.port, name: newPortData.name, description: newPortData.description }
          : p
      );
      saveCustomPorts(updatedPorts);
      setNewPortData({ port: '', name: '', description: '' });
      setEditingPort(null);
      setShowAddPort(false);
    }
  };

  const handleDeletePort = (portId) => {
    const updatedPorts = customPorts.filter(p => p.id !== portId);
    saveCustomPorts(updatedPorts);
    // If the deleted port was selected, switch to default
    const deletedPort = customPorts.find(p => p.id === portId);
    if (deletedPort && selectedPort === deletedPort.port) {
      setSelectedPort('5001');
    }
  };

  const cancelPortEdit = () => {
    setNewPortData({ port: '', name: '', description: '' });
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

  const tabs = isDev ? [
    { id: 'chat', label: 'Chat with Me', icon: '' },
    { id: 'port-view', label: 'Port View', icon: '' }
  ] : [
    { id: 'chat', label: 'Chat', icon: '' }
  ];

  const defaultPorts = [
    { port: '3000', name: 'React Dev Server', description: 'Default React development server', isCustom: false },
    { port: '5001', name: 'Backend API', description: 'Node.js/Express backend server', isCustom: false },
    { port: '8000', name: 'Frontend App', description: 'Current frontend application', isCustom: false },
    { port: '3001', name: 'Alternative React', description: 'Secondary React development port', isCustom: false },
    { port: '4000', name: 'GraphQL Server', description: 'GraphQL API server', isCustom: false },
    { port: '8080', name: 'HTTP Server', description: 'Common HTTP server port', isCustom: false },
    { port: '9000', name: 'Development Server', description: 'General development server', isCustom: false }
  ];

  const allPorts = [...defaultPorts, ...customPorts];

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

      case 'port-view':
        return (
          <div>
            <h3>Port View</h3>
            <p style={{color: 'var(--color-text-secondary)', marginBottom: '20px'}}>
              Monitor different localhost ports and services running on your development machine.
            </p>
            
            <div className="port-management">
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
            </div>
            
            <div className="port-selector">
              <h4>Select Port to View:</h4>
              <div className="port-buttons">
                {allPorts.map(portInfo => (
                  <div key={portInfo.isCustom ? portInfo.id : portInfo.port} className="port-button-container">
                    <button
                      className={`port-button ${selectedPort === portInfo.port ? 'active' : ''}`}
                      onClick={() => setSelectedPort(portInfo.port)}
                    >
                      <strong>:{portInfo.port}</strong>
                      <span>{portInfo.name}</span>
                    </button>
                    {portInfo.isCustom && (
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
                <input
                  type="number"
                  placeholder="Quick port access..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedPort(e.target.value);
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
                <span style={{color: 'var(--color-text-secondary)', fontSize: '12px'}}>Press Enter for quick access to any port</span>
              </div>
            </div>

            <div className="port-viewer">
              <div className="port-info">
                <h4>Viewing: localhost:{selectedPort}</h4>
                {allPorts.find(p => p.port === selectedPort) && (
                  <p style={{color: 'var(--color-text-secondary)', fontSize: '14px'}}>
                    {allPorts.find(p => p.port === selectedPort).description}
                  </p>
                )}
              </div>
              
              <div className="iframe-container">
                <iframe
                  src={`http://localhost:${selectedPort}`}
                  width="100%"
                  height="600px"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-surface)'
                  }}
                  title={`Port ${selectedPort} View`}
                  onError={() => console.log(`Failed to load port ${selectedPort}`)}
                >
                  <p style={{padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
                    Unable to load localhost:{selectedPort}. 
                    <br />
                    Make sure a service is running on this port.
                  </p>
                </iframe>
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
