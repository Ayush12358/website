import "./index.css";
import "./App.css";
import { useEffect, useState, useRef } from "react";
import { Mail, Phone, Linkedin, Github, Lock, Terminal, Volume2, VolumeX } from "lucide-react";

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
  id: string;
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
    id: "ml-geoguesser",
    title: "ML for Local Geoguesser",
    description:
      "Created a location prediction model using ResNet50 to estimate latitude, longitude, region, and angle from images, achieving 92% region accuracy.",
    tags: ["Python", "Machine Learning", "PyTorch"],
  },
  {
    id: "electoral-sim",
    title: "ElectoralSim",
    description:
      "Developed an open-source Python library for simulating electoral systems and voting methods as a side project of human sciences research.",
    tags: ["Python", "Simulation", "Open Source"],
    href: "https://pypi.org/project/electoral-sim",
  },
  {
    id: "crowdtwin",
    title: "CrowdTwin",
    description:
      "Created a predictive crowd monitoring dashboard prototype as part of a Tech Product Entrepreneurship course, focusing on idea refinement and pitching to guest evaluators.",
    tags: ["Next.js", "Product Design", "Prototype"],
    href: "https://crowdtwin.vercel.app/",
  },
  {
    id: "tafea-design",
    title: "Design for Social Innovation (TAFEA)",
    description:
      "Designed TAFEA (Teaching Assistant for Extracurricular Activities), an AI-assisted platform to help Teach For India fellows plan and customize extracurricular curricula for resource-constrained classrooms.",
    tags: ["Human-Centered Design", "Education", "AI"],
    href: "https://drive.google.com/drive/folders/1eeFthW_dBVRH_B3e6DE2cVocBUmpsps0?usp=drive_link",
  },
  {
    id: "highland-history",
    title: "Highland History Project",
    description:
      "Digitized historical documents using OCR and LLM-assisted text recovery to map Himalayan trade networks.",
    tags: ["Machine Learning", "OCR", "LLM"],
  },
  {
    id: "age-prediction",
    title: "Age Prediction Model",
    description:
      "Developed a model to predict age from images using transfer learning and compared it with ensemble methods like Random Forests and SVMs.",
    tags: ["Machine Learning", "PyTorch"],
  },
  {
    id: "campus-mart",
    title: "Campus Mart",
    description:
      "Designed UI/UX for a buy-sell-rent application featuring NFC tracking integration.",
    tags: ["UI/UX Design", "Prototyping"],
    href: "https://drive.google.com/drive/folders/12ZXtbmZpdcGo3j2tK9wqVYBc4WFLgdW4?usp=drive_link",
  },
  {
    id: "katha",
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
    tags: ["Machine Learning", "PyTorch", "Linux", "System Design", "Systems Programming"],
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
    href: "https://research.ayushmaurya.online/",
  },
  {
    title: "IPL Strategy Lab | Next-Gen Cricket Analytics",
    href: "https://ipl.ayushmaurya.online/",
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
    href: "https://tts.ayushmaurya.online/",
  },
  {
    title: "amReader - Minimalist M4B Player",
    href: "https://m4b.ayushmaurya.online/",
  },
  {
    title: "IIIT In Context",
    href: "https://iiit-in-context.vercel.app/",
  },
  {
    title: "Mental Health Toolkit",
    href: "https://mh.ayushmaurya.online/",
  },
  {
    title: "ZenFocus",
    href: "https://zen.ayushmaurya.online/",
  }
];

