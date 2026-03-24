# NXS Battle Trainer — Project Briefing
> Paste this entire document at the start of a new conversation to continue development.

---

## What We're Building
A mobile-first React PWA battle simulator for **competitive kendama events**. Players train against a CPU or in 2-player mode using official trick lists from real competitions. The app is partnered with **kendamanxs** (brand name: NXS).

**Key change from previous version:** This was previously an EKC-specific app. We are rebranding it to be a **multi-competition platform** where users can choose from different competitions, each with their own divisions and trick lists. The first competition available is EKC 2026, but more will be added.

---

## Tech Stack
- **Frontend**: React + Vite (v6), single file `src/App.jsx` (~1200 lines)
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
- Grain noise texture applied globally via `body::after` pseudo-element at opacity 0.07
- Logo: kendamanxs white X logo embedded as base64, `mix-blend-mode:screen`
- Safe area padding: `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` on all screens

---

## Brand: kendamanxs (NXS)
- **Logo**: White X mark on transparent background (brush/hand-drawn style)
- Already embedded as base64 in `const LOGO` in App.jsx
- New PWA icons (icon-192.png, icon-512.png) have been generated with the X logo on black `#0b0b0c` background
- App name references should say "NXS BATTLE" or "KENDAMA NXS"

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
  competition text,     -- now uses "comp_key:division_key" format e.g. "ekc_2026:am_open"
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
  competition text,     -- same format as match_results
  created_at timestamp
)
```

### RLS Policies
```sql
create policy "profiles_all" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "matches_all" on match_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attempts_all" on trick_attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## Competition Data Structure (NEW)
```js
const COMPS = [
  {
    key:"ekc_2026", name:"EKC 2026", full:"European Kendama Championship",
    location:"Utrecht, NL · May 22–23",
    divisions:[
      { key:"am_open", name:"AM OPEN", badge:"20 TRICKS", tricks:AM_TRICKS },
      { key:"open", name:"PRO OPEN", badge:"15+ TRICKS", trickSets:[
        { key:"regular", label:"REGULAR", sub:"15 tricks", tricks:OPEN_REGULAR },
        { key:"top16",   label:"TOP 16",  sub:"15 tricks", tricks:OPEN_TOP16 },
        { key:"mix",     label:"MIX",     sub:"all 30",    tricks:[...OPEN_REGULAR,...OPEN_TOP16] },
      ]},
    ],
  },
  // More competitions can be added here later
];
```

This structure is already in the codebase but the screens haven't been updated to use it yet.

---

## App Flow (NEW — needs implementation)

### 1. Splash / Auth Gate
- On load, check for existing Supabase session
- If logged in → go to Home screen
- If not logged in → show **Auth Screen** with guest option

### 2. Auth Screen
- Tab switcher: LOG IN / SIGN UP (already built)
- On signup: stores username in `user_metadata`, shows "CHECK YOUR EMAIL" confirmation (already built)
- On login: creates profile on first login from `user_metadata` (already built)
- **NEW: "CONTINUE AS GUEST" button** below the form → enters app without auth, stats won't save
- Guest state tracked via `isGuest` state variable (already added)

### 3. Home Screen (`screen:"home"`) — NEW, replaces old "pick" screen
- Top bar: username + STATS → (left), LOG OUT or SIGN UP (right, depending on guest/logged in)
- Large NXS X logo (centered, 250px)
- Tagline: "KENDAMA NXS · BATTLE TRAINER"
- **Competition list** from `COMPS` array:
  - Each comp is a row button showing: name (large, left) + location info (small, right)
  - e.g. `EKC 2026` left, `UTRECHT · MAY 22–23 →` right
  - Tapping a comp → goes to Division screen

### 4. Division Screen (`screen:"division"`) — NEW
- Back button ← HOME
- Comp name as header (e.g. "EKC 2026")
- Comp subtitle (e.g. "European Kendama Championship")
- List of divisions from `selectedComp.divisions`:
  - Each division is a row: name (large, left) + badge (small, right)
  - e.g. `AM OPEN` left, `20 TRICKS →` right
- Tapping a division → goes to Settings screen

### 5. Settings Screen (`screen:"settings"`)
- Same as before but adapted:
  - Header shows: Division name + Comp name subtitle
  - If division has `trickSets` (like PRO OPEN), show Trick List Seg control
  - If division has just `tricks`, skip Trick List control
  - Game Mode: CPU / 2 PLAYER
  - CPU Difficulty (CPU only): ROOKIE / AMATEUR / PRO
  - CPU Streaks (CPU only): ON / OFF
  - Race To: 3 / 5
  - START BATTLE button

### 6. Battle Screen — same as current
- All battle phases remain identical
- MenuBack footer shows: ← MENU (left) + "NXS BATTLE" (right)

### 7. Result Screen — same as current (with staggered animations)
- PLAY AGAIN / VIEW STATS → / ← MAIN MENU
- VIEW STATS should prompt auth if guest

### 8. Stats Screen — NEEDS UPDATE
- **If guest**: show a notification/prompt "Create an account to track your progress" with a button to go to auth
- **If logged in**: show stats filtered by `compDbKey` (the "comp_key:division_key" string)
- **NEW: Add "HISTORY" tab** alongside RECORD / TRICKS
  - Shows last 10 CPU matches for the current comp/division
  - Each row: W/L indicator + score (e.g. "3–1") + difficulty badge + date
  - Sorted newest first

---

