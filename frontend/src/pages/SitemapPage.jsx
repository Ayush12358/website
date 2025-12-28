import React from 'react';
import { Link } from 'react-router-dom';
import './SitemapPage.css';

const SitemapPage = () => {

  const siteStructure = [
    {
      title: 'Main Pages',
      links: [
        { path: '/', label: 'Home / Resume' },
        { path: '/blog', label: 'Blog' },
        { path: '/login', label: 'Login' },
        { path: '/signup', label: 'Sign Up' },
        { path: '/forgot-password', label: 'Forgot Password' },
      ]
    },
    {
      title: 'User Dashboard',
      links: [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'Profile' },
        { path: '/reset-password', label: 'Reset Password' },
      ]
    },
    {
      title: 'Blog System',
      links: [
        { path: '/blog', label: 'Blog Home' },
        { path: '/blog/admin', label: 'Blog Management (Admin)' },
        { path: '/blog/new', label: 'Create New Post (Admin)' },
      ]
    },
    {
      title: 'Developer Tools',
      links: [
        { path: '/port/3000', label: 'React Dev Server (Port 3000)' },
        { path: '/port/5001', label: 'Backend API (Port 5001)' },
        { path: '/port/8000', label: 'Frontend App (Port 8000)' },
        { path: '/admin/chat', label: 'Admin Chat (Developer Only)' },
      ]
    },
    {
      title: 'Other',
      links: [
        { path: '/sitemap', label: 'Sitemap (Current Page)' },
        { path: '/404', label: '404 - Page Not Found' },
      ]
    }
  ];

  return (
    <div className="sitemap-page">
      <div className="sitemap-nav">
        <Link to="/" className="back-to-main">
          ← Back to Main Site
        </Link>
      </div>

      <div className="sitemap-header">
        <h1>Site Map</h1>
        <p>Complete navigation structure of the website</p>
      </div>

      <div className="sitemap-content">
        {siteStructure.map((section, index) => (
          <div key={index} className="sitemap-section">
            <h2>{section.title}</h2>
            <ul className="sitemap-links">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  {link.path === '/sitemap' ? (
                    <span className="current-page">{link.label}</span>
                  ) : (
                    <Link to={link.path} className="sitemap-link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sitemap-footer">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This sitemap provides an overview of all available pages and sections
          on the website for easy navigation.
        </p>
      </div>
    </div>
  );
};

export default SitemapPage;