const asciiProfile = `                                      +++++++++++++++++++++++++                                      
                                 +++++++++++++++++++++++++++++++++++                                 
                            +++++++++++++++++++++++++++++++++++++++++++++                            
                         ++++++++++++++++++++++++===++==+++==+++++++++++++++                         
                       +++++++++++++++++++++==-  .-. ..- .=-=--=++++++++++++++++                      
                    +++++++++++++++++++++--.    ..   .--.       .-..=++++++++++++++                   
                  ++++++++++++++++++++=..-.    ----..-..             .+++++++++++++++                 
                +++++++++++++++++++++..     .   ..  ..            -. -===++++++++++++++               
              ++++++++++++++++++++++=-.      .....                 .- ..--+++++++++++++++             
              +++++++++++++++++++++-   .       ...=-   .             -     .++++++++++++++++           
            ++++++++++++++++++++++-   .           .    .. . ..       -- .  . =+++++++++++++++          
           ++++++++++++++++++++++.                ..     ...          .       =+++++++++++++++         
          +++++++++++++++++++++++=                .                           .++++++++++++++++        
        ++++++++++++++++++++++++++.       .===--.. .              .           .++++++++++++++++++      
       +++++++++++++++++++++++++++===    .=+++==...          .-.              .=++++++++++++++++++     
      +++++++++++++++++++++++++++++===  .=++++++==-.                          .-==+++++++++++++++++    
      ++++++++++++++++++++++++++++++++--++++++++=.                              -=+++++++++++++++++    
     ++++++++++++++++++++++++++++++.-==+++++++===--.                            -=++++++++++++++++++   
    ++++++++++++++++++++++++++++++++++++++++++-.                               .-++++++++++++++++++++  
   +++++++++++++++++++++++++++++++++++=++++++++++=                           ..-=+++++++++++++++++++++ 
   ++++++++++++++++++++++++++++++++++==++++++++++-        ..        ..===========++++++=++++++++++++++ 
   +++++=+++++++++++++++++++++++++===-=+++++++++++++==------.       -+++++++++===++++++----=--====+==--
  +++++++++++++++++++++++++++++++++---===+++++++++++++++++==-.    .-++++++++++===++++++=====+++++++++++
  +++++++++++++++++++++++++++++++++==--====+++++++++++++++++=--...-=++++++++++===++++++==++++++++++++++
  +++++++++++++++++++++++++++++++++==--====++++++++++++++++++======+++++++++++===++++++===+++++++++++++
  ++++++++++++++++++++++++++++++=++++-.-====+++++++++.  .=====-====+++++++++++====+++++===+++++++++++++
  +++++++++++++++++++++++++++++  =+++- .-==+++++==++++-      ..--=++++++++++++====+++++===+++++++++++++
  ++++++++++++++++++++++++++++-.-++++=. .-=====-    .--=-     .+++=+++++++++++====+++++====++++++++++++
  +++++++++++++++++++++++++++-....=++=-   ----==+=-==++.     .++++++++++++++++====+++++====++++++++++++
  +++++++++++++++++++++++++-  .--...=+=.   .-===++=.  ..--..=+++++++++++++++++====+++++====++++++++++++
  +++++++++++++++++++++--.    .-----..--     .=+++++-     =++++++++++++++++++++===+++++=====+++++++++++
  ++++++++++++++++-.   ...   ..-........       .-====- -+++++++++++++++++++++====+++++======++++++++++
  ++++++++++++++---..     .    ---....--.             .=+++++++++++++++++++++++==++++++====++++++++++++
   +++++++++++=.....-.........  .---.-.---.        .   +++++++++++=+++++++++++====++++++====++++++++++=
   ++++++++=-...--------.----..   .-------...       .    ++++++++++++++++++++++===+++++=====++++++++++ 
   +++++---.....  -==-----...---.  ..---==---.   .=++.    -++++++=++++++++++++====+++++=====+++++++++= 
    +=---.......----------....--.-  .--=--.       =++++    .+++++----=---------.-=+++++====++++++++++  
     ------....--=--=====----.---..  --            -+++=   .+++++. ..... .      .=+++++=====++++++++   
      --..-+=------------.------..-=              .+++++    +++++................=+++++======++++++    
      ..----===----------...--....-....           -++++++   +++++--.-------......=+++++======++++++    
       ------------.---.-....----....--.   .       +++++++  +++++-----------.....=+++++======+++++     
        ---=--=---==-...-.......-........          -+++++++ -++++------------....-+++++=======+++      
          --..-=---..   ..-. ...........-.  .  ..   ++++++++ =+++                 =++=========+=       
           .-=-.---...=. ...  ........ .-.    ..    =+++++++- +++                 .------======        
            ....--...        .  ..=.....        ..-.-++++++++. ++=====================---====          
              -..-.--    ..     --....        ..   --+++++++++ .+++++++++++++++++++++++====-           
                .....   .         ....        .. ....++++++++++ .++++++++++++++++++++++++=             
                 ....              ..-.    -.     .--++++++++++. =++++++++++++++++++++++               
                   -.       .       ...     .  .....-=++++++++++  ++++++++++++++++++++                 
                                    ...           ....++++++++++  =+++++++++++++++++                   
                                      .          ..  .++++++++++   ++++++++++++++                      
                                     .             .--.+++++++++   =++++++++++                         
                                                    ...+++++++++   .+++++++                            
                                                   ..  -++++++++    =+                                 
                                                 .     -+++++++++                                      `;

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

