<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Samson George Sanga | Cybersecurity Graduate</title>
<meta
 name="description"
 content="Portfolio of Samson George Sanga — Cybersecurity Graduate, Web Developer and AI/ML Enthusiast."
/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
  <style>
    :root {
      --bg: #05080a;
      --bg-soft: #091014;
      --card: rgba(10, 20, 24, 0.75);
      --border: rgba(0, 255, 170, 0.15);
      --green: #00ff9d;
      --cyan: #00d9ff;
      --text: #edfdf7;
      --muted: #8da5a0;
      --danger: #ff5577;
      --max: 1180px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      scroll-behavior: smooth;
    }

    body {
      font-family: "Inter", sans-serif;
      background:
        radial-gradient(circle at 20% 10%, rgba(0,255,157,.08), transparent 25%),
        radial-gradient(circle at 80% 20%, rgba(0,217,255,.06), transparent 25%),
        var(--bg);
      color: var(--text);
      line-height: 1.7;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .18;
      background-image:
        linear-gradient(rgba(0,255,157,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,157,.04) 1px, transparent 1px);
      background-size: 45px 45px;
      z-index: -1;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .container {
      width: min(92%, var(--max));
      margin: auto;
    }

    /* NAVIGATION */

    nav {
      position: fixed;
      width: 100%;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(18px);
      background: rgba(5, 8, 10, .78);
      border-bottom: 1px solid rgba(255,255,255,.05);
    }

    .nav-inner {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-family: "JetBrains Mono", monospace;
      font-weight: 700;
      color: var(--green);
      font-size: 1rem;
    }

    .logo span {
      color: var(--cyan);
    }

    .nav-links {
      display: flex;
      gap: 28px;
      list-style: none;
      font-size: .9rem;
    }

    .nav-links a {
      color: var(--muted);
      transition: .25s;
    }

    .nav-links a:hover {
      color: var(--green);
    }

    /* HERO */

    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding-top: 80px;
    }

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, .7fr);
  gap: 70px;
  align-items: center;
}

.hero-grid > div:first-child {
  grid-column: 1;
}

