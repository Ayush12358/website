import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeButton from './ThemeButton';
import './Header.css';

const Header = ({ onMenuClick, isSidebarOpen }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="global-header">
            <div className="header-container">
                <div className="header-left">
                    <Link to="/" className="header-logo">
                        AYUSH MAURYA
                    </Link>

                    <nav className="header-nav">
                        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                            Resume
                        </Link>
                        <Link to="/blog" className={`nav-link ${isActive('/blog') ? 'active' : ''}`}>
                            Blog
                        </Link>
                        <Link to="/roadmap" className={`nav-link ${isActive('/roadmap') ? 'active' : ''}`}>
                            Roadmap
                        </Link>
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            Dashboard
                        </Link>
                    </nav>
                </div>

                <div className="header-right">
                    <div className="header-actions">
                        <ThemeButton size="small" />
                        <button
                            className={`header-toggle ${isSidebarOpen ? 'active' : ''}`}
                            onClick={onMenuClick}
                            aria-label="Toggle settings"
                            title="Settings"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
