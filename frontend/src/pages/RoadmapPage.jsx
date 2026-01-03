import React from 'react';
import { Link } from 'react-router-dom';
import './SitemapPage.css'; // Reuse sitemap styling
import './RoadmapPage.css'; // Specific overrides

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
      case 'high': return 'var(--color-error)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--color-success)';
      case 'in-progress': return 'var(--color-primary)';
      case 'planned': return 'var(--color-warning)';
      case 'research': return 'var(--color-secondary)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div className="sitemap-container roadmap-page">
      <div className="sitemap-header">
        <h1>Development Roadmap</h1>
        <p className="sitemap-subtitle">Planned features and improvements</p>
      </div>

      <div className="sitemap-content">
        <div className="sitemap-intro">
          <p>
            Upcoming features and improvements. Priorities may change based on progress and feedback.
          </p>

          <div className="roadmap-legend">
            <h4>Status Legend:</h4>
            <div className="legend-items">
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: getStatusColor('completed') }}></span>
                Completed
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: getStatusColor('in-progress') }}></span>
                In Progress
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: getStatusColor('planned') }}></span>
                Planned
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: getStatusColor('research') }}></span>
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
                          style={{ backgroundColor: getPriorityColor(item.priority) }}
                        >
                          {item.priority} priority
                        </span>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
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
