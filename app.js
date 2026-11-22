/**
 * ANSHURAJ SAH - PORTFOLIO INTERACTION ENGINE
 * melon.studio signature aesthetic: Dark inky black, vibrant melon red, liquid pink, experimental motion
 */

// 1. Web Audio Synthesizer (Zero-latency micro-SFX)
class SoundFx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported", e);
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      if (this.enabled) {
        soundToggle.classList.remove('audio-paused');
        document.getElementById('sound-status').innerText = 'SFX: ON';
        this.playPop(520, 0.04);
      } else {
        soundToggle.classList.add('audio-paused');
        document.getElementById('sound-status').innerText = 'SFX: OFF';
      }
    }
    return this.enabled;
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playPop(freq = 440, duration = 0.03) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playRiser() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

const sfx = new SoundFx();

// 2. Custom Cursor with Smooth Lerp
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = -100, mouseY = -100;
let ringX = -100, ringY = -100;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

function setupHoverSounds() {
  const interactives = document.querySelectorAll('a, button, input, select, .melon-card, .interactive-tag');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      sfx.playClick();
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
    el.addEventListener('click', () => {
      sfx.playPop(620, 0.05);
    });
  });
}

// 3. Live New Delhi Time (IST) Clock
function updateClock() {
  const clockEl = document.getElementById('ist-clock');
  if (!clockEl) return;
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
  clockEl.textContent = `${timeString} IST`;
}
setInterval(updateClock, 1000);
updateClock();

// 4. Profile Photo Management (Persistent LocalStorage + File Picker + Angle Switcher)
function setupPhotoUploader() {
  const fileInput = document.getElementById('photo-upload-input');
  const triggerBtn = document.getElementById('change-photo-btn');
  const profileImg = document.getElementById('profile-photo-img');
  const angleButtons = document.querySelectorAll('.hero-photo-switch');

  // Angle switcher buttons
  angleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      angleButtons.forEach(b => {
        b.classList.remove('active-hero-photo', 'bg-[#ff3b3b]', 'text-white');
        b.classList.add('bg-[#1c0808]', 'text-zinc-400');
      });
      btn.classList.add('active-hero-photo', 'bg-[#ff3b3b]', 'text-white');
      btn.classList.remove('bg-[#1c0808]', 'text-zinc-400');
      
      const targetSrc = btn.getAttribute('data-src');
      if (profileImg && targetSrc) {
        profileImg.style.opacity = '0';
        setTimeout(() => {
          profileImg.src = targetSrc;
          profileImg.style.opacity = '1';
        }, 150);
        sfx.playPop(520, 0.04);
      }
    });
  });

  // Load from localStorage if present
  try {
    const saved = localStorage.getItem('anshuraj_profile_photo');
    if (saved && profileImg) {
      profileImg.src = saved;
    }
  } catch (e) {
    console.warn("LocalStorage access error", e);
  }

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => {
      fileInput.click();
      sfx.playPop(480, 0.03);
    });
  }

  if (fileInput && profileImg) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          profileImg.src = dataUrl;
          try {
            localStorage.setItem('anshuraj_profile_photo', dataUrl);
          } catch (err) {
            console.warn("Could not save to localStorage", err);
          }
          sfx.playRiser();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// 5. Interactive Reel Simulator
const reelSubtitles = [
  { text: "STOP SCROLLING. HERE IS WHY 99% FAIL.", time: 0, tag: "HOOK INTERRUPT" },
  { text: "THEY FOCUS ON PRODUCTION. NOT RETENTION.", time: 2, tag: "PATTERN BREAK" },
  { text: "EVERY 1.2 SECONDS: MOTION, CALLOUT, SFX.", time: 4, tag: "VISUAL PACING" },
  { text: "AI COMPOUNDS RESEARCH 10X FASTER.", time: 6, tag: "TECH LEVERAGE" },
  { text: "THAT'S HOW YOU DOMINATE THE ALGORITHM.", time: 8, tag: "CALL TO ACTION" }
];

let reelPlaying = false;
let reelProgress = 0;
let reelInterval = null;

