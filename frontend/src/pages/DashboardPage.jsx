import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Chat from '../components/Chat';
import AdminChatComponent from '../components/AdminChatComponent';
import LinkTree from '../components/LinkTree';
import PublicLinks from '../components/PublicLinks';
import './DashboardPage.css';

const DashboardPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [userProfile, setUserProfile] = useState(null);
  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    if (user?.profile) {
      setUserProfile(user.profile);
      const devStatus = user.profile.email === 'ayushmaurya2003@gmail.com';
      setIsDev(devStatus);
    } else {
      fetchUserProfile();
    }
  }, [user]);

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

  const tabs = [
    { id: 'chat', label: isDev ? 'Chat with Me' : 'Chat', icon: '' },
    { id: 'linktree', label: 'Linktree', icon: '' }
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
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Organize and manage your important links in a tree structure.
            </p>
            <LinkTree />

            {/* Public Links Section */}
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--color-border)' }}>
              <h3>Public Links</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                {isDev
                  ? 'Manage public links that are visible to all users.'
                  : 'Browse links and resources shared by the admin.'}
              </p>
              <PublicLinks />
            </div>
          </div>
        );


      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <div className="header-title">
          <h1>Dashboard</h1>
          <div className="user-info">
            Welcome back, <strong>{userProfile?.name || 'User'}</strong>
          </div>
        </div>
        <div className="dashboard-actions">
          <Link to="/profile" className="btn btn-sm">
            Profile Settings
          </Link>
          <Link to="/" className="btn btn-sm btn-glass">
            View Public Site
          </Link>
          <button className="btn btn-sm btn-error" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main animate-fade-in">
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
