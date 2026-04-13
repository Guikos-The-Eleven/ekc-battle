# KOMP — Design System Reference

---

## Typography

### Fonts (Google Fonts)
| Role | Font | Weight | Import |
|------|------|--------|--------|
| **Display** (headings, buttons, labels) | Bebas Neue | 400 | `family=Bebas+Neue` |
| **Body** (text, descriptions, metadata) | Barlow Condensed | 400, 600 | `family=Barlow+Condensed:wght@400;600` |

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600&display=swap');
```

### Font Variables
```js
const BB = "'Bebas Neue', sans-serif";   // display / headings / buttons
const BC = "'Barlow Condensed', sans-serif"; // body / labels / metadata
```

### Typical Sizes
| Element | Font | Size | Letter-Spacing | Weight |
|---------|------|------|----------------|--------|
| App title "KOMP" | BB | 46px | — | 400 |
| Section headers | BB | 24px | 5px | 400 |
| Button (primary) | BB | 24px | 5px | 400 |
| Button (ghost) | BB | 20px | 5px | 400 |
| Segmented control | BB | 17px | 4px | 400 |
| Back button | BB | 13px | 5px | 400 |
| Label / category | BC | 13px | 1.5px | 600 |
| Body text | BC | 12–14px | 1–3px | 400/600 |
| Sub-label (seg control) | BB | 10px | 2px | 400 |
| Streak indicator | BC | 12px | 3px | 600 |

---

## Color Palette

### Core Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0b0b0c` | Page background |
| `surface` | `#121214` | Card / panel backgrounds |
| `border` | `#1f1f23` | Borders, dividers |
| `divider` | `#19191c` | Subtle horizontal rules |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `white` | `#fafafa` | Primary headings, active text |
| `text` | `#f3f3f3` | Body text |
| `sub` | `#b8b8c0` | Secondary text, labels |
| `muted` | `#888894` | Tertiary text, ghost buttons |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `green` | `#3ddc84` | Player 1, LAND, wins, Battle mode |
| `red` | `#ff4d4f` | CPU opponent, MISS, losses |
| `yellow` | `#f4c430` | Drill mode, Amateur difficulty, champion glow |
| `orange` | `#ff7a18` | Player 2 (2P mode), Tournament mode, HOT streak |
| `blue` | `#4da3ff` | Focus outlines, COLD streak, CPU mode accent |

### Extended Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `amber` | `#e8b04a` | Drill mode accent (InfoOverlay) |
| `copper` | `#c47a4e` | Tournament mode accent (InfoOverlay) |
| `slate` | `#8b9eb0` | 2P mode accent (InfoOverlay) |
| `violet` | `#b49cff` | Decorative |
| `pink` | `#f472b6` | Decorative |
| `teal` | `#4eeacd` | Decorative |

### Neon / Feature Colors
| Token | Hex |
|-------|-----|
| `cyan` | `#00F0FF` |
| `lime` | `#CCFF00` |
| `magenta` | `#FF0099` |
| `molten` | `#FF5F00` |

### Specialty Colors
| Token | Hex |
|-------|-----|
| `shreak_skin` | `#d3ff33` |
| `traffic_cone` | `#ff5b22` |
| `bratz_purple` | `#dbb8ff` |
| `internet_blue` | `#3939ff` |
| `carebare_fuzz` | `#aee6ed` |

### Blue Gradient Set
`#5e60ce` → `#4ea8de` → `#48bfe3` → `#64dfdf`

### Warm Gradient Set
`#ea7317` → `#fec601` (orange to yellow)

### Cool Set
`#73bfb8` → `#3da5d9` → `#086788` (teal to dark blue)

---

## Spacing & Layout

### Border Radius
```js
const R = "2px"; // Sharp corners everywhere — editorial aesthetic
```

### Left-Border Accents
- Cards and sections use a **3px left border** for color accents
- Color matches the mode or context (green for battle, yellow for drill, etc.)

### Safe Area Padding
All screens respect device safe areas (notch, home indicator).

### Common Spacing
| Element | Value |
|---------|-------|
| Card padding | `18–20px` |
| Section margin-bottom | `22px` |
| Button padding (primary) | `18px 20px` |
| Button padding (ghost) | `16px 24px` |
| Back button margin-bottom | `24px` |
| Gap between segments | `8px` |

---

## Texture & Effects

### Grain Noise Overlay
```css
body::after {
  content: '';
  position: fixed;
  inset: -50px;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.07;
  background-image: url("data:image/svg+xml,...feTurbulence fractalNoise baseFrequency=0.8 numOctaves=4...");
  background-repeat: repeat;
}
```
Subtle film-grain texture at 7% opacity over the entire UI.

### Global Resets
```css
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; overscroll-behavior: none; background: #0b0b0c; }
```

---

## Animations

