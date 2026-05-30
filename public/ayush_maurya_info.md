# Ayush Maurya - Comprehensive Profile & Deep-Dive Dossier

This document is a comprehensive compilation and deep-dive into the portfolio, research, professional experiences, and projects of **Ayush Maurya**, extracted from this repository, academic records, and public resources.

---

## 🧑‍💻 Personal Summary & Academic Profile
* **Title:** Computer Science Engineering Student & Computational Human Sciences Researcher
* **Affiliation:** **Human Sciences Research Centre (HSRC)**, International Institute of Information Technology (IIIT), Hyderabad.
* **Academic Program:** Dual Degree (B.Tech in CSE + M.S. by Research in Computing and Human Sciences)
* **Core Interests:** The intersection of Software Systems, Machine Learning, and Human Sciences (including political systems, networks, history, and user psychology).
* **Ranks & Achievements:**
  * **UGEE (Undergraduate Entrance Examination) Rank:** **111** (out of 40,000+ applicants)
  * **JEE Main Rank/Percentile:** **96.9 Percentile**
  * **Academic Journey Start:** Joined IIIT Hyderabad in **2021** (UG 2k21 cohort)

---

## 🎓 Education & Academic Specializations

### **IIIT Hyderabad**
* **Duration:** 2021 – Present
* **Academic Degrees:**
  * **B.Tech in Computer Science Engineering (CSE)**
  * **M.S. by Research in Computing and Human Sciences (Ongoing)**
* **Affiliated Research Centre:** **Human Sciences Research Centre (HSRC)**
* **Advisors & Research Collaborations:** Collaborated as a student researcher under **Prof. Aniket Alam** (Associate Professor at HSRC specializing in Himalayan history, mountain societies, and applying computational methods like Spatial Informatics and NLP to historical/narrative research).
* **Core Research Focus:**
  * **Examining Political Narratives in India:** An analysis of the Indian Electoral System.
* **Key Coursework & Labs (2022 – 2024):**
  * Design & Analysis of Software Systems
  * Human Science Lab (NLP Research)

### **Mary Gardiner's Convent School**
* **Year:** 2021
* **Performance:** Class XII - **90.1%**

### **City Montessori School**
* **Year:** 2019
* **Performance:** Class X - **94.2%**

---

## 🛠️ Technical Competency & Expertise

### **Programming Languages**
* **Python** (Advanced; expert in data analysis, agent modeling, scientific toolkits)
* **C / C++** (Core systems programming)
* **JavaScript / TypeScript** (Modern full-stack web environments)
* **SQL** (Relational databases, design, and schema engineering)
* **HTML / CSS** (Modern UI engineering)

### **Technologies & Frameworks**
* **Machine Learning / AI:** PyTorch, ResNet50, Transfer Learning, Ensemble Methods (Random Forests, SVMs), Agentic AI architectures.
* **Web Stack:** React 19, Vite 6, Next.js, Flutter, Bun, Node.js (MERN Stack), Tailwind CSS, Framer Motion, shadcn/ui.
* **Specialized Web APIs & Runtime:** Pyodide (WASM browser-side Python execution), Vosk (Offline speech recognition engine), IndexedDB (Offline local web databases), PWA (Progressive Web Apps).
* **Systems / Scientific Computing:** Linux environment, Mesa (Agent-Based Modeling), Polars (Vectorized high-performance dataframes), Numba JIT compiling, CuPy (GPU-accelerated numpy-like computing).

### **UI/UX & Product Design**
* Wireframing & Interactive Prototyping
* User Persona Mapping & User Stories
* User Research & Human-Centered Design (HCD)
* Interaction Design

---

## 💼 Core Experiences

### **SERC Digital Twin (Environmental IoT)**
* **Description:** Developed a real-time environmental monitoring dashboard using the MERN stack (MongoDB, Express, React, Node.js), integrating local physical sensors for tracking environmental metrics like temperature, humidity, water quality, and air quality index.
* **Key Technologies:** `MERN Stack` | `IoT Sensors` | `SQL` | `Real-time Dashboards`

### **tafea (System Design)**
* **Description:** Designed a comprehensive student client software system using standard Software Development Life Cycle (SDLC) methodologies. Embedded natural language interfaces using LLM APIs to improve student interaction and scheduling workflows.
* **Key Technologies:** `System Design` | `UI Design` | `LLM Integrations` | `SDLC`

---

## 🚀 Pinned & Deep-Dive Projects

### 1. **ElectoralSim**
> **Advanced Agent-Based Electoral Simulation Toolkit**
* **Overview:** A modular, high-performance simulation toolkit for electoral systems, voter behavior, and political dynamics. Developed as a side-project of computational human sciences research at IIIT-H, enabling researchers to run massive agent-based simulations of democratic processes.
* **Key Architecture & Performance Features:**
  * **Scale & Vectorization:** Capable of simulating **1M+ voter agents** using vectorized Polars DataFrames and Numba JIT compilation, delivering an **89x speedup** over standard implementations.
  * **Throughput:** Supports batch execution at **30 elections/second** with parallel multiprocessing sweeps.
  * **Hardware Acceleration:** Optional GPU-accelerated computing via **CuPy**.
