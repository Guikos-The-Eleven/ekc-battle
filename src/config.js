// ─── CONFIG ──────────────────────────────────────────────────────────────────
//import newLogoImg from "./assets/KOMP_logo_full-removebg-preview.png";
//const LOGO = newLogoImg;

import logo1 from "./assets/KOMP logo/KOMP_logo_full_corte_vermelho.png"
import logo2 from "./assets/KOMP logo/KOMP_logo_full_2x2_corte_vermelho.png"
import logo3 from "./assets/KOMP logo/KOMP_logo_solo_corte_vermelho.png"

const LOGOS = [logo1, logo2, logo3];

const LOGO = LOGOS[0];

const BKO_BANNER = "data:image/webp;base64,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";
// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg:"#0b0b0c", surface:"#121214", border:"#1f1f23", divider:"#19191c",
  white:"#fafafa", text:"#f3f3f3", sub:"#b8b8c0", muted:"#888894",
  green:"#3ddc84", red:"#ff4d4f", yellow:"#f4c430", orange:"#ff7a18", blue:"#4da3ff",
  amber:"#e8b04a", copper:"#c47a4e", slate:"#8b9eb0",
  violet:"#b49cff", pink:"#f472b6", teal:"#4eeacd",
  shreak_skin:"#d3ff33", traffic_cone:"#ff5b22", bratz_purple:"#dbb8ff", internet_blue:"#3939ff", carebare_fuzz:"#aee6ed",
  blue1:"#5e60ce", blue2:"#4ea8de", blue3:"#48bfe3", blue4:"#64dfdf",
  orange2:"#ea7317", yellow2:"#fec601", tile2:"#73bfb8", sea_blue2:"#3da5d9", dark_blue2:"#086788",
  // NOVAS CORES NEON PARA OS MODOS DE JOGO
  cyan: "#00F0FF", lime: "#CCFF00", magenta: "#FF0099", molten: "#FF5F00",
};
const BB = "'Bebas Neue', sans-serif";
const BC = "'Barlow Condensed', sans-serif";
const R  = "2px";

// ─── TRICK LISTS ────────────────────────────────────────────────────────────
const AM_TRICKS = [
  "Around USA","Airplane, J Stick, Poop, Inward J Stick","Spike, Double Whirlwind",
  "Inward Lunar, Monkey Tap, Monkey Tap In","One Turn Lighthouse Insta Trade Spike",
  "Big Cup, Nod On Bird, Over The Valley, Nod Off Small Cup, Trade Airplane",
  "Stuntplane Fasthand Penguin Catch","Pull Up Triple Kenflip Small Cup, Spike",
  "One Turn Lighthouse, 0.5 Stilt, 0.5 Lighthouse, Falling In","Airplane, Double Inward J Stick",
  "Big Cup, Inward Turntable, Spike","Swing Candlestick 0.5 Flip Spike","Spike, Juggle Spike",
  "Ghost Lighthouse, Stuntplane","Big Cup, Kneebounce Orbit Big Cup, Spike",
  "Switch Pull Up Spike, Earthturn","Spacewalk Airplane","Stuntplane, Inward Stuntplane Flip",
  "Slinger Spike","Hanging Spike",
];
const OPEN_REGULAR = [
  "Around The Ken, Trade Downspike","Spike, Trade Sara Grip Downspike Fasthand Kengrip",
  "Stuntplane, Inward Stuntplane Flip Fasthand","Pull Up Kenflip Big Cup, Kenflip Spike",
  "Spike, Triple Inward Whirlwind","Hanging Inward 0.5 Candlestick, Trade Inward 0.5 Flip Spike",
  "One Turn Tap Insta Lighthouse Flip Insta Inward Lighthouse Flip Tap Lighthouse, Trade Spike",
  "Around Stalls, Flex Spike","Big Cup, Trade Axe, In","Spacewalk One Turn Tap In",
  "One Turn Lunar, Armbounce Lunar, 0.5 Swap Spike","Pull Up Muscle Spike","Spike, 123 Slinger",
  "One Turn Airplane, Airplane, Inward One Turn Airplane","Gooncircle Big Cup, Nod On Bird, Spike",
];
const OPEN_TOP16 = [
  "Airplane, Quad Tap In","Around Sara Grip Handlestall",
  "Pull Up Speed Up Tap Stilt, Speed Up Spike Tap In",
  "Lighthouse, Two Turn Armbounce Insta Two Turn Lighthouse, In",
  "Pull Up Triple Kenflip Ghost Juggle Late Triple Kenflip Spike",
  "Airplane, Trip J Stick Penguin Airplane",
  "Handlestall, One Turn Trade Lighthouse Insta One Turn Swap Handlestall, Trade In",
  "One Turn Finger Balance Lighthouse, Inward Finger Balance Lighthouse Flip, Inward One Turn Swap Spike",
  "One Turn Cush Stuntplane Fasthand, Kenflip Toss Cush Stuntplane Fasthand",
  "Spacewalk One Turn Swap Penguin Spike Fasthand Ken Grip",
  "Lighthouse, Triple Lighthouse Flip Insta Triple Lighthouse Flip, Trade Spike",
  "Switch Swing Spike, Juggle Spike","Lunar, Tre Flip Insta Backflip, In",
  "C-Whip, One Turn Lighthouse Insta One Turn Stuntplane Fasthand",
  "Big Cup, Trade Three Turn Inward Lighthouse, Trade Downspike",
];