.hero-grid > .terminal {
  grid-column: 2;
}
    }

    .terminal-label {
      font-family: "JetBrains Mono", monospace;
      color: var(--green);
      font-size: .9rem;
      margin-bottom: 20px;
    }

    .terminal-label::before {
      content: "> ";
      color: var(--cyan);
    }

    h1 {
      font-size: clamp(2.7rem, 7vw, 5.5rem);
      line-height: 1.02;
      letter-spacing: -4px;
      margin-bottom: 25px;
    }

    h1 span {
      color: var(--green);
    }

    .hero h2 {
      font-size: clamp(1.1rem, 2vw, 1.5rem);
      color: var(--muted);
      font-weight: 500;
      margin-bottom: 25px;
    }

    .hero-description {
      max-width: 680px;
      color: #a8bbb7;
      font-size: 1.05rem;
      margin-bottom: 35px;
    }

    .buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 13px 22px;
      border-radius: 8px;
      font-weight: 600;
      font-size: .9rem;
      transition: .25s;
    }

    .btn-primary {
      color: #00150d;
      background: var(--green);
      box-shadow: 0 0 30px rgba(0,255,157,.12);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 35px rgba(0,255,157,.3);
    }

    .btn-secondary {
      border: 1px solid var(--border);
      color: var(--text);
      background: rgba(255,255,255,.02);
    }

    .btn-secondary:hover {
      border-color: var(--green);
      color: var(--green);
    }

    /* TERMINAL */

    .terminal {
      background: #050b0d;
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 0 70px rgba(0,255,157,.06);
      overflow: hidden;
    }

    .terminal-top {
      padding: 12px 15px;
      background: #0b1518;
      border-bottom: 1px solid rgba(255,255,255,.05);
    }

    .dots {
      display: flex;
      gap: 7px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .red { background: #ff5f56; }
    .yellow { background: #ffbd2e; }
    .green { background: #27c93f; }

    .terminal-body {
      padding: 25px;
      font-family: "JetBrains Mono", monospace;
      font-size: .82rem;
    }

    .terminal-line {
      margin-bottom: 13px;
      color: #9cb2ad;
    }

    .terminal-line .prompt {
      color: var(--green);
    }

    .terminal-line .value {
      color: var(--cyan);
    }

    /* SECTIONS */

    section {
      padding: 110px 0;
    }

    .section-heading {
      margin-bottom: 50px;
    }

    .section-number {
      color: var(--green);
      font-family: "JetBrains Mono", monospace;
      font-size: .8rem;
      margin-bottom: 8px;
    }

    .section-heading h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      letter-spacing: -1px;
    }

    .section-heading p {
      color: var(--muted);
      max-width: 650px;
      margin-top: 12px;
    }

    /* ABOUT */

    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .about-text p {
      color: #a8bbb7;
      margin-bottom: 18px;
    }

    .about-card {
      padding: 30px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
    }

    .about-card h3 {
      color: var(--green);
      margin-bottom: 20px;
    }

    .about-card ul {
      list-style: none;
    }

    .about-card li {
      padding: 9px 0;
      color: var(--muted);
      border-bottom: 1px solid rgba(255,255,255,.04);
    }

    .about-card li::before {
      content: "✓";
      color: var(--green);
      margin-right: 10px;
    }

    /* SKILLS */

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    .skill-card {
      padding: 25px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: .25s;
    }

    .skill-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0,255,157,.4);
    }

    .skill-card h3 {
      font-size: 1rem;
      margin-bottom: 15px;
      color: var(--green);
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      font-family: "JetBrains Mono", monospace;
      font-size: .72rem;
      padding: 5px 9px;
      border-radius: 5px;
      background: rgba(0,255,157,.05);
      border: 1px solid rgba(0,255,157,.1);
      color: #a9c6be;
    }

    /* PROJECTS */

    .projects {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 22px;
    }

    .project {
      position: relative;
      padding: 32px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: linear-gradient(
        145deg,
        rgba(11,25,28,.85),
        rgba(5,10,12,.85)
      );
      transition: .3s;
    }

    .project:hover {
      transform: translateY(-7px);
      border-color: rgba(0,255,157,.4);
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
    }

    .project-number {
      color: var(--cyan);
      font-family: "JetBrains Mono", monospace;
      font-size: .75rem;
      margin-bottom: 20px;
    }

    .project h3 {
      font-size: 1.35rem;
      margin-bottom: 12px;
    }

    .project p {
      color: var(--muted);
      font-size: .92rem;
      margin-bottom: 20px;
    }

    /* EXPERIENCE */

    .timeline {
      border-left: 1px solid rgba(0,255,157,.25);
      margin-left: 10px;
    }

    .timeline-item {
      position: relative;
      padding: 0 0 50px 35px;
    }

    .timeline-item::before {
      content: "";
      position: absolute;
      left: -6px;
      top: 6px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 15px var(--green);
    }

    .timeline-date {
      color: var(--green);
      font-family: "JetBrains Mono", monospace;
      font-size: .8rem;
      margin-bottom: 8px;
    }

    .timeline-item h3 {
      font-size: 1.3rem;
    }

    .timeline-item h4 {
      color: var(--cyan);
      font-weight: 500;
      margin-bottom: 12px;
    }

    .timeline-item p {
      color: var(--muted);
      max-width: 750px;
    }

    /* EDUCATION */

    .education-card {
      padding: 35px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--card);
    }

    .education-card .degree {
      color: var(--green);
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .education-card .school {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }

    .education-card p {
      color: var(--muted);
    }

    /* CONTACT */

    .contact-box {
      text-align: center;
      padding: 70px 30px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background:
        radial-gradient(circle at center, rgba(0,255,157,.07), transparent 60%),
        var(--card);
    }

    .contact-box h2 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      margin-bottom: 15px;
    }

    .contact-box p {
      color: var(--muted);
      margin: 0 auto 30px;
      max-width: 600px;
    }

    .contact-links {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .contact-link {
      padding: 11px 18px;
      border: 1px solid var(--border);
      border-radius: 7px;
      color: var(--muted);
      font-family: "JetBrains Mono", monospace;
      font-size: .8rem;
    }

    .contact-link:hover {
      color: var(--green);
      border-color: var(--green);
    }

    /* FOOTER */

    footer {
      border-top: 1px solid rgba(255,255,255,.05);
      padding: 30px 0;
      color: var(--muted);
      font-size: .8rem;
      text-align: center;
    }

    footer span {
      color: var(--green);
    }

    /* RESPONSIVE */

    @media (max-width: 900px) {
      .hero-grid,
      .about-grid {
        grid-template-columns: 1fr;
      }

      .skills-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .projects {
        grid-template-columns: 1fr;
      }

      .terminal {
        max-width: 600px;
      }
    }

    @media (max-width: 650px) {
      .nav-links {
        display: none;
      }

      h1 {
        letter-spacing: -2px;
      }

      section {
        padding: 80px 0;
      }

      .skills-grid {
        grid-template-columns: 1fr;
      }

      .hero {
        padding-top: 110px;
      }

      .buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
      .terminal {
  display: block;
  width: 100%;
  max-width: 500px;
  visibility: visible;
  opacity: 1;
}

    }
  </style>

</head>

<body>

  <!-- NAVIGATION -->

  <nav>
    <div class="container nav-inner">
      <a href="#home" class="logo">samson<span>@</span>cyber:~$</a>

  <ul class="nav-links">
    <li><a href="#about">About</a></li>
    <li><a href="#skills">Skills</a></li>
    <li><a href="#projects">Projects</a></li>
    <li><a href="#experience">Experience</a></li>
    <li><a href="#education">Education</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</div>

  </nav>

  <!-- HERO -->

  <main id="home">
    <section class="hero">
      <div class="container hero-grid">

    <div>
      <div class="terminal-label">
        cybersecurity.profile
      </div>

      <h1>
        Samson George<br>
        <span>Sanga.</span>
      </h1>

      <h2>
        Cybersecurity Graduate · Security Enthusiast · Web Developer · AI/ML Enthusiast
      </h2>

      <p class="hero-description">
        Building secure, intelligent and practical digital solutions
        through cybersecurity, software development and artificial intelligence.
      </p>

      <div class="buttons">
        <a href="#projects" class="btn btn-primary">
          View My Projects
        </a>

        <a href="#contact" class="btn btn-secondary">
          Contact Me
        </a>

        <!-- Replace # with your CV file -->
        <a href="#" class="btn btn-secondary">
          Download CV
        </a>
      </div>
    </div>

    <!-- TERMINAL CARD -->
    <div class="terminal">
      <div class="terminal-top">
        <div class="dots">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
        </div>
      </div>

      <div class="terminal-body">
        <div class="terminal-line">
          <span class="prompt">samson@sanga</span>:~$ whoami
        </div>

        <div class="terminal-line">
          <span class="value">Cybersecurity Graduate</span>
        </div>

        <div class="terminal-line">
          <span class="prompt">samson@sanga</span>:~$ location
        </div>

        <div class="terminal-line">
          <span class="value">Tanzania</span>
        </div>

        <div class="terminal-line">
          <span class="prompt">samson@sanga</span>:~$ focus
        </div>

        <div class="terminal-line">
          <span class="value">Cybersecurity + AI + Development</span>
        </div>

        <div class="terminal-line">
          <span class="prompt">samson@sanga</span>:~$ status
        </div>

        <div class="terminal-line">
          <span class="value">Available for opportunities_</span>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="container">

    <div class="section-heading">
      <div class="section-number">01 / ABOUT</div>
      <h2>Who I Am</h2>
      <p>
        A cybersecurity graduate passionate about protecting systems
        and building intelligent technology.
      </p>
    </div>

    <div class="about-grid">

      <div class="about-text">
        <p>
          I am a Cybersecurity graduate from the
          Institute of Accountancy Arusha (IAA), Tanzania,
          with a strong interest in cybersecurity, network security,
          vulnerability assessment, web development and artificial intelligence.
        </p>

        <p>
          My technical background combines security and software development.
          I work with technologies including Python, PHP, JavaScript,
          HTML, CSS, MySQL, Laravel and React.
        </p>

        <p>
          I also have practical experience with cybersecurity tools and
          methodologies including Nmap, Nessus, Burp Suite, Metasploit,
          Snort, Wireshark, Hydra, GoPhish and SET.
        </p>

        <p>
          My major academic project, <strong>PhishGuard AI</strong>,
          focuses on using AI and NLP to detect phishing threats across
          emails, SMS messages and URLs.
        </p>
      </div>

      <div class="about-card">
        <h3>Areas of Focus</h3>

        <ul>
          <li>Cybersecurity & Information Security</li>
          <li>Vulnerability Assessment</li>
          <li>Network Security</li>
          <li>Ethical Hacking & Security Testing</li>
          <li>AI-Based Security Solutions</li>
          <li>Web Application Development</li>
          <li>Security Awareness</li>
          <li>Risk Assessment</li>
        </ul>
      </div>

    </div>
  </div>
</section>

<!-- SKILLS -->
<section id="skills">
  <div class="container">

    <div class="section-heading">
      <div class="section-number">02 / SKILLS</div>
      <h2>Technical Arsenal</h2>
      <p>
        Technologies, tools and security skills I work with.
      </p>
    </div>

    <div class="skills-grid">

      <div class="skill-card">
        <h3>Cybersecurity</h3>
        <div class="tags">
          <span class="tag">Vulnerability Assessment</span>
          <span class="tag">Network Security</span>
          <span class="tag">Ethical Hacking</span>
          <span class="tag">Penetration Testing</span>
          <span class="tag">Security Auditing</span>
          <span class="tag">Risk Assessment</span>
          <span class="tag">Phishing Detection</span>
          <span class="tag">Social Engineering</span>
        </div>
      </div>

      <div class="skill-card">
        <h3>Security Tools</h3>
        <div class="tags">
          <span class="tag">Kali Linux</span>
          <span class="tag">Nmap</span>
          <span class="tag">Nessus</span>
          <span class="tag">Burp Suite</span>
          <span class="tag">Metasploit</span>
          <span class="tag">Snort</span>
          <span class="tag">Wireshark</span>
          <span class="tag">Hydra</span>
          <span class="tag">GoPhish</span>
          <span class="tag">BeEF</span>
          <span class="tag">SET</span>
        </div>
      </div>

      <div class="skill-card">
        <h3>Programming</h3>
        <div class="tags">
          <span class="tag">Python</span>
          <span class="tag">PHP</span>
          <span class="tag">JavaScript</span>
          <span class="tag">HTML5</span>
          <span class="tag">CSS3</span>
          <span class="tag">SQL</span>
          <span class="tag">MySQL</span>
          <span class="tag">Java</span>
          <span class="tag">C/C++</span>
        </div>
      </div>

      <div class="skill-card">
        <h3>Frameworks & AI</h3>
        <div class="tags">
          <span class="tag">Laravel</span>
          <span class="tag">React.js</span>
          <span class="tag">TensorFlow</span>
          <span class="tag">Keras</span>
          <span class="tag">OpenCV</span>
          <span class="tag">NLTK</span>
          <span class="tag">Hugging Face</span>
          <span class="tag">Git/GitHub</span>
          <span class="tag">XAMPP</span>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- PROJECTS -->
<section id="projects">
  <div class="container">

    <div class="section-heading">
      <div class="section-number">03 / PROJECTS</div>
      <h2>Selected Projects</h2>
      <p>
        Practical work combining cybersecurity, software development
        and artificial intelligence.
      </p>
    </div>

    <div class="projects">

      <article class="project">
        <div class="project-number">PROJECT / 01</div>

        <h3>PhishGuard AI</h3>

        <p>
          A multi-layer AI-based phishing detection system designed
          to analyze emails, SMS messages and URLs. The system combines
          artificial intelligence, natural language processing and
          security analysis to identify potential phishing threats.
        </p>

        <div class="tags">
          <span class="tag">Python</span>
          <span class="tag">AI/ML</span>
          <span class="tag">NLP</span>
          <span class="tag">Cybersecurity</span>
          <span class="tag">URL Analysis</span>
        </div>
      </article>

      <article class="project">
        <div class="project-number">PROJECT / 02</div>

        <h3>Vulnerability Assessment Labs</h3>

        <p>
          Security testing and vulnerability assessment labs involving
          network discovery, vulnerability identification and security
          analysis using industry-standard cybersecurity tools.
        </p>

        <div class="tags">
          <span class="tag">Nmap</span>
          <span class="tag">Nessus</span>
          <span class="tag">Burp Suite</span>
          <span class="tag">Kali Linux</span>
        </div>
      </article>

      <article class="project">
        <div class="project-number">PROJECT / 03</div>

        <h3>Database Security Auditing System</h3>

        <p>
          A database auditing concept designed to monitor database
          activities such as SELECT and UPDATE operations, improving
          accountability and helping identify unauthorized changes.
        </p>

        <div class="tags">
          <span class="tag">MySQL</span>
          <span class="tag">SQL</span>
          <span class="tag">Security Auditing</span>
          <span class="tag">Database Security</span>
        </div>
      </article>

      <article class="project">
        <div class="project-number">PROJECT / 04</div>

        <h3>Web Development Projects</h3>

        <p>
          Web applications developed using modern web technologies,
          combining responsive interfaces, backend development,
          databases and practical application security principles.
        </p>

        <div class="tags">
          <span class="tag">HTML</span>
          <span class="tag">CSS</span>
          <span class="tag">JavaScript</span>
          <span class="tag">PHP</span>
          <span class="tag">Laravel</span>
          <span class="tag">React</span>
          <span class="tag">MySQL</span>
        </div>
      </article>

    </div>
  </div>
</section>

<!-- EXPERIENCE -->
<section id="experience">
  <div class="container">

    <div class="section-heading">
      <div class="section-number">04 / EXPERIENCE</div>
      <h2>Professional Exposure</h2>
      <p>
        Practical cybersecurity experience gained during my field attachment.
      </p>
    </div>

    <div class="timeline">

      <div class="timeline-item">
        <div class="timeline-date">FIELD ATTACHMENT</div>

        <h3>Ministry of Communication and Information Technology</h3>

        <h4>
          Communication Safety & Information Security
        </h4>

        <p>
          Gained practical exposure to cybersecurity operations,
          vulnerability assessment, network security assessment,
          security testing and risk assessment. Worked with tools
          including Nmap and Nessus and gained exposure to SQL injection
          testing, social engineering security awareness labs and
          Critical Information Infrastructure (CII) management.
        </p>
      </div>

    </div>
  </div>
</section>

<!-- EDUCATION -->
<section id="education">
  <div class="container">

    <div class="section-heading">
      <div class="section-number">05 / EDUCATION</div>
      <h2>Education</h2>
    </div>

    <div class="education-card">
      <div class="degree">Bachelor of Cyber Security (BCSe)</div>

      <div class="school">
        Institute of Accountancy Arusha (IAA), Tanzania
      </div>

      <p>
        Faculty of Informatics — Department of Computer Science
      </p>

      <p style="margin-top:12px;color:#00ff9d;">
        ✓ Graduated
      </p>
    </div>

  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <div class="container">

    <div class="contact-box">

      <div class="section-number">06 / CONTACT</div>

      <h2>Let's Connect.</h2>

      <p>
        Interested in cybersecurity, secure software development,
        AI-driven security solutions or collaboration?
        Feel free to get in touch.
      </p>

      <div class="contact-links">

        <!-- Replace these placeholders with your real details -->

        <a class="contact-link" href="mailto:samsongeorge800@gmail.com">
          Email
        </a>

        <a class="contact-link" href="https://github.com/Gsbreel" target="_blank">
          GitHub
        </a>

        <a class="contact-link" href="https://linkedin.com/in/sam123" target="_blank">
          LinkedIn
        </a>

        <a class="contact-link" href="tel:+255614385526">
          Phone
        </a>

        <span class="contact-link">
          Tanzania
        </span>

      </div>

    </div>
  </div>
</section>

  </main>

  <footer>
    <div class="container">
      © 2026 <span>Samson George Sanga</span>.
      Built with purpose, security and code.
    </div>
  </footer>

</body>
</html>
