import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import LinkTree from '../components/LinkTree';
import './LinktreePage.css';

const LinktreePage = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div className={`linktree-page theme-${currentTheme}`}>
      <nav className="linktree-nav">
        <Link to="/" className="back-to-main">
          ← Back to Home
        </Link>
      </nav>
      
      <div className="linktree-page-container">
        <div className="linktree-page-header">
          <h1>My Linktree</h1>
          <p className="linktree-subtitle">
            Organize and share your important links
          </p>
        </div>
        
        <div className="linktree-content">
          <LinkTree />
        </div>
      </div>
    </div>
  );
};

export default LinktreePage;