* **Simulation Capabilities:**
  * **Electoral Systems:** FPTP (Plurality), Proportional (D'Hondt, Sainte-Laguë, Hare/Droop Quotas), Ranked Choice (IRV/RCV, STV), and alternative voting (Approval, Condorcet Winner).
  * **Voter Psychology:** Integrates the Big Five personality traits (OCEAN), Moral Foundations Theory (Haidt), media diets (bias/misinformation susceptibility), and affective polarization.
  * **Voter Behavior:** Proximity models (spatial policy distance), Valence models (competence/charisma), Retrospective models (incumbent reward/punish), and Strategic voting (Duverger's Law).
  * **Opinion Dynamics:** Social networks (Barabási-Albert, Watts-Strogatz, Erdős-Rényi) modeling opinion shifts, noisy voter interactions, zealot components, and media bias diffusion.
  * **Coalitions & Stability:** Min Winning Coalition (MWC), Laver-Shepsle portfolio allocation, and collapse models (sigmoid, linear, exponential).
  * **Presets:** Includes preconfigured political structures for **11 countries**, including India (543 Lok Sabha seats), EU Parliament (720 MEPs), USA, Brazil, Japan, UK, and Germany.
* **Tags:** `Python` | `Agent-Based Modeling (Mesa)` | `Polars` | `Numba` | `Open Source`
* **PyPI:** [electoral-sim on PyPI](https://pypi.org/project/electoral-sim)

### 2. **IPL Strategy Lab**
> **Next-Generation Cricket Analytics Platform**
* **Overview:** An intelligent cricket strategy analyzer powered by agentic AI models (Gemini/Gemma 3) and client-side Python execution. Users ask complex analytical cricket questions in natural language and receive interactive charts, insights, and PDF reports.
* **Key Architecture Features:**
  * **Multi-Agent Architecture:** Runs a pipeline composed of an *Analyst* (generating Pandas analysis), a *Strategist* (extracting tactical insights), and an *Evaluator* (performing quality audit).
  * **Self-Healing Analysis Loop:** Integrates recursive feedback that restarts coding tasks with refined prompts if initial code executions encounter exceptions.
  * **Client-Side WASM Engine:** Runs Python's Pandas engine entirely in the browser using **Pyodide** (WebAssembly), keeping computing fully client-side.
  * **Rich Analytics:** Analyzes a massive, Gzip-optimized dataset of **260,000+ deliveries** (covering IPL seasons from 2008 to 2024) with interactive Recharts diagrams.
* **Tags:** `React` | `Agentic AI` | `Pyodide (WASM)` | `Pandas` | `Recharts` | `PWA`
* **Link:** [ipl.ayushmaurya.xyz](https://ipl.ayushmaurya.xyz/)

### 3. **WorDrop**
> **Offline Personal Safety & Automation Android App**
* **Overview:** A privacy-first, offline Android app designed for personal safety, privacy, and local device automation. The app runs as a background service listening for user-defined trigger words (hotwords) to execute custom action pipelines.
* **Key Architectural Features:**
  * **100% Offline Speech Recognition:** Utilizes the local **Vosk** speech recognition engine, running audio transcription on-device with a ~50MB language model (never sending audio data to the cloud).
  * **Trigger Profiles:** Categories (e.g., "Panic Mode") that map multiple phrase aliases.
  * **Configurable Action Triggers:** Pause active media playback, flash device torch, fire custom haptic patterns, mute system audio, clear clipboard data, blast a panic siren, or launch designated emergency apps (e.g., Spotify, dialer).
  * **UI/UX:** Modern Flutter implementation of Google Material 3 Design with Dark Mode.
* **Tags:** `Flutter` | `Vosk Offline Speech` | `Material 3` | `Personal Safety` | `Android`
* **Link:** [WorDrop on GitHub](https://github.com/Ayush12358/WorDrop)

### 4. **TempusLogic**
> **NLP Diagnostic Reasoning Robustness Suite**
* **Overview:** An advanced NLP research toolkit consisting of two evaluation tracks designed to test the limits of modern Large Language Models under contextual shifts and adversarial prompting.
* **Evaluation Tracks:**
  * **Logical Reasoning Diagnostics:** Uses **Dyads** (2 premises) and **Triads** (3 premises) to test model logical consistency. It compares original logical conclusions against modified contexts (where statements are added but the question is kept identical) to measure models' recall drops and sensitivity to contextual changes.
  * **Mathematical Stress Tests:** Subjects models to the GSM8K benchmark while applying adversarial prompting (misleading exemplars) to evaluate math stability.
* **Tags:** `Python` | `NLP Research` | `Logical Reasoning` | `API Gateways` | `GSM8K`
* **Link:** [TempusLogic on GitHub](https://github.com/Ayush12358/TempusLogic)

### 5. **amReader**
> **Premium Client-Side M4B Audiobook Player**
* **Overview:** A premium web-based player optimized specifically for M4B audiobooks, supporting chapter divisions and lyric/subtitle formats (ASS, SSA, SRT, VTT).
* **Key Technical Features:**
  * **Chapter Parsing:** Client-side parsing of M4B file structures to extract embedded chapters.
  * **Lyric Autoscroll:** Imports subtitle files to sync text lines automatically with the audio playhead.
  * **IndexedDB Storage:** Keeps files, metadata, playback speeds, bookmark timestamps, and cover art (`music-metadata-browser`) stored locally inside the browser.
  * **UI/UX:** Dual-axis theme configurations (5 preset visual colors + Light/Dark modes) built in React 19 and Vite 6.
* **Tags:** `React 19` | `Vite 6` | `Tailwind CSS` | `IndexedDB` | `M4B Player` | `PWA`
* **Link:** [m4b.ayushmaurya.xyz](https://m4b.ayushmaurya.xyz/)

### 6. **WebTTS**
> **Ebook-to-Audiobook Converter PWA**
* **Overview:** An immersive browser-based application that turns digital reading materials (EPUB ebooks, Markdown, or pasted text) into custom audiobooks using advanced text-to-speech engines.
* **Key Technical Features:**
  * **Dual Engine Support:** Uses local Web Speech API (system voices) or Google Cloud Text-to-Speech (neural voices).
  * **Interactive Reader:** Highlights active sentences in real time, supports right-click bookmarking on specific sentences, and dynamically calculates remaining "reading time" relative to playback speeds.
  * **Storage:** Integrates Vercel Blob storage.
* **Tags:** `React` | `Vite` | `Web Speech API` | `Google Cloud TTS` | `EPUB Parser` | `PWA`
* **Link:** [tts.ayushmaurya.xyz](https://tts.ayushmaurya.xyz/)

### 7. **ZenFocus HUD**
> **Cinematic, ADHD-Friendly Productivity Dashboard**
* **Overview:** A highly aesthetic Progressive Web App (PWA) "Heads-Up Display" designed to help users reach flow states. It integrates ambient custom visual streams (curated YouTube lofi/nature channels or offline drag-and-drop playlists) with custom productivity anchors.
* **Key Features:** Animated Circular Pomodoro timer, focus intention locking (`"I am focusing on..."`), IndexedDB offline local video playlists, custom quick-link docks, and JSON configuration importing/exporting.
* **Tags:** `HTML5` | `IndexedDB` | `ADHD-Friendly` | `Pomodoro` | `PWA`
* **Link:** [zen.ayushmaurya.xyz](https://zen.ayushmaurya.xyz/)

### 8. **Himalayan Trade Networks (Highland History Project)**
* **Overview:** A specialized digital humanities project developed in collaboration with Prof. Aniket Alam's research at HSRC. Focuses on digitizing massive registers of historical trade documents, applying OCR processing, and leveraging LLMs to recover text anomalies to map trade routes throughout the Himalayas.
* **Tags:** `Machine Learning` | `OCR` | `Himalayan History` | `Digital Humanities` | `LLM`

### 9. **Other Active Projects**
* **ML for Local Geoguesser:** Image location estimation model using ResNet50. Predicts region, lat/lon, and camera angle, achieving **92% region accuracy**. (`Python`, `PyTorch`)
* **Campus Mart:** Buy-sell-rent mobile prototype integrating **NFC item tracking** for university campuses. [Google Drive Folder](https://drive.google.com/drive/folders/12ZXtbmZpdcGo3j2tK9wqVYBc4WFLgdW4?usp=drive_link)
* **Design for Social Innovation (TAFEA):** Platform enabling Teach for India fellows to draft extracurricular courses. [Google Drive Folder](https://drive.google.com/drive/folders/1eeFthW_dBVRH_B3e6DE2cVocBUmpsps0?usp=drive_link)
* **Katha Marketplace:** Stories-first visual interface prototype for rural artisans. (`UI/UX Design`)
* **IIIT In Context:** Autonomous student-oriented platform context. [iiit-in-context.vercel.app](https://iiit-in-context.vercel.app/)
* **Mental Health Toolkit:** Minimal, elegant web wellness toolkit. [mh.ayushmaurya.xyz](https://mh.ayushmaurya.xyz/)

---

## 🏆 Honours & Extra-Curricular Activities

* **Academic Honours:**
  * **UGEE Rank 111:** High-standing rank out of 40,000+ candidates for the IIIT Dual Degree track.
  * **JEE Main:** 96.9 Percentile.
* **Creative & Artistic Pursuits:**
  * **Bass Guitarist:** Active bass guitar player in his college band.
  * **Sports:** Lawn tennis player.

---

## 📞 Connectivity & Social Links

* **Email (Personal):** [ayushmaurya2003@gmail.com](mailto:ayushmaurya2003@gmail.com)
* **Email (IIIT-H Research):** [ayush.maurya@research.iiit.ac.in](mailto:ayush.maurya@research.iiit.ac.in)
* **Phone:** +91-7985149173
* **LinkedIn:** [/in/ayush-maurya-a41a9721a](https://linkedin.com/in/ayush-maurya-a41a9721a)
* **GitHub Profile:** [Ayush12358](https://github.com/Ayush12358)
* **Personal/Portfolio Website:** [ayushmaurya.xyz](https://ayushmaurya.xyz)
