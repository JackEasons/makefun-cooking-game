// Golden Ladle — shared constants, recipes, palette and kitchen layout.
// One job: the numbers every other module reads, so tuning never touches logic.
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const DAY_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_TICKETS = 4;
export const COMBO_WINDOW_MS = 20000;

export const CHEF_SPEED = 265; // px per second
export const CHEF_RADIUS = 24;
export const INTERACT_RANGE = 78;

export const CHOP_MS = 1200;
export const COOK_MS = 6000;
export const BURN_MS = 12000;

// Warm bistro palette: cream walls, terracotta floor, dark walnut counters.
export const COLORS = {
  wall: '#f3e2c7',
  wallTrim: '#e0c69a',
  floorA: '#c98d5f',
  floorB: '#bd7f52',
  counterTop: '#8a5a33',
  counterSide: '#6e4525',
  counterEdge: '#a9713f',
  steel: '#b9c0c7',
  steelDark: '#8d949c',
  cream: '#fff6e3',
  ink: '#2b1d12',
  inkSoft: '#5d4632',
  red: '#d94f3d',
  green: '#4d9e57',
  gold: '#f2b234',
  ticket: '#fff8e6',
  ticketUrgent: '#ffe3d9',
  stoveHot: '#ff7a2f',
};

// Every ingredient the kitchen stocks, with its drawn look and its prep step.
export const INGREDIENTS = {
  tomato:       { label: 'Tomato',  color: '#e2483a', chop: 'tomatoChopped', raw: true },
  lettuce:      { label: 'Lettuce', color: '#69b455', chop: 'lettuceChopped', raw: true },
  onion:        { label: 'Onion',   color: '#e8d9f2', chop: 'onionChopped', raw: true },
  cheese:       { label: 'Cheese',  color: '#f6c945', chop: null, raw: true },
  bun:          { label: 'Bun',     color: '#e8a95c', chop: null, raw: true },
  pattyRaw:     { label: 'Raw Patty', color: '#b06a5e', chop: null, raw: true },
  tomatoChopped:  { label: 'Tomato · sliced', color: '#e2483a', chop: null, chopped: true },
  lettuceChopped: { label: 'Lettuce · shredded', color: '#69b455', chop: null, chopped: true },
  onionChopped:   { label: 'Onion · diced', color: '#e8d9f2', chop: null, chopped: true },
  patty:        { label: 'Patty · grilled', color: '#7a4a2e', chop: null, cooked: true },
  pattyBurnt:   { label: 'Patty · burnt!', color: '#2e211a', chop: null, burnt: true },
};

// The menu: each dish is the exact set a plate must hold to serve.
export const RECIPES = {
  burger: {
    name: 'Classic Burger',
    short: 'Burger',
    needs: ['bun', 'patty', 'lettuce'],
    base: 100,
    color: '#e8a95c',
  },
  melt: {
    name: 'Cheesy Melt',
    short: 'Melt',
    needs: ['bun', 'patty', 'cheese'],
    base: 110,
    color: '#f6c945',
  },
  salad: {
    name: 'Garden Salad',
    short: 'Salad',
    needs: ['lettuceChopped', 'tomatoChopped', 'onionChopped'],
    base: 90,
    color: '#69b455',
  },
  stack: {
    name: 'Veggie Stack',
    short: 'Stack',
    needs: ['bun', 'lettuce', 'tomatoChopped', 'cheese'],
    base: 130,
    color: '#d94f3d',
  },
};
export const RECIPE_IDS = ['burger', 'melt', 'salad', 'stack'];

// Station rectangles (x, y, w, h) on the 1280x720 floor. The top strip is the
// order board; the kitchen floor starts below it.
export const STATIONS = {
  crates: [
    { id: 'crate-tomato',  kind: 'tomato',  x: 24,  y: 188, w: 92, h: 66 },
    { id: 'crate-lettuce', kind: 'lettuce', x: 128, y: 188, w: 92, h: 66 },
    { id: 'crate-onion',   kind: 'onion',   x: 232, y: 188, w: 92, h: 66 },
    { id: 'crate-cheese',  kind: 'cheese',  x: 336, y: 188, w: 92, h: 66 },
    { id: 'crate-bun',     kind: 'bun',     x: 440, y: 188, w: 92, h: 66 },
    { id: 'crate-patty',   kind: 'pattyRaw', x: 544, y: 188, w: 92, h: 66 },
  ],
  board:   { id: 'board',   x: 24,  y: 292, w: 196, h: 96 },
  stoves: [
    { id: 'stove-0', x: 244, y: 292, w: 104, h: 96 },
    { id: 'stove-1', x: 360, y: 292, w: 104, h: 96 },
  ],
  assembly:{ id: 'assembly', x: 488, y: 292, w: 220, h: 96 },
  plates:  { id: 'plates',  x: 732, y: 292, w: 96,  h: 96 },
  window:  { id: 'window',  x: 852, y: 292, w: 200, h: 96 },
  trash:   { id: 'trash',   x: 1076, y: 292, w: 92,  h: 96 },
  // Decorative bottom counters, piled with ingredients on the counter.
  counters: [
    { id: 'counter-0', x: 24,   y: 612, w: 300, h: 72 },
    { id: 'counter-1', x: 956,  y: 612, w: 300, h: 72 },
  ],
};

// Walkable floor: the chef roams the whole kitchen and is pushed out of
// station rectangles; the aisle between the crate row and the work row lets
// the chef reach both.
export const FLOOR = { x: 16, y: 256, w: 1248, h: 444 };
