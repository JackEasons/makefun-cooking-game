// Golden Ladle — kitchen station state, one job: what sits on the stoves and
// the assembly counter, and how chopping and cooking advance over time.
import { STATIONS, CHOP_MS, COOK_MS, BURN_MS } from './config.js';

export class Kitchen {
  constructor() {
    this.reset();
  }

  reset() {
    // One slot per stove: null, or { item: 'pattyRaw'|'patty'|'pattyBurnt', ms }.
    this.stoves = STATIONS.stoves.map(() => ({ item: null, ms: 0 }));
    // The plate resting on the assembly counter, or null.
    this.assemblyPlate = null; // { items: [] }
    // Chopping in progress: null, or { item, ms }.
    this.chopping = null;
    this.sizzleAt = 0;
  }

  update(dt, nowMs, sounds) {
    for (let i = 0; i < this.stoves.length; i++) {
      const slot = this.stoves[i];
      if (!slot.item) continue;
      slot.ms += dt * 1000;
      if (slot.item === 'pattyRaw' && slot.ms >= COOK_MS) {
        slot.item = 'patty';
        slot.ms = COOK_MS;
      } else if (slot.item === 'patty' && slot.ms >= BURN_MS) {
        slot.item = 'pattyBurnt';
        slot.ms = BURN_MS;
      }
      if ((slot.item === 'pattyRaw' || slot.item === 'patty') && nowMs - this.sizzleAt > 900) {
        this.sizzleAt = nowMs;
        if (sounds) sounds.sizzle();
      }
    }
  }

  freeStove() {
    return this.stoves.findIndex((s) => !s.item);
  }

  // Chopping: returns { done: choppedItem } when finished, { busy: true }
  // while in progress, or null when nothing is being chopped.
  chopTick(dt) {
    if (!this.chopping) return null;
    this.chopping.ms += dt * 1000;
    if (this.chopping.ms >= CHOP_MS) {
      const done = this.chopping.item;
      this.chopping = null;
      return { done };
    }
    return { busy: true };
  }

  startChop(item) {
    this.chopping = { item, ms: 0 };
  }

  cancelChop() {
    this.chopping = null;
  }
}
