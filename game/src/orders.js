// Golden Ladle — order tickets, one job: spawn tickets, age their patience,
// match served plates, and score the serve.
import { RECIPES, RECIPE_IDS, MAX_TICKETS } from './config.js';

let nextTicketId = 1;

export class OrderBoard {
  constructor() {
    this.tickets = [];
    this.spawnTimer = 2.5; // first ticket comes fast so the board is never empty
    this.served = 0;
    this.expired = 0;
    this.bestCombo = 0;
  }

  reset() {
    this.tickets = [];
    this.spawnTimer = 2.5;
    this.served = 0;
    this.expired = 0;
    this.bestCombo = 0;
    nextTicketId = 1;
  }

  // Patience shrinks as the shift goes on, so pressure grows without new chores.
  patienceFor(elapsed, daySeconds) {
    const progress = Math.min(1, elapsed / daySeconds);
    return 58 - progress * 18; // 58s early, 40s late
  }

  spawnInterval(elapsed, daySeconds) {
    const progress = Math.min(1, elapsed / daySeconds);
    return 13 - progress * 5; // 13s early, 8s late
  }

  spawnTicket(elapsed, daySeconds) {
    const recipeId = RECIPE_IDS[Math.floor(Math.random() * RECIPE_IDS.length)];
    const patience = this.patienceFor(elapsed, daySeconds);
    this.tickets.push({
      id: nextTicketId++,
      recipeId,
      recipe: RECIPES[recipeId],
      patience,
      maxPatience: patience,
      age: 0,
    });
  }

  update(dt, elapsed, daySeconds) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.tickets.length < MAX_TICKETS) {
      this.spawnTicket(elapsed, daySeconds);
      this.spawnTimer = this.spawnInterval(elapsed, daySeconds);
    }
    const expiredNow = [];
    for (const t of this.tickets) {
      t.age += dt;
      if (t.age >= t.patience) expiredNow.push(t);
    }
    if (expiredNow.length) {
      this.tickets = this.tickets.filter((t) => t.age < t.patience);
      this.expired += expiredNow.length;
    }
    return expiredNow;
  }

  // A plate serves when its items are exactly the recipe's set, any order.
  matchTicket(plateItems) {
    const sorted = [...plateItems].sort().join('|');
    return this.tickets.find((t) => [...t.recipe.needs].sort().join('|') === sorted) || null;
  }

  serveTicket(ticket, combo) {
    this.tickets = this.tickets.filter((t) => t !== ticket);
    this.served++;
    const remaining = Math.max(0, 1 - ticket.age / ticket.patience);
    const tip = Math.round(50 * remaining);
    const points = Math.round((ticket.recipe.base + tip) * (1 + 0.25 * Math.min(combo, 4)));
    return { points, tip, recipe: ticket.recipe };
  }
}
