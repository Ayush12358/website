import React from 'react';
import { Link } from 'react-router-dom';
import './ResumePage.css';

const ResumePage = ({ isAuthenticated = false }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Resume.pdf';
    link.click();
  };

  return (
    <div className="resume-container">
      <div className="resume-header">
        <h1>Welcome to My Portfolio</h1>
        <p>Discover my professional experience and skills</p>
        <div className="resume-actions">
          <button onClick={handleDownload} className="btn btn-primary">
            Download Resume
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              User Login
            </Link>
          )}
        </div>
      </div>

      <div className="resume-viewer">
        <div className="pdf-container">
          <iframe
            src="/resume.pdf"
            width="100%"
            height="800px"
            title="Resume"
            className="pdf-iframe"
          >
            <p>
              Your browser doesn't support PDF viewing. 
              <button onClick={handleDownload} className="link-button">
                Click here to download the resume
              </button>
            </p>
          </iframe>
        </div>
      </div>

      <div className="resume-footer">
        <p>Interested in my work? Let's connect!</p>
        <div className="contact-links">
          <a href="mailto:ayushmaurya2003@gmail.com" className="contact-link">
            Email
          </a>
          <a href="https://linkedin.com/in/ayush-maurya-a41a9721a/" target="_blank" rel="noopener noreferrer" className="contact-link">
            LinkedIn
          </a>
          <a href="https://github.com/Ayush12358" target="_blank" rel="noopener noreferrer" className="contact-link">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