function toggleReelPlayer() {
  reelPlaying = !reelPlaying;
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const reelStatus = document.getElementById('reel-status-indicator');

  if (reelPlaying) {
    sfx.playRiser();
    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
    if (reelStatus) {
      reelStatus.innerText = 'PLAYING SIMULATION';
      reelStatus.classList.remove('text-zinc-500');
      reelStatus.classList.add('text-[#ff3b3b]');
    }

    reelInterval = setInterval(() => {
      reelProgress += 0.5;
      if (reelProgress > 10) reelProgress = 0;
      updateReelDisplay();
    }, 500);
  } else {
    clearInterval(reelInterval);
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    if (reelStatus) {
      reelStatus.innerText = 'PAUSED';
      reelStatus.classList.add('text-zinc-500');
      reelStatus.classList.remove('text-[#ff3b3b]');
    }
  }
}

function updateReelDisplay() {
  const progressBar = document.getElementById('reel-progress-bar');
  const subText = document.getElementById('reel-subtitle-text');
  const phaseTag = document.getElementById('reel-phase-tag');
  const waveBars = document.querySelectorAll('.waveform-dynamic');

  if (progressBar) {
    progressBar.style.width = `${(reelProgress / 10) * 100}%`;
  }

  // Find active subtitle
  const activeSub = reelSubtitles.slice().reverse().find(s => reelProgress >= s.time) || reelSubtitles[0];
  if (subText && subText.innerText !== activeSub.text) {
    subText.innerText = activeSub.text;
    subText.style.animation = 'none';
    void subText.offsetWidth; // trigger reflow
    subText.style.animation = 'pop-in 0.25s ease-out forwards';
    sfx.playPop(500 + Math.random() * 200, 0.03);
  }

  if (phaseTag) {
    phaseTag.innerText = activeSub.tag;
  }

  // Waveform heights
  waveBars.forEach((bar) => {
    const height = Math.floor(Math.random() * 28) + 6;
    bar.style.height = `${height}px`;
  });
}

function setupReelLayers() {
  const layerButtons = document.querySelectorAll('.reel-layer-btn');
  layerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLayer = btn.getAttribute('data-layer');
      const layerElement = document.getElementById(targetLayer);
      if (layerElement) {
        layerElement.classList.toggle('opacity-0');
        btn.classList.toggle('bg-[#ff3b3b]/20');
        btn.classList.toggle('text-[#ff3b3b]');
        btn.classList.toggle('border-[#ff3b3b]/50');
        sfx.playPop(480, 0.03);
      }
    });
  });
}

