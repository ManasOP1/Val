/**
 * Romantic Valentine Web App
 * Core interactions: YES celebration, NO evasion, floating hearts
 */

(function () {
  'use strict';

  // ============ DOM Elements ============
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const noTooltip = document.getElementById('noTooltip');
  const mainCard = document.getElementById('mainCard');
  const successOverlay = document.getElementById('successOverlay');
  const heartsBurst = document.getElementById('heartsBurst');
  const nameReveal = document.getElementById('nameReveal');
  const heartsContainer = document.querySelector('.hearts-container');
  const catReaction = document.getElementById('catReaction');
  const catNoGuard = document.getElementById('catNoGuard');
  const sparklesContainer = document.getElementById('sparklesContainer');
  const subtitleEl = document.getElementById('subtitle');

  // ============ Configuration ============
  const NO_BUTTON_PADDING = 20;
  const TOOLTIP_MESSAGES = [
    'Are you sure? 🥺',
    'Think again 💕',
    'Wrong choice 😏',
    'Nope, try again! 😋',
    'Really?? 💗',
    'Say yes instead! ✨',
    'Don\'t do it! 🙈',
    'One more chance? 😇',
    'I believe in you 💕',
    'YES is the way! 🌸'
  ];

  // ============ State ============
  let noEscapeCount = 0;
  let successTriggered = false;

  // ============ Floating Hearts Background ============
  function createFloatingHearts() {
    const heartSymbols = ['💕', '💗', '🌸'];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 8}s`;
      heart.style.animationDuration = `${6 + Math.random() * 4}s`;
      heartsContainer.appendChild(heart);
    }
  }

  createFloatingHearts();

  // ============ Cursor Sparkles (desktop only - mouse trail) ============
  const SPARKLE_SYMBOLS = ['✨', '💕', '⭐', '🌸', '💗', '✧'];
  let lastSparkle = 0;
  if (!('ontouchstart' in window)) {
    document.addEventListener('mousemove', (e) => {
      if (Date.now() - lastSparkle < 100) return;
      lastSparkle = Date.now();
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = SPARKLE_SYMBOLS[Math.floor(Math.random() * SPARKLE_SYMBOLS.length)];
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      if (sparklesContainer) {
        sparklesContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1300);
      }
    });
  }

  // ============ Rotating Cute Subtitles ============
  const SUBTITLES = [
    'Choose wisely...',
    'Pick the right one! 💕',
    'I\'m waiting...',
    'What\'ll it be? ✨',
    'Take your time...',
    'Pretty please? 🥺'
  ];
  let subtitleIdx = 0;
  if (subtitleEl) {
    setInterval(() => {
      subtitleIdx = (subtitleIdx + 1) % SUBTITLES.length;
      subtitleEl.style.opacity = '0';
      setTimeout(() => {
        subtitleEl.textContent = SUBTITLES[subtitleIdx];
        subtitleEl.style.opacity = '0.85';
      }, 300);
    }, 4000);
  }

  // ============ Cat Interactions ============
  const CAT_REACTIONS = {
    'no-attempt': ['Nope! 😼', 'Wrong button! 🐱', 'Nice try! 😺', 'Nuh-uh! 😸', 'Missed me! 😻'],
    'cat-click': ['*purr* 😻', 'Meow! 😺', '❤️', '*nuzzles* 😸', 'Good choice! 😼']
  };

  function showCatReaction(type) {
    if (!catReaction) return;
    const msgs = CAT_REACTIONS[type] || CAT_REACTIONS['no-attempt'];
    catReaction.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    catReaction.classList.remove('show');
    void catReaction.offsetWidth; // reflow
    catReaction.classList.add('show');
    setTimeout(() => catReaction.classList.remove('show'), 1200);
  }

  document.querySelectorAll('.cat-corner').forEach(cat => {
    cat.addEventListener('click', () => {
      cat.classList.add('cat-bounce');
      showCatReaction('cat-click');
      setTimeout(() => cat.classList.remove('cat-bounce'), 600);
    });
  });

  if (catNoGuard) {
    catNoGuard.addEventListener('click', () => {
      catNoGuard.classList.add('cat-wiggle');
      showCatReaction('cat-click');
      setTimeout(() => catNoGuard.classList.remove('cat-wiggle'), 500);
    });
  }

  // ============ NO Button Evasion Logic (within card only) ============
  function getRandomPosition() {
    const btnRect = noBtn.getBoundingClientRect();
    const btnWidth = btnRect.width;
    const btnHeight = btnRect.height;
    const cardRect = mainCard.getBoundingClientRect();

    // Keep button inside the white card bounds
    const minX = cardRect.left + NO_BUTTON_PADDING;
    const maxX = cardRect.right - btnWidth - NO_BUTTON_PADDING;
    const minY = cardRect.top + NO_BUTTON_PADDING;
    const maxY = cardRect.bottom - btnHeight - NO_BUTTON_PADDING;

    const x = minX + Math.random() * Math.max(0, maxX - minX);
    const y = minY + Math.random() * Math.max(0, maxY - minY);

    return { x, y };
  }

  function moveNoButtonTo(x, y) {
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.transform = 'none';
    noBtn.classList.add('floating');
  }

  function updateNoTooltip() {
    const idx = noEscapeCount % TOOLTIP_MESSAGES.length;
    noTooltip.textContent = TOOLTIP_MESSAGES[idx];
    noBtn.classList.add('tooltip-visible');
  }

  function growYesButton() {
    noEscapeCount++;
    const scale = 1 + Math.min(noEscapeCount * 0.05, 0.4);
    yesBtn.style.transform = `scale(${scale})`;
    updateNoTooltip();
  }

  let isEvading = false;

  function handleNoButtonEvasion() {
    if (successTriggered || isEvading) return;

    isEvading = true;
    showCatReaction('no-attempt');
    growYesButton();

    // Move the button 3 times in quick succession (playful dodge - no clicking NO allowed!)
    const pos1 = getRandomPosition();
    const pos2 = getRandomPosition();
    const pos3 = getRandomPosition();

    moveNoButtonTo(pos1.x, pos1.y);

    setTimeout(() => moveNoButtonTo(pos2.x, pos2.y), 350);
    setTimeout(() => {
      moveNoButtonTo(pos3.x, pos3.y);
      setTimeout(() => { isEvading = false; }, 300);
    }, 700);
  }

  // Evasion ONLY on click/tap - no hover or proximity. User can reach & click NO first!
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleNoButtonEvasion();
  });

  noBtn.addEventListener('mouseenter', () => {
    noBtn.classList.add('tooltip-visible');
    updateNoTooltip();
  });
  noBtn.addEventListener('mouseleave', () => noBtn.classList.remove('tooltip-visible'));

  // Touch evasion for mobile (only on tap)
  noBtn.addEventListener('touchstart', (e) => {
    if (successTriggered) return;
    e.preventDefault();
    handleNoButtonEvasion();
  });

  // ============ Sparkle burst - birthday bash style (YES celebration) ============
  function spawnHeartsBurst() {
    const burstSymbols = ['✨', '💕', '⭐'];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const heart = document.createElement('span');
      heart.className = 'burst-heart';
      heart.textContent = burstSymbols[Math.floor(Math.random() * burstSymbols.length)];
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.setProperty('--burst-x', `${dx}px`);
      heart.style.setProperty('--burst-y', `${dy}px`);
      heart.style.animationDelay = `${Math.random() * 0.3}s`;

      if (heartsBurst) {
        heartsBurst.appendChild(heart);
        setTimeout(() => heart.remove(), 1400);
      }
    }
  }

  // ============ YES Button Celebration ============
  function triggerCelebration() {
    if (successTriggered) return;
    successTriggered = true;

    mainCard.classList.add('celebrate');
    successOverlay.classList.add('visible');
    yesBtn.style.display = 'none';
    noBtn.style.display = 'none';

    spawnHeartsBurst();

    if (nameReveal) {
      setTimeout(() => nameReveal.classList.add('show'), 700);
    }
  }

  yesBtn.addEventListener('click', triggerCelebration);

  // ============ Reset NO button position on resize ============
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!successTriggered && noBtn.style.position === 'fixed') {
        const pos = getRandomPosition();
        moveNoButtonTo(pos.x, pos.y);
      }
    }, 100);
  });

})();
