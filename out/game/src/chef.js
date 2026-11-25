// Golden Ladle — the chef, one job: move around the kitchen, carry one thing,
// and know which station is in reach.
import { CHEF_SPEED, CHEF_RADIUS, INTERACT_RANGE, FLOOR, STATIONS } from './config.js';

export function allStations() {
  return [
    ...STATIONS.crates,
    STATIONS.board,
    ...STATIONS.stoves,
    STATIONS.assembly,
    STATIONS.plates,
    STATIONS.window,
    STATIONS.trash,
    ...STATIONS.counters,
  ];
}

function distToRect(px, py, r) {
  const cx = Math.max(r.x, Math.min(px, r.x + r.w));
  const cy = Math.max(r.y, Math.min(py, r.y + r.h));
  return Math.hypot(px - cx, py - cy);
}

export class Chef {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 640;
    this.y = 560;
    this.dir = -1; // facing: -1 up, 1 down (drawn as a small tilt)
    this.carrying = null; // null, { type: 'item', item } or { type: 'plate', items: [] }
    this.moveTarget = null;
    this.walking = false;
    this.stepPhase = 0;
  }

  get handsFree() { return this.carrying === null; }
  get carryingPlate() { return this.carrying && this.carrying.type === 'plate'; }
  get carryingItem() { return this.carrying && this.carrying.type === 'item' ? this.carrying.item : null; }

  pickItem(item) { this.carrying = { type: 'item', item }; }
  pickPlate(items = []) { this.carrying = { type: 'plate', items }; }
  dropCarried() { const c = this.carrying; this.carrying = null; return c; }

  nearestStation() {
    let best = null, bestD = Infinity;
    for (const s of allStations()) {
      const d = distToRect(this.x, this.y, s);
      if (d < bestD) { bestD = d; best = s; }
    }
    return bestD <= INTERACT_RANGE ? { station: best, dist: bestD } : null;
  }

  update(dt, input) {
    let vx = 0, vy = 0;
    const keys = input.moveVector();
    if (keys.x !== 0 || keys.y !== 0) {
      vx = keys.x; vy = keys.y;
      this.moveTarget = null;
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) {
        this.moveTarget = null;
      } else {
        vx = dx / d; vy = dy / d;
      }
    }
    if (vx !== 0 || vy !== 0) {
      this.walking = true;
      this.stepPhase += dt * 10;
      if (vy < 0) this.dir = -1;
      if (vy > 0) this.dir = 1;
    } else {
      this.walking = false;
    }
    this.x += vx * CHEF_SPEED * dt;
    this.y += vy * CHEF_SPEED * dt;
    // Stay on the floor.
    this.x = Math.max(FLOOR.x + CHEF_RADIUS, Math.min(FLOOR.x + FLOOR.w - CHEF_RADIUS, this.x));
    this.y = Math.max(FLOOR.y + CHEF_RADIUS, Math.min(FLOOR.y + FLOOR.h - CHEF_RADIUS, this.y));
    // Push out of station rectangles (circle vs rect).
    for (const s of allStations()) {
      const cx = Math.max(s.x, Math.min(this.x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(this.y, s.y + s.h));
      const dx = this.x - cx, dy = this.y - cy;
      const d = Math.hypot(dx, dy);
      if (d < CHEF_RADIUS && d > 0.001) {
        this.x = cx + (dx / d) * CHEF_RADIUS;
        this.y = cy + (dy / d) * CHEF_RADIUS;
      } else if (d <= 0.001) {
        this.y = s.y + s.h + CHEF_RADIUS;
      }
    }
  }
}
