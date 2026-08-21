<?php require_once 'includes/functions.php'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhishGuard AI - Phishing Detection</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>


<body>
    <div class="background-shell">
        <canvas id="bg-particles"></canvas>
        <div class="signal-ring ring-1"></div>
        <div class="signal-ring ring-2"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="grid-overlay"></div>
    </div>
    <div class="page-shell">
        <nav class="navbar">
            <a href="index.php" class="navbar-brand">PhishGuard AI</a>
            <div class="nav-links">
                <a href="index.php">Home</a>
                <?php if (isLoggedIn()): ?>
                    <a href="index.php" class="active">Analyze</a>
                    <a href="history.php">History</a>
                    <a href="#" onclick="logout()">Logout (<?php echo htmlspecialchars($_SESSION['username']); ?>)</a>
                <?php else: ?>
                    <a href="login.php">Login</a>
                    <a href="register.php">Register</a>
                <?php endif; ?>
            </div>
        </nav>
        <div class="container">
        <?php if (!isLoggedIn()): ?>
        <!-- HERO SECTION -->
<div class="card hero-card" style="text-align:center; padding:3rem; margin-bottom:2rem;">

    <h1 style="font-size:2.2rem;margin-bottom:1rem; color:#ffffff;">
        A MULTI-LAYER AI-BASED PHISHING DETECTION SYSTEM
    </h1>

    <p style="font-size:1.2rem; opacity:0.88; color:#dbeafe;">
        For Email, SMS, and URL Analysis
    </p>

    <p style="margin-top:1rem; max-width:900px; margin-left:auto; margin-right:auto; line-height:1.8; color:rgba(226, 232, 240, 0.94);">
        An intelligent cybersecurity platform that combines Artificial Intelligence,
        Natural Language Processing, URL Analysis, and Machine Learning techniques
        to detect phishing attacks across multiple communication channels.
    </p>
</div>

<!-- DETECTION MODULES -->
<div class="card">
    <div class="card-title"> Detection Modules</div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">

        <div class="module-card">
            <h3> Email Analysis Module</h3>
            <p>
                Detects phishing emails using NLP techniques, suspicious keywords,
                sender behavior analysis, urgency detection, and credential request identification.
            </p>
        </div>

        <div class="module-card">
            <h3>SMS Analysis Module</h3>
            <p>
                Identifies fraudulent SMS messages, malicious links,
                social engineering attempts, and scam-related language patterns.
            </p>
        </div>

        <div class="module-card">
            <h3>URL Analysis Module</h3>
            <p>
                Examines URLs for suspicious domains, shortened links,
                abnormal structures, and known phishing indicators.
            </p>
        </div>

        <div class="module-card">
            <h3>AI Decision Engine</h3>
            <p>
                Combines results from all detection layers and produces
                a final phishing risk score and classification.
            </p>
        </div>

    </div>
</div>

<!-- SYSTEM PROCESS -->
<div class="card">
    <div class="card-title"> Detection Process Flow</div>

    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:15px;text-align:center;margin-top:20px;">

        <div class="process-box">User Input ➤</div>
        <div class="process-box">AI Text Analysis ➤</div>
        <div class="process-box">URL Inspection ➤</div>
        <div class="process-box">Feature Extraction ➤</div>
        <div class="process-box">Risk Assessment ➤</div>
        <div class="process-box">Final Classification</div>

    </div>
</div>

<!-- TECHNOLOGY STACK -->
<div class="card">
    <div class="card-title">Technology Stack</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">

        <div class="tech-card">
            <h3>Frontend</h3>
            <p>HTML, CSS and JavaScript</p>
        </div>

        <div class="tech-card">
            <h3>Backend</h3>
            <p>PHP, Java and Python</p>
        </div>

        <div class="tech-card">
            <h3>Database</h3>
            <p>MySQL</p>
        </div>

        <div class="tech-card">
            <h3>Artificial Intelligence</h3>
            <p>NLP, Machine Learning, Pattern Detection</p>
        </div>

        <div class="tech-card">
            <h3>Security Features</h3>
            <p>Authentication, Session Management, Threat Analysis</p>
        </div>

    </div>
</div>
<?php endif; ?>

