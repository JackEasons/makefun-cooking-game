// Golden Ladle — the game itself, one job: own the state machine (title,
// playing, game over), run the update step, and answer every interaction.
import {
  DAY_SECONDS, MAX_HEARTS, CHOP_MS, COOK_MS, BURN_MS,
  INGREDIENTS, RECIPES, STATIONS, COMBO_WINDOW_MS,
} from './config.js';
import { Chef } from './chef.js';
import { Kitchen } from './kitchen.js';
import { OrderBoard } from './orders.js';
import { SoundBank } from './audio.js';

export class Game {
  constructor(input) {
    this.input = input;
    this.sounds = new SoundBank();
    this.chef = new Chef();
    this.kitchen = new Kitchen();
    this.board = new OrderBoard();
    this.state = 'title'; // title | playing | over
    this.timeLeft = DAY_SECONDS;
    this.elapsed = 0;
    this.score = 0;
    this.hearts = MAX_HEARTS;
    this.combo = 0;
    this.comboTimer = 0;
    this.message = '';
    this.messageAt = 0;
    this.particles = []; // { x, y, vx, vy, life, maxLife, color, size }
    this.popups = [];    // { x, y, text, life, color }
    this.steam = [];
    this.lastTickSecond = -1;
    this.chopHeldMs = 0;
    this.nowMs = 0;
    this.shake = 0;
    this.flash = null; // { color, life }
  }

  reset() {
    this.chef.reset();
    this.kitchen.reset();
    this.board.reset();
    this.state = 'playing';
    this.timeLeft = DAY_SECONDS;
    this.elapsed = 0;
    this.score = 0;
    this.hearts = MAX_HEARTS;
    this.combo = 0;
    this.comboTimer = 0;
    this.message = '';
    this.particles = [];
    this.popups = [];
    this.steam = [];
    this.chopHeldMs = 0;
    this.sounds.startMusic();
  }

  say(text) {
    this.message = text;
    this.messageAt = this.nowMs;
  }

  addPopup(x, y, text, color = '#2b1d12') {
    this.popups.push({ x, y, text, life: 1.4, maxLife: 1.4, color });
  }