## Current State Variables (in the partially-rebranded codebase)
```js
// Already added:
const [isGuest, setIsGuest] = useState(false);
const [screen, setScreen] = useState("home");
const [selectedComp, setSelectedComp] = useState(null);
const [selectedDiv, setSelectedDiv] = useState(null);
const compDbKey = selectedComp && selectedDiv ? `${selectedComp.key}:${selectedDiv.key}` : null;

// Already updated:
// - enterAsGuest() function exists
// - saveTrickAttempt uses compDbKeyRef
// - saveMatchResult uses compDbKeyRef
// - Both skip saving if user is null (guest)
```

---

## What STILL NEEDS to be done (in order of priority)

### 1. Update `allTricks()` function
Currently still references old `comp` variable. Needs to use `selectedDiv`:
```js
const allTricks = () => {
  if (!selectedDiv) return [];
  if (selectedDiv.tricks) return selectedDiv.tricks;
  if (selectedDiv.trickSets) {
    const set = selectedDiv.trickSets.find(s => s.key === openList);
    return set ? set.tricks : selectedDiv.trickSets[0].tricks;
  }
  return [];
};
```

### 2. Update Auth Screen
- Add `onGuest` prop and "CONTINUE AS GUEST" button
- Wire it up: `if (!user && !isGuest) return <AuthScreen onAuth={...} onGuest={enterAsGuest}/>;`

### 3. Build Home Screen (replaces old "pick" screen)
- Delete the old `screen==="pick"` block
- Build new Home screen using `COMPS` data
- Top bar should adapt: guests see "SIGN UP" instead of "LOG OUT", clicking STATS as guest shows auth prompt

### 4. Build Division Screen
- New screen: list divisions for `selectedComp`
- Each division row → sets `selectedDiv` and goes to settings

### 5. Update Settings Screen
- Replace old `comp` references with `selectedComp` / `selectedDiv`
- Trick List Seg only shows if `selectedDiv.trickSets` exists
- Back button goes to division screen
- Header shows division + comp info

### 6. Update Stats Screen
- Accept `compDbKey` as filter (or a comp/division picker)
- Add guest auth prompt
- Add HISTORY tab with last 10 matches

### 7. Fix remaining old variable references
- Remove old `comp` / `setComp` state
- Replace any remaining `compRef` with `compDbKeyRef`
- Remove old "AM OPEN" / "PRO OPEN" hardcoded pick screen

---

## Game Logic (unchanged)

### Trick Lists
- `AM_TRICKS`: 20 tricks
- `OPEN_REGULAR`: 15 tricks
- `OPEN_TOP16`: 15 tricks
- Mix mode: all 30 combined
- Pool-based drawing (no repeats until pool exhausted, then reshuffles)

### CPU Difficulty
```js
easy:   { base: 0.48, thinkMs:[1400,2200] }  // ROOKIE
medium: { base: 0.68, thinkMs:[1200,1800] }  // AMATEUR
hard:   { base: 0.87, thinkMs:[900,1500]  }  // PRO
```

### CPU Intelligence (NEW — already in code)
- **Momentum**: tracks last 6 CPU outcomes, regresses if landing too much, boosts if missing
- **Comeback**: CPU gets +5% when behind by 2+, -4% when ahead by 2+
- **Clutch**: at match point, CPU rates adjust (desperate boost when player at match point)
- **Variable think time**: randomized per difficulty tier (feels less robotic)

### Streak Logic
```js
// HOT streak: starts when CPU scores (20% chance), ends IMMEDIATELY when player scores
// COLD streak: starts when player scores (22% chance), only if CPU was NOT hot, lasts 2-3 tricks
// HOT: +12% (capped at 88%) / COLD: -18% (floored at 12%)
```

### Try System
- Up to 3 tries per trick
- Point scored when outcomes differ
- After 3 ties → null → next trick

---

## Animations (CSS keyframes — all working)
```
rise     — fade in + slide up
pop      — scale in with overshoot
pulse    — opacity pulse
glow     — gentle scale pulse
scorePulse — bounce on score change
flash    — color flash on point/result
slideIn  — slide from left (trick reveal)
fadeUp   — fade up (staggered elements)
```

### Visual Effects (all working)
- Score pulse animation when scores change
- Flash overlays (green/red) on points and match end
- Staggered result screen animations
- Match point indicators in ScoreBar
- Glow effects on progress dashes, streak dots, text
- MISS button has subtle red tint
- LAND button has green glow shadow
- Haptic feedback via `navigator.vibrate()`
- Variable trick name font size (smaller for long names)
- Colored first-turn indicator (green=you, red=cpu)

---

## PWA Status
- Manual PWA (no vite-plugin-pwa)
- Files in `public/`: `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`
- `index.html` has PWA meta tags + SW registration
- **NEW icons generated** with NXS X logo (need to replace old EKC icons)
- `manifest.json` needs name updated from "EKC Battle Simulator" to "NXS Battle"

---

## Files to Update for Full Rebrand
1. `src/App.jsx` — main app (partially done, see "STILL NEEDS" section above)
2. `public/manifest.json` — update name/short_name to "NXS Battle"
3. `public/icon-192.png` — replace with NXS icon (already generated)
4. `public/icon-512.png` — replace with NXS icon (already generated)
5. `index.html` — update title from "EKC Battle" to "NXS Battle", update apple-mobile-web-app-title

---

## Deployment Workflow
```bash
git add .
git commit -m "description"
git push
# Vercel auto-deploys in ~30 seconds
```
