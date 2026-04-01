// ─── CONFIG ──────────────────────────────────────────────────────────────────
const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6gMYCio6DfYHqAAAKhlJREFUeNrt3Xl8VdW1wPF1hwTMREICJIBFGUQmiQIOgIpitBChihVaJQhYxTqhqLF+6lOKohisOEFVKihVEOUPFRAEMVpr1VCcQKjUFBAJiRogQCDDOXe/P8JqTqmMyb3n3Jvf95/2pb7cffaNa+299nBEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDq+NxuAPBTfD6fz/mf5gC32wWgHgkErvP7/X7fASIioQMO/ucCgUAgFAqFSCSAN5BA4BpNGgcnC5/P52vevHnzlJSUlDZt2rSprKys3LZt27aqqqqqQCAQsG3bdrvtAEggcIlzxnHqqaeempmZmdmlS5cu3bt3796rV69enTp16pScnJyclpaWVlVVVfXDDz/88MYbb7yRn5+fv3///v1utx8A4AKfz+cLBAIBEZEZM2bMMMYYLU0dimVZljHGjBs3bpyISHx8fLzbzwEAiDBNHgUFBQXGGGMfUHuAZVmWbdu2JpVQKBSqra2tNcaYf//73//u0KFDBxGRYDAYdPtZAAARokE/Pz8/3xhjamtra480+1C2bduaRPr3799fpD4ZAQBimAb7ESNGjNCy1NEmD2cS0V1aWs4iiQBADNMF84yMjIwtW7Zscc4ojpWuh1RXV1efeeaZZ4qQRAAgZmnp6r777rvPGGNqampqjid5HJxEvvjiiy+SkpKSROqTFAAgRmhgb968efMNGzZsaMjsw0kX1p944oknRFhUB4CYo+WlAQMGDDDmyFt2j3VNxBhjLrroootESCJAJPndbgBin85AzjrrrLNERMJxknzWrFmzWrVq1cqyLItSFhAZJBCEnTF1d1f16dOnj0jjrlX4/X6/bdt2ly5dusyaNWuW/sztZwYANAJNGB999NFHzgXwxqS/84477rhDRCQuLi7O7ecGADSAJo+kpKSkb7/99tvGWkA/1HqIbdt2bm5urgjrIQAQ1bSc1LFjx45VVVVVjb2I/lML6mVlZWVdu3btKsL5EACIWhrAzz///PPDmTyUlrI+++yzz1q2bNlShDURIFz4FwsR0aJFixYidS+LCufnBAKBgGVZVnZ2dvb8+fPnkzyA8OFfLkSEJpBICAaDwdra2tpLLrnkkocffvjhUCgUopQFAFFGF7KnTJkyxZj60+ORoGsil1566aUirIeEk74g7ODXE/sc3G4jgCijQXvhwoULnWsUkUwgW7Zs2dKmTZs2ItyX1RD6IrBAIBDQZBEMBoOHSszOvna+RAwAjkgDSFxcXNxXX331lTOoR4rOeF566aWXRNjaezx+KvgfnIjj4uLi0tPT03v27NkzKysrS8/hJCYmJrZs2bKl/t8kkdjCaAxh4/f7/aFQKNSvX79+RUVFRW61w7IsKxgMBq+99tpr58yZMycYDAYty7Lc7h8v06ShCV9EJDMzM/NnP/vZzy644IIL8vLy8kpKSko2bty4sX379u27devWrVWrVq1SUlJS9u/fv3/btm3bysvLy9u3b98+JSUlZfv27dsffvjhh//yl7/8RX+v288IwMN0tP/kk08+6ZwNRJoGwR07duzgfMiRaYlKpC6RtGjRosU999xzz+7du3c39DvIz8/P189w+zkBeJQGoHbt2rUrLy8vNyb8Z0AOR9deCgsLCzVAsh7y33w+n0+TfmJiYmJ+fn5+UVFR0Q8//PCD9mMoFArpO+sty7IO9Q57/d/15/rPGmPMqFGjRolwPgfAIegIc/LkyZOdAdxN2obHHnvsMWcbURfMndfur127dq0mA+27hg4ANIEsXbp0qX6m288NwGN0ZJ+cnJy8adOmTc5A5DZNIhMmTJggQhJx9kHz5s2bP/roo49quUlnF4313WnfL1y4cKHzcwHgPzQw5OTk5BgT+Z1XhxM6oLq6ulrfT9KUR8JasuratWvXNWvWrNFAH47vTGcgt912223OzwaA/9DAMG7cuHHOwOEVOhJetWrVKpGmeTbEud4xfPjw4Tt37typ31U4ZovOUlj37t27izTtxA3gEDQw3XPPPfd4MYFoQKutra3t2bNnT5GmFcwCgUBAn/eWW265RctU4Vyn0hnN119//XV8fHy8SNNM3LGmyfxLg8hLSEhIcLsNhxIKhULBYDB42mmnnSbSdIJZMBgM2rZtJyUlJT377LPPPvnkk0+K1L01MpxrEsbUnSVZu3bt2pqamppAIBDQnyF6kUAQNvv379/vdhsORYNXU0kgWrKyLMvq1atXr9WrV6++/vrrr7csy/IfEM7PdyYQbY/bfYKGI4EgbGpqamrcbsOhaADr169fPxGRWD4ZrQnCsixrzJgxYz788MMPTznllFP0hH4kgrl+xtdff/21SH1CQXQjgSBsKioqKtxuw6HoiDs7Ozs7MzMz0xhjYnFUHAwGg/oOlpkzZ8588cUXX0xMTEzUEl6k2qHlseLi4mIREkisIIEgbLw+A7Ft227ZsmXL88477zyR2FpI11tzLcuy0tPT05ctW7bsxhtvvLG2trZWb9KNVFs0WVRWVlZu3759u9t9g8YTM//CwHu8HpA1sA0fPny4221pLM5LEH0+n2/kyJEjV69evTonJyfHsiwrLi4uLtIzLe3n0tLS0vLy8nLnzwDgv2i54pJLLrnEuYXTa/RsQllZWVmrVq1aiUT34q7z2vUhQ4YM+fzzzz/X53TzO9DtwUuWLFki4v2BBQAXaYDo1atXL69cYXKk4JaXl5cnEr3Xa+jLnUREpk+fPt2Y/7740M0+1s8fOnTo0GjuYwARoKP4lJSUlJKSkhINZm4ni58SzaNj3ZrrvH592rRp04ypv8fKK/27fPny5c6/DQA4JA3Eq1atWuUMJF6jie2HH374ISMjI0MkOoLcwWc3WrVq1erpp59+2pjwXUdyPPR7Hz169GgRZh8AjoKWUwoKCgo0qLkdzA5FSywXXnjhhSLeD3LavmbNmjUbPXr06CVLlixx3mXldn8qTWIlJSUl6enp6SLRkZxx9LgNE2H1zTfffON2G44kFAqF/H6///LLL7/83Xfffdft9hyOnibv3bt377lz5849/fTTTzem7gyLbdu2l264ra2trY2Pj4+fN2/evPLy8nJeJQzgqGggmzBhwgSvjYwPpjOQLVu2bElJSUkR8d5I2efz+eLi4uJERHJzc3MrKysrtV+9VLJSWrr69NNPP01LS0vzYp8C8ChNIOPHjx+vgc7toHY0Ae+qq666SsRbZSzn9tzf/va3v62pqalxttlrtF2vvPLKK8nJycn6DG73I4AooQu8ffv27et2QDuWoKclLK/sxnIulj/++OOPa1vd3pp7KDpQWLNmzRpNel7pSwBRQkeciYmJiVu2bNlijHcPFDrZtm336dOnj4j7gc+ZPGbPnj3bGGNqampqvFauUpqE9+3bt2/YsGHDRHjrIIDjpMFvyZIlS5wBxqt09FxQUFAg4m4ZSz87KSkp6fXXX3/d2T4v0sHBtm3btvXt27ev8/sHgGOmo88HHnjgAa8HQGPqt51u27Ztm5tXm2i/dezYseOnn376qdf7TpPHzp07d+rsjZlH08AIAWG3YcOGDSLeX0jVa89t27bdeu2qbnU966yzznr//fffP/3000+vra2t9XJANqbuYsTx48ePX7NmzZq4uLg4tusCaBAtYfTs2bOn18tX2r6ysrKy7OzsbGf7I0WTxMUXX3zxnj179jjb5VU6M5o+ffp05zMAQIPo6D0QCAS++OKLL4zx5kK6BumKioqKs88++2xtcyT7Sc94jB8/frxt27ZehOh23xyObideuXLlSr2Py+uzTABRREekU6dOnWqM92r5GqR37969+9xzzz3X2eZIcO60ys/PzzemLsl6MdE66ff4+eeff966devW+ixu/70BiCEaVHr06NFj//79+43xzs28mjzKy8vL3Uoeekhw5syZMzUwe6V/DsWZPLKysrKc3zMANCotBy1YsGCBM3B7IQhu2rRp02mnnXaaSGSTh35Wampq6ltvvfWWtsnLySMUCoW03z744IMPdObBugeAsNEEMnDgwIEa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";

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
  "Big Cup, Nod On Bird, Over The Valley, Nod Off Mall Cup, Trade Airplane",
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
    key:"wko_2026", name:"WKO 2026", full:"World Kendama Open",
    location:"Tokyo, JP · Aug 15–17",
    soon:true,
    divisions:[
      { key:"am_open", name:"AM OPEN", badge:"COMING SOON", tricks:AM_TRICKS },
      { key:"open", name:"PRO OPEN", badge:"COMING SOON", trickSets:[
        { key:"regular", label:"REGULAR", sub:"15 tricks", tricks:OPEN_REGULAR },
        { key:"top16",   label:"TOP 16",  sub:"15 tricks", tricks:OPEN_TOP16 },
        { key:"mix",     label:"MIX",     sub:"all 30",    tricks:[...OPEN_REGULAR,...OPEN_TOP16] },
      ]},
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

export { LOGO, C, BB, BC, R, AM_TRICKS, OPEN_REGULAR, OPEN_TOP16, COMPS, CPU_CFG, haptic, CPU_NAMES, getTricksForDiv, MODE_COLORS };
