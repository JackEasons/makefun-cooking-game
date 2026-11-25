// Golden Ladle — staged screenshot states, one job: put the real game into a
// photogenic, fully-played moment for each screenshot, then flag readiness.
// Every state is built only from the game's own objects, so each screenshot
// is a true render of the game's code, never a mock-up.
import { RECIPES } from './config.js';

function setTicket(game, id, recipeId, age, patience) {
  game.board.tickets.push({
    id,
    recipeId,
    recipe: RECIPES[recipeId],
    patience,
    maxPatience: patience,
    age,
  });
}

export function stageShot(game, name) {
  game.state = 'playing';
  game.board.reset();
  game.kitchen.reset();
  game.chef.reset();
  game.score = 0;
  game.hearts = 3;
  game.combo = 0;
  game.message = '';
  game.particles = [];
  game.popups = [];
  game.steam = [];

  if (name === 'cover') {
    // The full picture: order board, ingredients on the counter, a dish
    // mid-assembly, a patty on the grill, a timer running, a plate ready.
    game.elapsed = 45;
    game.timeLeft = 105;
    game.score = 340;
    game.combo = 2;
    game.comboTimer = 12000;
    setTicket(game, 1, 'burger', 12, 52);
    setTicket(game, 2, 'salad', 30, 48);
    setTicket(game, 3, 'melt', 6, 55);
    game.kitchen.stoves[0] = { item: 'patty', ms: 6000 };
    game.kitchen.assemblyPlate = { items: ['bun', 'patty'] };
    game.chef.x = 590; game.chef.y = 430; game.chef.dir = -1;
    game.chef.pickItem('lettuce');
    game.say('Burger almost there — add the lettuce!');
  } else if (name === 'chop') {
    // Mid-chop: knife work on the board, ticket board and timer in frame.
    game.elapsed = 20;
    game.timeLeft = 130;
    game.score = 110;
    setTicket(game, 1, 'salad', 8, 55);
    setTicket(game, 2, 'burger', 20, 50);
    game.kitchen.startChop('tomato');
    game.kitchen.chopping.ms = 700;
    game.chef.x = 120; game.chef.y = 430; game.chef.dir = -1;
    game.say('Chopping tomato — hold E!');
  } else if (name === 'serve') {
    // A finished plate in hand at the window, ready to serve.
    game.elapsed = 78;
    game.timeLeft = 72;
    game.score = 520;
    game.combo = 3;
    game.comboTimer = 15000;
    setTicket(game, 1, 'burger', 10, 50);
    setTicket(game, 2, 'stack', 26, 46);
    game.chef.x = 950; game.chef.y = 430; game.chef.dir = -1;
    game.chef.pickPlate(['bun', 'patty', 'lettuce']);
    game.say('Classic Burger complete — serve it at the window!');
  } else {
    // The rush: four tickets, one about to expire, two dishes in progress.
    game.elapsed = 118;
    game.timeLeft = 32;
    game.score = 890;
    game.combo = 4;
    game.comboTimer = 9000;
    setTicket(game, 1, 'salad', 42, 46);
    setTicket(game, 2, 'burger', 15, 44);
    setTicket(game, 3, 'stack', 30, 42);
    setTicket(game, 4, 'melt', 5, 48);
    game.kitchen.stoves[0] = { item: 'pattyRaw', ms: 4500 };
    game.kitchen.stoves[1] = { item: 'patty', ms: 6000 };
    game.kitchen.assemblyPlate = { items: ['lettuceChopped', 'tomatoChopped'] };
    game.chef.x = 640; game.chef.y = 520; game.chef.dir = 1;
    game.chef.pickItem('onionChopped');
    game.say('Rush hour! That salad ticket is about to walk out!');
  }
  // One real frame through the normal render path, then signal readiness.
  requestAnimationFrame(() => { window.__shotReady = true; });
}

export const SHOT_NAMES = ['cover', 'chop', 'serve', 'rush'];
