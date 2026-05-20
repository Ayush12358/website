import "./index.css";
import "./App.css";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type LabeledValue = {
  label: string;
  value: string;
};

type TimelineEntry = {
  title: string;
  date: string;
  lines: string[];
};

type TaggedEntry = {
  title: string;
  date: string;
  description: string;
  tags: string[];
};

type ProjectEntry = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
};

type ContactEntry = {
  code: string;
  label: string;
  href?: string;
};

const heroHighlights = [
  "Software Engineering",
  "Machine Learning",
  "Human Sciences",
];

const profileMetrics: LabeledValue[] = [
  { value: "2021", label: "Started B.Tech/M.S." },
  { value: "111", label: "UGEE Rank" },
];

const education: TimelineEntry[] = [
  {
    title: "IIIT Hyderabad",
    date: "2021 – Present",
    lines: [
      "B.Tech in Computer Science Engineering (CSE)",
      "M.S. by Research in Computing and Human Sciences (Ongoing)",
    ],
  },
  {
    title: "Relevant Coursework & Labs",
    date: "2022 – 2024",
    lines: [
      "Design & Analysis of Software Systems",
      "Human Science Lab (NLP Research)",
    ],
  },
  {
    title: "Mary Gardiner's Convent School",
    date: "2021",
    lines: ["Class XII - 90.1%"],
  },
  {
    title: "City Montessori School",
    date: "2019",
    lines: ["Class X - 94.2%"],
  },
];

const experiences: TaggedEntry[] = [
  {
    title: "SERC Digital Twin",
    date: "Environmental IoT",
    description:
      "Developed a real-time environmental monitoring dashboard using the MERN stack, integrating local sensors for temperature, humidity, water, and air quality.",
    tags: ["MERN", "IoT", "SQL"],
  },
  {
    title: "tafea",
    date: "System Design",
    description:
      "Designed a student client software system using standard SDLC methodologies and integrated LLM APIs.",
    tags: ["System Design", "UI Design", "LLM"],
  },
];

const projects: ProjectEntry[] = [
  {
    title: "ML for Local Geoguesser",
    description:
      "Created a location prediction model using ResNet50 to estimate latitude, longitude, region, and angle from images, achieving 92% region accuracy.",
    tags: ["Python", "Machine Learning", "PyTorch"],
  },
  {
    title: "ElectoralSim",
    description:
      "Developed an open-source Python library for simulating electoral systems and voting methods as a side project of human sciences research.",
    tags: ["Python", "Simulation", "Open Source"],
    href: "https://pypi.org/project/electoral-sim",
  },
  {
    title: "CrowdTwin",
    description:
      "Created a predictive crowd monitoring dashboard prototype as part of a Tech Product Entrepreneurship course, focusing on idea refinement and pitching to guest evaluators.",
    tags: ["Next.js", "Product Design", "Prototype"],
    href: "https://crowdtwin.vercel.app/",
  },
  {
    title: "Highland History Project",
    description:
      "Digitized historical documents using OCR and LLM-assisted text recovery to map Himalayan trade networks.",
    tags: ["Machine Learning", "OCR", "LLM"],
  },
  {
    title: "Age Prediction Model",
    description:
      "Developed a model to predict age from images using transfer learning and compared it with ensemble methods like Random Forests and SVMs.",
    tags: ["Machine Learning", "PyTorch"],
  },
  {
    title: "Hoi Shell",
    description:
      "Built a custom shell in C supporting basic Linux commands, piping, and redirection.",
    tags: ["C/C++", "Linux", "Systems"],
  },
  {
    title: "Campus Mart",
    description:
      "Designed UI/UX for a buy-sell-rent application featuring NFC tracking integration.",
    tags: ["UI/UX Design", "Prototyping"],
  },
  {
    title: "Katha Marketplace",
    description:
      "Designed a prototype storytelling-based marketplace interface for local artisans.",
    tags: ["UI/UX Design", "Wireframing"],
  },
];

const contacts: ContactEntry[] = [
  {
    code: "EM",
    label: "Email (Personal)",
    href: "mailto:ayushmaurya2003@gmail.com",
  },
  {
    code: "II",
    label: "Email (IIIT-H)",
    href: "mailto:ayush.maurya@research.iiit.ac.in",
  },
  {
    code: "PH",
    label: "+91-7985149173",
  },
  {
    code: "IN",
    label: "LinkedIn",
    href: "https://linkedin.com/in/ayush-maurya-a41a9721a",
  },
  {
    code: "GH",
    label: "GitHub Profile",
    href: "https://github.com/Ayush12358",
  },
];

const expertise: Array<{ category: string; tags: string[] }> = [
  {
    category: "Languages",
    tags: ["Python", "C/C++", "JavaScript", "SQL", "HTML/CSS"],
  },
  {
    category: "Technologies",
    tags: ["Machine Learning", "PyTorch", "Linux", "System Design", "Image Processing"],
  },
  {
    category: "UI/UX & Design",
    tags: ["Wireframing", "Prototyping", "User Stories", "User Research", "Interaction Design"],
  },
];

const honours = [
  {
    title: "UGEE Rank: 111",
    description: "Rank 111 out of 40,000+ candidates",
  },
  {
    title: "JEE Main",
    description: "96.9 Percentile",
  },
  {
    title: "Extra-Curricular",
    description: "Bass guitarist in college band, lawn tennis player",
  },
];

