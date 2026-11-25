// Golden Ladle — bootstrap, one job: wire canvas, input and the game loop,
// and stage a screenshot state when the URL asks for one (?shot=cover).
import { VIEW_W, VIEW_H, STATIONS } from './config.js';
import { Input } from './input.js';
import { Game } from './game.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW_W * dpr;
  canvas.height = VIEW_H * dpr;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const input = new Input(canvas);
const game = new Game(input);

// Clicking a station names it for the game loop (only when it is in reach).
input.onStationClick = (x, y) => {
  const all = [
    ...STATIONS.crates,
    STATIONS.board,
    ...STATIONS.stoves,
    STATIONS.assembly,
    STATIONS.plates,
    STATIONS.window,
    STATIONS.trash,
  ];
  for (const s of all) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s.id;
  }
  return null;
};

// Any key or click starts the music (browsers require a gesture for audio).
input.onAnyKey = () => {
  game.sounds.ensure();
  if (game.state === 'playing') game.sounds.startMusic();
};

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt, now);
  render(ctx, game, input);
  input.endFrame();
  requestAnimationFrame(frame);
}

if (shot) {
  stageShot(game, shot);
  // Staged states do not advance their timers: the screenshot is the moment.
  // Only the clock for pulsing animations keeps moving.
  game.update = (_dt, nowMs) => { game.nowMs = nowMs; };
}

requestAnimationFrame(frame);