// 6. Interactive Viral Hook Lab
const hookLibrary = {
  geopolitics: {
    interrupt: {
      script: "\"You think this conflict is about land. It's actually about a submarine cable 8,000 miles away.\"",
      visual: "Fast zoom into ocean cross-section + kinetic map telemetry callouts",
      sfx: "Sub-bass 808 drop + glitch static hit",
      retention: "94% target (3s safeguard)"
    },
    contrarian: {
      script: "\"Everyone is celebrating this treaty. But in 6 months, it will collapse their entire energy grid.\"",
      visual: "Split screen: News anchor cheering vs red alarm satellite heat-map",
      sfx: "Rising vinyl scratch into reverse cymbal",
      retention: "91% target (High comment debate)"
    },
    highstakes: {
      script: "\"In 72 hours, 40% of the world's shipping lanes could shut down. Here is the unreleased memo.\"",
      visual: "Redacted document highlight overlay with pulsing geo-coordinates",
      sfx: "Typewriter clack into sudden dead silence",
      retention: "96% target (Urgency trigger)"
    },
    datashock: {
      script: "\"India just exported $18 Billion in technology you've never heard of. And China can't copy it.\"",
      visual: "Counter tick-up from $0 to $18B in 1.1 seconds with kinetic gold typography",
      sfx: "Rapid mechanical cash register tick-up",
      retention: "89% target (National curiosity)"
    }
  },
  finance: {
    interrupt: {
      script: "\"The bank didn't lose your money. They literally gambled it on Japanese Yen arbitrage.\"",
      visual: "ATM screen error animation glitching into Bloomberg terminal graph",
      sfx: "ATM dispense noise into error buzzer",
      retention: "93% target"
    },
    contrarian: {
      script: "\"Buying a house in your 20s is mathematically the worst financial decision in 2026.\"",
      visual: "Compound interest visual scale tilting violently with red warning arrows",
      sfx: "Heavy thud riser into snap",
      retention: "95% target (Viral rage/debate hook)"
    },
    highstakes: {
      script: "\"If your bank holds less than $100B in assets, your savings might not be insured by Monday.\"",
      visual: "List of collapsing bank logos crossing out sequentially in 0.9s",
      sfx: "Emergency broadcast drone tone",
      retention: "97% target (Fear of loss)"
    },
    datashock: {
      script: "\"One 24-year-old made $4.2M using 3 free AI tools and zero employees. Here's the raw receipt.\"",
      visual: "Stripe dashboard verified invoice scroll with blurred client names",
      sfx: "Crisp phone notification chime",
      retention: "92% target"
    }
  },
  popculture: {
    interrupt: {
      script: "\"MrBeast deleted this video after 4 minutes because it exposed his entire retention algorithm.\"",
      visual: "YouTube Studio dark mode analytics screen with secret retention spike circled",
      sfx: "Censored beep into fast camera shutter clicks",
      retention: "98% target"
    },
    contrarian: {
      script: "\"GTA 6 isn't delayed because of bugs. Rockstar is waiting for this one AI hardware chip.\"",
      visual: "Side-by-side gameplay fidelity comparison with real-world Miami footage",
      sfx: "Iconic GTA mission passed brass hit",
      retention: "94% target"
    },
    highstakes: {
      script: "\"Twitch just banned their biggest streamer permanently, and Discord is next.\"",
      visual: "Banned channel screen with live chat scrolling at 200 messages/sec",
      sfx: "Heavy glitch sound effect",
      retention: "92% target"
    },
    datashock: {
      script: "\"This anime took 9 years to animate. AI remade the hardest scene in 42 seconds.\"",
      visual: "Frame-by-frame onion skin slider showing hand-drawn vs neural render",
      sfx: "Anime sword clash into futuristic synth pad",
      retention: "90% target"
    }
  },
  creatoreconomy: {
    interrupt: {
      script: "\"Stop editing in 4K. YouTube's algorithm literally penalizes files over 2GB for this reason.\"",
      visual: "Upload compression diagram with bitrate graph dropping sharply",
      sfx: "Tape stop sound effect",
      retention: "96% target"
    },
    contrarian: {
      script: "\"The first 3 seconds of your Reel don't matter anymore. The 4th second is where you lose them.\"",
      visual: "Retention curve graph dropping from 100% to 32% at exactly 00:03.9",
      sfx: "Heartbeat flatline pulse",
      retention: "94% target"
    },
    highstakes: {
      script: "\"If you post without this one caption setting, Instagram marks your account as bot farm.\"",
      visual: "Screen recording of Instagram advance settings toggle glowing in neon red",
      sfx: "Phone UI tap click",
      retention: "95% target"
    },
    datashock: {
      script: "\"82% of viral Shorts use this exact font and spacing formula. Let's inspect the CSS.\"",
      visual: "Kinetic typography overlay showing exact pixel kerning and drop shadow values",
      sfx: "Computer keyboard typing burst",
      retention: "91% target"
    }
  }
};

let currentCategory = 'geopolitics';
let currentAngle = 'interrupt';

function setupHookLab() {
  const catButtons = document.querySelectorAll('.hook-cat-btn');
  const angleButtons = document.querySelectorAll('.hook-angle-btn');

  function renderHook() {
    const data = hookLibrary[currentCategory][currentAngle];
    const scriptEl = document.getElementById('hook-script-display');
    const visualEl = document.getElementById('hook-visual-display');
    const sfxEl = document.getElementById('hook-sfx-display');
    const retEl = document.getElementById('hook-retention-display');

    if (scriptEl) scriptEl.innerText = data.script;
    if (visualEl) visualEl.innerText = data.visual;
    if (sfxEl) sfxEl.innerText = data.sfx;
    if (retEl) retEl.innerText = data.retention;
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active-cat', 'bg-[#ff3b3b]', 'text-white'));
      catButtons.forEach(b => b.classList.add('bg-[#140606]', 'text-zinc-400'));
      btn.classList.add('active-cat', 'bg-[#ff3b3b]', 'text-white');
      btn.classList.remove('bg-[#140606]', 'text-zinc-400');
      currentCategory = btn.getAttribute('data-cat');
      renderHook();
      sfx.playPop(550, 0.04);
    });
  });

  angleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      angleButtons.forEach(b => b.classList.remove('active-angle', 'border-[#ff3b3b]', 'text-[#ff3b3b]', 'bg-[#ff3b3b]/10'));
      btn.classList.add('active-angle', 'border-[#ff3b3b]', 'text-[#ff3b3b]', 'bg-[#ff3b3b]/10');
      currentAngle = btn.getAttribute('data-angle');
      renderHook();
      sfx.playPop(650, 0.04);
    });
  });

  renderHook();
}

