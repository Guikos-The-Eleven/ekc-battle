# EKC Battle Simulator — Project Briefing
> Paste this entire document at the start of a new conversation to continue development.

---

## What We Built
A mobile-first React PWA (Progressive Web App) battle simulator for the **European Kendama Championship 2026** (Utrecht, Netherlands, May 22–23). Players train against a CPU or in 2-player mode using the official EKC trick lists. It has user authentication and stats tracking via Supabase.

---

## Tech Stack
- **Frontend**: React + Vite (v6), single file `src/App.jsx` (~1000 lines)
- **Auth + DB**: Supabase (free tier)
- **Deployment**: Vercel (auto-deploys on git push)
- **Repo**: `https://github.com/Guikos-The-Eleven/ekc-battle`
- **Live URL**: `ekc-battle-git-main-guikos-the-elevens-projects.vercel.app`
- **Local path**: `C:\Users\guiko\ekc\ekc-battle`

---

## Design System (DO NOT CHANGE)
```js
const C = {
  bg:"#0b0b0c", surface:"#121214", border:"#1f1f23", divider:"#19191c",
  white:"#fafafa", text:"#f3f3f3", sub:"#b8b8c0", muted:"#888894",
  green:"#3ddc84", red:"#ff4d4f", yellow:"#f4c430", orange:"#ff7a18", blue:"#4da3ff",
};
const BB = "'Bebas Neue', sans-serif";   // display font
const BC = "'Barlow Condensed', sans-serif"; // body font
const R  = "2px"; // border radius — sharp corners everywhere
```
- Fonts loaded via Google Fonts
- Background: pure black `#0b0b0c`
- Style: editorial black, sharp corners (R=2px), left-border accents (3px), no rounded cards
- Grain noise texture at opacity 0.07
- Logo: official EKC white transparent PNG embedded as base64, `mix-blend-mode:screen`

---

## Supabase Config
```
URL:  https://oqirbcoylhmzigyfsxmt.supabase.co
KEY:  sb_publishable_HRxgS1WFQNvWP7jQ0est6w_iLdt4SJr
```

### Database Schema
```sql
profiles (
  id uuid PK → auth.users,
  username text unique,
  created_at timestamp
)

match_results (
  id uuid PK,
  user_id uuid → profiles,
  competition text,     -- "am_open" | "open"
  difficulty text,      -- "easy" | "medium" | "hard"
  race_to int,
  won boolean,
  your_score int,
  cpu_score int,
  created_at timestamp
)

trick_attempts (
  id uuid PK,
  user_id uuid → profiles,
  trick text,
  landed boolean,
  competition text,
  created_at timestamp
)
```

### RLS Policies (must be set in Supabase SQL Editor)
```sql
drop policy if exists "Users see own attempts" on trick_attempts;
drop policy if exists "Users see own matches" on match_results;
drop policy if exists "Users see own profile" on profiles;

create policy "profiles_all" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "matches_all" on match_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attempts_all" on trick_attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## App Structure / Screens

### Auth Screen (no user logged in)
- Email + password login/signup
- Tab switcher: LOG IN / SIGN UP
- On signup: creates profile with username
- On login: fetches profile, upserts if missing (fallback to email prefix)

### Pick Screen (`screen:"pick"`)
- Top bar: `username · STATS →` (left) + `LOG OUT` (right)
- Large EKC logo (300×300, mix-blend-mode:screen)
- Event tagline: "EUROPEAN KENDAMA CHAMPIONSHIP · MAY 22–23 · UTRECHT, NL"
- Two flat row buttons: AM OPEN / PRO OPEN → goes to settings

### Settings Screen (`screen:"settings"`)
- Division header (AM OPEN or PRO OPEN)
- Seg controls:
  - Trick List (Pro Open only): REGULAR / TOP 16 / MIX
  - Game Mode: CPU / 2 PLAYER
  - CPU Difficulty (CPU only): ROOKIE (~48%) / AMATEUR (~68%) / PRO (~87%)
  - CPU Streaks (CPU only): ON / OFF
  - Race To: 3 / 5
- START BATTLE button

### Battle Screen (`screen:"battle"`)
**ScoreBar** — always visible at top:
- Scores with coloured progress dashes (green=you, red=CPU)
- Streak dot under CPU score (pulsing orange HOT or blue COLD dot)

**CPU mode phases:**
- `reveal` → trick name (40px, left-border accent) + who goes first pill → 2s auto-advance
- `p_first` → LAND (green, 120px tall) / MISS (ghost, 120px tall) side by side
- `cpu_first` → CPU label + animated dots
- `p_second` → CPU result as hero text (LANDED/MISSED 64px) + LAND/MISS buttons (100px)
- `cpu_resp` → YOUR result as hero text + CPU dots
- `tie` → "BOTH LANDED" or "BOTH MISSED" + "TRY X OF 3"
- `point` → "YOU SCORED" (green) or "CPU SCORED" (red) at 52px
- `null` → "TRICK NULLED" → next trick

**2P mode phases:**
- `2p_reveal` → trick + who goes first → 2.2s auto-advance
- `2p_score` → trick + who goes first + P1 SCORED / P2 SCORED / NULL buttons
- `2p_point` → "P1 SCORED" or "P2 SCORED"

**MenuBack footer**: `← MENU` (left) + `EKC '26 · AM OPEN · UTRECHT` (right)

### Result Screen (`screen:"result"`)
- Win/lose label + big outcome text
- Final score (large numbers)
- PLAY AGAIN / VIEW STATS → / ← MAIN MENU

### Stats Screen (`screen:"stats"`)
**Structure**: Header → Division switcher (AM OPEN / PRO OPEN) → Tab switcher (RECORD / TRICKS)