// ─── BKO TRICK LIST ─────────────────────────────────────────────────────────
const BKO_OPEN = [
  "Opposite Hand Pull Up Bird Turn In",
  "Airplane Cush In, J Stick Cush In",
  "Darkside UFO One Turn Lighthouse Insta Jug Spike",
  "Inward Axe Over The Valley, Falling In Fasthand Downspike",
  "Down Fast, J Stick Trade Down Fast",
  "Two Turn Lunar, Two Turn Lunar Flip, In",
  "Hanging Start To Stunt Fasthand",
  "Penguin Airplane, Penguin J Stick",
  "Scooping Goldfish Trade Downspike",
  "Inward Lunar, 360 Rover, One Turn Trade Spike",
  "Whirlwind Late Ken",
  "Airplane, 1.5 Late Ken 1.5 In",
  "Spacewalk Tap Stuntplane",
  "Two Tap Toss One Tap Trade Spike",
  "Swing Inward Stilt, Dub Flip To Regular Stilt, Swap Spike",
  "Around Stalls 2.0",
  "Swing Tap Inward Lunar, Flip Tap Inward Lunar, Flip Tap In",
];

// Optional info for tricks that need extra explanation (shown via ⓘ button)
const TRICK_INFO = {
  "Around Stalls 2.0": "Small Cup to Big Wing, Big Cup to Underbird, Base Cup to Slip Stall — In",
};

// ─── COMPETITIONS ────────────────────────────────────────────────────────────
const COMPS = [
  {
    key:"ekc_2026", name:"EKC 2026", full:"European Kendama Championship",
    location:"Utrecht, NL · May 22–23",
    ig:{ href:"https://instagram.com/eukendamachamp", label:"eukendamachamp" },
    divisions:[
      { key:"am_open", name:"AM OPEN", badge:"20 TRICKS", tricks:AM_TRICKS },
      { key:"open", name:"PRO OPEN", badge:"15+ TRICKS", trickSets:[
        { key:"regular", label:"REGULAR", sub:"15 tricks", tricks:OPEN_REGULAR },
        { key:"top16",   label:"TOP 16",  sub:"15 tricks", tricks:OPEN_TOP16 },
        { key:"mix",     label:"MIX",     sub:"all 30",    tricks:[...OPEN_REGULAR,...OPEN_TOP16] },
      ]},
    ],
  },
  {
    key:"bko_2026", name:"BKO 2026", full:"British Kendama Open",
    location:"Cardiff, UK · May 2",
    ig:{ href:"https://instagram.com/britishkendamaopen", label:"britishkendamaopen" },
    banner:BKO_BANNER,
    divisions:[
      { key:"open", name:"OPEN", badge:"17 TRICKS", tricks:BKO_OPEN },
    ],
  },
];

// ─── CPU CONFIG ──────────────────────────────────────────────────────────────
const CPU_CFG = {
  easy:   { base:0.35, label:"ROOKIE",  color:C.green,  thinkMs:[1400,2200] },
  medium: { base:0.58, label:"AMATEUR", color:C.yellow, thinkMs:[1200,1800] },
  hard:   { base:0.80, label:"PRO",     color:C.red,    thinkMs:[900,1500]  },
};