  burst(x, y, color, n = 10, speed = 90) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30,
        life: 0.7, maxLife: 0.7, color, size: 3 + Math.random() * 4,
      });
    }
  }

  addSteam(x, y) {
    this.steam.push({ x: x + (Math.random() * 30 - 15), y, life: 1.1, maxLife: 1.1, size: 6 + Math.random() * 8 });
  }

  update(dt, nowMs) {
    this.nowMs = nowMs;
    if (this.state === 'title') {
      if (this.input.wasPressed('Enter', ' ')) this.reset();
      return;
    }
    if (this.state === 'over') {
      if (this.input.wasPressed('r', 'R', 'Enter')) this.reset();
      return;
    }

    // --- timers -----------------------------------------------------------
    this.elapsed += dt;
    this.timeLeft = Math.max(0, DAY_SECONDS - this.elapsed);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt * 1000;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    const second = Math.ceil(this.timeLeft);
    if (this.timeLeft <= 10 && second !== this.lastTickSecond && this.timeLeft > 0) {
      this.lastTickSecond = second;
      this.sounds.tick();
    }

    // --- orders -----------------------------------------------------------
    const expired = this.board.update(dt, this.elapsed, DAY_SECONDS);
    for (const t of expired) {
      this.hearts -= 1;
      this.combo = 0;
      this.sounds.expire();
      this.say(`Order expired: ${t.recipe.name} — a customer walked out!`);
      this.shake = 6;
      this.flash = { color: 'rgba(217,79,61,0.25)', life: 0.5 };
      if (this.hearts <= 0) return this.endShift('Too many customers walked out.');
    }
    if (this.timeLeft <= 0) return this.endShift('The dinner shift is over!');

    // --- kitchen ----------------------------------------------------------
    this.kitchen.update(dt, nowMs, this.sounds);
    if (Math.random() < dt * 6) {
      const hot = this.kitchen.stoves.findIndex((s) => s.item === 'pattyRaw' || s.item === 'patty');
      if (hot >= 0) {
        const st = STATIONS.stoves[hot];
        this.addSteam(st.x + st.w / 2, st.y + 10);
      }
    }

    // --- chef -------------------------------------------------------------
    if (this.input.moveTarget) {
      this.chef.moveTarget = this.input.moveTarget;
      this.input.moveTarget = null; // consumed: the chef keeps its own copy
    }
    this.chef.update(dt, this.input);
    if (this.input.clickedStation) {
      const near = this.chef.nearestStation();
      if (near && near.station.id === this.input.clickedStation) this.interact();
    }
    if (this.input.wasPressed('e', 'E', ' ')) this.interact();
    if (this.input.wasPressed('m', 'M')) {
      const muted = this.sounds.toggleMute();
      this.say(muted ? 'Sound off' : 'Sound on');
      if (!muted) this.sounds.startMusic();
    }

    // --- chopping (hold E at the board) ------------------------------------
    const near = this.chef.nearestStation();
    const chopping = this.kitchen.chopping;
    if (chopping && near && near.station.id === 'board' &&
        (this.input.keys.has('e') || this.input.keys.has(' '))) {
      this.chopHeldMs += dt * 1000;
      if (Math.random() < dt * 8) {
        this.burst(near.station.x + near.station.w / 2, near.station.y + 30, '#8a5a33', 2, 50);
        this.sounds.chop();
      }
      const res = this.kitchen.chopTick(dt);
      if (res && res.done) {
        const chopped = INGREDIENTS[chopping.item].chop;
        this.chef.pickItem(chopped);
        this.sounds.chopDone();
        this.burst(near.station.x + near.station.w / 2, near.station.y + 30, INGREDIENTS[chopped].color, 12, 110);
        this.say(`${INGREDIENTS[chopped].label} ready!`);
        this.chopHeldMs = 0;
      }
    } else if (chopping) {
      this.chopHeldMs = 0;
    }

    // --- particles & popups -------------------------------------------------
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.popups) { p.y -= 28 * dt; p.life -= dt; }
    this.popups = this.popups.filter((p) => p.life > 0);
    for (const s of this.steam) { s.y -= 26 * dt; s.life -= dt; }
    this.steam = this.steam.filter((s) => s.life > 0);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);
    if (this.flash) { this.flash.life -= dt; if (this.flash.life <= 0) this.flash = null; }
  }

  endShift(reason) {
    this.state = 'over';
    this.endReason = reason;
    this.sounds.stopMusic();
    this.sounds.ding();
  }

  // --- interactions -------------------------------------------------------
  interact() {
    const near = this.chef.nearestStation();
    if (!near) { this.say('Walk up to a station first.'); return; }
    const st = near.station;
    const chef = this.chef;

    // Ingredient crates: take one if hands are free.
    if (st.id.startsWith('crate-')) {
      if (!chef.handsFree) { this.sounds.error(); this.say('Hands full — put something down first.'); return; }
      chef.pickItem(st.kind);
      this.sounds.pickup();
      return;
    }

    // Chopping board: start chopping a choppable item, or take the chopped result.
    if (st.id === 'board') {
      if (this.kitchen.chopping) { this.say('Keep holding E to finish chopping!'); return; }
      const item = chef.carryingItem;
      if (item && INGREDIENTS[item].chop) {
        chef.dropCarried();
        this.kitchen.startChop(item);
        this.sounds.chop();
        this.say(`Chopping ${INGREDIENTS[item].label} — hold E!`);
        return;
      }
      if (item) { this.sounds.error(); this.say(`${INGREDIENTS[item].label} does not need chopping.`); return; }
      this.say('Bring a tomato, lettuce or onion to chop.');
      return;
    }

    // Stoves: place a raw patty, or take a cooked (or burnt) one.
    if (st.id.startsWith('stove-')) {
      const idx = Number(st.id.split('-')[1]);
      const slot = this.kitchen.stoves[idx];
      if (!slot.item) {
        if (chef.carryingItem === 'pattyRaw') {
          chef.dropCarried();
          slot.item = 'pattyRaw';
          slot.ms = 0;
          this.sounds.putdown();
          this.say('Patty on the grill…');
        } else if (chef.carryingItem) {
          this.sounds.error(); this.say('Only a raw patty goes on the grill.');
        } else {
          this.say('Bring a raw patty to grill.');
        }
        return;
      }
      if (!chef.handsFree) { this.sounds.error(); this.say('Hands full!'); return; }
      if (slot.item === 'pattyRaw') { this.sounds.error(); this.say('Still raw — wait for it to grill!'); return; }
      const took = slot.item;
      slot.item = null; slot.ms = 0;
      chef.pickItem(took);
      if (took === 'pattyBurnt') { this.sounds.error(); this.say('Burnt! Toss it in the trash.'); }
      else { this.sounds.pickup(); this.say('Grilled patty — nice!'); }
      return;
    }

    // Plate stack: take a clean plate.
    if (st.id === 'plates') {
      if (!chef.handsFree) { this.sounds.error(); this.say('Hands full — put something down first.'); return; }
      chef.pickPlate([]);
      this.sounds.pickup();
      this.say('Clean plate in hand.');
      return;
    }

    // Assembly counter: set a plate down, add an ingredient, or pick the plate up.
    if (st.id === 'assembly') {
      if (chef.carryingPlate) {
        if (this.kitchen.assemblyPlate) { this.sounds.error(); this.say('A plate is already on the counter.'); return; }
        this.kitchen.assemblyPlate = { items: [...chef.carrying.items] };
        chef.dropCarried();
        this.sounds.putdown();
        this.say('Plate on the counter — add ingredients to it.');
        return;
      }
      const item = chef.carryingItem;
      if (item && this.kitchen.assemblyPlate) {
        const plate = this.kitchen.assemblyPlate;
        if (plate.items.includes(item)) { this.sounds.error(); this.say('That is already on the plate.'); return; }
        const wanted = Object.values(RECIPES).some((r) => r.needs.includes(item));
        if (!wanted) { this.sounds.error(); this.say(`${INGREDIENTS[item].label} goes in no dish — trash it.`); return; }
        plate.items.push(item);
        chef.dropCarried();
        this.sounds.putdown();
        this.burst(st.x + st.w / 2, st.y + 40, INGREDIENTS[item].color, 8, 80);
        const complete = this.board.matchTicket(plate.items);
        if (complete) this.say(`${complete.recipe.name} complete — serve it at the window!`);
        return;
      }
      if (!item && this.kitchen.assemblyPlate) {
        chef.pickPlate([...this.kitchen.assemblyPlate.items]);
        this.kitchen.assemblyPlate = null;
        this.sounds.pickup();
        return;
      }
      if (!item && !this.kitchen.assemblyPlate) { this.say('Bring a plate here to build a dish.'); return; }
      if (item && !this.kitchen.assemblyPlate) { this.sounds.error(); this.say('No plate on the counter — grab one first.'); return; }
      return;
    }

    // Serving window: serve a finished plate, or ring the bell empty-handed.
    if (st.id === 'window') {
      if (!chef.carryingPlate) { this.sounds.ding(); this.say('Ring! (Bring a finished dish to serve.)'); return; }
      const plate = chef.carrying;
      if (plate.items.length === 0) { this.sounds.error(); this.say('An empty plate serves nobody.'); return; }
      const ticket = this.board.matchTicket(plate.items);
      if (!ticket) {
        this.sounds.error();
        this.shake = 5;
        this.say('No order matches this plate — check the tickets!');
        return;
      }
      const result = this.board.serveTicket(ticket, this.combo);
      this.score += result.points;
      this.combo += 1;
      this.comboTimer = COMBO_WINDOW_MS;
      this.board.bestCombo = Math.max(this.board.bestCombo, this.combo);
      chef.dropCarried();
      this.sounds.serve();
      this.burst(st.x + st.w / 2, st.y + 20, '#f2b234', 16, 130);
      this.addPopup(st.x + st.w / 2, st.y - 10, `+${result.points}`, '#1d7a2e');
      this.say(`Served ${result.recipe.name}! +${result.points} (tip $${result.tip})`);
      return;
    }

    // Trash: throw away whatever is carried.
    if (st.id === 'trash') {
      if (chef.handsFree) { this.say('Nothing to throw away.'); return; }
      const dropped = chef.dropCarried();
      this.sounds.putdown();
      this.burst(st.x + st.w / 2, st.y + 20, '#5d4632', 8, 70);
      this.say(dropped.type === 'plate' ? 'Plate cleared.' : `${INGREDIENTS[dropped.item].label} tossed.`);
      return;
    }

    // Decorative counters: just a hint.
    this.say('Ingredients live on the counter — grab them from the crates above.');
  }
}