**Record tab**:
- Big W / L numbers
- Win rate bar
- Per-difficulty breakdown (coloured dot + ROOKIE/AMATEUR/PRO + W L %)

**Tricks tab**:
- Sorted worst-first
- Split into "Needs Work" (<50%, red label) and "Solid" (≥50%, green label)
- Each row: trick name + attempts count + % + coloured bar

---

## Game Logic

### Trick Lists
- `AM_TRICKS`: 20 tricks (AM Open division)
- `OPEN_REGULAR`: 15 tricks (Pro Open regular)
- `OPEN_TOP16`: 15 tricks (Pro Open top 16)
- Mix mode: all 30 combined
- Pool-based drawing (no repeats until pool exhausted, then reshuffles)

### CPU Difficulty
```js
easy:   { base: 0.48 }  // ROOKIE
medium: { base: 0.68 }  // AMATEUR
hard:   { base: 0.87 }  // PRO
```

### Streak Logic (event-driven, NOT tick-based)
```js
// HOT streak: starts when CPU scores (20% chance), ends IMMEDIATELY when player scores
// COLD streak: starts when player scores (22% chance), only if CPU was NOT hot, lasts 2-3 tricks
// Ties/nulls: hot persists, cold ticks down

const applyStreak = (streak, pointWinner, streaksOn) => {
  if (!streaksOn) return { active:false, dir:"hot", left:0 };
  if (pointWinner==="cpu") {
    if (streak.active && streak.dir==="hot") return streak; // keep hot
    return Math.random()<0.20 ? { active:true, dir:"hot", left:0 } : { active:false, dir:"hot", left:0 };
  }
  if (pointWinner==="you") {
    if (streak.active && streak.dir==="hot") return { active:false, dir:"hot", left:0 }; // kill hot
    if (!streak.active)
      return Math.random()<0.22 ? { active:true, dir:"cold", left:2+Math.floor(Math.random()*2) } : { active:false, dir:"hot", left:0 };
    return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
  }
  // null/tie: tick cold down, hot persists
  if (streak.active && streak.dir==="cold")
    return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
  return streak;
};

// Streak effect on roll
// HOT: +12% (capped at 88%)
// COLD: -18% (floored at 12%)
```

### Try System
- Up to 3 tries per trick
- Point scored when outcomes differ (one lands, one misses)
- If both land or both miss → tie → next try
- After 3 ties → null → next trick

### Who Goes First
- Alternates each trick (`playerFirst: !state.playerFirst`)
- Shown on reveal screen and persists on 2P scoring screen

---

## UI Atoms (shared components)
- `Label` — small uppercase category text (BC, 11px, C.sub, fontWeight:600)
- `Div` — 1px horizontal divider (C.divider)
- `BtnPrimary` — off-white fill (#d4d4d4), BB font, sharp corners
- `BtnGhost` — transparent with border, BB font
- `Seg` — segment control with selected state (tinted bg + coloured border)
- `TryDots` — three 32×3px horizontal bars (white/sub/border)
- `StreakDot` — pulsing dot + HOT/COLD label
- `BackBtn` — muted BB text button
- `Dots` — animated pulsing dots (CPU thinking indicator)
- `NOISE` — fixed grain texture overlay

---

## Animations (CSS keyframes)
```css
rise  — fade in + slide up (used on screen transitions)
pop   — scale in with overshoot (used on point/result screens)
pulse — opacity pulse (used on StreakDot, CPU dots)
glow  — gentle scale pulse
tap   — scale(0.96) + opacity on :active
```

---

## PWA Status (IN PROGRESS)
The app is being converted to a PWA so it installs as a native app on phones.

**Problem**: `vite-plugin-pwa` doesn't support Vite 6. Solution: manual PWA without the plugin.

**Files needed in project** (already generated, just need to be placed):
- `public/manifest.json` — app manifest
- `public/sw.js` — service worker for offline cache
- `public/icon-192.png` — app icon (EKC logo on black bg)
- `public/icon-512.png` — app icon large
- `index.html` — updated with PWA meta tags + SW registration
- `vite.config.js` — simplified (no PWA plugin needed)

**Steps remaining**:
1. `npm uninstall vite-plugin-pwa`
2. Place the 6 files above
3. `git add . && git commit -m "add PWA" && git push`
4. On phone: open Vercel link → Share → "Add to Home Screen" (iPhone) or Chrome banner (Android)

---

## Deployment Workflow
```bash
# After any change to App.jsx:
git add src/App.jsx
git commit -m "description of change"
git push
# Vercel auto-deploys in ~30 seconds
```

---

## Known Issues / Recent Fixes
- RLS policies were blocking all writes — fixed with `with check` clause
- Username was showing email — fixed by upsert on login
- Streak was too aggressive (25% trigger, too high boost) — rebalanced
- Viewport was cutting off settings on mobile — fixed with `100dvh` + internal scroll
- vite-plugin-pwa incompatible with Vite 6 — workaround with manual PWA

---

## What's Working
✅ Auth (login/signup/logout/session restore)
✅ CPU battle mode with full phase flow
✅ 2-player mode
✅ Streak system (hot/cold, event-driven)
✅ Stats tracking to Supabase (trick attempts + match results)
✅ Stats screen with tabs (Record/Tricks) + division switcher
✅ Mobile viewport (no scroll bleed, internal page scroll)
✅ EKC brand design (Bebas Neue + Barlow Condensed, black, grain, sharp)

## What's In Progress
🔄 PWA conversion (files ready, need to be placed in project)

## Potential Next Steps
- PWA completion + testing on real phone
- More trick stats insights (streak of consecutive lands, personal bests)
- Share/export stats
- Multiple user leaderboard (currently private only)
