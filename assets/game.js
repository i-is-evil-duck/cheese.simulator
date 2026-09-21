(() => {
  "use strict";

  const CHEESE_IMG = "2.png";
  const CURSED_IMG = "1.png";
  const SOUND_FILES = ["sound1.mp3", "sound2.mp3", "sound3.mp3", "sound4.mp3", "sound5.mp3"];
  const MAX_NODES = 40;
  const COMBO_WINDOW_MS = 2500;

  const follower = document.getElementById("follow");
  const hudScore = document.getElementById("score-val");
  const hudCombo = document.getElementById("combo-val");
  const hudLevel = document.getElementById("level-val");
  const hudBest = document.getElementById("best-val");
  const comboPill = document.getElementById("combo-pill");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const muteBtn = document.getElementById("mute-btn");
  const resetBtn = document.getElementById("reset-btn");

  const state = {
    running: false,
    score: 0,
    combo: 0,
    comboCount: 0,
    lastEatAt: 0,
    eaten: 0,
    level: 1,
    best: parseInt(localStorage.getItem("cheese_best") || "0", 10) || 0,
    muted: false,
    spawnTimer: null,
  };

  // Preload sounds so rapid clicks overlap instead of cutting off.
  const soundPool = SOUND_FILES.map((f) => {
    const a = new Audio(f);
    a.preload = "auto";
    return a;
  });

  function playSound() {
    if (state.muted) return;
    try {
      const src = soundPool[Math.floor(Math.random() * soundPool.length)];
      const clone = src.cloneNode();
      clone.volume = 0.7;
      clone.play().catch(() => {});
    } catch (_) { /* audio not ready */ }
  }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem("cheese_best", String(state.best));
    }
  }

  function renderHud() {
    hudScore.textContent = state.score;
    hudCombo.textContent = state.combo > 1 ? `x${state.combo}` : "—";
    hudLevel.textContent = state.level;
    hudBest.textContent = state.best;
    comboPill.classList.toggle("hot", state.combo >= 3);
  }

  function spawnIntervalMs() {
    return Math.max(150, 650 - state.level * 45);
  }

  function despawnMs() {
    return Math.max(1800, 4200 - state.level * 200);
  }

  function randomPos(size) {
    const w = Math.max(60, window.innerWidth - size - 20);
    const h = Math.max(120, window.innerHeight - size - 20);
    return {
      x: 20 + Math.floor(Math.random() * (w - 20)),
      y: 70 + Math.floor(Math.random() * (h - 70)),
    };
  }

  function rollType() {
    const r = Math.random();
    if (r < 0.10) return "golden"; // +5
    if (r < 0.18) return "cursed"; // face: -2, breaks combo
    return "normal";
  }

  function floatText(x, y, text, color) {
    const el = document.createElement("div");
    el.className = "float-score";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    if (color) el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  function eat(cheeseEl, type, x, y) {
    const now = Date.now();
    if (now - state.lastEatAt < COMBO_WINDOW_MS) {
      state.comboCount += 1;
    } else {
      state.comboCount = 1;
    }
    state.lastEatAt = now;
    state.combo = state.comboCount;

    let gained = 0;
    if (type === "golden") {
      gained = 5 * Math.max(1, state.combo);
      floatText(x, y, `+${gained} GOLD!`, "#b8860b");
    } else if (type === "cursed") {
      gained = -2;
      state.combo = 0;
      state.comboCount = 0;
      floatText(x, y, "-2 CURSED!", "#c0392b");
    } else {
      const mult = state.combo >= 5 ? 3 : state.combo >= 3 ? 2 : 1;
      gained = 1 * mult;
      floatText(x, y, mult > 1 ? `+${gained} COMBO!` : "+1", mult > 1 ? "#e67e22" : "#27ae60");
    }

    state.score = Math.max(0, state.score + gained);
    state.eaten += 1;
    state.level = Math.floor(state.eaten / 10) + 1;
    saveBest();
    renderHud();
    playSound();
  }

  function spawnCheese() {
    if (!state.running) return;

    // Cap live nodes so the DOM never bloats.
    const live = document.querySelectorAll(".cheese").length;
    if (live < MAX_NODES) {
      const type = rollType();
      const size = type === "golden" ? 84 : 56 + Math.floor(Math.random() * 44);
      const pos = randomPos(size);

      const el = document.createElement("div");
      el.className = `cheese ${type}`;
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;

      const img = document.createElement("img");
      img.src = type === "cursed" ? CURSED_IMG : CHEESE_IMG;
      img.alt = type === "cursed" ? "cursed" : "cheese";
      img.draggable = false;
      el.appendChild(img);

      const onEat = (ev) => {
        ev.stopPropagation();
        const cx = parseInt(el.style.left, 10);
        const cy = parseInt(el.style.top, 10);
        el.classList.add("eaten");
        const t = type;
        setTimeout(() => el.remove(), 150);
        eat(el, t, cx, cy);
      };
      el.addEventListener("click", onEat);
      el.addEventListener("touchstart", onEat, { passive: true });

      document.body.appendChild(el);
      setTimeout(() => {
        if (el.isConnected) {
          el.classList.add("despawn");
          setTimeout(() => el.remove(), 350);
        }
      }, despawnMs());
    }

    state.spawnTimer = setTimeout(spawnCheese, spawnIntervalMs() + Math.random() * 400);
  }

  function moveFollower(clientX, clientY) {
    const size = window.innerWidth < 600 ? 64 : 100;
    follower.style.left = `${clientX - size / 2 + window.scrollX}px`;
    follower.style.top = `${clientY - size / 2 + window.scrollY}px`;
  }

  function start() {
    if (state.running) return;
    state.running = true;
    overlay.classList.add("hidden");
    pauseBtn.textContent = "Pause";
    spawnCheese();
  }

  function pause() {
    if (!state.running) return;
    state.running = false;
    clearTimeout(state.spawnTimer);
    overlayTitle.textContent = "Paused";
    overlayText.innerHTML = `Score <b>${state.score}</b> · Level <b>${state.level}</b> · Best <b>${state.best}</b><br>Press <kbd>P</kbd> or Start to resume.`;
    startBtn.textContent = "Resume";
    overlay.classList.remove("hidden");
    pauseBtn.textContent = "Resume";
  }

  function reset() {
    saveBest();
    state.score = 0;
    state.combo = 0;
    state.comboCount = 0;
    state.eaten = 0;
    state.level = 1;
    document.querySelectorAll(".cheese,.float-score").forEach((el) => el.remove());
    renderHud();
  }

  document.addEventListener("mousemove", (e) => moveFollower(e.pageX, e.pageY));
  document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) moveFollower(t.pageX, t.pageY);
  }, { passive: true });

  startBtn.addEventListener("click", () => {
    document.documentElement.classList.remove("ui-cursor");
    if (state.running) return;
    if (startBtn.textContent === "Resume") {
      state.running = true;
      overlay.classList.add("hidden");
      pauseBtn.textContent = "Pause";
      spawnCheese();
    } else {
      start();
    }
  });
  pauseBtn.addEventListener("click", () => (state.running ? pause() : start()));
  resetBtn.addEventListener("click", () => { reset(); });
  muteBtn.addEventListener("click", () => {
    state.muted = !state.muted;
    muteBtn.textContent = state.muted ? "Unmute" : "Mute";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") state.running ? pause() : start();
    if (e.key === "m" || e.key === "M") muteBtn.click();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });

  // Show cursor over UI chrome so buttons are clickable.
  document.querySelectorAll("#controls button, #overlay .card").forEach((el) => {
    el.addEventListener("mouseenter", () => document.documentElement.classList.add("ui-cursor"));
    el.addEventListener("mouseleave", () => document.documentElement.classList.remove("ui-cursor"));
  });

  renderHud();
})();
