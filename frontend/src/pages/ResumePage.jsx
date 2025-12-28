import React from 'react';
import { Link } from 'react-router-dom';
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
        <h1 className="animate-fade-in">Ayush Maurya</h1>
        <p className="resume-subtitle animate-fade-in">
          Computer Science Engineering Student • IIIT Hyderabad
        </p>
        <div className="resume-actions animate-fade-in">
          <button onClick={handleDownload} className="btn btn-primary">
            Download PDF
          </button>
          <Link to="/blog" className="btn btn-glass">
            Blog
          </Link>
          <Link to="/sitemap" className="btn btn-glass">
            Site Map
          </Link>
          <Link to="/release-notes" className="btn btn-glass">
            Updates
          </Link>
          <Link to="/roadmap" className="btn btn-glass">
            Roadmap
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-glass">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-glass">
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="resume-content">
        <div className="resume-main">
          {/* About Me */}
          <section className="resume-section animate-fade-in">
            <h2><span>👤</span> About Me</h2>
            <p>
              Proficiently trained in both human sciences and computer science, I possess a unique perspective
              that enables me to comprehend the far-reaching implications and outcomes of technological advancements.
              My work focuses on the intersection of technical excellence and human-centric design.
            </p>
          </section>

          {/* Education */}
          <section className="resume-section animate-fade-in">
            <h2><span>🎓</span> Education</h2>
            <div className="education-item">
              <div className="header-flex">
                <h3>IIIT Hyderabad</h3>
                <span className="date">2021 – Present</span>
              </div>
              <p className="degree">B.Tech in Computer Science Engineering (CSE)</p>
              <p className="degree">M.S. by Research in Computing and Human Sciences</p>
            </div>
            <div className="education-item">
              <div className="header-flex">
                <h3>Mary Gardiner's Convent School</h3>
                <span className="date">2021</span>
              </div>
              <p className="degree">Class XII - 90.1%</p>
            </div>
            <div className="education-item">
              <div className="header-flex">
                <h3>City Montessori School</h3>
                <span className="date">2019</span>
              </div>
              <p className="degree">Class X - 94.2%</p>
            </div>
          </section>

          {/* Experience */}
          <section className="resume-section animate-fade-in">
            <h2><span>💼</span> Experience</h2>
            <div className="experience-item">
              <div className="header-flex">
                <h3>SERC Digital Twin</h3>
                <span className="date">Real-time IoT</span>
              </div>
              <p className="experience-desc">
                Led development of a real-time environmental monitoring digital twin using MERN stack and
                on-campus sensors (temp, humidity, water, air quality). Followed full SDLC over 8 sprints.
              </p>
              <div className="skills-tags">
                <span className="skill-tag">System Design</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">IoT</span>
                <span className="skill-tag">MERN</span>
              </div>
            </div>
            <div className="experience-item">
              <div className="header-flex">
                <h3>tafea - System Design</h3>
                <span className="date">Product Lead</span>
              </div>
              <p className="experience-desc">
                Designed an end-to-end client software system following SDLC. Leveraged LLM to create
                student-catered features.
              </p>
              <div className="skills-tags">
                <span className="skill-tag">UX Research</span>
                <span className="skill-tag">Product Design</span>
                <span className="skill-tag">LLM Integration</span>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="resume-section animate-fade-in">
            <h2><span>🚀</span> Key Projects</h2>
            <div className="projects-grid">
              <div className="project-item">
                <h3>Age Prediction Model</h3>
                <p>Predicting age from images using transfer learning and ensemble methods with high accuracy.</p>
                <div className="skills-tags">
                  <span className="skill-tag">ML</span>
                  <span className="skill-tag">PyTorch</span>
                </div>
              </div>
              <div className="project-item">
                <h3>ML for Local Geoguesser</h3>
                <p>Predicted location details from images using ResNet50 with attention. Achieved 92% region accuracy.</p>
                <div className="skills-tags">
                  <span className="skill-tag">ResNet50</span>
                  <span className="skill-tag">Vision AI</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Katha Marketplace</h3>
                <p>Designed a UI/UX solution for local artisans using digital storytelling to enhance engagement.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Design Thinking</span>
                  <span className="skill-tag">Marketplace</span>
                </div>
              </div>
              <div className="project-item">
                <h3>Hoi Shell</h3>
                <p>Built a custom shell in C supporting Linux commands, piping, and redirection.</p>
                <div className="skills-tags">
                  <span className="skill-tag">Systems</span>
                  <span className="skill-tag">C/C++</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="resume-sidebar">
          {/* Contact */}
          <section className="sidebar-section animate-fade-in">
            <h2><span>✉️</span> Connectivity</h2>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <a href="mailto:ayushmaurya2003@gmail.com">Email (Personal)</a>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🏢</div>
              <a href="mailto:ayush.maurya@research.iiit.ac.in">Email (IIIT-H)</a>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <span>+91-7985149173</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🔗</div>
              <a href="https://linkedin.com/in/ayush-maurya-a41a9721a" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            <div className="contact-item">
              <div className="contact-icon">👨‍💻</div>
              <a href="https://github.com/Ayush12358" target="_blank" rel="noopener noreferrer">GitHub Profile</a>
            </div>
          </section>

          {/* Skills */}
          <section className="sidebar-section animate-fade-in">
            <h2><span>⚡</span> Expertise</h2>
            <div className="skills-category">
              <h4>Languages</h4>
              <div className="skills-tags">
                <span className="skill-tag">Python</span>
                <span className="skill-tag">C++</span>
                <span className="skill-tag">JS</span>
              </div>
            </div>
            <div className="skills-category">
              <h4>Frameworks</h4>
              <div className="skills-tags">
                <span className="skill-tag">React</span>
                <span className="skill-tag">Node</span>
                <span className="skill-tag">PyTorch</span>
              </div>
            </div>
            <div className="skills-category">
              <h4>Design Tools</h4>
              <div className="skills-tags">
                <span className="skill-tag">Figma</span>
                <span className="skill-tag">Adobe XD</span>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="sidebar-section animate-fade-in">
            <h2><span>🏆</span> Honours</h2>
            <div className="course-item">
              <h4>UGEE Rank: 111</h4>
              <p>Top 0.3% out of 40,000+ candidates</p>
            </div>
            <div className="course-item">
              <h4>Cultural Merit</h4>
              <p>Base Guitarist, 2nd Place Inter-house</p>
            </div>
          </section>
        </div>
      </div>

      <div className="resume-footer">
        <p className="animate-fade-in">Interested in building something great together?</p>
        <div className="contact-links animate-fade-in">
          <a href="mailto:ayushmaurya2003@gmail.com" className="btn btn-primary">Let's Connect</a>
          <a href="https://github.com/Ayush12358" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">GitHub</a>
        </div>
      </div>
    </div>
  );
};

    </div >
  );
};

export default ResumePage;
