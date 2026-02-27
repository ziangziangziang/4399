Build a small browser game inspired by the popular ad-style runner:

GAME (do not change)
- A straight runner track.
- The squad (soldiers) auto-runs forward along +Z at constant speed.
- The player controls only lateral movement along X (left/right within bounds).
- Ahead are paired “math gates” the squad must pass through. Each gate applies an operation to squad size:
  +N, -N, ×K, ÷K (integer division, floor).
- Zombie waves/clusters approach the squad. Collisions reduce squad size deterministically based on zombie strength.
- Win if the squad reaches the finish with soldierCount > 0. Lose if soldierCount reaches 0 at any time.
- Keep it readable and “ad-like”: clear gates, clear outcomes, fast decisions.

RENDERING / TECH (must not change)
- Use Three.js and prefer WebGPU rendering when available.
- Automatically fall back to WebGL if WebGPU is unavailable.
- Use primitives / simple generated meshes (no purchased assets).
- Performance: use instancing (InstancedMesh) for soldiers and zombies; avoid per-entity meshes.

DETERMINISTIC REPLAY (for testing and consistency)
- Implement a seeded RNG (e.g., mulberry32/xorshift). Do not use Math.random() in simulation logic.
- All procedural content must come from the seed:
  - gate placements, ops, values
  - zombie wave timing, positions, counts, strengths
- Use a fixed timestep simulation (e.g., 60Hz). Rendering FPS must not affect outcomes.
- Provide save/load of the full simulation state so runs can be reproduced exactly:
  RNG state, tick, distance, score, soldierCount, squadX, and all active entities (gates/zombies).

GAMEPLAY LOGIC SPEC
1) World + motion
- Clamp squad center X within track bounds.
- Squad advances forward at constant speed every sim tick.
- Third-person follow camera that keeps upcoming gates readable.

2) Squad
- soldierCount is an integer >= 0 (optionally cap at maxSoldiers for stability).
- Visualize soldiers as a formation around squad center (grid/rows) that updates as count changes.
- Lateral movement should be smooth (steer toward a target X, not teleport).

3) Gates
- Spawn gates in pairs (left/right) at intervals along Z.
- Each gate has {op, value} with sane ranges (avoid extreme spikes).
- When the squad passes through a gate, apply exactly one operation and clamp:
  soldierCount = max(0, result) (and optionally min(maxSoldiers, ...)).
- Record debug info about the chosen gate and before/after soldierCount.

4) Zombies
- Spawn zombie clusters ahead; each cluster has count and strength (deterministic).
- Zombies should feel like they’re coming toward the squad (your movement model choice, but keep that feel).
- Collision resolution must be explicit and deterministic. Example rule (or define your own clearly):
  On overlap:
    soldiersLost = min(soldierCount, cluster.strength)
    soldierCount -= soldiersLost
    cluster.strength -= soldiersLost
    if cluster.strength <= 0 -> remove cluster and count as defeated

5) Scoring
- Keep a simple visible score: distance + zombies defeated + finish bonus.

CONTROLS + UI
- Manual controls: keyboard (A/D or Left/Right). Optional mouse/touch drag maps to lateral target.
- HUD overlay: soldierCount, distance, score, seed, tick (optional FPS).
- Buttons: restart, set seed, toggle manual vs “bot control”, select bot, run/stop bot.

BOT CONTROL INTERFACE (do not call it a benchmark; it’s just an autopilot/testing interface)
Expose an Environment-like interface so a bot can control the squad:
- reset(seed?: number) -> observation
- step(action) -> { observation, reward, done, info }
- getObservation() -> observation
- serializeState() -> string
- loadState(state: string) -> void
- setManualControl(enabled: boolean) -> void

Action:
- Continuous: { xTarget: number } where xTarget is normalized in [-1, +1] mapped to track bounds.

Observation (pure JSON; small but sufficient):
- tick, seed
- soldierCount
- squadX (world), speed, distanceTraveled, remainingDistance
- next gate pair info (left/right ops/values and positions)
- nearest upcoming zombie clusters (positions, strengths; limit to a small fixed number like 3)

Optional reward (for bots; keep deterministic):
reward = (deltaDistance * 0.01) + (zombiesDefeatedThisStep * 1.0) - (soldiersLostThisStep * 0.2)
terminal: +20 win, -20 lose

BOT EXAMPLES (must include)
- RandomBot: random xTarget (optionally held for N ticks).
- GreedyGateBot: steers toward the gate that maximizes immediate expected soldierCount, optionally penalizing routes likely to hit the nearest zombie cluster before the gate.

GRAPHICS (you may use an image generator tool)
- You may generate small textures for gate panels / UI icons.
- Keep assets lightweight; visuals must not affect determinism.

AVOID
- No heavy physics engine.
- No non-deterministic time-based randomness.
- No external services.

FINAL DELIVERABLES
1) Complete playable game runnable in Chrome.
2) All source code files you create (HTML/CSS/JS) and any generated image assets you choose to include.
3) A short README explaining:
   - how to open/run it in Chrome
   - how to use manual controls
   - how to enable bot control and switch bots
   - how to reproduce a run using a seed and saved state

Output format:
- Brief architecture overview (1–2 paragraphs)