// 7. melon.studio-style Live Project Brief Generator
const briefState = {
  role: 'Creative Intern / Content Strategist',
  platform: ['YouTube', 'Instagram Reels'],
  services: ['Viral Hook Ideation', 'Kinetic Motion & Typography', 'AI-Assisted Research'],
  turnaround: 'Rapid (24h - 48h)'
};

function setupBriefGenerator() {
  const roleSelect = document.getElementById('brief-role-select');
  const turnaroundSelect = document.getElementById('brief-turnaround-select');
  const serviceChecks = document.querySelectorAll('.brief-service-check');
  const platformChecks = document.querySelectorAll('.brief-platform-check');
  const briefOutput = document.getElementById('brief-preview-code');

  function generateBriefMarkdown() {
    return `// ==========================================
// INQUIRY & CREATIVE PRODUCTION BRIEF
// TARGET: Anshuraj Sah (anshurajkumarsah@gmail.com)
// DATE: ${new Date().toLocaleDateString('en-GB')}
// ==========================================

1. INQUIRY TYPE:
   • ${briefState.role}

2. TARGET PLATFORMS:
   • ${briefState.platform.join(' • ') || 'None specified'}

3. REQUIRED CAPABILITIES:
   • ${briefState.services.join('\n   • ') || 'Custom assistance'}

4. EXPECTED PACING & TIMELINE:
   • ${briefState.turnaround}

5. ESTIMATED IMPACT:
   • Focus on high 3s retention, viral hooks, and AI-native research workflows.
// ==========================================`;
  }

  function updateBrief() {
    if (briefOutput) {
      briefOutput.textContent = generateBriefMarkdown();
    }
  }

  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      briefState.role = e.target.value;
      updateBrief();
      sfx.playClick();
    });
  }

  if (turnaroundSelect) {
    turnaroundSelect.addEventListener('change', (e) => {
      briefState.turnaround = e.target.value;
      updateBrief();
      sfx.playClick();
    });
  }

  serviceChecks.forEach(box => {
    box.addEventListener('change', () => {
      const active = Array.from(serviceChecks).filter(c => c.checked).map(c => c.value);
      briefState.services = active;
      updateBrief();
      sfx.playPop(480, 0.03);
    });
  });

  platformChecks.forEach(box => {
    box.addEventListener('change', () => {
      const active = Array.from(platformChecks).filter(c => c.checked).map(c => c.value);
      briefState.platform = active;
      updateBrief();
      sfx.playPop(520, 0.03);
    });
  });

  const copyBriefBtn = document.getElementById('copy-brief-btn');
  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(generateBriefMarkdown()).then(() => {
        const orig = copyBriefBtn.innerHTML;
        copyBriefBtn.innerHTML = `<span>COPIED BRIEF TO CLIPBOARD!</span>`;
        copyBriefBtn.classList.add('bg-[#ff3b3b]', 'text-white');
        sfx.playRiser();
        setTimeout(() => {
          copyBriefBtn.innerHTML = orig;
          copyBriefBtn.classList.remove('bg-[#ff3b3b]', 'text-white');
        }, 2200);
      });
    });
  }

  const sendEmailBtn = document.getElementById('send-email-btn');
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
      const subject = encodeURIComponent(`Project Brief / Creative Role: ${briefState.role}`);
      const body = encodeURIComponent(generateBriefMarkdown());
      window.location.href = `mailto:anshurajkumarsah@gmail.com?subject=${subject}&body=${body}`;
      sfx.playRiser();
    });
  }

  updateBrief();
}

// 8. Interactive Background Canvas (Melon Ember Particles)
function initCanvasBackground() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(width > 768 ? 65 : 30, 80);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 59, 59, ${0.08 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 179, 179, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  setupHoverSounds();
  setupPhotoUploader();
  setupReelLayers();
  setupHookLab();
  setupBriefGenerator();
  initCanvasBackground();

  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      sfx.toggle();
    });
  }

  const playReelBtn = document.getElementById('reel-play-btn');
  if (playReelBtn) {
    playReelBtn.addEventListener('click', toggleReelPlayer);
  }

  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('anshurajkumarsah@gmail.com').then(() => {
        const toast = document.getElementById('copy-toast');
        if (toast) {
          toast.classList.remove('opacity-0', 'translate-y-2');
          sfx.playRiser();
          setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
          }, 2000);
        }
      });
    });
  }
});
