// Golden Ladle — everything drawn, one job: turn the game state into the
// warm bistro kitchen the screenshots show. All art is canvas vector shapes;
// no image files are loaded at all.
import {
  VIEW_W, VIEW_H, COLORS, INGREDIENTS, RECIPES, STATIONS, CHOP_MS, COOK_MS, BURN_MS,
} from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- ingredients -----------------------------------------------------------
export function drawIngredient(ctx, kind, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 2; // half-size unit
  switch (kind) {
    case 'tomato': {
      ctx.fillStyle = '#e2483a';
      ctx.beginPath(); ctx.arc(0, u * 0.15, u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3f8f3a';
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.7);
      ctx.lineTo(u * 0.45, -u * 0.25); ctx.lineTo(-u * 0.45, -u * 0.25);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(-u * 0.35, -u * 0.2, u * 0.22, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#69b455';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * u * 0.45, Math.sin(a) * u * 0.45 + u * 0.1, u * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#8fd07e';
      ctx.beginPath(); ctx.arc(0, u * 0.1, u * 0.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'onion': {
      ctx.fillStyle = '#efe6f7';
      ctx.beginPath(); ctx.arc(0, u * 0.1, u * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b48fd0'; ctx.lineWidth = Math.max(1.5, u * 0.12);
      for (const r of [0.65, 0.4]) {
        ctx.beginPath(); ctx.arc(0, u * 0.1, u * r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#7fae5a';
      ctx.fillRect(-u * 0.08, -u * 1.05, u * 0.16, u * 0.4);
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f6c945';
      ctx.beginPath();
      ctx.moveTo(-u, u * 0.6); ctx.lineTo(u, u * 0.6); ctx.lineTo(u * 0.2, -u * 0.7);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d99e1f';
      for (const [hx, hy] of [[-0.3, 0.25], [0.3, 0.3], [0.05, -0.1]]) {
        ctx.beginPath(); ctx.arc(hx * u, hy * u, u * 0.14, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'bun': {
      ctx.fillStyle = '#e8a95c';
      ctx.beginPath(); ctx.arc(0, u * 0.25, u * 0.95, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillRect(-u * 0.95, u * 0.25, u * 1.9, u * 0.35);
      ctx.fillStyle = '#f7d9a0';
      for (const [sx, sy] of [[-0.45, -0.35], [0, -0.55], [0.45, -0.35], [-0.2, -0.15], [0.25, -0.1]]) {
        ctx.beginPath(); ctx.ellipse(sx * u, sy * u, u * 0.1, u * 0.06, 0.4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'pattyRaw':
    case 'patty':
    case 'pattyBurnt': {
      ctx.fillStyle = kind === 'pattyRaw' ? '#b06a5e' : kind === 'patty' ? '#7a4a2e' : '#2e211a';
      roundRect(ctx, -u, -u * 0.45, u * 2, u * 0.9, u * 0.4);
      ctx.fill();
      if (kind === 'patty') {
        ctx.strokeStyle = '#5d3517'; ctx.lineWidth = Math.max(1.5, u * 0.1);
        ctx.beginPath();
        ctx.moveTo(-u * 0.7, 0); ctx.lineTo(u * 0.7, 0);
        ctx.moveTo(-u * 0.5, -u * 0.25); ctx.lineTo(u * 0.5, -u * 0.25);
        ctx.stroke();
      }
      break;
    }
    case 'tomatoChopped':
    case 'lettuceChopped':
    case 'onionChopped': {
      const base = kind === 'tomatoChopped' ? '#e2483a' : kind === 'lettuceChopped' ? '#69b455' : '#efe6f7';
      ctx.fillStyle = base;
      for (let i = -1; i <= 1; i++) {
        roundRect(ctx, i * u * 0.62 - u * 0.28, -u * 0.3, u * 0.56, u * 0.7, u * 0.14);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
      break;
    }
    default: {
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(0, 0, u * 0.8, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, items, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cfc4a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.72, s * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
  // Stacked dish layers, bottom to top.
  const layers = items || [];
  layers.forEach((item, i) => {
    drawIngredient(ctx, item, 0, -6 - i * 7, s * 0.95);
  });
  ctx.restore();
}

function drawChef(ctx, chef, carrying) {
  const { x, y } = chef;
  const bob = chef.walking ? Math.sin(chef.stepPhase) * 2 : 0;
  ctx.save();
  ctx.translate(x, y);
  // Shadow.
  ctx.fillStyle = 'rgba(43,29,18,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 22, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body: white coat and terracotta apron.
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, -17, -8 + bob, 34, 30, 10);
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  roundRect(ctx, -13, 2 + bob, 26, 20, 6);
  ctx.fill();
  // Head and toque.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(0, -18 + bob, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-7, -30 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -30 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -33 + bob, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-11, -30 + bob, 22, 6);
  // Eyes look toward the facing direction.
  ctx.fillStyle = '#2b1d12';
  const look = chef.dir * 2;
  ctx.beginPath(); ctx.arc(-5 + look, -18 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5 + look, -18 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  // Carried item floats above the toque.
  if (carrying) {
    ctx.fillStyle = 'rgba(255,248,230,0.9)';
    ctx.beginPath(); ctx.arc(0, -62 + bob, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -62 + bob, 22, 0, Math.PI * 2); ctx.stroke();
    if (carrying.type === 'item') drawIngredient(ctx, carrying.item, 0, -62 + bob, 30);
    else drawPlate(ctx, 0, -62 + bob, carrying.items, 17);
  }
  ctx.restore();
}

// --- stations --------------------------------------------------------------
function drawStationBase(ctx, s, label, accent) {
  ctx.fillStyle = COLORS.counterSide;
  roundRect(ctx, s.x, s.y + 6, s.w, s.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, s.x, s.y, s.w, s.h - 6, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(s.x + 4, s.y + s.h - 12, s.w - 8, 4);
  text(ctx, label, s.x + s.w / 2, s.y + s.h - 22, 11, 'rgba(255,246,227,0.9)', '800', 'center');
  if (accent) {
    ctx.fillStyle = accent;
    ctx.fillRect(s.x + 8, s.y + 6, s.w - 16, 4);
  }
}

function drawTicket(ctx, ticket, x, y, w, h, nowMs) {
  const remaining = Math.max(0, 1 - ticket.age / ticket.patience);
  const urgent = remaining < 0.22;
  const pulse = urgent ? 0.75 + 0.25 * Math.sin(nowMs / 130) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = urgent ? COLORS.ticketUrgent : COLORS.ticket;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#d94f3d' : '#d9c49a';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = ticket.recipe.color;
  ctx.fillRect(x, y, 8, h);
  text(ctx, ticket.recipe.name, x + 16, y + 20, 15, COLORS.ink, '800');
  text(ctx, `#${ticket.id}`, x + w - 10, y + 18, 11, COLORS.inkSoft, '700', 'right');
  // Ingredient icons for the recipe.
  ticket.recipe.needs.forEach((item, i) => {
    drawIngredient(ctx, item, x + 32 + i * 34, y + 48, 26);
  });
  // Patience bar.
  const barW = w - 24;
  ctx.fillStyle = '#e8dcc2';
  roundRect(ctx, x + 12, y + h - 16, barW, 8, 4);
  ctx.fill();
  ctx.fillStyle = remaining > 0.5 ? '#4d9e57' : remaining > 0.22 ? '#f2b234' : '#d94f3d';
  if (remaining > 0) {
    roundRect(ctx, x + 12, y + h - 16, barW * remaining, 8, 4);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(ticket.patience - ticket.age)}s`, x + w - 12, y + h - 26, 11, urgent ? '#d94f3d' : COLORS.inkSoft, '800', 'right');
}

// --- main render -----------------------------------------------------------
export function render(ctx, game, input) {
  const { chef, kitchen, board } = game;
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }

  // Wall and floor.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW_W, 180);
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, 172, VIEW_W, 8);
  // Floor checker.
  const tile = 64;
  for (let ty = 180; ty < VIEW_H; ty += tile) {
    for (let tx = 0; tx < VIEW_W; tx += tile) {
      const even = ((tx / tile + ty / tile) | 0) % 2 === 0;
      ctx.fillStyle = even ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  // Wall decor: framed menu and hanging pans.
  text(ctx, '★ GOLDEN LADLE ★', 24, 30, 20, '#8a5a33', '800');
  text(ctx, 'bistro · est. 2026', 24, 54, 12, COLORS.inkSoft, '600');
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, 980, 14, 276, 52, 8);
  ctx.fill();
  ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
  roundRect(ctx, 980, 14, 276, 52, 8);
  ctx.stroke();
  text(ctx, 'TODAY: burgers · melts · salads · stacks', 1118, 40, 12, COLORS.inkSoft, '700', 'center');

  // --- HUD bar ------------------------------------------------------------
  ctx.fillStyle = 'rgba(43,29,18,0.88)';
  roundRect(ctx, 380, 8, 520, 56, 12);
  ctx.fill();
  const mm = Math.floor(game.timeLeft / 60);
  const ss = Math.floor(game.timeLeft % 60).toString().padStart(2, '0');
  const lowTime = game.timeLeft <= 30 && game.state === 'playing';
  text(ctx, `⏱ ${mm}:${ss}`, 640, 30, 26, lowTime ? '#ff8a70' : '#fff6e3', '800', 'center');
  text(ctx, `SCORE ${game.score}`, 640, 52, 13, '#f2b234', '800', 'center');
  // Hearts.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < game.hearts ? '#d94f3d' : 'rgba(255,255,255,0.25)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('♥', 400 + i * 26, 30);
  }
  if (game.combo > 1) {
    text(ctx, `🔥 COMBO x${game.combo}`, 400, 52, 13, '#ff9a3d', '800');
  }
  text(ctx, `served ${board.served}`, 880, 30, 13, '#fff6e3', '700', 'right');
  text(ctx, 'M mute · R restart', 880, 52, 11, 'rgba(255,246,227,0.7)', '600', 'right');

  // --- order board ---------------------------------------------------------
  text(ctx, 'ORDER BOARD', 24, 92, 13, COLORS.inkSoft, '800');
  ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(24, 104); ctx.lineTo(150, 104); ctx.stroke();
  if (board.tickets.length === 0) {
    ctx.fillStyle = 'rgba(43,29,18,0.55)';
    roundRect(ctx, 24, 112, 300, 56, 10);
    ctx.fill();
    text(ctx, 'No orders yet — the lunch rush is coming…', 174, 140, 13, '#fff6e3', '600', 'center');
  }
  board.tickets.forEach((t, i) => {
    drawTicket(ctx, t, 24 + i * 312, 112, 296, 58, game.nowMs);
  });

  // --- stations ------------------------------------------------------------
  for (const crate of STATIONS.crates) {
    drawStationBase(ctx, crate, INGREDIENTS[crate.kind].label.toUpperCase());
    drawIngredient(ctx, crate.kind, crate.x + crate.w / 2, crate.y + 26, 40);
  }
  drawStationBase(ctx, STATIONS.board, 'CHOP · HOLD E', '#69b455');
  ctx.fillStyle = '#e8d9b8';
  roundRect(ctx, STATIONS.board.x + 14, STATIONS.board.y + 12, STATIONS.board.w - 28, 34, 6);
  ctx.fill();
  if (kitchen.chopping) {
    const item = kitchen.chopping.item;
    drawIngredient(ctx, item, STATIONS.board.x + STATIONS.board.w / 2, STATIONS.board.y + 29, 34);
    const p = Math.min(1, kitchen.chopping.ms / CHOP_MS);
    ctx.fillStyle = '#e8dcc2';
    roundRect(ctx, STATIONS.board.x + 20, STATIONS.board.y + 56, STATIONS.board.w - 40, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#69b455';
    roundRect(ctx, STATIONS.board.x + 20, STATIONS.board.y + 56, (STATIONS.board.w - 40) * p, 8, 4);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8a5a33';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🔪', STATIONS.board.x + STATIONS.board.w / 2, STATIONS.board.y + 29);
  }
  STATIONS.stoves.forEach((st, i) => {
    const slot = kitchen.stoves[i];
    drawStationBase(ctx, st, 'GRILL', slot.item ? COLORS.stoveHot : null);
    ctx.fillStyle = '#2b1d12';
    ctx.beginPath(); ctx.ellipse(st.x + st.w / 2, st.y + 30, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
    if (slot.item) {
      drawIngredient(ctx, slot.item, st.x + st.w / 2, st.y + 26, 40);
      const total = slot.item === 'pattyRaw' ? COOK_MS : BURN_MS;
      const p = Math.min(1, slot.ms / total);
      ctx.fillStyle = '#e8dcc2';
      roundRect(ctx, st.x + 16, st.y + 56, st.w - 32, 8, 4);
      ctx.fill();
      ctx.fillStyle = slot.item === 'pattyBurnt' ? '#2e211a' : slot.item === 'patty' ? '#4d9e57' : '#ff7a2f';
      roundRect(ctx, st.x + 16, st.y + 56, (st.w - 32) * p, 8, 4);
      ctx.fill();
      if (slot.item === 'patty') text(ctx, 'READY!', st.x + st.w / 2, st.y + 76, 11, '#4d9e57', '800', 'center');
      if (slot.item === 'pattyBurnt') text(ctx, 'BURNT!', st.x + st.w / 2, st.y + 76, 11, '#d94f3d', '800', 'center');
    } else {
      ctx.fillStyle = '#8d949c';
      ctx.beginPath(); ctx.ellipse(st.x + st.w / 2, st.y + 30, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  drawStationBase(ctx, STATIONS.assembly, 'BUILD YOUR DISH', '#f2b234');
  if (kitchen.assemblyPlate) {
    drawPlate(ctx, STATIONS.assembly.x + STATIONS.assembly.w / 2, STATIONS.assembly.y + 34, kitchen.assemblyPlate.items, 40);
    const match = board.matchTicket(kitchen.assemblyPlate.items);
    if (match) text(ctx, `✓ ${match.recipe.name} — ready to serve!`, STATIONS.assembly.x + STATIONS.assembly.w / 2, STATIONS.assembly.y + 76, 11, '#2b7a2e', '800', 'center');
  } else {
    ctx.fillStyle = 'rgba(255,246,227,0.75)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('plate + ingredients', STATIONS.assembly.x + STATIONS.assembly.w / 2, STATIONS.assembly.y + 34);
  }
  drawStationBase(ctx, STATIONS.plates, 'PLATES');
  drawPlate(ctx, STATIONS.plates.x + STATIONS.plates.w / 2, STATIONS.plates.y + 30, [], 30);
  drawPlate(ctx, STATIONS.plates.x + STATIONS.plates.w / 2, STATIONS.plates.y + 36, [], 30);
  drawStationBase(ctx, STATIONS.window, 'SERVE →', '#d94f3d');
  ctx.fillStyle = '#f7ead0';
  roundRect(ctx, STATIONS.window.x + 12, STATIONS.window.y + 10, STATIONS.window.w - 24, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🔔', STATIONS.window.x + STATIONS.window.w / 2, STATIONS.window.y + 27);
  drawStationBase(ctx, STATIONS.trash, 'TRASH', '#5d4632');
  ctx.fillStyle = '#3a2a1c';
  roundRect(ctx, STATIONS.trash.x + 22, STATIONS.trash.y + 10, STATIONS.trash.w - 44, 34, 6);
  ctx.fill();

  // Ingredients piled on the bottom counters.
  for (const counter of STATIONS.counters) {
    drawStationBase(ctx, counter, '');
    const kinds = counter.id === 'counter-0'
      ? ['tomato', 'tomato', 'lettuce', 'onion']
      : ['cheese', 'bun', 'bun', 'tomato'];
    kinds.forEach((k, i) => {
      drawIngredient(ctx, k, counter.x + 40 + i * 68, counter.y + 26, 44);
    });
  }

  // Steam wisps.
  for (const s of game.steam) {
    ctx.globalAlpha = Math.max(0, s.life / s.maxLife) * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (1.6 - s.life / s.maxLife), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Nearest-station highlight + prompt.
  const near = game.state === 'playing' ? chef.nearestStation() : null;
  if (near) {
    ctx.strokeStyle = '#f2b234';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, near.station.x - 4, near.station.y - 4, near.station.w + 8, near.station.h + 8, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    const label = stationHint(near.station, game);
    if (label) {
      ctx.fillStyle = 'rgba(43,29,18,0.9)';
      const w = ctx.measureText(label).width + 90;
      roundRect(ctx, chef.x - w / 2, chef.y - 96, w, 26, 13);
      ctx.fill();
      text(ctx, label, chef.x, chef.y - 83, 13, '#fff6e3', '700', 'center');
    }
  }

  // Chef, particles, popups.
  drawChef(ctx, chef, chef.carrying);
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const p of game.popups) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    text(ctx, p.text, p.x, p.y, 24, p.color, '800', 'center');
  }
  ctx.globalAlpha = 1;

  // Message line.
  if (game.message && game.nowMs - game.messageAt < 3500) {
    ctx.fillStyle = 'rgba(43,29,18,0.85)';
    roundRect(ctx, VIEW_W / 2 - 320, VIEW_H - 40, 640, 30, 15);
    ctx.fill();
    text(ctx, game.message, VIEW_W / 2, VIEW_H - 25, 14, '#fff6e3', '600', 'center');
  }

  if (game.flash) {
    ctx.globalAlpha = Math.max(0, game.flash.life * 2);
    ctx.fillStyle = game.flash.color;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // --- overlays -------------------------------------------------------------
  if (game.state === 'title') drawTitle(ctx, game);
  if (game.state === 'over') drawGameOver(ctx, game);
}

function stationHint(st, game) {
  const chef = game.chef;
  if (st.id.startsWith('crate-')) return chef.handsFree ? `E — take ${INGREDIENTS[st.kind].label}` : null;
  if (st.id === 'board') {
    if (game.kitchen.chopping) return 'Hold E — chopping…';
    const item = chef.carryingItem;
    return item && INGREDIENTS[item].chop ? `E — chop ${INGREDIENTS[item].label}` : 'E — chopping board';
  }
  if (st.id.startsWith('stove-')) {
    const slot = game.kitchen.stoves[Number(st.id.split('-')[1])];
    if (!slot.item) return chef.carryingItem === 'pattyRaw' ? 'E — grill the patty' : 'E — grill';
    return slot.item === 'patty' ? 'E — take the grilled patty!' : slot.item === 'pattyBurnt' ? 'E — take it (burnt!)' : 'E — still grilling…';
  }
  if (st.id === 'plates') return chef.handsFree ? 'E — take a plate' : null;
  if (st.id === 'assembly') {
    if (chef.carryingPlate) return 'E — set the plate down';
    if (chef.carryingItem) return game.kitchen.assemblyPlate ? 'E — add to the plate' : 'E — need a plate first';
    return game.kitchen.assemblyPlate ? 'E — pick the plate up' : 'E — build dishes here';
  }
  if (st.id === 'window') return chef.carryingPlate ? 'E — serve the dish!' : 'E — ring the bell';
  if (st.id === 'trash') return chef.handsFree ? null : 'E — throw it away';
  return null;
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(43,29,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, 290, 110, 700, 500, 20);
  ctx.fill();
  ctx.strokeStyle = '#f2b234'; ctx.lineWidth = 4;
  roundRect(ctx, 290, 110, 700, 500, 20);
  ctx.stroke();
  text(ctx, '🍳 GOLDEN LADLE 🍳', 640, 160, 44, '#8a5a33', '800', 'center');
  text(ctx, 'A tiny bistro. A big lunch rush. One very busy chef.', 640, 205, 17, COLORS.inkSoft, '600', 'center');
  const lines = [
    ['1 · GRAB', 'ingredients from the crates (E)'],
    ['2 · CHOP', 'veg on the board — hold E'],
    ['3 · GRILL', 'patties on the stove — don\'t burn them!'],
    ['4 · BUILD', 'the dish on a plate at the counter'],
    ['5 · SERVE', 'at the window before the ticket runs out'],
  ];
  lines.forEach(([a, b], i) => {
    text(ctx, a, 360, 255 + i * 34, 16, '#d94f3d', '800');
    text(ctx, b, 520, 255 + i * 34, 16, COLORS.ink, '600');
  });
  text(ctx, 'Move: WASD / arrows · or click to walk · Interact: E or Space · Mute: M', 640, 450, 14, COLORS.inkSoft, '600', 'center');
  text(ctx, 'Serve fast for tips — chain serves for a combo. 3 walk-outs ends the shift.', 640, 478, 14, COLORS.inkSoft, '600', 'center');
  const blink = Math.sin(game.nowMs / 300) > 0;
  if (blink) text(ctx, '▶  PRESS ENTER TO OPEN THE KITCHEN  ◀', 640, 545, 20, '#d94f3d', '800', 'center');
}

function drawGameOver(ctx, game) {
  ctx.fillStyle = 'rgba(43,29,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, 340, 150, 600, 400, 20);
  ctx.fill();
  ctx.strokeStyle = '#f2b234'; ctx.lineWidth = 4;
  roundRect(ctx, 340, 150, 600, 400, 20);
  ctx.stroke();
  text(ctx, 'SHIFT OVER', 640, 205, 40, '#8a5a33', '800', 'center');
  text(ctx, game.endReason || '', 640, 250, 16, COLORS.inkSoft, '600', 'center');
  text(ctx, `SCORE  ${game.score}`, 640, 310, 30, '#d94f3d', '800', 'center');
  text(ctx, `Dishes served: ${game.board.served}      Best combo: x${Math.max(1, game.board.bestCombo)}      Walk-outs: ${game.board.expired}`, 640, 360, 16, COLORS.ink, '600', 'center');
  const verdict = game.score >= 800 ? '🏆 Head-chef material!' : game.score >= 400 ? '👨‍🍳 A solid shift — the regulars approve.' : '🍳 The lunch rush won today. One more shift?';
  text(ctx, verdict, 640, 410, 16, COLORS.inkSoft, '600', 'center');
  const blink = Math.sin(game.nowMs / 300) > 0;
  if (blink) text(ctx, 'PRESS R TO COOK AGAIN', 640, 490, 20, '#d94f3d', '800', 'center');
}

export { RECIPES };