const getContactIcon = (code: string) => {
  switch (code) {
    case "EM":
    case "II":
      return <Mail size={12} />;
    case "PH":
      return <Phone size={12} />;
    case "IN":
      return <Linkedin size={12} />;
    case "GH":
      return <Github size={12} />;
    default:
      return null;
  }
};

const asciiArts = {
  slant: `
    _                     _      __  __                                
   / \\  _   _ _   _  ___| |_  |  \\/  | __ _ _   _ _ __ _   _  __ _ 
  / _ \\| | | | | | |/ __| '_ \\ | |\\/| |/ _\` | | | | '__| | | |/ _\` |
 / ___ \\ |_| | |_| |\\__ \\ | | || |  | | (_| | |_| | |  | |_| | (_| |
/_/   \\_\\__, |\\__,_||___/_| |_||_|  |_|\\__,_|\\__,_|_|   \\__, |\\__,_|
        |___/                                           |___/       
  `,
  block: `
 █████  ██    ██ ██    ██  ██████ ██   ██     ███    ███  █████  ██    ██ ██████  ██    ██  █████  
██   ██  ██  ██  ██    ██ ██      ██   ██     ████  ████ ██   ██ ██    ██ ██   ██  ██  ██  ██   ██ 
███████   ████   ██    ██  █████  ███████     ██ ████ ██ ███████ ██    ██ ██████    ████   ███████ 
██   ██    ██    ██    ██      ██ ██   ██     ██  ██  ██ ██   ██ ██    ██ ██   ██    ██    ██   ██ 
██   ██    ██     ██████  ██████  ██   ██     ██      ██ ██   ██  ██████  ██   ██    ██    ██   ██ 
  `
};

// Falling letters background component
function MatrixBackground({ themeMode, screensaverActive, onClose, playKeySound }: { 
  themeMode: "stark" | "green" | "amber"; 
  screensaverActive: boolean; 
  onClose: () => void;
  playKeySound: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    const fontSize = 12;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));

    const draw = () => {
      ctx.fillStyle = screensaverActive ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let color = "#33ff33";
      if (themeMode === "stark") color = "#ffffff";
      else if (themeMode === "amber") color = "#ffb000";

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const dropVal = drops[i];
        if (dropVal !== undefined) {
          ctx.fillText(text, i * fontSize, dropVal * fontSize);

          if (dropVal * fontSize > canvas.height && Math.random() > 0.98) {
            drops[i] = 0;
          } else {
            drops[i] = dropVal + 1;
          }
        }
      }
    };

    const interval = setInterval(draw, 40);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [themeMode, screensaverActive]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: screensaverActive ? 500 : 0,
        pointerEvents: screensaverActive ? "auto" : "none",
        cursor: screensaverActive ? "pointer" : "default"
      }}
      onClick={() => {
        if (screensaverActive) {
          playKeySound();
          onClose();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          opacity: screensaverActive ? 0.92 : 0.4,
          transition: "opacity 0.4s ease"
        }}
      />
      {screensaverActive && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            color: "var(--brand, #ffffff)",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: "#000000",
            border: "1px dashed var(--stroke, #333)",
            padding: "0.3rem 0.6rem"
          }}
        >
          [ SCREENSAVER MODE. CLICK OR PRESS ESC TO QUIT ]
        </div>
      )}
    </div>
  );
}

function TuiHorizontalScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animationId: number;
    let direction = 1; // 1 = right, -1 = left
    let pauseCounter = 0;
    const speed = 0.55; // Pixels per frame (extremely smooth and slow)
    const pauseDuration = 100; // Pause duration in frames (~1.6s)
    
    // Use floating-point accumulator to prevent browser decimal truncation
    let scrollPos = el.scrollLeft;

    const scrollLoop = () => {
      if (isPaused) {
        // Sync our accumulator with any manual scroll movements
        scrollPos = el.scrollLeft;
        animationId = requestAnimationFrame(scrollLoop);
        return;
      }

      if (pauseCounter > 0) {
        pauseCounter--;
        scrollPos = el.scrollLeft;
        animationId = requestAnimationFrame(scrollLoop);
        return;
      }

      const maxScroll = el.scrollWidth - el.clientWidth;

      if (maxScroll <= 0) {
        animationId = requestAnimationFrame(scrollLoop);
        return;
      }

      // Add float value to position accumulator
      scrollPos += direction * speed;

      if (direction === 1 && scrollPos >= maxScroll) {
        scrollPos = maxScroll;
        direction = -1;
        pauseCounter = pauseDuration;
      } else if (direction === -1 && scrollPos <= 0) {
        scrollPos = 0;
        direction = 1;
        pauseCounter = pauseDuration;
      }

      // Assign the rounded integer value to browser element
      el.scrollLeft = Math.round(scrollPos);
      animationId = requestAnimationFrame(scrollLoop);
    };

    animationId = requestAnimationFrame(scrollLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  return (
    <div
      ref={containerRef}
      className="horizontal-projects-scroll"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {children}
    </div>
  );
}