const linktreeLinks: Array<{ title: string; href: string }> = [
  {
    title: "My Research - Representing India",
    href: "https://research.ayushmaurya.xyz/",
  },
  {
    title: "IPL Strategy Lab | Next-Gen Cricket Analytics",
    href: "https://ipl.ayushmaurya.xyz/",
  },
  {
    title: "TempusLogic NLP Research",
    href: "https://github.com/Ayush12358/TempusLogic",
  },
  {
    title: "WorDrop Android App",
    href: "https://github.com/Ayush12358/WorDrop",
  },
  {
    title: "WebTTS - EPUB to Audiobook",
    href: "https://tts.ayushmaurya.xyz/",
  },
  {
    title: "amReader - Minimalist M4B Player",
    href: "https://m4b.ayushmaurya.xyz/",
  },
  {
    title: "IIIT In Context",
    href: "https://iiit-in-context.vercel.app/",
  },
  {
    title: "Mental Health Toolkit",
    href: "https://mh.ayushmaurya.xyz/",
  },
  {
    title: "ZenFocus",
    href: "https://zen.ayushmaurya.xyz/",
  }
];

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="skills-tags">
      {tags.map(tag => (
        <span key={tag} className="skill-tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function App() {
  const [isProjectsPopupOpen, setIsProjectsPopupOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("theme-mode");
    if (savedMode === "light") {
      setIsDarkMode(false);
      return;
    }

    setIsDarkMode(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!isProjectsPopupOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProjectsPopupOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isProjectsPopupOpen]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/resume_ayush_maurya.pdf";
    link.download = "resume_ayush_maurya.pdf";
    link.click();
  };

  return (
    <div className={`resume-container${isDarkMode ? " dark-mode" : ""}`}>
      <header className="resume-header">
        <p className="hero-kicker animate-fade-in">Portfolio Resume</p>
        <h1 className="animate-fade-in">Ayush Maurya</h1>
        <p className="resume-subtitle animate-fade-in">
          Computer Science Engineering student and researcher at IIIT Hyderabad working at the intersection of computer science and human sciences.
        </p>
        <div className="hero-highlights animate-fade-in">
          {heroHighlights.map(highlight => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
      </header>

      <div className="resume-content">
        <div className="resume-main">
          <section className="resume-section animate-fade-in">
            <h2>About Me</h2>
            <p>
              Pursuing a dual degree (B.Tech in CS + M.S. by Research in Computing and Human Sciences) at IIIT Hyderabad. Academic interests include machine learning and software systems.
            </p>
            <div className="profile-metrics">
              {profileMetrics.map(metric => (
                <div key={metric.label} className="metric-item">
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section animate-fade-in">
            <h2>Education</h2>
            {education.map(entry => (
              <div key={entry.title} className="education-item">
                <div className="header-flex">
                  <h3>{entry.title}</h3>
                  <span className="date">{entry.date}</span>
                </div>
                {entry.lines.map(line => (
                  <p key={line} className="degree">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </section>

          <section className="resume-section animate-fade-in">
            <h2>Experience</h2>
            {experiences.map(experience => (
              <div key={experience.title} className="experience-item">
                <div className="header-flex">
                  <h3>{experience.title}</h3>
                  <span className="date">{experience.date}</span>
                </div>
                <p className="experience-desc">{experience.description}</p>
                <Tags tags={experience.tags} />
              </div>
            ))}
          </section>

          <section className="resume-section animate-fade-in">
            <h2>Key Projects</h2>
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.title} className="project-item">
                  <h3>
                    {project.href ? (
                      <a href={project.href} target="_blank" rel="noopener noreferrer" className="project-link">
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  <p>{project.description}</p>
                  <Tags tags={project.tags} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="resume-sidebar">
          <section className="sidebar-section animate-fade-in">
            <h2>Connectivity</h2>
            {contacts.map(contact => (
              <div key={`${contact.code}-${contact.label}`} className="contact-item">
                <div className="contact-icon">{contact.code}</div>
                {contact.href ? (
                  <a href={contact.href} target={contact.href.startsWith('http') ? '_blank' : undefined} rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                    {contact.label}
                  </a>
                ) : (
                  <span>{contact.label}</span>
                )}
              </div>
            ))}
          </section>

          <section className="sidebar-section animate-fade-in">
            <h2>Expertise</h2>
            {expertise.map(group => (
              <div key={group.category} className="skills-category">
                <h4>{group.category}</h4>
                <Tags tags={group.tags} />
              </div>
            ))}
          </section>

          <section className="sidebar-section animate-fade-in">
            <h2>Honours</h2>
            {honours.map(item => (
              <div key={item.title} className="course-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </section>

          <div className="sidebar-controls">
            <button
              type="button"
              className="side-projects-button"
              onClick={() => setIsProjectsPopupOpen(true)}
            >
              Other Projects
            </button>

            <button
              type="button"
              className="sidebar-action-button"
              onClick={() => window.location.href = "/blog"}
            >
              Blog
            </button>

            <button
              type="button"
              className="sidebar-action-button"
              onClick={handleDownload}
            >
              Download Resume PDF
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="theme-toggle-floating theme-toggle-corner"
        onClick={() => setIsDarkMode(prev => !prev)}
        role="switch"
        aria-checked={isDarkMode}
        aria-label="Toggle dark mode"
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
        </span>
        <span className={`theme-toggle-track${isDarkMode ? " active" : ""}`}>
          <span className="theme-toggle-thumb" />
        </span>
      </button>

      {isProjectsPopupOpen && (
        <div
          className="projects-popup-overlay"
          role="presentation"
          onClick={() => setIsProjectsPopupOpen(false)}
        >
          <div
            className="projects-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="other-projects-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="projects-popup-header">
              <h2 id="other-projects-title">Other Projects</h2>
              <button
                type="button"
                className="projects-popup-close"
                onClick={() => setIsProjectsPopupOpen(false)}
                aria-label="Close popup"
              >
                Close
              </button>
            </div>
            <div className="link-list">
              {linktreeLinks.map(link => (
                <a
                  key={link.href}
                  className="link-list-item"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