// Haptic feedback helper (mobile vibration)
const haptic = (ms=12) => { try { navigator?.vibrate?.(ms); } catch {} };

// CPU opponent names for tournament
const CPU_NAMES = [
  "SPIKE LORD","KEN MASTER","LUNAR KING","STALL QUEEN","DAMA BOSS",
  "TRICK SAGE","CUP WIZARD","FLIP NINJA","BIRD HAWK","SWAP DEMON",
  "ORBIT ACE","GRIP FURY","LACE GOD","PULL PHANTOM","EARTH WALKER",
];

// ─── MODE COLORS (for InfoOverlay accents) ──────────────────────────────────
const MODE_COLORS = { cpu:C.blue, drill:C.amber, tournament:C.copper, "2p":C.slate };
// ─── TRICK HELPERS ──────────────────────────────────────────────────────────
const getTricksForDiv = (div, listKey) => {
  if (!div) return AM_TRICKS;
  if (div.tricks) return div.tricks;
  if (div.trickSets) {
    const set = div.trickSets.find(s => s.key === listKey);
    return set ? set.tricks : div.trickSets[0].tricks;
  }
  return [];
};

// ─── GLOBAL STYLES (side-effect on import — must run before first render) ───
if (typeof document !== "undefined") {
  if (!document.getElementById("ekc-fonts")) {
    const s = document.createElement("style");
    s.id = "ekc-fonts";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600&display=swap');`;
    document.head.appendChild(s);
  }
  if (!document.getElementById("ekc-kf")) {
    const s = document.createElement("style");
    s.id = "ekc-kf";
    s.textContent = `
      @keyframes rise  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pop   { from{opacity:0;transform:scale(0.84)} 55%{transform:scale(1.06)} to{opacity:1;transform:scale(1)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @keyframes glow  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.72;transform:scale(1.015)} }
      @keyframes scorePulse { 0%{transform:scale(1)} 30%{transform:scale(1.18)} 100%{transform:scale(1)} }
      @keyframes flash { 0%{opacity:0.15} 100%{opacity:0} }
      @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes champGlow { 0%,100%{text-shadow:0 0 30px #f4c43030,0 0 60px #f4c43010} 50%{text-shadow:0 0 40px #f4c43050,0 0 80px #f4c43020} }
      @keyframes champLine { from{width:0} to{width:60px} }
      @keyframes champScale { from{opacity:0;transform:scale(0.6)} 50%{transform:scale(1.08)} to{opacity:1;transform:scale(1)} }
      @keyframes champFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      .rise { animation: rise 0.3s ease both }
      .pop  { animation: pop  0.38s cubic-bezier(0.34,1.56,0.64,1) both }
      .pls  { animation: pulse 1.4s ease-in-out infinite }
      .glow { animation: glow  1.1s ease-in-out infinite }
      .scorePulse { animation: scorePulse 0.4s cubic-bezier(0.34,1.56,0.64,1) }
      .slideIn { animation: slideIn 0.35s ease both }
      .fadeUp { animation: fadeUp 0.4s ease both }
      .tap:active { transform:scale(0.96); opacity:0.82; }
      button:disabled { opacity:0.35; cursor:not-allowed; pointer-events:none; }
      button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
        outline:2px solid #4da3ff; outline-offset:2px;
      }
      input::placeholder { color:#52525a; }
      input:focus { border-color:#3a3a42 !important; outline:none; }
      textarea:focus { border-color:#3a3a42 !important; outline:none; }
      textarea::placeholder { color:#52525a; }
      * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; margin:0; padding:0; }
      html, body { height:100%; overflow:hidden; overscroll-behavior:none; background:#0b0b0c; }
      body::after {
        content:''; position:fixed; inset:-50px; pointer-events:none; z-index:9999; opacity:0.07;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
        background-repeat:repeat;
      }
      #root { height:100%; }
    `;
    document.head.appendChild(s);
  }
}

export { LOGOS, LOGO, C, BB, BC, R, AM_TRICKS, OPEN_REGULAR, OPEN_TOP16, BKO_OPEN, COMPS, CPU_CFG, haptic, CPU_NAMES, getTricksForDiv, MODE_COLORS, TRICK_INFO };