<?php if (isLoggedIn()): ?> <!-- WELCOME MESSAGE -->
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 700;"> Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>! </div>
                        <div style="opacity: 0.9; margin-top: 0.25rem;"> You're logged in. Start analyzing emails, SMS, or URLs below. </div>
                    </div>
                </div>
            </div> <!-- ANALYSIS FORM (ONLY SHOW WHEN LOGGED IN) -->
            <div class="card">
                <div class="card-title">Analyze Communication</div>
                <div class="tabs"> <button class="tab-btn active" data-type="email">Email</button> <button class="tab-btn" data-type="sms">SMS</button> <button class="tab-btn" data-type="url">URL</button> </div>
                <form id="analyzeForm"> <input type="hidden" id="inputType" value="email">
                    <div class="form-group"> <label for="inputText">Content</label> <textarea id="inputText" placeholder="Paste the full email content here..."></textarea> </div> <button type="submit" class="btn btn-primary btn-block" id="analyzeBtn"> <span class="spinner"></span> Analyze Now </button>
                </form>
                <div id="resultCard" class="result-card">
                    <div id="riskBadge" class="risk-badge">Unknown</div>
                    <div class="score-display" id="finalScore">0%</div>
                    <div style="text-align:center;font-weight:600;margin-bottom:1rem;" id="classificationText">--</div>
                    <div style="font-weight:600;margin-bottom:0.5rem;">Detected Indicators:</div>
                    <ul class="explanations" id="explanations"></ul>
                    <div class="layer-breakdown">
                        <div class="layer-item">
                            <div class="layer-label"><span>Text Analysis</span><span id="textScoreVal">0%</span></div>
                            <div class="progress-bar">
                                <div class="progress-fill text" id="textScoreBar"></div>
                            </div>
                        </div>
                        <div class="layer-item">
                            <div class="layer-label"><span>URL Analysis</span><span id="urlScoreVal">0%</span></div>
                            <div class="progress-bar">
                                <div class="progress-fill url" id="urlScoreBar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> <?php else: ?> <!-- NOT LOGGED IN - SHOW LOGIN PROMPT -->
            <div class="card card-highlight" style="text-align: center; padding: 3rem;">
                <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: pulse 2s ease-in-out infinite;">🔒</div>
                <div class="card-title" style="font-size: 2rem; margin-bottom: 0.5rem;">Secure Your Analysis</div>
                <p style="margin-bottom: 1rem; font-size: 1.1rem;">Create an account to start analyzing emails, SMS messages, and URLs for phishing threats.</p>
                <p style="margin-bottom: 2rem; font-size: 0.95rem; opacity: 0.9;">Your detections are saved to your history for easy reference.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;"> 
                    <a href="login.php" class="btn btn-primary" style="min-width: 140px;">Sign In</a> 
                    <a href="register.php" class="btn btn-primary" style="background: linear-gradient(135deg, var(--success), #10b981); min-width: 140px;">Create Account</a> 
                </div>
            </div> <?php endif; ?> <!-- INFO CARD (SHOWS FOR EVERYONE) -->
        <div class="card">
            <div class="card-title">How It Works</div>
            <ol style="margin-left:1.25rem;color:var(--text-light);line-height:2;">
                <li><strong>Text Analysis:</strong> NLP detects urgency, credential requests, social engineering.</li>
                <li><strong>URL Inspection:</strong> Lexical and host-based features identify malicious links.</li>
                <li><strong>Decision Fusion:</strong> Weighted ensemble combines both signals.</li>
            </ol>
        </div>
    </div>
    </div>
    <script src="assets/js/app.js"></script>
    <script>
        function logout() {
            fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'action=logout'
            }).then(() => window.location.href = 'login.php');
        }
    </script>
    <footer style="
    margin-top:40px;
    background:#0f172a;
    color:#ffffff;
    text-align:center;
    padding:40px 25px;
    position: relative;
    z-index: 20;
    font-size:1rem;
">
    <h3 style="font-size:1.5rem;margin-bottom:15px;">A MULTI-LAYER AI-BASED PHISHING DETECTION SYSTEM</h3>

    <p style="font-size:1rem;line-height:1.8;margin-bottom:15px;">
        Detecting phishing threats across Email, SMS, and URLs using
        Artificial Intelligence and Multi-Layer Security Analysis.
    </p>

    <p style="margin-top:15px;font-size:0.95rem;">
        © <?php echo date('Y'); ?>
        Institute of Accountancy Arusha (IAA) |
        Final Year Project
    </p>

    <p style="margin-top:15px;font-size:1rem;">
        Developed by <strong>SAMSON GEORGE SANGA</strong>
    </p>
</footer>
</body>

</html>