# 苍穹战机 (Sky Dominator) - Game Design Document

## 1. Title + Pitch
**苍穹战机 (Sky Dominator)** - A fast-paced 3D arcade flight combat game where you pilot a sleek fighter through endless waves of enemy aircraft in a vibrant neon sky arena.

## 2. Core Gameplay Loop
- Spawn in arena with full health and ammo
- Engage incoming enemy waves using dodge + fire mechanics
- Collect power-up orbs dropped by destroyed enemies
- Complete wave within time limit to advance
- Spend points between waves on weapon upgrades
- Repeat with increasing difficulty until game over

## 3. Controls Concept
- **Pitch/Roll**: Mouse drag up/down/left/right or WASD
- **Throttle**: Auto (no manual control needed)
- **Fire**: Auto-fire enabled (hold to burst mode)
- **Boost**: Spacebar - temporary speed burst, drains energy
- **Brake**: Shift - quick deceleration for tight turns
- **Special Weapon**: Q key - charged shot after collecting power-ups

## 4. Objectives & Win/Lose Conditions
- **Endless Mode**: Survive as many waves as possible (primary mode)
- **Wave System**: 20 waves total, each with unique enemy compositions
- **Win**: Clear all 20 waves with any health remaining
- **Lose**: Health reaches zero or time expires on final wave
- **High Score**: Leaderboard based on survival time + enemies destroyed

## 5. Enemy Roster
- **Interceptor (Basic)**: Zigzag pattern, moderate speed, spawns in groups of 3
- **Bomber (Tank)**: Slow but high HP, releases smaller drones, fires spread shots
- **Dart (Sniper)**: Long-range attacks, telegraphs fire with red laser sight
- **Acrobat (Dodge)**: Unpredictable movement patterns, low HP but hard to hit
- **Carrier (Boss)**: Spawns 4 sub-enemies, moves slowly, vulnerable core weak point

## 6. Player Abilities & Progression
- **Starting Loadout**: Dual machine guns, basic health pack
- **Weapon Upgrades**: Machine gun → spread shot → laser beam → plasma cannon
- **Power-ups**: 
  - Health restore (green orb)
  - Fire rate boost (yellow orb)
  - Shield (blue orb, blocks 1 hit)
  - Multi-shot (red orb, +2-4 additional projectiles)
- **Between Waves**: Choose 1 of 3 random upgrades (weapon, shield, speed)

## 7. Scoring & Rewards
- **Base Score**: 100 points per enemy (scaled by type)
- **Streak Multiplier**: +10% per consecutive kill without taking damage (max 3x)
- **Headshot Bonus**: +50% for destroying enemies in 1 shot
- **Time Bonus**: Remaining time × 10 points per wave
- **Risk-Reward**: Destroy enemies in tight formations for combo bonuses, but higher collision risk

## 8. Level/World Concept
- **Arena**: Endless procedurally generated canyon with floating rock formations
- **Sky**: Dynamic gradient from deep blue to vibrant orange (day/night cycle)
- **Landmarks**: Distant mountain silhouettes, floating ruins, energy fields
- **Atmosphere**: Speed lines, motion blur, volumetric lighting effects
- **Feel**: Open but constrained - wide open spaces for dodging, narrow passages for tension

## 9. Visual Style Guide
- **Palette**: Neon cyan, electric magenta, bright yellow against dark navy/black backgrounds
- **Silhouettes**: Sharp angular planes (player) vs. organic blob shapes (enemies)
- **VFX**: Trailing particle streams, screen shake on explosions, flash on hits
- **UI Readability**: Minimal HUD - health bar (left), score (top-right), wave counter (top-center)
- **Colors**: Player = cyan/white, Allies = green, Enemies = red/orange, Power-ups = distinct colors

## 10. "Fun Factor" Hooks
- **Speed vs. Precision**: Boost for quick escapes but risk overheating; balanced combat rewards skill
- **Combo System**: Chain kills without taking damage for escalating multipliers and screen-filling VFX
- **Risk-Reward Patterns**: High-value targets cluster in dangerous zones with heavy fire
- **Progression Satisfaction**: Clear visual upgrade path from basic guns to screen-clearing plasma cannons
- **Flow State**: Tight controls, instant respawn (3s), no loading between waves maintains momentum

---

**Word Count**: ~480 words  
**Feasibility**: All elements achievable with simple 3D geometry (cubes, cones, spheres) and procedural colors/particles