| Class | Keyframes | Duration | Easing | Use |
|-------|-----------|----------|--------|-----|
| `.rise` | translateY(18px→0), opacity 0→1 | 0.3s | ease | Entry animation for cards/sections |
| `.pop` | scale(0.84→1.06→1), opacity 0→1 | 0.38s | cubic-bezier(0.34,1.56,0.64,1) | Score reveals, emphasis |
| `.pls` | opacity 1→0.3→1 | 1.4s infinite | ease-in-out | Pulsing indicators (streak) |
| `.glow` | opacity+scale oscillation | 1.1s infinite | ease-in-out | Glowing elements |
| `.scorePulse` | scale(1→1.18→1) | 0.4s | cubic-bezier(0.34,1.56,0.64,1) | Score update |
| `.slideIn` | translateX(-12px→0), opacity 0→1 | 0.35s | ease | Horizontal slide entry |
| `.fadeUp` | translateY(10px→0), opacity 0→1 | 0.4s | ease | Fade-up entry |
| `.tap:active` | scale(0.96), opacity 0.82 | instant | — | Touch feedback |

### Champion Animations (Tournament)
| Keyframes | Description |
|-----------|-------------|
| `champGlow` | Yellow text-shadow pulsing |
| `champLine` | Width 0→60px decorative line |
| `champScale` | scale(0.6→1.08→1) with fade |
| `champFade` | translateY(12px→0) with fade |

---

## Component Patterns

### Primary Button (`BtnPrimary`)
- Full width, `#fafafa` background, `#0b0b0c` text
- Bebas Neue 24px, letter-spacing 5px
- 2px border-radius
- Disabled: `#555` background, 35% opacity

### Ghost Button (`BtnGhost`)
- Full width, transparent background
- 1px border (color parameterized, default `#888894`)
- Bebas Neue 20px, letter-spacing 5px

### Segmented Control (`Seg`)
- Flex row with 8px gap
- Selected: tinted background (`color + "22"`), colored border
- Unselected: transparent, `#1f1f23` border
- Bebas Neue 17px

### Label
- Barlow Condensed 13px, letter-spacing 1.5px, `#b8b8c0`, weight 600

### Divider
- 1px height, `#19191c` background, `aria-hidden`

### Back Button
- Transparent, Bebas Neue 13px, letter-spacing 5px, `#888894`
- Text: "← BACK"

---

## Accessibility

- `focus-visible`: 2px solid `#4da3ff`, offset 2px
- `aria-label` on all interactive elements
- `aria-checked` + `role="radio"` on segmented controls
- `role="status"` on loading indicators
- Semantic `<fieldset>/<legend>`, `<nav>`, `<hr>`
- `button:disabled`: opacity 0.35, cursor not-allowed, pointer-events none

---

## Mode Color Mapping

| Mode | Accent Color | Hex |
|------|-------------|-----|
| CPU (Battle) | Blue | `#4da3ff` |
| Drill | Amber | `#e8b04a` |
| Tournament | Copper | `#c47a4e` |
| 2 Player | Slate | `#8b9eb0` |

### Player Colors (2P Mode)
| Player | Color | Hex |
|--------|-------|-----|
| P1 | Green | `#3ddc84` |
| P2 | Orange | `#ff7a18` |

### Difficulty Colors
| Level | Label | Color | Hex |
|-------|-------|-------|-----|
| Easy | ROOKIE | Green | `#3ddc84` |
| Medium | AMATEUR | Yellow | `#f4c430` |
| Hard | PRO | Red | `#ff4d4f` |

### Streak Colors
| State | Color | Hex |
|-------|-------|-----|
| HOT | Orange | `#ff7a18` |
| COLD | Blue | `#4da3ff` |

---

## Input Fields

```css
input::placeholder { color: #52525a; }
input:focus { border-color: #3a3a42 !important; outline: none; }
textarea::placeholder { color: #52525a; }
textarea:focus { border-color: #3a3a42 !important; outline: none; }
```

---

## Logo

- **kendamanxs** white X brush-style logo
- Embedded as base64 PNG in `const LOGO`
- Home screen display: 140px width
- App name "KOMP" in Bebas Neue 46px below logo
- Subtitle: "KENDAMA COMPETITION TRAINER" in Barlow Condensed

---

## Design Principles

1. **Pure black** background — editorial, premium feel
2. **Sharp corners** — 2px border-radius everywhere, no rounded pill shapes
3. **Left-border accents** — 3px colored borders on cards for mode/context identification
4. **Grain texture** — subtle noise overlay for analog warmth
5. **Minimal color** — dark UI with precise accent hits
6. **Typography-driven** — Bebas Neue display + Barlow Condensed body creates editorial hierarchy
7. **Touch-first** — `.tap:active` feedback, haptic vibration, large hit targets (120px LAND/MISS buttons)
