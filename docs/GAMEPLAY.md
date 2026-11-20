# Gameplay guide

Everything in this guide comes from [`src/game.js`](../src/game.js). The game runs at a fixed **60 updates per second**, so "frames" below are 1/60 s.

## Rules

- **Best of 3 rounds**: the first fighter to win 2 rounds takes the match.
- **60-second timer** per round. At time-up, the fighter with the higher **percentage** of health left wins (draws are possible).
- **K.O.** when health hits 0, with a slow-motion finish. Winning without taking damage scores a **PERFECT**.
- Super meter carries over between rounds; health resets.

## Modes

| Mode | Description |
|---|---|
| **Arcade** (1P) | Pick a fighter and beat 6 random rivals in a row. CPU difficulty rises each match (level `0.12 + 0.18 × match`, capped at 0.9). Lose and you can retry the same match. Clear all 6 for the champion ending. |
| **Versus** (2P) | Two players share one keyboard. Each picks a fighter; the stage is random. |
| **CPU vs CPU** | Watch two random AI fighters (difficulty 0.6). Returns to the title when the match ends. |

## Controls

| Action | Player 1 | Player 2 | Touch |
|---|---|---|---|
| Move | `A` / `D` | `←` / `→` | `<` `>` |
| Jump | `W` | `↑` | `^` |
| Guard | `S` or hold back | `↓` or hold back | `GRD` |
| Punch | `F` | `J` | `P` |
| Kick | `G` | `K` | `K` |
| Special | `H` | `L` | `SP` |
| Special 2 | `S` + `H` | `↓` + `L` | `GRD` + `SP` |
| Dash / backdash | tap `D` twice / `A` twice | tap `→` twice / `←` twice | double-tap `>` / `<` |
| Throw (up close) | toward + `F` | toward + `J` | `>` + `P` |
| Super | `R` | `I` | `SUP` |
| Pause | `Esc` / `P` | | `II` |
| Mute | `M` | | |

In Arcade, both key sets control Player 1. Menus accept `W/S/↑/↓` + `Enter/Space/F/J`, mouse clicks and taps.

## Core moves (all fighters)

| Move | Startup → active | Total | Damage | Notes |
|---|---|---|---|---|
| **Punch** | 6 → 6–10 | 22 | fighter's punch value (6–8) | Steps forward slightly. On hit, can be cancelled during frames 11–21. |
| **Punch chain** | | | | Punch → Punch → **Punch** turns the third hit into a launcher kick (+2 damage, launches the rival). |
| **Kick cancel** | | | | Kick after a landed punch for a heavy follow-up. |
| **Kick** | 9 → 9–15 | 32 | fighter's kick value (10–12) | Heavy hit, long knockback. |
| **Air kick** | jump, then Punch/Kick | until landing | kick − 1 | Hits from frame 3 of the air attack. |
| **Jump** | | | | Launch speed 16.5, gravity 0.9 per frame; keeps your walking direction. |
| **Guard** | hold down or back | | | Blocks ground attacks. You take 12% chip damage, which can never K.O. you. |
| **Special** | fires on frame 16 | 40 (Big Bao 52, Zara 50) | see roster | 78-frame cooldown. |
| **Special 2** | Down + Special | varies | see roster | 90-frame cooldown, separate from Special. |
| **Dash** | double-tap toward | 16 | | Fast forward burst. |
| **Backdash** | double-tap away | 18 | | Invincible for the first 8 frames. |
| **Throw** | toward + Punch, up close | 24 (whiff 32) | 12 | **Cannot be guarded.** Can't grab airborne, knocked-down or invincible rivals. |
| **Super** | needs a full meter | 62 | 30-ish | 48-frame cinematic freeze; invincible for 52 frames; effect fires on frame 12. |

### Hits, combos and recovery

- **Hit-stop**: the game freezes for 4–12 frames on impact, longer on heavy hits.
- **Combo scaling**: each extra hit in a combo does 10% less damage, down to a floor of 45%.
- **Juggles**: any hit on an airborne fighter knocks them down. Launchers send them higher.
- **Knockdown**: a downed fighter lies for 32 frames after landing, then gets up with 42 frames of invincibility.
- **Hitstun** lasts 16–56 frames by attack; **blockstun** is 55% of the hitstun with 70% of the knockback.

### Super meter

| Event | Attacker gains | Defender gains |
|---|---|---|
| Hit lands | 1.1 × damage | 0.75 × damage |
| Hit is blocked | 0.5 × damage | 0.4 × damage |
| Super hits | 0 | 0.75 × damage |

When the meter reaches 100 the bar flashes **SUPER READY!** and shows the super's name.

## Roster and move list

| Fighter | HP | Walk speed | Punch / Kick |
|---|---|---|---|
| Rex Ironreps (Fitness) | 112 | 4.3 | 7 / 11 |
| Kira Framerate (Gaming) | 96 | 5.5 | 6 / 10 |
| Big Bao (Mukbang) | 136 | 3.8 | 8 / 12 |
| Dev Gadget (Tech reviews) | 100 | 4.9 | 6 / 10 |
| Lady Contour (Beauty) | 96 | 5.1 | 6 / 11 |
| Wanda Lust (Travel vlogs) | 102 | 4.8 | 7 / 10 |
| Max Hustle (Finance) | 110 | 4.4 | 7 / 11 |
| Luna Whisper (ASMR) | 92 | 5.6 | 5 / 9 |
| Big Mic (Podcasts) | 130 | 3.7 | 8 / 11 |
| Jax Jolt (Pranks) | 98 | 5.2 | 6 / 10 |
| Zara Steps (Dance) | 94 | 5.8 | 6 / 10 |
| Sage Bloom (Wellness) | 104 | 4.6 | 6 / 10 |

