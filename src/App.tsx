import "./index.css";
import "./App.css";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Mail, Phone, Linkedin, Github, Volume2, VolumeX } from "lucide-react";
import { DecryptText } from "./DecryptText";

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

type BlogArchiveStatus = "querying" | "ready" | "fallback";

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
          <DecryptText text={tag} />
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

function MatrixArtifacts() {
  return (
    <div className="matrix-artifacts" aria-hidden="true">
      <span className="matrix-artifact artifact-north">0101::TRACE</span>
      <span className="matrix-artifact artifact-east">SYS/WAKE_09</span>
      <span className="matrix-artifact artifact-west">[ RED PILL CACHE ]</span>
      <span className="matrix-artifact artifact-south">follow_the_white_cursor()</span>
      <span className="matrix-glyph-cluster artifact-cluster-a">ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜ</span>
      <span className="matrix-glyph-cluster artifact-cluster-b">101101001011</span>
      <span className="matrix-crosshair artifact-crosshair-a" />
      <span className="matrix-crosshair artifact-crosshair-b" />
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

const BOOT_LOGS = [
  "BOOTING PORTFOLIO KERNEL v2.2...",
  "PARSING ENVIRONMENT SPECIFICATIONS... OK",
  "ALLOCATING MONOSPACE BUFFER BLOCKS... OK",
  "INITIALIZING NEO DATABASE INSTANCES... OK",
  "RETRIEVING ENCRYPTED EXPERIENCE LOGS... OK",
  "DECRYPTING PROFILE BIO ARTIFACTS... OK",
  "UNPACKING INTERACTIVE SHELL PROMPTS... OK",
  "CONNECTING PHOSPHOR STREAM DAEMONS... OK",
  "ESTABLISHING SECURE VISITOR TRAFFIC PORTS... OK",
  "SYNTHESIZING RETRO SOUND SYSTEMS... OK",
  "DECRYPTION COMPLETED SUCCESSFULLY.",
];

export function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootGlitchHot, setBootGlitchHot] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioUnlockRef = useRef<(() => void) | null>(null);
  // Creative TUI Elements states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screensaverActive, setScreensaverActive] = useState(false);

  // Real-time ping metrics states
  const [pingTime, setPingTime] = useState(14);
  const [loadPercentage, setLoadPercentage] = useState(34);
  const [uptime, setUptime] = useState(6192);

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogArchiveStatus, setBlogArchiveStatus] = useState<BlogArchiveStatus>("querying");
  const accessBadge = useMemo(() => {
    const segment = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");

    return {
      access: "GUEST",
      session: `${segment()}-${segment()}`,
      node: "IIIT-H",
    };
  }, []);

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
    } catch (e) { }
  };

  const getBackgroundAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/song.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }

    return audioRef.current;
  }, []);

  const clearPendingAudioUnlock = useCallback(() => {
    const cleanup = pendingAudioUnlockRef.current;
    if (cleanup) {
      cleanup();
      pendingAudioUnlockRef.current = null;
    }
  }, []);

  const startBackgroundAudio = useCallback(() => {
    const audio = getBackgroundAudio();

    audio.play().then(clearPendingAudioUnlock).catch(() => {
      if (pendingAudioUnlockRef.current) return;

      const playOnInteraction = () => {
        audio.play().then(clearPendingAudioUnlock).catch(() => { });
      };

      const cleanup = () => {
        document.removeEventListener("click", playOnInteraction);
        document.removeEventListener("keydown", playOnInteraction);
        document.removeEventListener("touchstart", playOnInteraction);
      };

      pendingAudioUnlockRef.current = cleanup;
      document.addEventListener("click", playOnInteraction);
      document.addEventListener("keydown", playOnInteraction);
      document.addEventListener("touchstart", playOnInteraction);
    });
  }, [clearPendingAudioUnlock, getBackgroundAudio]);

  const stopBackgroundAudio = useCallback(() => {
    clearPendingAudioUnlock();
    audioRef.current?.pause();
  }, [clearPendingAudioUnlock]);

  useEffect(() => {
    let currentProgress = 0;
    let logIndex = 0;

    const progressInterval = setInterval(() => {
      // Slower incremental ticks (2% to 4%)
      const oldProgress = currentProgress;
      currentProgress += Math.floor(Math.random() * 3) + 2;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsBooting(false);
        }, 400);
      }

      // Trigger dynamic phosphor theme wake-up midway (50% progress)
      if (oldProgress < 50 && currentProgress >= 50) {
        setVisibleLogs(prev => [
          ...prev,
          `> [ OK ] VOLTAGE SECURED. PHOSPHOR TUBES ENGAGED [THEME: GREEN]`
        ]);
        playKeySound();
      }

      setBootProgress(currentProgress);
    }, 80); // Slowed progress interval from 80ms to 120ms

    const logsInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        const nextLog = BOOT_LOGS[logIndex];
        if (nextLog) {
          setVisibleLogs(prev => [...prev, nextLog]);
        }
        logIndex++;
      } else {
        clearInterval(logsInterval);
      }
    }, 150); // Slowed logs interval from 130ms to 220ms

    return () => {
      clearInterval(progressInterval);
      clearInterval(logsInterval);
    };
  }, []);

  useEffect(() => {
    if (!isBooting) {
      setBootGlitchHot(false);
      return;
    }

    const glitchInterval = setInterval(() => {
      setBootGlitchHot(Math.random() > 0.48);
    }, 140);

    return () => {
      clearInterval(glitchInterval);
    };
  }, [isBooting]);

  // Reactively initialize and control loop background audio (song.mp3)
  useEffect(() => {
    if (soundEnabled && !isBooting) {
      startBackgroundAudio();
    } else {
      stopBackgroundAudio();
    }
  }, [soundEnabled, isBooting, startBackgroundAudio, stopBackgroundAudio]);

  useEffect(() => {
    return () => {
      stopBackgroundAudio();
    };
  }, [stopBackgroundAudio]);

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
        setScreensaverActive(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isBooting) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".resume-section, .sidebar-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [isBooting]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/api/blog");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setBlogPosts(data);
            setBlogArchiveStatus("ready");
            return;
          }
        }
        setBlogArchiveStatus("fallback");
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        setBlogArchiveStatus("fallback");
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

  const getBootProgressBar = (pct: number) => {
    const totalBlocks = 20;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return `[${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)}] ${pct}%`;
  };

  if (isBooting) {
    return (
      <div className={`resume-container theme-green boot-screen ${bootGlitchHot ? "glitch-hot" : ""}`}>
        <div className="boot-glitch-fragments" aria-hidden="true">
          <span>ERR_NEURAL_HANDSHAKE</span>
          <span>0xMATRIX_RELINK</span>
          <span>WAKE_SIGNAL_DROPPED</span>
          <span>REALITY_BUFFER_SPLIT</span>
          <span>TRACE_RED_VECTOR</span>
        </div>
        <div className="boot-glitch-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={`boot-box animate-fade-in ${bootProgress >= 50 ? 'phosphor-active' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--stroke)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700 }}>
            <span>BOOT_SEQUENCE.SYS</span>
            <span>v2.2-unSTABLE</span>
          </div>
          <div className="boot-log-container">
            {visibleLogs.map((log, idx) => (
              <div key={idx} className="boot-log-line" style={{ fontFamily: 'monospace', lineHeight: 1.4 }}>
                {log.startsWith("DECRYPTION") ? `> ${log}` : `[ OK ] ${log}`}
              </div>
            ))}
          </div>
          <div className="boot-progress-container" style={{ fontFamily: 'monospace' }}>
            <div style={{ marginBottom: '0.25rem', fontSize: '0.7rem', color: 'var(--ink-soft)' }}>
              DECRYPTING PORTFOLIO BUFFER ARTIFACTS
            </div>
            <div style={{ fontWeight: 700 }}>
              {getBootProgressBar(bootProgress)}
            </div>
          </div>
          <div className={`pill-choice-protocol ${bootProgress >= 50 ? "choice-locked" : ""}`} aria-hidden="true">
            <span className="pill-choice-label">CHOICE_PROTOCOL</span>
            <div className={`pill-track ${bootProgress >= 50 ? "red-only-track" : ""}`}>
              {bootProgress < 50 && <span className="matrix-pill blue-pill">BLUE</span>}
              <span className="pill-signal-line">{bootProgress < 50 ? "SELECTING_RED" : "BLUE_REMOVED"}</span>
              <span className="matrix-pill red-pill selected-pill">RED</span>
            </div>
            <span className="pill-choice-status">
              {bootProgress < 50 ? "blue pill rejected" : "red pill selected: waking up"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-container theme-green">
      <MatrixBackground
        themeMode="green"
        screensaverActive={screensaverActive}
        onClose={() => {
          setScreensaverActive(false);
        }}
        playKeySound={playKeySound}
      />
      <MatrixArtifacts />

      {/* Retro Header controls */}
      <header className="resume-header" style={{ width: '100%' }}>
        <div className="header-controls-row">
          <p className="hero-kicker animate-fade-in" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', margin: 0 }}>
            Portfolio CLI v2.2
          </p>

          <div className="access-badge" aria-label="Visitor access session">
            <span>ACCESS: {accessBadge.access}</span>
            <span>SESSION: {accessBadge.session}</span>
            <span>NODE: {accessBadge.node}</span>
          </div>

          <button
            type="button"
            className="header-control-button header-resume-button"
            onClick={() => {
              triggerDownload('resume_ayush_maurya.pdf');
            }}
          >
            Download Resume
          </button>

          <div className="header-control-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                const nextSoundEnabled = !soundEnabled;
                setSoundEnabled(nextSoundEnabled);

                if (nextSoundEnabled && !isBooting) {
                  startBackgroundAudio();
                } else if (!nextSoundEnabled) {
                  stopBackgroundAudio();
                }
              }}
            >
              {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
              {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="header-container">
          {/* Left Column: ASCII name title, controls, highlights */}
          <div>
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
                <DecryptText text={asciiArts.block} />
              </pre>
            </div>

            <p className="resume-subtitle animate-fade-in terminal-cursor" style={{ marginTop: '1rem' }}>
              <DecryptText text="Computer Science Engineering student and researcher at IIIT Hyderabad" />
            </p>
            <p className="resume-subtitle animate-fade-in" style={{ marginTop: '0rem' }}>
              <DecryptText text="working at the intersection of computer science and human sciences." />
            </p>

            <div className="hero-highlights animate-fade-in" style={{ marginTop: '0.75rem' }}>
              {heroHighlights.map(highlight => (
                <span key={highlight}><DecryptText text={highlight} /></span>
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
            <h2><DecryptText text="About Me" /></h2>
            <p>
              <DecryptText text="Pursuing a dual degree (B.Tech in CS + M.S. by Research in Computing and Human Sciences) at IIIT Hyderabad. Academic interests include machine learning and software systems." />
            </p>
            <div className="profile-metrics">
              {profileMetrics.map(metric => (
                <div key={metric.label} className="metric-item">
                  <span className="metric-value"><DecryptText text={metric.value} /></span>
                  <span className="metric-label"><DecryptText text={metric.label} /></span>
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section animate-fade-in">
            <h2><DecryptText text="Education" /></h2>
            {education.map(entry => (
              <div key={entry.title} className="education-item">
                <div className="header-flex">
                  <h3><DecryptText text={entry.title} /></h3>
                  <span className="date"><DecryptText text={entry.date} /></span>
                </div>
                {entry.lines.map(line => (
                  <p key={line} className="degree">
                    <DecryptText text={line} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          <section className="resume-section animate-fade-in">
            <h2><DecryptText text="Experience" /></h2>
            {experiences.map(experience => (
              <div key={experience.title} className="experience-item">
                <div className="header-flex">
                  <h3><DecryptText text={experience.title} /></h3>
                  <span className="date"><DecryptText text={experience.date} /></span>
                </div>
                <p className="experience-desc"><DecryptText text={experience.description} /></p>
                <Tags tags={experience.tags} />
              </div>
            ))}
          </section>

        </div>

        <div className="resume-sidebar">
          <section className="sidebar-section animate-fade-in">
            <h2><DecryptText text="Connectivity" /></h2>
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
                    <DecryptText text={contact.label} />
                  </a>
                ) : (
                  <span><DecryptText text={contact.label} /></span>
                )}
              </div>
            ))}
          </section>

          <section className="sidebar-section animate-fade-in">
            <h2><DecryptText text="Expertise" /></h2>
            {expertise.map(group => (
              <div key={group.category} className="skills-category">
                <h4><DecryptText text={group.category} /></h4>
                <Tags tags={group.tags} />
              </div>
            ))}
          </section>

          <section className="sidebar-section animate-fade-in">
            <h2><DecryptText text="Honours" /></h2>
            {honours.map(item => (
              <div key={item.title} className="course-item">
                <h4><DecryptText text={item.title} /></h4>
                <p><DecryptText text={item.description} /></p>
              </div>
            ))}
          </section>


        </div>
      </div>

      <div style={{ width: 'min(1080px, 100%)', margin: '0 auto', padding: '0 1.25rem 3.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box' }}>
        <section className="resume-section animate-fade-in">
          <h2><DecryptText text="Key Projects" /></h2>
          <TuiHorizontalScroll>
            {projects.map(project => (
              <div key={project.title} className="project-item">
                <h3>
                  {project.href ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className="project-link">
                      <DecryptText text={project.title} />
                    </a>
                  ) : (
                    <DecryptText text={project.title} />
                  )}
                </h3>
                <p><DecryptText text={project.description} /></p>
                <Tags tags={project.tags} />
              </div>
            ))}
          </TuiHorizontalScroll>
        </section>

        <section className="resume-section animate-fade-in">
          <h2><DecryptText text="Other Projects" /></h2>
          <TuiHorizontalScroll>
            {linktreeLinks.map(link => (
              <div key={link.title} className="project-item">
                <h3>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="project-link">
                    <DecryptText text={link.title} />
                  </a>
                </h3>
                <p><DecryptText text="External project repository/analytics resource. Click to launch site." /></p>
                <div className="skills-tags" style={{ marginTop: 'auto' }}>
                  <span className="skill-tag">[ External Link ]</span>
                </div>
              </div>
            ))}
          </TuiHorizontalScroll>
        </section>

        <section className="resume-section animate-fade-in">
          <h2><DecryptText text="Recent Blog Posts" /></h2>
          <TuiHorizontalScroll>
            {blogArchiveStatus === "querying" ? (
              Array(4).fill(null).map((_, i) => (
                <div key={`archive-loader-${i}`} className="project-item blog-archive-loader">
                  <h3>[ Querying Archive {String(i + 1).padStart(2, "0")} ]</h3>
                  <div className="archive-loader-lines">
                    <span>opening /api/blog stream...</span>
                    <span>checking public visibility flags...</span>
                    <span>decrypting markdown index...</span>
                  </div>
                  <div className="archive-loader-bar" />
                  <div className="archive-loader-footer">
                    <span>NEON::READ</span>
                    <span>[ WAIT ]</span>
                  </div>
                </div>
              ))
            ) : blogPosts.length > 0 ? (
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
                      <DecryptText text={post.title} />
                    </a>
                  </h3>
                  <p><DecryptText text={post.content ? post.content.substring(0, 110).replace(/[#*`_-]/g, '') + '...' : 'Retro TUI blog post...'} /></p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.7rem', opacity: 0.8, color: 'var(--brand)' }}>
                    <span><DecryptText text={new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })} /></span>
                    <span>[ <DecryptText text="Read Post" /> ]</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="project-item blog-archive-loader">
                <h3>[ Archive Unavailable ]</h3>
                <div className="archive-loader-lines">
                  <span>{blogArchiveStatus === "fallback" ? "blog endpoint returned no readable entries." : "no public posts indexed yet."}</span>
                  <span>portfolio shell remains online.</span>
                </div>
                <div className="archive-loader-footer">
                  <span>ARCHIVE::EMPTY</span>
                  <span>[ OK ]</span>
                </div>
              </div>
            )}
          </TuiHorizontalScroll>
        </section>
      </div>

      <footer className="site-footer animate-fade-in">
        <span>Ayush Maurya</span>
        <span>IIIT Hyderabad</span>
        <a href="mailto:ayushmaurya2003@gmail.com" onClick={playKeySound}>
          ayushmaurya2003@gmail.com
        </a>
      </footer>

    </div>
  );
}

export default App;
