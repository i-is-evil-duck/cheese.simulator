(() => {
  "use strict";

  const CHEESE_IMG = "2.png";
  const CURSED_IMG = "1.png";
  const SOUND_FILES = ["sound1.mp3", "sound2.mp3", "sound3.mp3", "sound4.mp3", "sound5.mp3"];
  const MAX_NODES = 40;
  const COMBO_WINDOW_MS = 2500;

  const follower = document.getElementById("follow");
  const counter = document.getElementById("counter");
  const bestEl = document.getElementById("best");
  const pauseBtn = document.getElementById("pause-btn");

  const state = {
    running: true,
    score: 0,
    comboCount: 0,
    lastEatAt: 0,
    eaten: 0,
    level: 1,
    best: parseInt(localStorage.getItem("cheese_best") || "0", 10) || 0,
    spawnTimer: null,
  };

  const soundPool = SOUND_FILES.map((f) => {
    const a = new Audio(f);
    a.preload = "auto";
    return a;
  });

  function playSound() {
    try {
      const src = soundPool[Math.floor(Math.random() * soundPool.length)];
      const clone = src.cloneNode();
      clone.volume = 0.7;
      clone.play().catch(() => {});
    } catch (_) {}
  }

  function renderHud() {
    counter.textContent = "Counter: " + state.score;
    bestEl.textContent = "Best: " + state.best;
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
    return Math.random() < 0.1 ? "cursed" : "normal";
  }

  function floatText(x, y, text, font, color) {
    const el = document.createElement("div");
    el.className = "float-score";
    el.textContent = text;
    el.style.left = x + "px";
    el.style.top = y + "px";
    if (font) el.style.fontFamily = font;
    if (color) el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  function eat(type, x, y) {
    const now = Date.now();
    if (now - state.lastEatAt < COMBO_WINDOW_MS) {
      state.comboCount += 1;
    } else {
      state.comboCount = 1;
    }
    state.lastEatAt = now;

    let gained = 0;
    if (type === "cursed") {
      gained = 5;
      floatText(x, y, "+5");
    } else {
      const mult = state.comboCount >= 5 ? 3 : state.comboCount >= 3 ? 2 : 1;
      gained = 1 * mult;
      if (mult === 3) {
        floatText(x, y, "+3 COMBO!", '"Comic Sans MS", "Comic Sans", cursive', "#f5b301");
      } else {
        floatText(x, y, "+" + gained, mult > 1 ? '"Comic Sans MS", "Comic Sans", cursive' : null);
      }
    }

    state.score = Math.max(0, state.score + gained);
    state.eaten += 1;
    state.level = Math.floor(state.eaten / 10) + 1;
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem("cheese_best", String(state.best));
    }
    renderHud();
    playSound();
  }

  function spawnCheese() {
    if (!state.running) return;

    const live = document.querySelectorAll(".cheese").length;
    if (live < MAX_NODES) {
      const type = rollType();
      const size = 56 + Math.floor(Math.random() * 44);
      const pos = randomPos(size);

      const el = document.createElement("div");
      el.className = "cheese";
      el.style.left = pos.x + "px";
      el.style.top = pos.y + "px";
      el.style.width = size + "px";
      el.style.height = size + "px";

      const img = document.createElement("img");
      img.src = type === "cursed" ? CURSED_IMG : CHEESE_IMG;
      img.width = size;
      img.height = size;
      img.draggable = false;
      el.appendChild(img);

      const onEat = (ev) => {
        ev.stopPropagation();
        const cx = parseInt(el.style.left, 10);
        const cy = parseInt(el.style.top, 10);
        el.remove();
        eat(type, cx, cy);
      };
      el.addEventListener("click", onEat);
      el.addEventListener("touchstart", onEat, { passive: true });

      document.body.appendChild(el);
      setTimeout(() => {
        if (el.isConnected) el.remove();
      }, despawnMs());
    }

    state.spawnTimer = setTimeout(spawnCheese, spawnIntervalMs() + Math.random() * 400);
  }

  function moveFollower(clientX, clientY) {
    const size = window.innerWidth < 600 ? 60 : 90;
    follower.style.left = (clientX - size / 2 + window.scrollX) + "px";
    follower.style.top = (clientY - size / 2 + window.scrollY) + "px";
  }

  let pulseTimer = null;
  function pulseCursor() {
    follower.classList.add("pulse");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => follower.classList.remove("pulse"), 150);
  }

  function pause() {
    state.running = false;
    clearTimeout(state.spawnTimer);
    pauseBtn.textContent = "Resume";
  }

  function resume() {
    if (state.running) return;
    state.running = true;
    pauseBtn.textContent = "Pause";
    spawnCheese();
  }

  document.addEventListener("mousemove", (e) => moveFollower(e.pageX, e.pageY));
  document.addEventListener("pointerdown", pulseCursor);
  document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) moveFollower(t.pageX, t.pageY);
  }, { passive: true });

  pauseBtn.addEventListener("click", () => (state.running ? pause() : resume()));
  document.addEventListener("dragstart", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") state.running ? pause() : resume();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });

  renderHud();
  spawnCheese();
})();
