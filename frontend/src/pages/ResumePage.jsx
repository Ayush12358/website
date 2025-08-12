import React from 'react';
import { Link } from 'react-router-dom';
import PublicLinks from '../components/PublicLinks';
import './ResumePage.css';

const ResumePage = ({ isAuthenticated = false }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'resume_ayush_maurya.pdf';
    link.click();
  };

  return (
    <div className="resume-container">
      <div className="resume-header">
        <h1>Ayush Maurya</h1>
        <p className="resume-subtitle">Computer Science Engineering Student • IIIT Hyderabad</p>
        <div className="resume-actions">
          <button onClick={handleDownload} className="btn btn-primary">
            Download PDF
          </button>
          <Link to="/blog" className="btn btn-secondary">
            Blog
          </Link>
          <Link to="/sitemap" className="btn btn-secondary">
            Site Map
          </Link>
          <Link to="/release-notes" className="btn btn-secondary">
            Release Notes
          </Link>
          <Link to="/roadmap" className="btn btn-secondary">
            Roadmap
          </Link>
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

      <div className="resume-content">
        <div className="resume-main">
          {/* About Me */}
          <section className="resume-section">
            <h2>About Me</h2>
            <p>
              Proficiently trained in both human sciences and computer science, I possess a unique perspective 
              that enables me to comprehend the far-reaching implications and outcomes of technological advancements.
            </p>
          </section>

          {/* Education */}
          <section className="resume-section">
            <h2>Education</h2>
            <div className="education-item">
              <div className="education-header">
                <h3>IIIT Hyderabad</h3>
                <span className="date">2021 – Present</span>
              </div>
              <p className="degree">B.Tech in Computer Science Engineering (CSE)</p>
              <p className="degree">M.S. by Research in Computing and Human Sciences</p>
            </div>
            <div className="education-item">
              <div className="education-header">
                <h3>Mary Gardiner's Convent School</h3>
                <span className="date">2021</span>
              </div>
              <p className="degree">Class XII - 90.1%</p>
            </div>
            <div className="education-item">
              <div className="education-header">
                <h3>City Montessori School, RDSO</h3>
                <span className="date">2019</span>
              </div>
              <p className="degree">Class X - 94.2%</p>
            </div>
          </section>

          {/* Work Experience */}
          <section className="resume-section">
            <h2>Work Experience</h2>
            <div className="experience-item">
              <h3>SERC Digital Twin</h3>
              <p className="experience-desc">
                Led development of a real-time environmental monitoring digital twin using MERN stack and 
                on-campus sensors (temp, humidity, water, air quality). Followed full SDLC over 8 sprints.
              </p>
              <div className="skills-tags">
                <span className="skill-tag">System Design</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">CSS</span>
                <span className="skill-tag">HTML</span>
                <span className="skill-tag">SQL</span>
              </div>
            </div>
            <div className="experience-item">
              <h3>tafea - System Design</h3>
              <p className="experience-desc">
                Designed an end-to-end client software system following SDLC. Leveraged LLM to create 
                student-catered features.
              </p>
              <div className="skills-tags">
                <span className="skill-tag">System Design</span>
                <span className="skill-tag">UI Design</span>
                <span className="skill-tag">User Research</span>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="resume-section">
            <h2>Key Projects</h2>
            <div className="projects-grid">
              <div className="project-item">
                <h3>Age Prediction Model</h3>
                <p>Developed a model to predict age from images using transfer learning and ensemble methods.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Machine Learning</span>
                  <span className="skill-tag">Image Processing</span>
                </div>
              </div>
              <div className="project-item">
                <h3>ML for Local Geoguesser</h3>
                <p>Created a model to predict location details from images using ResNet50 with attention. Achieved 92% region accuracy.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">PyTorch</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Katha Marketplace</h3>
                <p>Designed a UI/UX solution for local artisans using digital storytelling to enhance engagement.</p>
                <div className="skills-tags">
                  <span className="skill-tag">UI/UX Design</span>
                  <span className="skill-tag">Prototyping</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Campus Mart</h3>
                <p>UI/UX design of a buy-sell-rent app with unique NFC features for exchange and tracking.</p>
                <div className="skills-tags">
                  <span className="skill-tag">UI/UX</span>
                  <span className="skill-tag">Interaction Design</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Hoi Shell</h3>
                <p>Built a custom shell in C supporting preliminary Linux commands (ls, clr, piping etc.).</p>
                <div className="skills-tags">
                  <span className="skill-tag">C/C++</span>
                  <span className="skill-tag">Linux</span>
                  <span className="skill-tag">Teamwork</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Highland History Project</h3>
                <p>Digitized historical reports using OCR and LLMs to fix missing elements, part of a larger project mapping Himalayan trade networks.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Machine Learning</span>
                  <span className="skill-tag">Teamwork</span>
                  <span className="skill-tag">Image Processing</span>
                </div>
              </div>
              <div className="project-item">
                <h3>HSRC Summer Bootcamp</h3>
                <p>Trained in computational tools for Human Science. Co-authored The Hindu article, analyzed/visualized cricket data using Python.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Machine Learning</span>
                  <span className="skill-tag">Teamwork</span>
                  <span className="skill-tag">Research and Analysis</span>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="resume-section">
            <h2>Achievements</h2>
            <ul className="achievements-list">
              {/* <li> JEE Main Percentile: 96.9</li> */}
              <li> UGEE Rank: 111 / 40,000+ expected students</li>
              <li> Base Guitarist (2nd place, inter-house cultural competition band)</li>
              <li> Lawn Tennis Enthusiast</li>
            </ul>
          </section>
        </div>

        <div className="resume-sidebar">
          {/* Contact */}
          <section className="sidebar-section">
            <h2>Contact</h2>
            <div className="contact-item">
              <span className="contact-icon">✉</span>
              <a href="mailto:ayushmaurya2003@gmail.com">ayushmaurya2003@gmail.com</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉</span>
              <a href="mailto:ayush.maurya@research.iiit.ac.in">ayush.maurya@research.iiit.ac.in</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>+91-7985149173</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">💼</span>
              <a href="https://linkedin.com/in/ayush-maurya-a41a9721a" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🔗</span>
              <a href="https://github.com/Ayush12358" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </section>

          {/* Skills */}
          <section className="sidebar-section">
            <h2>Skills</h2>
            <div className="skills-category">
              <h4>Programming</h4>
              <div className="skills-tags">
                <span className="skill-tag">Python</span>
                <span className="skill-tag">C/C++</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">SQL</span>
              </div>
            </div>
            <div className="skills-category">
              <h4>Web Development</h4>
              <div className="skills-tags">
                <span className="skill-tag">HTML</span>
                <span className="skill-tag">CSS</span>
                <span className="skill-tag">React</span>
              </div>
            </div>
            <div className="skills-category">
              <h4>Machine Learning</h4>
              <div className="skills-tags">
                <span className="skill-tag">PyTorch</span>
                <span className="skill-tag">Image Processing</span>
              </div>
            </div>
            <div className="skills-category">
              <h4>Design</h4>
              <div className="skills-tags">
                <span className="skill-tag">UI/UX</span>
                <span className="skill-tag">Wireframing</span>
                <span className="skill-tag">Prototyping</span>
              </div>
            </div>
          </section>

          {/* Relevant Courses */}
          <section className="sidebar-section">
            <h2>Relevant Courses</h2>
            <div className="course-item">
              <h4>Design and Analysis of Software Systems</h4>
              <p>SDLC Training by Microsoft, Qualcomm experts</p>
              <span className="date">Dec 2024</span>
            </div>
            <div className="course-item">
              <h4>Human Science Lab (HSRC)</h4>
              <p>Trained in foundational NLP techniques</p>
              <span className="date">Dec 2022</span>
            </div>
          </section>

          {/* Publication */}
          <section className="sidebar-section">
            <h2>Publication</h2>
            <div className="publication-item">
              <h4>The Hindu: Data</h4>
              <p>The indirect impact of T20s on Test cricket</p>
              <p className="publication-desc">Co-authored article analyzing data trends in cricket formats</p>
            </div>
          </section>
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

      {/* Public Links Section */}
      <div className="public-links-section" style={{
        marginTop: '50px',
        padding: '40px 30px',
        background: 'var(--color-background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        maxWidth: '1200px',
        margin: '50px auto 0 auto'
      }}>
        <h2 style={{marginBottom: '25px', color: 'var(--color-text)', textAlign: 'center'}}>Useful Links</h2>
        <PublicLinks />
      </div>
    </div>
  );
};

export default ResumePage;
