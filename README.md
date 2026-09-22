

# Cheese Simulator  <br />  <img alt="Stargazers" src="https://img.shields.io/github/stars/i-is-evil-duck/cheese.simulator?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41">


## Cheese Simulator
A click-to-eat cheese game. Chase the cheese with your cursor-follower, build combos, dodge the cursed face, and climb levels.

### <a href="https://cheese-simulator.j3ly.com/">Play Now</a>

## Downloads

No build step — static files served from `assets/`. Play online or download from the [releases](https://github.com/i-is-evil-duck/cheese.simulator/releases) page.

| Platform | File |
|----------|------|
| Web | `assets/index.html` + `game.js` + `style.css` |
| Live | [cheese-simulator.j3ly.com](https://cheese-simulator.j3ly.com/) |

## Build from Source

```bash
# Clone the repo
git clone https://github.com/i-is-evil-duck/cheese.simulator.git
cd cheese.simulator/assets

# Serve statically (no dependencies)
python -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Features

- **Combo system** — eat within 2.5s to build streaks (x2 at 3, x3 at 5, base 1 point per cheese)
- **Cursed face** (10%) — worth +5 points
- **Levels** — every 10 eaten speeds up spawns and shrinks despawn time
- **Counter + persistent best** (`localStorage`)
- **Sounds** — 5 SFX with overlap (fixed missing `sound.mp3` ref)
- **Pause** — button or `P`, auto-pause on tab hide, DOM capped at 40 nodes with expiring cheese
- **Mobile** — touch to eat, responsive follower

## Usage

Click (or tap) cheese to eat it. Normal cheese is 1 point times your combo multiplier, the face is 5 points flat.

- **Pause / Resume** — Pause button or `P`

## Views

<img src="https://count.getloli.com/get/@cheese.simulator?theme=rule34" />
