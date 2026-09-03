// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('inputType').value = btn.dataset.type;
        
        const placeholder = {
            'email': 'Paste the full email content here (subject and body)...',
            'sms': 'Paste the SMS message here...',
            'url': 'Enter a URL to analyze (e.g., https://example.com)...'
        };
        document.getElementById('inputText').placeholder = placeholder[btn.dataset.type];
    });
});

// Analysis form
document.getElementById('analyzeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('inputType').value;
    const content = document.getElementById('inputText').value.trim();
    const btn = document.getElementById('analyzeBtn');
    const spinner = btn.querySelector('.spinner');
    const resultCard = document.getElementById('resultCard');
    
    if (!content) {
        alert('Please enter content to analyze.');
        return;
    }
    
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    resultCard.style.display = 'none';
    
    try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('content', content);
        
        const response = await fetch('api/analyze.php', { method: 'POST', body: formData });
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        displayResult(data);
        
    } catch (err) {
        alert('Analysis failed: ' + err.message);
    } finally {
        btn.disabled = false;
        spinner.style.display = 'none';
    }
});

function displayResult(data) {
    const card = document.getElementById('resultCard');
    card.className = `result-card ${data.classification}`;
    card.style.display = 'block';
    
    document.getElementById('riskBadge').className = `risk-badge ${data.risk_level.toLowerCase().replace(' ', '-')}`;
    document.getElementById('riskBadge').textContent = data.risk_level;
    
    const scoreDisplay = document.getElementById('finalScore');
    scoreDisplay.textContent = `${(data.final_score * 100).toFixed(1)}%`;
    scoreDisplay.className = `score-display ${data.classification}`;
    
    document.getElementById('classificationText').textContent = 
        data.classification === 'phishing' ? '⚠️ PHISHING DETECTED' : '✅ LEGITIMATE';
    
    const explList = document.getElementById('explanations');
    explList.innerHTML = (data.explanations && data.explanations.length > 0)
        ? data.explanations.map(e => `<li>${e}</li>`).join('')
        : '<li>No specific indicators found.</li>';
    
    document.getElementById('textScoreBar').style.width = `${(data.text_score * 100)}%`;
    document.getElementById('textScoreVal').textContent = `${(data.text_score * 100).toFixed(1)}%`;
    
    document.getElementById('urlScoreBar').style.width = `${(data.url_score * 100)}%`;
    document.getElementById('urlScoreVal').textContent = `${(data.url_score * 100).toFixed(1)}%`;
    
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
(function() {
  const canvas = document.getElementById('bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const COLORS = [
    'rgba(0,229,255,',   // cyan
    'rgba(0,176,204,',   // darker cyan
    'rgba(123,94,167,',  // purple
    'rgba(255,255,255,'  // white
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: col,
      ph: Math.random() * Math.PI * 2,
      ps: 0.02 + Math.random() * 0.02
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130) {
          const op = (1 - dist / 130) * 0.17;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${op})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Particles with glow
    particles.forEach(p => {
      p.ph += p.ps;
      const a = p.alpha * (0.75 + 0.25 * Math.sin(p.ph));

      ctx.save();
      ctx.globalAlpha = a;

      if (p.r > 1.4) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + '1)';
      }

      ctx.fillStyle = p.color + a + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (a * 0.08) + ')';
      ctx.fill();

      ctx.restore();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
  }

  // Mouse repulsion
  let mx = -999, my = -999;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  setInterval(() => {
    particles.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 80 && dist > 0) {
        p.vx += (dx / dist) * 0.3;
        p.vy += (dy / dist) * 0.3;
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (speed > 2) { p.vx = (p.vx/speed)*2; p.vy = (p.vy/speed)*2; }
      }
    });
  }, 30);

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
  loop();
})();
