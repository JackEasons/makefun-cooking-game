// Golden Ladle — keyboard and mouse input, one job: turn presses and clicks
// into a small state object the game loop reads every frame.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set(); // keys pressed since last frame, consumed by the loop
    this.moveTarget = null;   // {x, y} in canvas pixels, set by mouse click
    this.clickedStation = null; // station id the player clicked, consumed by the loop
    this.onStationClick = null; // (stationId) => void, set by the game
    this.onAnyKey = null;       // () => void, used to dismiss the title screen

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this.keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (this.onAnyKey) this.onAnyKey();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      this.moveTarget = { x, y };
      if (this.onStationClick) {
        const hit = this.onStationClick(x, y);
        if (hit) this.clickedStation = hit;
      }
      if (this.onAnyKey) this.onAnyKey();
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  // Held movement vector from WASD or arrows, normalised.
  moveVector() {
    let x = 0, y = 0;
    if (this.keys.has('a') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('w') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('s') || this.keys.has('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  }

  hasMoveKeys() {
    const v = this.moveVector();
    return v.x !== 0 || v.y !== 0;
  }

  // True once for the frame the key went down.
  wasPressed(...names) {
    return names.some((n) => this.pressed.has(n));
  }

  endFrame() {
    this.pressed.clear();
    this.clickedStation = null;
  }
}
