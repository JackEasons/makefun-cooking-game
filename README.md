# makefun-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/JackEasons/makefun-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/JackEasons/makefun-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Golden Ladle** — a tiny bistro, a big lunch rush. You are the only chef in a
warm little kitchen: grab ingredients from the crates, chop veg on the board,
grill patties on the stove (don't burn them), build each dish on a plate at
the counter, and serve it at the window before its ticket runs out. Four
recipes (Classic Burger, Cheesy Melt, Garden Salad, Veggie Stack), a 150-second
dinner shift, tips for fast serves, combos for chained serves, and three
walk-outs ends the shift.

Everything is drawn in code on a 2D canvas — no image, font or sound files —
and every sound is synthesised with WebAudio. Keyboard (WASD/arrows + E) and
mouse (click to walk, click a station to use it) both play.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` from any static server — the game makes no network
requests at all. `?shot=cover|chop|serve|rush` stages a screenshot moment.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored library.
- `game/index.html` + `game/src/` — the game: `config.js` (recipes, palette,
  layout), `game.js` (state machine and interactions), `chef.js` (movement and
  carrying), `kitchen.js` (stoves, chopping, assembly), `orders.js` (tickets
  and scoring), `render.js` (all canvas drawing), `input.js` (keyboard and
  mouse), `audio.js` (synthesised sounds and music), `shots.js` (staged
  screenshot states), `main.js` (bootstrap and loop).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — four real renders of the game's own code.

## License

MIT. See LICENSE.

---

<sub>Entered on [make.fun](https://make.fun/?ref=gbg9q3ye&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
