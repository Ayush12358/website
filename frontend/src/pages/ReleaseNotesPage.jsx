import React from 'react';
import { Link } from 'react-router-dom';
import './SitemapPage.css'; // Reuse sitemap styling

const ReleaseNotesPage = () => {
  const releases = [
    {
      version: "v2.1.0",
      date: "August 12, 2025",
      type: "Major Feature Update",
      changes: [
        {
          category: "New Features",
          items: [
            "✨ Public Links - Admin-managed links visible to all users",
            "✨ Enhanced Link Editing - Edit both name and URL for personal and public links",
            "✨ Improved Dashboard Layout - Combined personal and public links in single tab",
            "🔗 URL Validation - Better link management with proper URL handling"
          ]
        },
        {
          category: "Improvements",
          items: [
            "🎨 Better Link Tree UI - Inline editing forms instead of popups",
            "📱 Responsive Design - Improved mobile experience for link management",
            "🔒 Enhanced Security - Admin privilege checking for public links",
            "⚡ Performance - Optimized database queries and frontend rendering"
          ]
        },
        {
          category: "Bug Fixes",
          items: [
            "🐛 Fixed user authentication context for admin controls",
            "🐛 Resolved link editing state management issues",
            "🐛 Fixed dropdown visibility in nested folders",
            "🐛 Corrected theme integration across all components"
          ]
        }
      ]
    },
    {
      version: "v2.0.0",
      date: "August 10, 2025",
      type: "Major Release",
      changes: [
        {
          category: "New Features",
          items: [
            "🌳 Personal LinkTree - Collapsible tree structure for organizing links",
            "📁 Folder Support - Create nested folders for better organization",
            "🎨 Theme Integration - Full theme support with CSS custom properties",
            "💾 Database Storage - Backend storage with SQLite and Sequelize"
          ]
        },
        {
          category: "Technical",
          items: [
            "🏗️ Backend API - RESTful endpoints for CRUD operations",
            "🔐 Authentication - JWT-based user authentication",
            "📊 Database Models - Proper data modeling with relationships",
            "🧪 Error Handling - Comprehensive error management"
          ]
        }
      ]
    },
    {
      version: "v1.5.0",
      date: "August 5, 2025",
      type: "Feature Update",
      changes: [
        {
          category: "New Features",
          items: [
            "💬 Chat System - Real-time chat with admin",
            "🎨 Theme System - Multiple color themes",
            "📝 Blog Integration - Blog posts and content management",
            "🌐 Port Management - Developer port monitoring"
          ]
        },
        {
          category: "Infrastructure",
          items: [
            "🗄️ Database Backups - Automated backup system",
            "🔧 Configuration - Environment-based settings",
            "📦 Dependency Updates - Latest package versions",
            "🛡️ Security - Enhanced security measures"
          ]
        }
      ]
    },
    {
      version: "v1.0.0",
      date: "July 20, 2025",
      type: "Initial Release",
      changes: [
        {
          category: "Core Features",
          items: [
            "👤 User Authentication - Login and registration system",
            "📄 Resume Display - Professional resume showcase",
            "🎯 Dashboard - User and admin dashboards",
            "📱 Responsive Design - Mobile-friendly interface"
          ]
        },
        {
          category: "Technical Foundation",
          items: [
            "⚛️ React Frontend - Modern React.js application",
            "🚀 Node.js Backend - Express.js server",
            "💾 SQLite Database - Local database storage",
            "🎨 CSS Themes - Custom CSS property system"
          ]
        }
      ]
    }
  ];

  return (
    <div className="sitemap-container">
      <div className="sitemap-header">
        <h1>Release Notes</h1>
        <p className="sitemap-subtitle">Track the evolution and improvements</p>
      </div>

      <div className="sitemap-content">
        <div className="sitemap-intro">
          <p>
            Documentation of all major releases, features, and improvements made to the website.
          </p>
        </div>

        <div className="sitemap-sections">
          {releases.map((release, index) => (
            <div key={release.version} className="sitemap-section">
              <div className="release-header">
                <h2 className="release-version">{release.version}</h2>
                <div className="release-meta">
                  <span className="release-date">{release.date}</span>
                  <span className={`release-type ${release.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    {release.type}
                  </span>
                </div>
              </div>

              {release.changes.map((category, categoryIndex) => (
                <div key={categoryIndex} className="release-category">
                  <h3 className="category-title">{category.category}</h3>
                  <ul className="category-items">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="category-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sitemap-footer">
          <h3>Stay Updated</h3>
          <p>
            Follow the development progress and upcoming features on the{' '}
            <Link to="/roadmap" className="inline-link">roadmap page</Link>.
            For questions or feedback, feel free to reach out through the contact information on the{' '}
            <Link to="/" className="inline-link">homepage</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesPage;
