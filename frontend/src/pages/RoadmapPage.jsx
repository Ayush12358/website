import React from 'react';
import { Link } from 'react-router-dom';
import './SitemapPage.css'; // Reuse sitemap styling

const RoadmapPage = () => {
  const roadmapItems = [
    {
      phase: "Current Sprint",
      status: "in-progress",
      timeframe: "August 2025",
      items: [
        {
          title: "Enhanced Link Management",
          description: "Improve link editing capabilities with URL validation and better UX",
          priority: "high",
          status: "completed"
        },
        {
          title: "Public Links System",
          description: "Admin-managed public links visible to all users",
          priority: "high",
          status: "completed"
        },
        {
          title: "UI/UX Improvements",
          description: "Better responsive design and theme integration",
          priority: "medium",
          status: "in-progress"
        }
      ]
    },
    {
      phase: "Next Release (v2.2.0)",
      status: "planned",
      timeframe: "September 2025",
      items: [
        {
          title: "Link Analytics",
          description: "Track click counts and popular links for admin insights",
          priority: "medium",
          status: "planned"
        },
        {
          title: "Link Categories",
          description: "Categorize and tag links for better organization",
          priority: "medium",
          status: "planned"
        },
        {
          title: "Bulk Link Operations",
          description: "Import/export links and bulk editing capabilities",
          priority: "low",
          status: "planned"
        },
        {
          title: "Link Validation",
          description: "Automatic link health checking and broken link detection",
          priority: "medium",
          status: "planned"
        }
      ]
    },
    {
      phase: "Major Features (v3.0.0)",
      status: "planned",
      timeframe: "Q4 2025",
      items: [
        {
          title: "Multi-User LinkTrees",
          description: "Allow multiple users to have their own public LinkTrees",
          priority: "high",
          status: "planned"
        },
        {
          title: "Custom Themes",
          description: "User-customizable themes and branding options",
          priority: "medium",
          status: "planned"
        },
        {
          title: "API Access",
          description: "Public API for external integrations and mobile apps",
          priority: "low",
          status: "planned"
        },
        {
          title: "Advanced Analytics",
          description: "Detailed analytics dashboard with charts and insights",
          priority: "medium",
          status: "planned"
        }
      ]
    },
    {
      phase: "Future Enhancements",
      status: "research",
      timeframe: "2026",
      items: [
        {
          title: "Mobile Application",
          description: "Native mobile app for iOS and Android",
          priority: "low",
          status: "research"
        },
        {
          title: "Team Collaboration",
          description: "Multi-user editing and collaboration features",
          priority: "medium",
          status: "research"
        },
        {
          title: "Integration Platform",
          description: "Connect with popular services like GitHub, LinkedIn, etc.",
          priority: "low",
          status: "research"
        },
        {
          title: "Advanced Security",
          description: "Two-factor authentication and enhanced security features",
          priority: "high",
          status: "research"
        }
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'in-progress': return '#3498db';
      case 'planned': return '#f39c12';
      case 'research': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="sitemap-container">
      <div className="sitemap-header">
        <h1>Development Roadmap</h1>
        <p className="sitemap-subtitle">Planned features and improvements for the website</p>
        <div className="sitemap-actions">
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
          <Link to="/release-notes" className="btn btn-secondary">
            View Release Notes
          </Link>
        </div>
      </div>

      <div className="sitemap-content">
        <div className="sitemap-intro">
          <h2>What's Coming Next</h2>
          <p>
            This roadmap outlines the planned features and improvements for the website. 
            Priorities and timelines may change based on user feedback and development progress.
          </p>
          
          <div className="roadmap-legend">
            <h4>Status Legend:</h4>
            <div className="legend-items">
              <span className="legend-item">
                <span className="status-indicator" style={{backgroundColor: getStatusColor('completed')}}></span>
                Completed
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{backgroundColor: getStatusColor('in-progress')}}></span>
                In Progress
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{backgroundColor: getStatusColor('planned')}}></span>
                Planned
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{backgroundColor: getStatusColor('research')}}></span>
                Research Phase
              </span>
            </div>
          </div>
        </div>

        <div className="sitemap-sections">
          {roadmapItems.map((phase, index) => (
            <div key={index} className="sitemap-section">
              <div className="roadmap-phase-header">
                <h2 className="phase-title">{phase.phase}</h2>
                <div className="phase-meta">
                  <span className="phase-timeframe">{phase.timeframe}</span>
                  <span className={`phase-status ${phase.status}`}>
                    {phase.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="roadmap-items">
                {phase.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="roadmap-item">
                    <div className="item-header">
                      <h4 className="item-title">{item.title}</h4>
                      <div className="item-badges">
                        <span 
                          className="priority-badge" 
                          style={{backgroundColor: getPriorityColor(item.priority)}}
                        >
                          {item.priority} priority
                        </span>
                        <span 
                          className="status-badge" 
                          style={{backgroundColor: getStatusColor(item.status)}}
                        >
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="item-description">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sitemap-footer">
          <h3>Have Ideas?</h3>
          <p>
            Got suggestions for new features or improvements? Feel free to reach out through the 
            contact information on the <Link to="/" className="inline-link">homepage</Link> or 
            use the chat feature in the <Link to="/dashboard" className="inline-link">dashboard</Link> 
            if you're a registered user.
          </p>
          <p>
            <strong>Note:</strong> This roadmap is subject to change based on user feedback, 
            technical constraints, and development priorities. Check back regularly for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