export function App() {
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const [isLockPopupOpen, setIsLockPopupOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ml-ai");
  const [selectedStyle, setSelectedStyle] = useState("human");

  // Retro Theme state variables
  const [themeMode, setThemeMode] = useState<"stark" | "green" | "amber">("green");

  // Creative TUI Elements states
  const [asciiStyle, setAsciiStyle] = useState<"slant" | "block">("block");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screensaverActive, setScreensaverActive] = useState(false);

  // Real-time ping metrics states
  const [pingTime, setPingTime] = useState(14);
  const [loadPercentage, setLoadPercentage] = useState(34);
  const [uptime, setUptime] = useState(6192);

  // CLI state variables
  const [activeConsoleTab, setActiveConsoleTab] = useState<"shell" | "syslog" | "traffic">("shell");
  const [commandInput, setCommandInput] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System Initialized successfully.",
    "Type 'help' for a list of interactive shell commands.",
    ""
  ]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // Audio click synthesizer function (No heavy assets)
  const playKeySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);

      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  };

  useEffect(() => {
    // Live ticking values
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    const flipper = setInterval(() => {
      setPingTime(prev => Math.max(8, Math.min(35, prev + (Math.random() > 0.5 ? 2 : -2))));
      setLoadPercentage(prev => Math.max(10, Math.min(65, prev + (Math.random() > 0.5 ? 4 : -4))));
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(flipper);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDownloadPopupOpen(false);
        setIsLockPopupOpen(false);
        setScreensaverActive(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, activeConsoleTab]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/api/blog");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setBlogPosts(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
      }
    };
    fetchBlogPosts();
  }, []);

  const triggerDownload = (fileName: string) => {
    playKeySound();
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.download = fileName;
    link.click();
  };

  const handleCommandRun = (cmd: string) => {
    playKeySound();
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(" ");
    const primaryCmd = parts[0]?.toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    let outputLines: string[] = [];

    switch (primaryCmd) {
      case "help":
        outputLines = [
          "----------------------------------------------------------------",
          "Available Commands:",
          "  help               Display this assistant manual",
          "  clear              Clear the log console lines",
          "  cat about.txt      Print profile biographical text",
          "  ls projects        List key engineering software projects",
          "  cat projects/<id>  View detailed info for a project",
          "                     (e.g., cat projects/electoral-sim)",
          "  cat contact.conf   Show connectivity paths (email, github...)",
          "  matrix             Initiate digital falling rain screensaver",
          "  blog               Direct route to the Blog section",
          "----------------------------------------------------------------"
        ];
        break;
      case "clear":
        setConsoleLogs([]);
        setCommandInput("");
        return;
      case "matrix":
        outputLines = ["Initiating screensaver..."];
        setTimeout(() => {
          setScreensaverActive(true);
        }, 300);
        break;
      case "cat":
        if (arg === "about.txt") {
          outputLines = [
            "Ayush Maurya - CSE Student & Researcher @ IIIT Hyderabad.",
            "Working at the intersection of computer science and human sciences.",
            "Dual Degree: B.Tech in CSE + M.S. by Research in Computing & Human Sciences.",
            "Interests: Machine Learning, NLP, Software Engineering, System Design."
          ];
        } else if (arg === "contact.conf") {
          outputLines = [
            "Connectivity Contacts:",
            "  - Email (Personal): ayushmaurya2003@gmail.com",
            "  - Email (IIIT-H)  : ayush.maurya@research.iiit.ac.in",
            "  - LinkedIn        : linkedin.com/in/ayush-maurya-a41a9721a",
            "  - GitHub          : github.com/Ayush12358"
          ];
        } else if (arg.startsWith("projects/")) {
          const projectId = arg.replace("projects/", "").trim();
          const match = projects.find(p => p.id === projectId);
          if (match) {
            outputLines = [
              `Project: ${match.title}`,
              `Desc:    ${match.description}`,
              `Tags:    ${match.tags.join(", ")}`,
              match.href ? `Url:     ${match.href}` : ""
            ].filter(Boolean);
          } else {
            outputLines = [`Project not found: '${projectId}'. Type 'ls projects' for listings.`];
          }
        } else {
          outputLines = [
            `Usage: cat [file]`,
            `  Files: about.txt, contact.conf, projects/[project_id]`,
            `  Example: cat about.txt`
          ];
        }
        break;
      case "ls":
        if (arg === "projects") {
          outputLines = [
            "Project ID List (type 'cat projects/<id>' to inspect):",
            ...projects.map(p => `  - ${p.id}  [${p.title.substring(0, 30)}]`)
          ];
        } else {
          outputLines = [`Usage: ls projects`];
        }
        break;
      case "blog":
        outputLines = ["Navigating to /blog..."];
        setTimeout(() => {
          window.location.href = "/blog";
        }, 800);
        break;
      default:
        outputLines = [`Command not found: '${trimmed}'. Type 'help' for assistance.`];
        break;
    }

    setConsoleLogs(prev => [
      ...prev,
      `guest@ayushmaurya.online:~$ ${trimmed}`,
      ...outputLines,
      ""
    ]);
    setCommandInput("");
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const getLoadBar = (pct: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return `[${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)}] ${pct}%`;
  };

  return (
    <div className={`resume-container theme-${themeMode}`}>
      <MatrixBackground
        themeMode={themeMode}
        screensaverActive={screensaverActive}
        onClose={() => {
          setScreensaverActive(false);
        }}
        playKeySound={playKeySound}
      />

      {/* Retro Header controls */}
      <header className="resume-header" style={{ width: '100%' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed var(--stroke)', paddingBottom: '0.75rem' }}>
          <p className="hero-kicker animate-fade-in" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', margin: 0 }}>
            Portfolio CLI v2.0
          </p>

          {/* Theme custom select box */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Sound:</span>
            <button
              type="button"
              style={{
                fontSize: '0.65rem',
                border: '1px solid var(--stroke)',
                background: soundEnabled ? 'var(--stroke)' : 'transparent',
                color: soundEnabled ? 'var(--brand)' : 'var(--ink-soft)',
                padding: '0.2rem 0.4rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700
              }}
              onClick={() => {
                setSoundEnabled(prev => !prev);
                setTimeout(() => {
                  if(!soundEnabled) {
                    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                    if(AudioCtx) new AudioCtx();
                  }
                }, 50);
              }}
            >
              {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
              {soundEnabled ? "ON" : "OFF"}
            </button>

            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-soft)', marginLeft: '0.5rem' }}>Phosphor:</span>
            {[
              { id: 'stark', label: 'STARK' },
              { id: 'green', label: 'GREEN' },
              { id: 'amber', label: 'AMBER' },
            ].map(theme => (
              <button
                key={theme.id}
                type="button"
                style={{
                  fontSize: '0.65rem',
                  border: '1px solid var(--stroke)',
                  background: themeMode === theme.id ? 'var(--stroke)' : 'transparent',
                  color: themeMode === theme.id ? 'var(--brand)' : 'var(--ink-soft)',
                  padding: '0.2rem 0.4rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                onClick={() => {
                  playKeySound();
                  setThemeMode(theme.id as any);
                }}
              >
                {theme.label}
              </button>
            ))}


          </div>
        </div>

        <div className="header-container">
          {/* Left Column: ASCII name title, controls, highlights */}
          <div>
            {/* Dynamic ASCII Art title header selector */}
            <div style={{ width: '100%', marginTop: '1.25rem', overflowX: 'auto' }} className="animate-fade-in">
              <pre
                style={{
                  fontSize: 'min(1.2vw, 0.72rem)',
                  lineHeight: 1.15,
                  color: 'var(--brand)',
                  margin: 0,
                  fontFamily: 'monospace'
                }}
              >
                {asciiArts[asciiStyle]}
              </pre>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>ASCII Font:</span>
                <button
                  type="button"
                  style={{
                    fontSize: '0.65rem',
                    background: asciiStyle === 'slant' ? 'var(--stroke)' : 'transparent',
                    border: '1px solid var(--stroke)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    padding: '0.1rem 0.3rem'
                  }}
                  onClick={() => {
                    playKeySound();
                    setAsciiStyle('slant');
                  }}
                >
                  [ Slant ]
                </button>
                <button
                  type="button"
                  style={{
                    fontSize: '0.65rem',
                    background: asciiStyle === 'block' ? 'var(--stroke)' : 'transparent',
                    border: '1px solid var(--stroke)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    padding: '0.1rem 0.3rem'
                  }}
                  onClick={() => {
                    playKeySound();
                    setAsciiStyle('block');
                  }}
                >
                  [ Block ]
                </button>
              </div>
            </div>

            <p className="resume-subtitle animate-fade-in" style={{ marginTop: '1rem' }}>
              Computer Science Engineering student and researcher at IIIT Hyderabad
            </p>
            <p className="resume-subtitle animate-fade-in" style={{ marginTop: '0rem' }}>
              working at the intersection of computer science and human sciences.
            </p>

            <div className="hero-highlights animate-fade-in" style={{ marginTop: '0.75rem' }}>
              {heroHighlights.map(highlight => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </div>

          {/* Right Column: ASCII Art Profile Portrait */}
          <div className="header-ascii-profile-frame">
            <pre className="ascii-profile">
              {asciiProfile}
            </pre>
          </div>

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

        </div>

        <div className="resume-sidebar">

          <button
            type="button"
            className="sidebar-download-button animate-fade-in"
            onClick={() => {
              playKeySound();
              setIsDownloadPopupOpen(true);
            }}
          >
            [ F1: Download Resume ]
          </button>

          <section className="sidebar-section animate-fade-in">
            <h2>Connectivity</h2>
            {contacts.map(contact => (
              <div key={`${contact.code}-${contact.label}`} className="contact-item">
                <div className="contact-icon">{getContactIcon(contact.code)}</div>
                {contact.href ? (
                  <a
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    onClick={playKeySound}
                  >
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


        </div>
      </div>

      <div style={{ width: 'min(1080px, 100%)', margin: '0 auto', padding: '0 1.25rem 3.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box' }}>
        <section className="resume-section animate-fade-in">
          <h2>Key Projects</h2>
          <TuiHorizontalScroll>
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
          </TuiHorizontalScroll>
        </section>

        <section className="resume-section animate-fade-in">
          <h2>Other Projects</h2>
          <TuiHorizontalScroll>
            {linktreeLinks.map(link => (
              <div key={link.title} className="project-item">
                <h3>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="project-link">
                    {link.title}
                  </a>
                </h3>
                <p>External project repository/analytics resource. Click to launch site.</p>
                <div className="skills-tags" style={{ marginTop: 'auto' }}>
                  <span className="skill-tag">[ External Link ]</span>
                </div>
              </div>
            ))}
          </TuiHorizontalScroll>
        </section>

        <section className="resume-section animate-fade-in">
          <h2>Recent Blog Posts</h2>
          <TuiHorizontalScroll>
            {blogPosts.length > 0 ? (
              blogPosts.map(post => (
                <div
                  key={post.filename}
                  className="project-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    playKeySound();
                    window.location.href = `/blog/${post.filename.replace(/\.md$/, "")}`;
                  }}
                >
                  <h3>
                    <a
                      href={`/blog/${post.filename.replace(/\.md$/, "")}`}
                      className="project-link"
                      onClick={e => e.preventDefault()}
                    >
                      {post.title}
                    </a>
                  </h3>
                  <p>{post.content ? post.content.substring(0, 110).replace(/[#*`_-]/g, '') + '...' : 'Retro TUI blog post...'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.7rem', opacity: 0.8, color: 'var(--brand)' }}>
                    <span>{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>[ Read Post ]</span>
                  </div>
                </div>
              ))
            ) : (
              Array(6).fill(null).map((_, i) => (
                <div key={`mock-post-${i}`} className="project-item" style={{ opacity: 0.7 }}>
                  <h3>[ Simulated Entry {i+1} ]</h3>
                  <p>Connecting to Neon serverless database instances... Querying public table blog_posts...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
                    <span>2026-05-30</span>
                    <span>[ Waiting ]</span>
                  </div>
                </div>
              ))
            )}
          </TuiHorizontalScroll>
        </section>
      </div>

      {/* Expandable CLI terminal at bottom with multi-tab simulation */}
      <div style={{ maxWidth: '1080px', margin: '0 auto 4rem', padding: '0 1.25rem' }}>
        <div className="tui-console animate-fade-in">
          {/* Console Tab Selector Headers */}
          <div className="tui-console-header" style={{ paddingBottom: 0 }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[
                { id: 'shell', label: '1: interactive.sh' },
                { id: 'syslog', label: '2: kernel_log.sys' },
                { id: 'traffic', label: '3: traffic.log' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  style={{
                    fontSize: '0.7rem',
                    border: '1px solid var(--stroke)',
                    borderBottom: 'none',
                    background: activeConsoleTab === tab.id ? 'var(--stroke)' : 'transparent',
                    color: activeConsoleTab === tab.id ? 'var(--brand)' : 'var(--ink-soft)',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                  onClick={() => {
                    playKeySound();
                    setActiveConsoleTab(tab.id as any);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', alignSelf: 'center' }}>
              PORTFOLIO CLI SIMULATOR
            </span>
          </div>

          <div className="tui-console-logs" style={{ borderTop: '1px solid var(--stroke)', paddingTop: '0.4rem' }}>
            {activeConsoleTab === "shell" && (
              <>
                {consoleLogs.map((line, idx) => (
                  <div
                    key={idx}
                    className={`tui-console-log-line ${line.startsWith("guest@") ? "tui-console-log-command" : ""}`}
                  >
                    {line}
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </>
            )}

            {activeConsoleTab === "syslog" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--ink)' }}>
                <div>[  0.000000] Initializing portfolio kernel v2.0...</div>
                <div>[  0.038291] Secure virtual core boot: x86_64 host processor parsed.</div>
                <div>[  0.109281] Memory allocation: 8192 MB Unified RAM secured.</div>
                <div>[  0.320491] ACPI: Core ACPI table parsed successfully.</div>
                <div>[  0.490281] ext4: Mounted volume ~/website in read-only mode.</div>
                <div>[  0.718291] network: Loaded active connection portfolio.ayushmaurya.online.</div>
                <div>[  1.092819] bun: Hot reloading engine active on hot-module-reload port 3001.</div>
                <div>[  1.218291] sound: Web Audio synthetic mechanical switch synthesizer compiled.</div>
                <div style={{ color: 'var(--brand)' }}>[  1.512918] syslogd: Dynamic system logger daemon active [STATUS: OK]</div>
              </div>
            )}

            {activeConsoleTab === "traffic" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--ink-soft)' }}>
                <div>[21:45:02] Connection received from 127.0.0.1 (localhost)</div>
                <div style={{ color: 'var(--brand)' }}>[21:45:03] GET /api/blog (200 OK) - Dublin, IE</div>
                <div>[21:45:09] Connection received from 192.168.1.48</div>
                <div style={{ color: 'var(--brand)' }}>[21:45:10] GET /index.html (200 OK) - Lucknow, IN</div>
                <div style={{ color: 'var(--brand)' }}>[21:45:22] GET /resume_ayush_maurya.pdf (304 Not Modified) - Tokyo, JP</div>
                <div style={{ color: 'var(--brand)' }}>[21:45:34] GET /api/manage-blog (401 Unauthorized) - Frankfurt, DE</div>
                <div>[21:45:51] Connection received from 10.0.2.15</div>
                <div style={{ color: 'var(--brand)' }}>[21:45:52] GET /blog/geoguesser (200 OK) - California, US</div>
              </div>
            )}
          </div>

          {activeConsoleTab === "shell" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommandRun(commandInput);
              }}
              className="tui-console-input-line"
            >
              <span className="tui-console-prompt">guest@ayushmaurya.online:~$</span>
              <input
                type="text"
                className="tui-console-input"
                value={commandInput}
                onChange={(e) => {
                  playKeySound();
                  setCommandInput(e.target.value);
                }}
                placeholder="type 'help'..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </form>
          )}

          {/* Simple shortcuts for mobile/quick clicks */}
          <div className="tui-console-shortcuts">
            <span>Quick Commands: </span>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("help")}>[ help ]</button>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("cat about.txt")}>[ cat about.txt ]</button>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("ls projects")}>[ ls projects ]</button>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("cat contact.conf")}>[ cat contact.conf ]</button>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("matrix")}>[ matrix ]</button>
            <button type="button" className="tui-console-shortcut-btn" onClick={() => handleCommandRun("clear")}>[ clear ]</button>
          </div>
        </div>
      </div>



      {isDownloadPopupOpen && (
        <div
          className="projects-popup-overlay"
          role="presentation"
          onClick={() => {
            playKeySound();
            setIsDownloadPopupOpen(false);
          }}
        >
          <div
            className="projects-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-popup-title"
            onClick={event => event.stopPropagation()}
            style={{ maxWidth: '500px' }}
          >
            <div className="projects-popup-header">
              <h2 id="download-popup-title">Download Resume</h2>
              <div className="projects-popup-header-actions">
                <button
                  type="button"
                  className="header-lock-button"
                  onClick={() => {
                    playKeySound();
                    setIsLockPopupOpen(true);
                  }}
                  aria-label="Download tailored version"
                  title="Download tailored version"
                >
                  <Lock size={12} />
                </button>
                <button
                  type="button"
                  className="projects-popup-close"
                  onClick={() => {
                    playKeySound();
                    setIsDownloadPopupOpen(false);
                  }}
                  aria-label="Close popup"
                >
                  [X]
                </button>
              </div>
            </div>

            <div className="download-popup-body">
              <button
                type="button"
                className="sidebar-action-button"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => triggerDownload('resume_ayush_maurya.pdf')}
              >
                [ Download Main Resume ]
              </button>
            </div>
          </div>
        </div>
      )}

      {isLockPopupOpen && (
        <div
          className="projects-popup-overlay"
          role="presentation"
          onClick={() => {
            playKeySound();
            setIsLockPopupOpen(false);
          }}
        >
          <div
            className="projects-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-popup-title"
            onClick={event => event.stopPropagation()}
            style={{ maxWidth: '460px' }}
          >
            <div className="projects-popup-header">
              <h2 id="lock-popup-title">Tailored Resume</h2>
              <button
                type="button"
                className="projects-popup-close"
                onClick={() => {
                  playKeySound();
                  setIsLockPopupOpen(false);
                }}
                aria-label="Close popup"
              >
                [X]
              </button>
            </div>

            <div className="lock-popup-body">
              <div className="lock-popup-section">
                <label className="lock-popup-label">1. Target Role</label>
                <div className="lock-popup-options">
                  {[
                    { id: 'sde', label: 'Software Eng.' },
                    { id: 'ml-ai', label: 'ML / AI' },
                    { id: 'research', label: 'Research' },
                    { id: 'pd', label: 'Product Design' },
                  ].map(role => (
                    <button
                      key={role.id}
                      type="button"
                      className="lock-popup-pill"
                      data-active={selectedRole === role.id || undefined}
                      onClick={() => {
                        playKeySound();
                        setSelectedRole(role.id);
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lock-popup-section">
                <label className="lock-popup-label">2. Company Style</label>
                <div className="lock-popup-options">
                  {[
                    { id: 'ats', label: 'ATS' },
                    { id: 'startup', label: 'Creative' },
                    { id: 'human', label: 'Human Reader' },
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      className="lock-popup-pill"
                      data-active={selectedStyle === style.id || undefined}
                      onClick={() => {
                        playKeySound();
                        setSelectedStyle(style.id);
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="lock-popup-download"
                disabled={!selectedRole || !selectedStyle}
                onClick={() => {
                  if (selectedRole && selectedStyle) {
                    triggerDownload(`resume-${selectedRole}-${selectedStyle}.pdf`);
                    setIsLockPopupOpen(false);
                    setIsDownloadPopupOpen(false);
                  }
                }}
              >
                [ Download tailored PDF ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