### Specials

| Fighter | Special | Behaviour | Damage |
|---|---|---|---|
| Rex | **Protein Shot** | Spinning shaker bottle, speed 11.5 | 11 |
| Kira | **Pixel Blast** | Fast pixel projectile, speed 15, pixel trail | 9 |
| Big Bao | **Chili Breath** | Fire stream for ~0.5 s, range 335; hits every 9 frames | 5.2 per hit |
| Dev | **Phone Laser** | Instant beam across the whole screen | 9 |
| Lady Contour | **Lipstick Missile** | Slow, accelerating **homing** rocket | 11 |
| Wanda | **Flash!** | Screen flash, range 400, long **stun** (56 frames) | 5 |
| Max | **Stonks Arrow** | Green arrow that rises as it flies, speed 11 | 10 |
| Luna | **Whisper Wave** | Slow ripple (speed 6.5) with a long stun (52 frames) | 4 |
| Big Mic | **Hot Take** | Expanding sound wave, range ~460 | 9 |
| Jax | **Whoopee Mine** | Hidden trap placed ahead; arms after 18 frames, launches on contact (1 at a time) | 10 |
| Zara | **Trend Spin** | Spinning dash forward, up to 3 hits | 3 × 4 |
| Sage | **Chakra Palm** | Spinning lotus projectile, speed 10 | 10 |

### Second specials (Down + Special)

| Fighter | Special 2 | Behaviour | Damage |
|---|---|---|---|
| Rex | **Pre-Workout Rush** | Charging shoulder dash | 12 |
| Kira | **Lag Spike** | Teleports behind the rival, then strikes | 8 |
| Big Bao | **Snack Break** | Eats for half a second, healing 12 HP (punishable) | heal 12 |
| Dev | **Unboxing** | Lobs a package that explodes on landing or contact | 12 |
| Lady Contour | **Contour Counter** | Counter stance (frames 4–30): any attack, even a projectile, triggers a launching counter | 14 |
| Wanda | **Pole Vault** | Vaults over the rival with a diving kick (crosses up) | 12 |
| Max | **Make It Rain** | Three coins at low, mid and high height | 3 × 5 |
| Luna | **Mic Tap** | Point-blank tap with a 44-frame stun | 7 |
| Big Mic | **Mic Drop** | Close-range slam that launches | 12 |
| Jax | **Fake Out** | Blinks 170 px forward, invincible | — |
| Zara | **Moonwalk** | Invincible backward slide | — |
| Sage | **Deep Breath** | Heals 10 HP and gains 15 meter | heal 10 |

### Supers

| Fighter | Super | Behaviour | Damage |
|---|---|---|---|
| Rex | **Leg Day** | Ground slam shockwave, range 560, launches grounded rivals | 30 |
| Kira | **Rage Quit** | 3 lightning bolts that lock onto the rival's position, then strike | 3 × 11 |
| Big Bao | **Noodle Tsunami** | Giant noodle wave that crosses the stage and launches | 30 |
| Dev | **Drone Strike** | Drone follows the rival and drops 4 bombs | 4 × 9 |
| Lady Contour | **Glitter Storm** | Screen-wide glitter storm for 84 frames, range 660 | ~8 × 4.2 |
| Wanda | **First Class** | A jet flies in from off-screen behind her | 30 |
| Max | **Market Crash** | A giant red arrow locks on and crashes down | 30 |
| Luna | **Tingle Trance** | Unblockable: the rival falls asleep (130-frame stun) | 14 + free combo |
| Big Mic | **3-Hour Episode** | Speech-bubble barrage for 96 frames | ~8 × 3.9 |
| Jax | **It's Just a Prank** | A giant cake drops on the rival | 30 |
| Zara | **Viral Challenge** | Disco spotlights, 6 hits | 6 × 5 |
| Sage | **Inner Peace** | Heals 20 HP, lotus shockwave that launches, range 600 | 24 |

Projectile supers (wave, jet) pass through after their first hit; small projectiles vanish on contact.

## CPU opponent

The AI re-decides every `5 + random × (17 − 11 × level)` frames, so higher levels react faster. Each decision:

1. **Threat check**: if the rival is attacking within 310 px, or a projectile is within 280 px, retreat with probability `0.28 + 0.55 × level`.
2. **Super**: with a full meter and the rival within 620 px, fire it (probability `0.3 + 0.4 × level`).
3. **Combos**: after a landed punch, continue the chain (probability `0.45 + 0.45 × level`).
4. **Second specials**: heals when hurt and far away, Contour's counter when the rival attacks up close, the Moonwalk to escape, rushdowns at mid range.
5. **Throws**: when the rival is guarding up close (probability `0.25 + 0.5 × level`).
6. **Dashes**: closes long distances with a dash.
7. **Spacing**: in punch range it mostly punches or kicks; in kick range it kicks, specials or closes in; at long range it walks in or zones with its special. Range-limited specials (Chili Breath, Flash!) are only used when they can reach.
