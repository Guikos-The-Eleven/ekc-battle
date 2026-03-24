import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAABAGlDQ1BpY2MAABiVY2BgPMEABCwGDAy5eSVFQe5OChGRUQrsDxgYgRAMEpOLCxhwA6Cqb9cgai/r4lGHC3CmpBYnA+kPQKxSBLQcaKQIkC2SDmFrgNhJELYNiF1eUlACZAeA2EUhQc5AdgqQrZGOxE5CYicXFIHU9wDZNrk5pckIdzPwpOaFBgNpDiCWYShmCGJwZ3AC+R+iJH8RA4PFVwYG5gkIsaSZDAzbWxkYJG4hxFQWMDDwtzAwbDuPEEOESUFiUSJYiAWImdLSGBg+LWdg4I1kYBC+wMDAFQ0LCBxuUwC7zZ0hHwjTGXIYUoEingx5DMkMekCWEYMBgyGDGQCm1j8/yRb+6wAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6gMYCio6DfYHqAAAKhlJREFUeNrt3Xl8VdW1wPF1hwTMREICJIBFGUQmiQIOgIpitBChihVaJQhYxTqhqLF+6lOKohisOEFVKihVEOUPFRAEMVpr1VCcQKjUFBAJiRogQCDDOXe/P8JqTqmMyb3n3Jvf95/2pb7cffaNa+299nBEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDq+NxuAPBTfD6fz/mf5gC32wWgHgkErvP7/X7fASIioQMO/ucCgUAgFAqFSCSAN5BA4BpNGgcnC5/P52vevHnzlJSUlDZt2rSprKys3LZt27aqqqqqQCAQsG3bdrvtAEggcIlzxnHqqaeempmZmdmlS5cu3bt3796rV69enTp16pScnJyclpaWVlVVVfXDDz/88MYbb7yRn5+fv3///v1utx8A4AKfz+cLBAIBEZEZM2bMMMYYLU0dimVZljHGjBs3bpyISHx8fLzbzwEAiDBNHgUFBQXGGGMfUHuAZVmWbdu2JpVQKBSqra2tNcaYf//73//u0KFDBxGRYDAYdPtZAAARokE/Pz8/3xhjamtra480+1C2bduaRPr3799fpD4ZAQBimAb7ESNGjNCy1NEmD2cS0V1aWs4iiQBADNMF84yMjIwtW7Zscc4ojpWuh1RXV1efeeaZZ4qQRAAgZmnp6r777rvPGGNqampqjid5HJxEvvjiiy+SkpKSROqTFAAgRmhgb968efMNGzZsaMjsw0kX1p944oknRFhUB4CYo+WlAQMGDDDmyFt2j3VNxBhjLrroootESCJAJPndbgBin85AzjrrrLNERMJxknzWrFmzWrVq1cqyLItSFhAZJBCEnTF1d1f16dOnj0jjrlX4/X6/bdt2ly5dusyaNWuW/sztZwYANAJNGB999NFHzgXwxqS/84477rhDRCQuLi7O7ecGADSAJo+kpKSkb7/99tvGWkA/1HqIbdt2bm5urgjrIQAQ1bSc1LFjx45VVVVVjb2I/lML6mVlZWVdu3btKsL5EACIWhrAzz///PPDmTyUlrI+++yzz1q2bNlShDURIFz4FwsR0aJFixYidS+LCufnBAKBgGVZVnZ2dvb8+fPnkzyA8OFfLkSEJpBICAaDwdra2tpLLrnkkocffvjhUCgUopQFAFFGF7KnTJkyxZj60+ORoGsil1566aUirIeEk74g7ODXE/sc3G4jgCijQXvhwoULnWsUkUwgW7Zs2dKmTZs2ItyX1RD6IrBAIBDQZBEMBoOHSszOvna+RAwAjkgDSFxcXNxXX331lTOoR4rOeF566aWXRNjaezx+KvgfnIjj4uLi0tPT03v27NkzKysrS8/hJCYmJrZs2bKl/t8kkdjCaAxh4/f7/aFQKNSvX79+RUVFRW61w7IsKxgMBq+99tpr58yZMycYDAYty7Lc7h8v06ShCV9EJDMzM/NnP/vZzy644IIL8vLy8kpKSko2bty4sX379u27devWrVWrVq1SUlJS9u/fv3/btm3bysvLy9u3b98+JSUlZfv27dsffvjhh//yl7/8RX+v288IwMN0tP/kk08+6ZwNRJoGwR07duzgfMiRaYlKpC6RtGjRosU999xzz+7du3c39DvIz8/P189w+zkBeJQGoHbt2rUrLy8vNyb8Z0AOR9deCgsLCzVAsh7y33w+n0+TfmJiYmJ+fn5+UVFR0Q8//PCD9mMoFArpO+sty7IO9Q57/d/15/rPGmPMqFGjRolwPgfAIegIc/LkyZOdAdxN2obHHnvsMWcbURfMndfur127dq0mA+27hg4ANIEsXbp0qX6m288NwGN0ZJ+cnJy8adOmTc5A5DZNIhMmTJggQhJx9kHz5s2bP/roo49quUlnF4313WnfL1y4cKHzcwHgPzQw5OTk5BgT+Z1XhxM6oLq6ulrfT9KUR8JasuratWvXNWvWrNFAH47vTGcgt912223OzwaA/9DAMG7cuHHOwOEVOhJetWrVKpGmeTbEud4xfPjw4Tt37typ31U4ZovOUlj37t27izTtxA3gEDQw3XPPPfd4MYFoQKutra3t2bNnT5GmFcwCgUBAn/eWW265RctU4Vyn0hnN119//XV8fHy8SNNM3LGmyfxLg8hLSEhIcLsNhxIKhULBYDB42mmnnSbSdIJZMBgM2rZtJyUlJT377LPPPvnkk0+K1L01MpxrEsbUnSVZu3bt2pqamppAIBDQnyF6kUAQNvv379/vdhsORYNXU0kgWrKyLMvq1atXr9WrV6++/vrrr7csy/IfEM7PdyYQbY/bfYKGI4EgbGpqamrcbsOhaADr169fPxGRWD4ZrQnCsixrzJgxYz788MMPTznllFP0hH4kgrl+xtdff/21SH1CQXQjgSBsKioqKtxuw6HoiDs7Ozs7MzMz0xhjYnFUHAwGg/oOlpkzZ8588cUXX0xMTEzUEl6k2qHlseLi4mIREkisIIEgbLw+A7Ft227ZsmXL88477zyR2FpI11tzLcuy0tPT05ctW7bsxhtvvLG2trZWb9KNVFs0WVRWVlZu3759u9t9g8YTM//CwHu8HpA1sA0fPny4221pLM5LEH0+n2/kyJEjV69evTonJyfHsiwrLi4uLtIzLe3n0tLS0vLy8nLnzwDgv2i54pJLLrnEuYXTa/RsQllZWVmrVq1aiUT34q7z2vUhQ4YM+fzzzz/X53TzO9DtwUuWLFki4v2BBQAXaYDo1atXL69cYXKk4JaXl5cnEr3Xa+jLnUREpk+fPt2Y/7740M0+1s8fOnTo0GjuYwARoKP4lJSUlJKSkhINZm4ni58SzaNj3ZrrvH592rRp04ypv8fKK/27fPny5c6/DQA4JA3Eq1atWuUMJF6jie2HH374ISMjI0MkOoLcwWc3WrVq1erpp59+2pjwXUdyPPR7Hz169GgRZh8AjoKWUwoKCgo0qLkdzA5FSywXXnjhhSLeD3LavmbNmjUbPXr06CVLlixx3mXldn8qTWIlJSUl6enp6SLRkZxx9LgNE2H1zTfffON2G44kFAqF/H6///LLL7/83Xfffdft9hyOnibv3bt377lz5849/fTTTzem7gyLbdu2l264ra2trY2Pj4+fN2/evPLy8nJeJQzgqGggmzBhwgSvjYwPpjOQLVu2bElJSUkR8d5I2efz+eLi4uJERHJzc3MrKysrtV+9VLJSWrr69NNPP01LS0vzYp8C8ChNIOPHjx+vgc7toHY0Ae+qq666SsRbZSzn9tzf/va3v62pqalxttlrtF2vvPLKK8nJycn6DG73I4AooQu8ffv27et2QDuWoKclLK/sxnIulj/++OOPa1vd3pp7KDpQWLNmzRpNel7pSwBRQkeciYmJiVu2bNlijHcPFDrZtm336dOnj4j7gc+ZPGbPnj3bGGNqampqvFauUpqE9+3bt2/YsGHDRHjrIIDjpMFvyZIlS5wBxqt09FxQUFAg4m4ZSz87KSkp6fXXX3/d2T4v0sHBtm3btvXt27ev8/sHgGOmo88HHnjgAa8HQGPqt51u27Ztm5tXm2i/dezYseOnn376qdf7TpPHzp07d+rsjZlH08AIAWG3YcOGDSLeX0jVa89t27bdeu2qbnU966yzznr//fffP/3000+vra2t9XJANqbuYsTx48ePX7NmzZq4uLg4tusCaBAtYfTs2bOn18tX2r6ysrKy7OzsbGf7I0WTxMUXX3zxnj179jjb5VU6M5o+ffp05zMAQIPo6D0QCAS++OKLL4zx5kK6BumKioqKs88++2xtcyT7Sc94jB8/frxt27ZehOh23xyObideuXLlSr2Py+uzTABRREekU6dOnWqM92r5GqR37969+9xzzz3X2eZIcO60ys/PzzemLsl6MdE66ff4+eeff966devW+ixu/70BiCEaVHr06NFj//79+43xzs28mjzKy8vL3Uoeekhw5syZMzUwe6V/DsWZPLKysrKc3zMANCotBy1YsGCBM3B7IQhu2rRp02mnnXaaSGSTh35Wampq6ltvvfWWtsnLySMUCoW03z744IMPdObBugeAsNEEMnDgwIEa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";

const SB = createClient(
  "https://oqirbcoylhmzigyfsxmt.supabase.co",
  "sb_publishable_HRxgS1WFQNvWP7jQ0est6w_iLdt4SJr"
);

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg:"#0b0b0c", surface:"#121214", border:"#1f1f23", divider:"#19191c",
  white:"#fafafa", text:"#f3f3f3", sub:"#b8b8c0", muted:"#888894",
  green:"#3ddc84", red:"#ff4d4f", yellow:"#f4c430", orange:"#ff7a18", blue:"#4da3ff",
};
const BB = "'Bebas Neue', sans-serif";
const BC = "'Barlow Condensed', sans-serif";
const R  = "2px";

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
      button:disabled { opacity:0.4; cursor:not-allowed; }
      input::placeholder { color:#52525a; }
      input:focus { border-color:#3a3a42 !important; outline:none; }
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
    divisions:[
      { key:"am_open", name:"AM OPEN", badge:"20 TRICKS", tricks:AM_TRICKS },
      { key:"open", name:"PRO OPEN", badge:"15+ TRICKS", trickSets:[
        { key:"regular", label:"REGULAR", sub:"15 tricks", tricks:OPEN_REGULAR },
        { key:"top16",   label:"TOP 16",  sub:"15 tricks", tricks:OPEN_TOP16 },
        { key:"mix",     label:"MIX",     sub:"all 30",    tricks:[...OPEN_REGULAR,...OPEN_TOP16] },
      ]},
    ],
  },
];

// ─── CPU CONFIG ──────────────────────────────────────────────────────────────
const CPU_CFG = {
  easy:   { base:0.48, label:"ROOKIE",  color:C.green,  thinkMs:[1400,2200] },
  medium: { base:0.68, label:"AMATEUR", color:C.yellow, thinkMs:[1200,1800] },
  hard:   { base:0.87, label:"PRO",     color:C.red,    thinkMs:[900,1500]  },
};

// Haptic feedback helper (mobile vibration)
const haptic = (ms=12) => { try { navigator?.vibrate?.(ms); } catch {} };

// Momentum: recent results nudge CPU rate (last 4 outcomes tracked)
const applyMomentum = (rate, momentum=[]) => {
  if (momentum.length < 2) return rate;
  const recent = momentum.slice(-4);
  const landRate = recent.filter(Boolean).length / recent.length;
  const nudge = (landRate - 0.5) * -0.06;
  return Math.max(0.10, Math.min(0.92, rate + nudge));
};

// Comeback: score differential adjusts rate
const applyComeback = (rate, cpuScore, playerScore, raceTo) => {
  const diff = playerScore - cpuScore;
  if (diff >= 2) return Math.min(0.90, rate + 0.05);
  if (diff <= -2) return Math.max(0.15, rate - 0.04);
  return rate;
};

// Clutch: at match point, tension heightens
const applyClutch = (rate, cpuScore, playerScore, raceTo) => {
  const cpuMatchPoint = cpuScore === raceTo - 1;
  const playerMatchPoint = playerScore === raceTo - 1;
  if (cpuMatchPoint && playerMatchPoint) return rate + 0.03;
  if (playerMatchPoint) return rate + 0.04;
  if (cpuMatchPoint) return rate - 0.02;
  return rate;
};

const cpuThinkTime = (diff) => {
  const [min, max] = CPU_CFG[diff].thinkMs;
  return min + Math.random() * (max - min);
};

const roll = (diff, streak, streaksOn, gameState={}) => {
  let r = CPU_CFG[diff].base;
  if (streaksOn && streak.active)
    r = streak.dir==="hot" ? Math.min(0.88,r+0.12) : Math.max(0.12,r-0.18);
  if (gameState.cpuMomentum) r = applyMomentum(r, gameState.cpuMomentum);
  if (gameState.scores) r = applyComeback(r, gameState.scores.cpu, gameState.scores.you, gameState.raceTo || 3);
  if (gameState.scores) r = applyClutch(r, gameState.scores.cpu, gameState.scores.you, gameState.raceTo || 3);
  return Math.random() < r;
};

const applyStreak = (streak, pointWinner, streaksOn) => {
  if (!streaksOn) return { active:false, dir:"hot", left:0 };
  if (pointWinner==="cpu") {
    if (streak.active && streak.dir==="hot") return streak;
    return Math.random()<0.20 ? { active:true, dir:"hot", left:0 } : { active:false, dir:"hot", left:0 };
  }
  if (pointWinner==="you") {
    if (streak.active && streak.dir==="hot") return { active:false, dir:"hot", left:0 };
    if (!streak.active)
      return Math.random()<0.22 ? { active:true, dir:"cold", left:2+Math.floor(Math.random()*2) } : { active:false, dir:"hot", left:0 };
    return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
  }
  if (streak.active && streak.dir==="cold")
    return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
  return streak;
};

const drawTrick = (pool, all) => {
  const src = pool.length>0 ? pool : [...all];
  const i = Math.floor(Math.random()*src.length);
  return { trick:src[i], pool:src.filter((_,j)=>j!==i) };
};

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const Label = ({ children, style={} }) => (
  <div style={{fontFamily:BC,fontSize:11,letterSpacing:1.5,color:C.sub,fontWeight:600,...style}}>{children}</div>
);
const Div = ({ mt=0, mb=0 }) => <div style={{height:1,background:C.divider,marginTop:mt,marginBottom:mb}}/>;

const BtnPrimary = ({ children, onClick, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%",padding:"18px 20px",background:"#d4d4d4",border:"none",borderRadius:2,
    color:"#0b0b0c",fontFamily:BB,fontSize:20,letterSpacing:5,cursor:"pointer",
    transition:"opacity 0.1s ease",...style,
  }}>{children}</button>
);

const BtnGhost = ({ children, onClick, color=C.muted, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%",padding:"16px 24px",background:"transparent",
    border:`1px solid ${color}`,borderRadius:R,color,
    fontFamily:BB,fontSize:16,letterSpacing:5,cursor:"pointer",
    transition:"opacity 0.12s",...style,
  }}>{children}</button>
);

const Seg = ({ label, opts, val, onChange }) => (
  <div style={{marginBottom:22}}>
    {label && <Label style={{textAlign:"center",marginBottom:12}}>{label}</Label>}
    <div style={{display:"flex",gap:8}}>
      {opts.map(o=>{
        const sel = val===o.key;
        const selColor = o.color||"#c8c8c8";
        return (
          <button key={String(o.key)} className="tap" onClick={()=>onChange(o.key)} style={{
            flex:1, padding:o.sub?"12px 6px":"16px 6px",
            background:sel?(o.color?o.color+"22":"#ffffff0f"):"transparent",
            border:`1px solid ${sel?selColor:C.border}`,
            color:sel?(o.color||"#d8d8d8"):C.sub,
            fontFamily:BB,fontSize:14,letterSpacing:3,
            cursor:"pointer",borderRadius:R,transition:"all 0.12s",
          }}>
            <div>{o.label}</div>
            {o.sub && <div style={{fontSize:9,letterSpacing:2,opacity:sel?0.7:0.5,marginTop:4}}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  </div>
);

function Dots() {
  const [n,setN]=useState(1);
  useEffect(()=>{const t=setInterval(()=>setN(d=>(d%3)+1),450);return()=>clearInterval(t);},[]);
  return <span style={{letterSpacing:5}}>{[1,2,3].map(i=><span key={i} style={{opacity:i<=n?1:0.18}}>●</span>)}</span>;
}

function StreakDot({ streak }) {
  if (!streak?.active) return null;
  const hot = streak.dir==="hot";
  const col = hot?C.orange:C.blue;
  return (
    <div className="pls" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:col,boxShadow:`0 0 8px ${col}80`}}/>
      <span style={{fontFamily:BC,fontSize:10,letterSpacing:3,color:col,fontWeight:600,opacity:0.9,textShadow:`0 0 12px ${col}40`}}>
        {hot?"HOT":"COLD"}
      </span>
    </div>
  );
}

const TryDots = ({ current }) => (
  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:18}}>
    {[1,2,3].map(t=>(
      <div key={t} style={{width:32,height:3,background:t<current?C.white:t===current?C.sub:C.border,transition:"background 0.2s"}}/>
    ))}
  </div>
);

const BackBtn = ({ onClick, label="← BACK" }) => (
  <button onClick={onClick} style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:11,letterSpacing:5,cursor:"pointer",textAlign:"left",marginBottom:24,padding:0,display:"block"}}>{label}</button>
);

const IgIcon = ({ size=14, color=C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none"/>
  </svg>
);

const IgLink = ({ size=14, fontSize=12, style={} }) => (
  <a href="https://instagram.com/kendamanxs" target="_blank" rel="noopener noreferrer" style={{
    fontFamily:BC,fontSize,letterSpacing:3,color:C.muted,fontWeight:600,
    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
    transition:"opacity 0.15s",...style,
  }}>
    <IgIcon size={size} color={C.muted}/>
    @kendamanxs
  </a>
);

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, onGuest }) {
  const [tab,    setTab]    = useState("login");
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [name,   setName]   = useState("");
  const [err,    setErr]    = useState("");
  const [loading,setLoading]= useState(false);
  const [confirmed,setConfirmed] = useState(false);

  const inputStyle = {
    width:"100%", padding:"15px 16px", background:C.surface,
    border:`1px solid ${C.border}`, borderRadius:2, color:C.white,
    fontFamily:BC, fontSize:15, letterSpacing:3, marginBottom:12,
    outline:"none", transition:"border-color 0.15s",
  };

  async function handleSubmit() {
    setErr(""); setLoading(true);
    if (tab==="signup") {
      const { data, error } = await SB.auth.signUp({
        email, password:pw,
        options: { data: { username: name } },
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      setConfirmed(true);
      setLoading(false);
      return;
    } else {
      const { data, error } = await SB.auth.signInWithPassword({ email, password:pw });
      if (error) { setErr(error.message); setLoading(false); return; }
      let { data:prof } = await SB.from("profiles").select("username").eq("id",data.user.id).single();
      if (!prof) {
        const uname = data.user.user_metadata?.username || email.split("@")[0];
        await SB.from("profiles").insert({ id:data.user.id, username:uname });
        prof = { username:uname };
      }
      onAuth(data.user, prof.username);
    }
    setLoading(false);
  }

  return (
    <div style={{fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px",position:"relative"}}>
      <div style={{position:"relative",zIndex:1,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src={LOGO} alt="NXS" style={{width:120,height:120,objectFit:"contain",marginBottom:12,display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontFamily:BB,fontSize:9,letterSpacing:5,color:C.muted}}>NXS BATTLE · KENDAMA TRAINER</div>
          <div style={{marginTop:8,textAlign:"center",display:"flex",justifyContent:"center"}}>
            <IgLink size={13} fontSize={11}/>
          </div>
        </div>

        {confirmed ? (
          <div className="fadeUp" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.green,marginBottom:16}}>CHECK YOUR EMAIL</div>
            <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,marginBottom:8}}>
              We sent a confirmation link to
            </div>
            <div style={{fontFamily:BC,fontSize:15,color:C.white,fontWeight:600,letterSpacing:2,marginBottom:24}}>
              {email}
            </div>
            <div style={{fontFamily:BC,fontSize:13,color:C.muted,lineHeight:1.6,letterSpacing:1,marginBottom:32}}>
              Click the link in the email, then come back here and log in.
            </div>
            <BtnPrimary onClick={()=>{setConfirmed(false);setTab("login");setErr("");}}>
              GO TO LOG IN
            </BtnPrimary>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:`1px solid ${C.border}`}}>
              {["login","signup"].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{
                  flex:1,padding:"12px 0",background:"transparent",border:"none",
                  borderBottom:`2px solid ${tab===t?C.white:"transparent"}`,
                  color:tab===t?C.white:C.muted,fontFamily:BB,fontSize:16,letterSpacing:4,
                  cursor:"pointer",transition:"all 0.15s",marginBottom:-1,
                }}>{t==="login"?"LOG IN":"SIGN UP"}</button>
              ))}
            </div>

            {tab==="signup" && (
              <input placeholder="Username" value={name} onChange={e=>setName(e.target.value)}
                style={inputStyle}/>
            )}
            <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={inputStyle}/>
            <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)}
              style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>

            {err && <div style={{fontFamily:BC,fontSize:13,color:C.red,marginBottom:14,letterSpacing:3,lineHeight:1.4}}>{err}</div>}

            <BtnPrimary onClick={handleSubmit} style={{marginTop:4}}>
              {loading ? "···" : tab==="login"?"LOG IN":"CREATE ACCOUNT"}
            </BtnPrimary>

            {/* Guest mode */}
            <button className="tap" onClick={onGuest} style={{
              width:"100%",padding:"16px 0",marginTop:16,background:"transparent",border:"none",
              color:C.muted,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",
              transition:"opacity 0.12s",
            }}>
              CONTINUE AS GUEST
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STATS SCREEN ────────────────────────────────────────────────────────────
function StatsScreen({ user, username, isGuest, onBack, onAuth, compDbKey, selectedComp, selectedDiv }) {
  const [matches,  setMatches]  = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [history,  setHistory]  = useState(null);
  const [tab,      setTab]      = useState("record");   // "record" | "tricks" | "history"

  // Build available divisions from all comps
  const allDivisions = COMPS.flatMap(c => c.divisions.map(d => ({
    compKey: c.key, divKey: d.key, label: `${d.name}`, compName: c.name,
    dbKey: `${c.key}:${d.key}`,
  })));

  const [divKey, setDivKey] = useState(compDbKey || allDivisions[0]?.dbKey || "ekc_2026:am_open");

  useEffect(() => {
    if (!user) return;
    SB.from("match_results").select("*").eq("user_id",user.id)
      .then(({data})=>setMatches(data||[]));
    SB.from("trick_attempts").select("trick,landed,competition").eq("user_id",user.id)
      .then(({data})=>setAttempts(data||[]));
    // History: last 10 CPU matches for current division
    SB.from("match_results").select("*").eq("user_id",user.id)
      .order("created_at",{ascending:false}).limit(50)
      .then(({data})=>setHistory(data||[]));
  },[user]);

  const DIFFICULTIES= ["easy","medium","hard"];
  const DIFF_LABELS = {easy:"ROOKIE",medium:"AMATEUR",hard:"PRO"};
  const DIFF_COLORS = {easy:C.green,medium:C.yellow,hard:C.red};

  const recordForDiv = (key) => {
    const dm = (matches||[]).filter(m=>m.competition===key);
    return DIFFICULTIES.map(d=>{
      const sub = dm.filter(m=>m.difficulty===d);
      const w   = sub.filter(m=>m.won).length;
      return {diff:d, wins:w, losses:sub.length-w, total:sub.length};
    }).filter(r=>r.total>0);
  };

  const totalRecord = (key) => {
    const rows = recordForDiv(key);
    const wins = rows.reduce((a,r)=>a+r.wins,0);
    const tot  = rows.reduce((a,r)=>a+r.total,0);
    return {wins, losses:tot-wins, total:tot};
  };

  const tricksForDiv = (key) => {
    const stats = {};
    (attempts||[]).filter(a=>(a.competition||"ekc_2026:am_open")===key).forEach(a=>{
      if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
      if (a.landed) stats[a.trick].land++;
      else stats[a.trick].miss++;
    });
    return Object.entries(stats)
      .map(([t,s])=>({trick:t, rate:Math.round(s.land/(s.land+s.miss)*100), att:s.land+s.miss}))
      .sort((a,b)=>a.rate-b.rate);
  };

  const historyForDiv = (key) => {
    return (history||[]).filter(h=>h.competition===key).slice(0,10);
  };

  const loading = !isGuest && (matches===null || attempts===null);
  const root = {fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"};

  // Guest prompt
  if (isGuest) return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px))"}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
          <img src={LOGO} alt="NXS" style={{width:64,height:64,objectFit:"contain",opacity:0.3}}/>
          <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.white}}>TRACK YOUR PROGRESS</div>
          <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,maxWidth:280}}>
            Create an account to save your match history, trick stats, and win rates.
          </div>
          <BtnPrimary onClick={onAuth} style={{marginTop:16,maxWidth:280}}>SIGN UP</BtnPrimary>
        </div>
      </div>
    </div>
  );

  const currentDivLabel = allDivisions.find(d=>d.dbKey===divKey)?.label || "AM OPEN";

  return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <BackBtn onClick={onBack}/>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>{username}</div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,marginTop:6,fontWeight:600}}>Training Stats</div>
          </div>

          {/* Division switcher */}
          <div style={{display:"flex",gap:0,marginBottom:0}}>
            {allDivisions.map(d=>(
              <button key={d.dbKey} onClick={()=>setDivKey(d.dbKey)} style={{
                flex:1,padding:"10px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${divKey===d.dbKey?C.white:"transparent"}`,
                color:divKey===d.dbKey?C.white:C.muted,
                fontFamily:BB,fontSize:14,letterSpacing:3,
                cursor:"pointer",transition:"all 0.15s",
              }}>{d.label}</button>
            ))}
          </div>
          <Div/>

          {/* Tab switcher: RECORD | TRICKS | HISTORY */}
          <div style={{display:"flex",gap:0,marginTop:0}}>
            {[["record","RECORD"],["tricks","TRICKS"],["history","HISTORY"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{
                flex:1,padding:"12px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${tab===k?C.white:"transparent"}`,
                color:tab===k?C.white:C.muted,
                fontFamily:BB,fontSize:13,letterSpacing:4,
                cursor:"pointer",transition:"all 0.15s",marginBottom:-1,
              }}>{l}</button>
            ))}
          </div>
          <Div/>
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"24px 24px 32px"}}>
          {loading && <div style={{fontFamily:BC,fontSize:14,color:C.muted}}>Loading...</div>}

          {/* ── RECORD TAB ── */}
          {!loading && tab==="record" && (()=>{
            const rows = recordForDiv(divKey);
            const tot  = totalRecord(divKey);
            if (rows.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No matches yet for {currentDivLabel}.<br/>Play vs CPU to track your record.
              </div>
            );
            return (
              <>
                <div style={{display:"flex",gap:0,marginBottom:28}}>
                  {[["WINS",tot.wins,C.green],["LOSSES",tot.losses,C.red]].map(([l,v,col])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:col}}>{v}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted,marginTop:8}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:32}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <Label style={{letterSpacing:4}}>Win Rate</Label>
                    <Label style={{color:C.white}}>{Math.round(tot.wins/tot.total*100)}%</Label>
                  </div>
                  <div style={{height:2,background:C.border}}>
                    <div style={{height:2,background:C.green,width:`${tot.wins/tot.total*100}%`,transition:"width 0.5s"}}/>
                  </div>
                </div>
                <Div mb={24}/>
                <Label style={{marginBottom:16,letterSpacing:4}}>By Difficulty</Label>
                {rows.map(r=>{
                  const rate = Math.round(r.wins/r.total*100);
                  const col  = DIFF_COLORS[r.diff];
                  return (
                    <div key={r.diff} style={{marginBottom:20}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:col}}/>
                          <span style={{fontFamily:BB,fontSize:13,letterSpacing:4,color:C.white}}>{DIFF_LABELS[r.diff]}</span>
                        </div>
                        <div style={{display:"flex",gap:14,alignItems:"baseline"}}>
                          <span style={{fontFamily:BC,fontSize:12,color:C.green,fontWeight:600}}>{r.wins}W</span>
                          <span style={{fontFamily:BC,fontSize:12,color:C.red,fontWeight:600}}>{r.losses}L</span>
                          <span style={{fontFamily:BB,fontSize:15,letterSpacing:2,color:col}}>{rate}%</span>
                        </div>
                      </div>
                      <div style={{height:2,background:C.border}}>
                        <div style={{height:2,background:col,width:`${rate}%`,transition:"width 0.5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}

          {/* ── TRICKS TAB ── */}
          {!loading && tab==="tricks" && (()=>{
            const list = tricksForDiv(divKey);
            if (list.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No trick data yet for {currentDivLabel}.<br/>Attempt rates are tracked when you play vs CPU.
              </div>
            );
            const weak   = list.filter(t=>t.rate<50);
            const strong = list.filter(t=>t.rate>=50);
            const TrickRow = ({trick,rate,att}) => {
              const col = rate>=70?C.green:rate>=40?C.yellow:C.red;
              return (
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                    <div style={{fontFamily:BC,fontSize:13,color:C.sub,fontWeight:600,flex:1,paddingRight:16,lineHeight:1.35}}>{trick}</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:8,flexShrink:0}}>
                      <span style={{fontFamily:BC,fontSize:11,color:C.muted}}>{att}×</span>
                      <span style={{fontFamily:BB,fontSize:17,letterSpacing:1,color:col}}>{rate}%</span>
                    </div>
                  </div>
                  <div style={{height:2,background:C.border}}>
                    <div style={{height:2,background:col,width:`${rate}%`,transition:"width 0.4s"}}/>
                  </div>
                </div>
              );
            };
            return (
              <>
                {weak.length>0 && (
                  <>
                    <Label style={{marginBottom:16,letterSpacing:4,color:C.red}}>Needs Work</Label>
                    {weak.map(t=><TrickRow key={t.trick} {...t}/>)}
                  </>
                )}
                {strong.length>0 && (
                  <>
                    {weak.length>0 && <Div mt={8} mb={24}/>}
                    <Label style={{marginBottom:16,letterSpacing:4,color:C.green}}>Solid</Label>
                    {strong.map(t=><TrickRow key={t.trick} {...t}/>)}
                  </>
                )}
              </>
            );
          })()}

          {/* ── HISTORY TAB ── */}
          {!loading && tab==="history" && (()=>{
            const rows = historyForDiv(divKey);
            if (rows.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No match history yet for {currentDivLabel}.<br/>Play vs CPU to start tracking.
              </div>
            );
            return (
              <>
                <Label style={{marginBottom:16,letterSpacing:4}}>Last {rows.length} Matches</Label>
                {rows.map((m,i)=>{
                  const col = m.won?C.green:C.red;
                  const diffCol = DIFF_COLORS[m.difficulty]||C.sub;
                  const date = new Date(m.created_at);
                  const dateStr = `${date.getDate()}/${date.getMonth()+1}`;
                  return (
                    <div key={m.id||i} className="fadeUp" style={{
                      borderLeft:`3px solid ${col}`,paddingLeft:14,paddingTop:12,paddingBottom:12,
                      marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",
                      background:`${col}06`,animationDelay:`${i*0.04}s`,animationFillMode:"both",
                    }}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{fontFamily:BB,fontSize:20,letterSpacing:2,color:col,width:24}}>{m.won?"W":"L"}</div>
                        <div style={{fontFamily:BB,fontSize:22,letterSpacing:1,color:C.white}}>
                          {m.your_score}–{m.cpu_score}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{
                          fontFamily:BB,fontSize:10,letterSpacing:3,color:diffCol,
                          border:`1px solid ${diffCol}30`,padding:"4px 8px",borderRadius:R,
                        }}>{DIFF_LABELS[m.difficulty]||m.difficulty}</div>
                        <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600,minWidth:36,textAlign:"right"}}>{dateStr}</div>
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,     setUser]     = useState(null);
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest,  setIsGuest]  = useState(false);

  const [screen,   setScreen]   = useState("home");
  const [selectedComp, setSelectedComp] = useState(null);
  const [selectedDiv,  setSelectedDiv]  = useState(null);
  const [openList, setOpenList] = useState("regular");
  const [mode,     setMode]     = useState("cpu");
  const [diff,     setDiff]     = useState("medium");
  const [race,     setRace]     = useState(3);
  const [streaks,  setStreaks]  = useState(true);
  const [result,   setResult]   = useState(null);
  const [gs,       setGs]       = useState(null);

  // Derived: competition key for DB
  const compDbKey = selectedComp && selectedDiv ? `${selectedComp.key}:${selectedDiv.key}` : null;

  const gsRef       = useRef(null);
  const diffRef     = useRef(diff);
  const raceRef     = useRef(race);
  const modeRef     = useRef(mode);
  const openListRef = useRef(openList);
  const streaksRef  = useRef(streaks);
  const userRef     = useRef(user);
  const compDbKeyRef= useRef(compDbKey);

  useEffect(()=>{ gsRef.current      = gs;       },[gs]);
  useEffect(()=>{ diffRef.current    = diff;     },[diff]);
  useEffect(()=>{ raceRef.current    = race;     },[race]);
  useEffect(()=>{ modeRef.current    = mode;     },[mode]);
  useEffect(()=>{ openListRef.current= openList; },[openList]);
  useEffect(()=>{ streaksRef.current = streaks;  },[streaks]);
  useEffect(()=>{ userRef.current    = user;     },[user]);
  useEffect(()=>{ compDbKeyRef.current= compDbKey; },[compDbKey]);

  // Check existing session on load
  useEffect(()=>{
    SB.auth.getSession().then(async ({ data:{ session } })=>{
      if (session?.user) {
        let { data:prof } = await SB.from("profiles").select("username").eq("id",session.user.id).single();
        if (!prof) {
          const fallbackName = session.user.email.split("@")[0];
          await SB.from("profiles").insert({ id:session.user.id, username:fallbackName });
          prof = { username:fallbackName };
        }
        setUser(session.user);
        setUsername(prof.username);
      }
      setAuthLoading(false);
    });
  },[]);

  async function handleSignOut() {
    await SB.auth.signOut();
    setUser(null); setUsername(""); setIsGuest(false);
    setScreen("home"); setSelectedComp(null); setSelectedDiv(null);
  }

  function enterAsGuest() {
    setIsGuest(true); setUsername("Guest"); setScreen("home");
  }

  function goToAuth() {
    setIsGuest(false); setUser(null); setUsername(""); setScreen("home");
  }

  // Save trick attempt to DB (only in CPU mode, only for logged-in users)
  async function saveTrickAttempt(trick, landed) {
    const u = userRef.current;
    if (!u) return;
    const { error } = await SB.from("trick_attempts").insert({
      user_id:u.id, trick, landed, competition:compDbKeyRef.current||"unknown",
    });
    if (error) console.error("trick_attempts insert:", error.message);
  }

  // Save match result to DB
  async function saveMatchResult(scores, won) {
    const u = userRef.current;
    if (!u) return;
    const { error } = await SB.from("match_results").insert({
      user_id:u.id, competition:compDbKeyRef.current||"unknown",
      difficulty:diffRef.current, race_to:raceRef.current,
      won, your_score:scores.you, cpu_score:scores.cpu,
    });
    if (error) console.error("match_results insert:", error.message);
  }

  // ── FIXED: allTricks now uses selectedDiv ──
  const allTricks = () => {
    if (!selectedDiv) return AM_TRICKS; // fallback
    if (selectedDiv.tricks) return selectedDiv.tricks;
    if (selectedDiv.trickSets) {
      const set = selectedDiv.trickSets.find(s => s.key === openList);
      return set ? set.tricks : selectedDiv.trickSets[0].tricks;
    }
    return [];
  };

  // ── CPU logic ────────────────────────────────────────────────────────────────
  function resolveCpu(pLanded, cLanded) {
    setGs(p=>{
      if (pLanded===cLanded) {
        const ns = applyStreak(p.cpuStreak,"null",streaksRef.current);
        if (p.tryNum>=3) return {...p,cpuStreak:ns,phase:"null"};
        return {...p,cpuStreak:ns,phase:"tie",msg:pLanded?"BOTH LANDED":"BOTH MISSED"};
      }
      const winner = pLanded?"you":"cpu";
      const ns = applyStreak(p.cpuStreak,winner,streaksRef.current);
      haptic(winner==="you"?20:8);
      return {...p,cpuStreak:ns,scores:{...p.scores,[winner]:p.scores[winner]+1},winner,phase:"point",lastScoreKey:(p.lastScoreKey||0)+1};
    });
  }

  function onAttempt(landed) {
    const s = gsRef.current;
    if (!s) return;
    haptic(landed?15:8);
    saveTrickAttempt(s.trick, landed);
    if (s.phase==="p_first")  setGs(p=>({...p,pResult:landed,phase:"cpu_resp"}));
    if (s.phase==="p_second") resolveCpu(landed,s.cpuFirst);
  }

  function nextCpuTrick(state) {
    const r = drawTrick(state.pool,allTricks());
    setGs({...state,trick:r.trick,pool:r.pool,tryNum:1,
      playerFirst:!state.playerFirst,phase:"reveal",
      cpuFirst:null,pResult:null,msg:"",winner:null});
  }

  useEffect(()=>{
    if (!gs||modeRef.current!=="cpu") return;
    let t;
    if (gs.phase==="reveal")
      t=setTimeout(()=>setGs(p=>({...p,phase:p.playerFirst?"p_first":"cpu_first"})),2000);
    else if (gs.phase==="cpu_first")
      t=setTimeout(()=>{const s=gsRef.current;const landed=roll(diffRef.current,s.cpuStreak,streaksRef.current,{cpuMomentum:s.cpuMomentum,scores:s.scores,raceTo:raceRef.current});setGs(p=>({...p,cpuFirst:landed,cpuMomentum:[...p.cpuMomentum,landed].slice(-6),phase:"p_second"}));},cpuThinkTime(diffRef.current));
    else if (gs.phase==="cpu_resp")
      t=setTimeout(()=>{const s=gsRef.current;const landed=roll(diffRef.current,s.cpuStreak,streaksRef.current,{cpuMomentum:s.cpuMomentum,scores:s.scores,raceTo:raceRef.current});setGs(p=>({...p,cpuMomentum:[...p.cpuMomentum,landed].slice(-6)}));resolveCpu(s.pResult,landed);},cpuThinkTime(diffRef.current));
    else if (gs.phase==="tie")
      t=setTimeout(()=>setGs(p=>({...p,tryNum:p.tryNum+1,pResult:null,cpuFirst:null,msg:"",phase:p.playerFirst?"p_first":"cpu_first"})),1800);
    else if (gs.phase==="null")
      t=setTimeout(()=>nextCpuTrick(gsRef.current),1800);
    else if (gs.phase==="point")
      t=setTimeout(()=>{
        const s=gsRef.current;
        if (s.scores.you>=raceRef.current||s.scores.cpu>=raceRef.current) {
          const won = s.scores.you>=raceRef.current;
          saveMatchResult(s.scores, won);
          setResult({scores:s.scores,won});
          setScreen("result");
        } else nextCpuTrick(s);
      },2000);
    return ()=>clearTimeout(t);
  },[gs?.phase,gs?.trick,gs?.tryNum]);

  // ── 2P logic ─────────────────────────────────────────────────────────────────
  function on2PScore(winner) {
    setGs(p=>{
      if (winner==="null") {
        const r=drawTrick(p.pool,allTricks());
        return {...p,trick:r.trick,pool:r.pool,playerFirst:!p.playerFirst,phase:"2p_reveal",winner:null};
      }
      const scores={...p.scores,[winner]:p.scores[winner]+1};
      return {...p,scores,winner,phase:"2p_point"};
    });
  }

  useEffect(()=>{
    if (!gs||modeRef.current!=="2p") return;
    let t;
    if (gs.phase==="2p_reveal")
      t=setTimeout(()=>setGs(p=>({...p,phase:"2p_score"})),2200);
    else if (gs.phase==="2p_point")
      t=setTimeout(()=>{
        const s=gsRef.current;
        if (s.scores.p1>=raceRef.current||s.scores.p2>=raceRef.current) {
          setResult({scores:s.scores,won:s.scores.p1>=raceRef.current,mode:"2p"});
          setScreen("result");
        } else {
          const r=drawTrick(s.pool,allTricks());
          setGs({...s,trick:r.trick,pool:r.pool,playerFirst:!s.playerFirst,phase:"2p_reveal",winner:null});
        }
      },1800);
    return ()=>clearTimeout(t);
  },[gs?.phase,gs?.trick]);

  function startGame() {
    const r=drawTrick([],allTricks());
    if (mode==="cpu") {
      const init={scores:{you:0,cpu:0},pool:r.pool,trick:r.trick,tryNum:1,
        playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
        cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0};
      gsRef.current=init; setGs(init);
    } else {
      const init={scores:{p1:0,p2:0},pool:r.pool,trick:r.trick,
        playerFirst:true,phase:"2p_reveal",winner:null};
      gsRef.current=init; setGs(init);
    }
    setScreen("battle");
  }

  const root = {
    fontFamily:BC,background:C.bg,color:C.text,
    height:"100dvh",maxWidth:440,margin:"0 auto",
    display:"flex",flexDirection:"column",position:"relative",
    overscrollBehavior:"none",overflow:"hidden",
  };
  const page = {
    position:"relative",zIndex:1,flex:1,
    display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",
    overflowY:"auto",WebkitOverflowScrolling:"touch",
  };

  // Loading
  if (authLoading) return (
    <div style={{...root,alignItems:"center",justifyContent:"center"}}>
      <img src={LOGO} alt="NXS" className="glow" style={{width:100,height:100,objectFit:"contain"}}/>
      <div className="fadeUp" style={{fontFamily:BB,fontSize:10,letterSpacing:6,color:C.muted,marginTop:16,animationDelay:"0.3s",animationFillMode:"both"}}>LOADING</div>
    </div>
  );

  // Auth gate — guests bypass
  if (!user && !isGuest) return <AuthScreen onAuth={(u,n)=>{setUser(u);setUsername(n);}} onGuest={enterAsGuest}/>;

  // Stats screen
  if (screen==="stats") return (
    <StatsScreen
      user={user} username={username} isGuest={isGuest}
      onBack={()=>setScreen(selectedDiv?"settings":"home")}
      onAuth={goToAuth}
      compDbKey={compDbKey} selectedComp={selectedComp} selectedDiv={selectedDiv}
    />
  );

  // ── HOME SCREEN ──────────────────────────────────────────────────────────────
  if (screen==="home") return (
    <div style={root}>
      <div style={{...page,alignItems:"center"}}>

        {/* User bar */}
        <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <button onClick={()=>setScreen("stats")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:11,letterSpacing:4,cursor:"pointer",padding:0}}>
            {username} · STATS →
          </button>
          {isGuest ? (
            <button onClick={goToAuth} style={{background:"transparent",border:"none",color:C.green,fontFamily:BB,fontSize:10,letterSpacing:4,cursor:"pointer",padding:0}}>
              SIGN UP
            </button>
          ) : (
            <button onClick={handleSignOut} style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:10,letterSpacing:4,cursor:"pointer",padding:0}}>
              LOG OUT
            </button>
          )}
        </div>

        {/* Logo */}
        <div className="rise" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%"}}>
          <img src={LOGO} alt="NXS" style={{width:250,height:250,objectFit:"contain"}}/>
        </div>

        <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.sub,marginBottom:6,textAlign:"center"}}>
          KENDAMA NXS · BATTLE TRAINER
        </div>
        <div style={{marginBottom:24,display:"flex",justifyContent:"center"}}>
          <IgLink size={14} fontSize={12}/>
        </div>

        {/* Competition list */}
        <div className="rise" style={{width:"100%",animationDelay:"0.08s"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            {COMPS.map((comp,i)=>(
              <button key={comp.key} className="tap" onClick={()=>{setSelectedComp(comp);setScreen("division");}} style={{
                padding:"22px 0",background:"transparent",border:"none",
                borderTop:`1px solid ${C.border}`,
                borderBottom:i===COMPS.length-1?`1px solid ${C.border}`:"none",
                cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                transition:"opacity 0.1s",width:"100%",
              }}>
                <span style={{fontFamily:BB,fontSize:32,letterSpacing:4,color:C.white}}>{comp.name}</span>
                <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:BC,fontSize:11,letterSpacing:2,color:C.sub,fontWeight:600}}>{comp.location}</span>
                  <span style={{fontFamily:BB,fontSize:12,letterSpacing:2,color:C.muted}}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── DIVISION SCREEN ──────────────────────────────────────────────────────────
  if (screen==="division" && selectedComp) return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={()=>{setScreen("home");setSelectedComp(null);}} label="← HOME"/>
        <div className="rise" style={{marginBottom:28}}>
          <div style={{fontFamily:BB,fontSize:38,letterSpacing:5,lineHeight:1,color:C.white}}>
            {selectedComp.name}
          </div>
          <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:3,marginTop:8,fontWeight:600}}>
            {selectedComp.full}
          </div>
          <div style={{fontFamily:BC,fontSize:11,color:C.sub,letterSpacing:2,marginTop:4,fontWeight:600}}>
            {selectedComp.location}
          </div>
        </div>
        <Div mb={24}/>
        <div style={{display:"flex",flexDirection:"column"}}>
          {selectedComp.divisions.map((div,i)=>(
            <button key={div.key} className="tap" onClick={()=>{
              setSelectedDiv(div);
              setOpenList(div.trickSets?div.trickSets[0].key:"regular");
              setScreen("settings");
            }} style={{
              padding:"22px 0",background:"transparent",border:"none",
              borderTop:`1px solid ${C.border}`,
              borderBottom:i===selectedComp.divisions.length-1?`1px solid ${C.border}`:"none",
              cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
              transition:"opacity 0.1s",width:"100%",
            }}>
              <span style={{fontFamily:BB,fontSize:28,letterSpacing:4,color:C.white}}>{div.name}</span>
              <span style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted}}>→</span>
            </button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",justifyContent:"center",opacity:0.6}}>
          <IgLink size={13} fontSize={11}/>
        </div>
      </div>
    </div>
  );

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  if (screen==="settings" && selectedDiv) return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={()=>setScreen("division")}/>
        <div className="rise" style={{marginBottom:28}}>
          <div style={{fontFamily:BB,fontSize:38,letterSpacing:5,lineHeight:1,color:C.white}}>
            {selectedDiv.name}
          </div>
          <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:4,marginTop:8,fontWeight:600}}>
            {selectedComp?.name} · {selectedComp?.full}
          </div>
        </div>
        <Div mb={24}/>
        {selectedDiv.trickSets && (
          <Seg label="Trick List" val={openList} onChange={setOpenList} opts={
            selectedDiv.trickSets.map(s=>({key:s.key,label:s.label,sub:s.sub}))
          }/>
        )}
        <Seg label="Game Mode" val={mode} onChange={setMode} opts={[
          {key:"cpu",label:"CPU"},
          {key:"2p", label:"2 PLAYER"},
        ]}/>
        {mode==="cpu" && (<>
          <Seg label="CPU Difficulty" val={diff} onChange={setDiff} opts={[
            {key:"easy",  label:"ROOKIE",  color:C.green, sub:"~48%"},
            {key:"medium",label:"AMATEUR", color:C.yellow,sub:"~68%"},
            {key:"hard",  label:"PRO",     color:C.red,   sub:"~87%"},
          ]}/>
          <Seg label="CPU Streaks" val={streaks} onChange={setStreaks} opts={[
            {key:true, label:"ON", sub:"hot · cold"},
            {key:false,label:"OFF",sub:"steady rate"},
          ]}/>
        </>)}
        <Seg label="Race To" val={race} onChange={setRace} opts={[
          {key:3,label:"3"},
          {key:5,label:"5"},
        ]}/>
        <div style={{flex:1}}/>
        <BtnPrimary onClick={startGame}>START BATTLE</BtnPrimary>
      </div>
    </div>
  );

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (screen==="result" && result) {
    const { scores, won, mode:rm } = result;
    const is2p = rm==="2p";
    const winLabel = is2p?(scores.p1>=race?"P1 WINS":"P2 WINS"):(won?"YOU WIN":"CPU WINS");
    const resultColor = won?C.green:C.red;
    return (
      <div style={{...root,justifyContent:"center"}}>
        <div style={{position:"fixed",inset:0,background:resultColor,opacity:0,animation:"flash 0.8s ease-out",zIndex:2,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <div className="fadeUp" style={{animationDelay:"0s"}}>
            <img src={LOGO} alt="NXS" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",opacity:0.4}}/>
          </div>
          <div className="fadeUp" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
            <Label style={{marginBottom:12,letterSpacing:5}}>{is2p?"Match Over":(won?"Well Done":"Keep Training")}</Label>
          </div>
          <div className="pop" style={{animationDelay:"0.15s",animationFillMode:"both"}}>
            <div style={{fontFamily:BB,fontSize:62,letterSpacing:2,lineHeight:0.88,color:won?C.white:C.red,textShadow:`0 0 40px ${resultColor}30`}}>{winLabel}</div>
          </div>
          <div className="fadeUp" style={{animationDelay:"0.35s",animationFillMode:"both"}}>
            <Div mt={28} mb={28}/>
            <Label style={{marginBottom:16,letterSpacing:5}}>Final Score</Label>
            <div style={{display:"flex",justifyContent:"center",gap:32}}>
              {(is2p?[["P1",scores.p1],["P2",scores.p2]]:[["YOU",scores.you],["CPU",scores.cpu]]).map(([l,v],i)=>(
                <div key={l} className="fadeUp" style={{textAlign:"center",animationDelay:`${0.45+i*0.1}s`,animationFillMode:"both"}}>
                  <Label style={{marginBottom:8}}>{l}</Label>
                  <div style={{fontFamily:BB,fontSize:76,lineHeight:0.9,color:C.white}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fadeUp" style={{marginTop:36,display:"flex",flexDirection:"column",gap:12,animationDelay:"0.65s",animationFillMode:"both"}}>
            <BtnPrimary onClick={()=>{haptic(12);setScreen("settings");setGs(null);}}>PLAY AGAIN</BtnPrimary>
            {!is2p && (
              <BtnGhost color={C.sub} onClick={()=>{
                if (isGuest) { goToAuth(); return; }
                setScreen("stats");setGs(null);
              }}>VIEW STATS →</BtnGhost>
            )}
            <BtnGhost onClick={()=>{setScreen("home");setGs(null);setSelectedComp(null);setSelectedDiv(null);}}>← MAIN MENU</BtnGhost>
          </div>
        </div>
      </div>
    );
  }

  // ── BATTLE ───────────────────────────────────────────────────────────────────
  if (!gs) return null;
  const {scores,trick,tryNum,playerFirst,phase,msg,cpuFirst,pResult,winner,cpuStreak,lastScoreKey}=gs;
  const is2p = mode==="2p";
  const pk   = `${phase}-${trick}-${tryNum||0}`;

  const ScoreBar = () => {
    const youMatchPoint = !is2p && scores.you === race - 1;
    const cpuMatchPoint = !is2p && scores.cpu === race - 1;
    return (
    <div style={{padding:"calc(20px + env(safe-area-inset-top, 0px)) 24px 0"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:16}}>
        {is2p
          ? [["P1",scores.p1],["P2",scores.p2]].map(([l,v])=>(
              <div key={l} style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:6,letterSpacing:4}}>{l}</Label>
                <div key={`${l}-${v}`} className="scorePulse" style={{fontFamily:BB,fontSize:52,lineHeight:1}}>{v}</div>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<v?C.white:C.border,transition:"background 0.25s"}}/>
                  ))}
                </div>
              </div>
            ))
          : <>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:6,letterSpacing:4,color:youMatchPoint?C.green:C.sub}}>
                  {youMatchPoint?"MATCH PT":"You"}
                </Label>
                <div key={`you-${scores.you}-${lastScoreKey}`} className={phase==="point"&&winner==="you"?"scorePulse":""} style={{fontFamily:BB,fontSize:52,lineHeight:1,textShadow:youMatchPoint?`0 0 20px ${C.green}30`:undefined}}>{scores.you}</div>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.you?C.green:C.border,transition:"background 0.25s",boxShadow:i<scores.you?`0 0 4px ${C.green}40`:undefined}}/>
                  ))}
                </div>
              </div>
              <div style={{fontFamily:BB,fontSize:20,color:C.border,paddingTop:24}}>:</div>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:6,letterSpacing:4,color:cpuMatchPoint?C.red:C.sub}}>
                  {cpuMatchPoint?"MATCH PT":"CPU"}
                </Label>
                <div key={`cpu-${scores.cpu}-${lastScoreKey}`} className={phase==="point"&&winner==="cpu"?"scorePulse":""} style={{fontFamily:BB,fontSize:52,lineHeight:1,textShadow:cpuMatchPoint?`0 0 20px ${C.red}30`:undefined}}>{scores.cpu}</div>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.cpu?C.red:C.border,transition:"background 0.25s",boxShadow:i<scores.cpu?`0 0 4px ${C.red}40`:undefined}}/>
                  ))}
                </div>
                {!is2p && <StreakDot streak={cpuStreak}/>}
              </div>
            </>
        }
      </div>
      <Div mt={18}/>
    </div>
  );
  };

  const MenuBack = () => (
    <div style={{padding:"12px 24px calc(22px + env(safe-area-inset-bottom, 0px))",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={()=>setScreen("settings")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:11,letterSpacing:5,cursor:"pointer",padding:0}}>← MENU</button>
      <div style={{fontFamily:BB,fontSize:9,letterSpacing:4,color:C.muted}}>
        NXS BATTLE
      </div>
    </div>
  );

  if (phase==="reveal"||phase==="2p_reveal") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px",gap:22}}>
          <div className="slideIn" style={{fontFamily:BB,fontSize:10,letterSpacing:8,color:C.muted,animationDelay:"0s"}}>NEXT TRICK</div>
          <div className="slideIn" style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20,animationDelay:"0.08s",animationFillMode:"both"}}>
            <div style={{fontFamily:BB,fontSize:trick.length>40?32:40,letterSpacing:2,lineHeight:1.1,color:C.white}}>{trick}</div>
          </div>
          <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,animationDelay:"0.2s",animationFillMode:"both"}}>
            <div style={{width:20,height:1,background:C.border}}/>
            <div style={{fontFamily:BB,fontSize:10,letterSpacing:6,color:playerFirst?C.green:C.red}}>
              {is2p?(playerFirst?"P1 FIRST":"P2 FIRST"):(playerFirst?"YOU FIRST":"CPU FIRST")}
            </div>
          </div>
        </div>
        <MenuBack/>
      </div>
    </div>
  );

  if (is2p&&phase==="2p_score") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 24px 0"}}>
          <div style={{borderLeft:`3px solid ${C.muted}`,paddingLeft:16,marginBottom:16}}>
            <Label style={{marginBottom:6}}>Trick</Label>
            <div style={{fontFamily:BB,fontSize:24,letterSpacing:2,lineHeight:1.2,color:C.white}}>{trick}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:20,height:1,background:C.border}}/>
            <div style={{fontFamily:BB,fontSize:10,letterSpacing:6,color:C.muted}}>{playerFirst?"P1 FIRST":"P2 FIRST"}</div>
          </div>
          <Div mb={20}/>
          <Label style={{textAlign:"center",marginBottom:16,letterSpacing:5}}>Who scored?</Label>
          <div style={{display:"flex",flexDirection:"column",gap:10,flex:1,justifyContent:"center"}}>
            <BtnPrimary onClick={()=>on2PScore("p1")}>P1 SCORED</BtnPrimary>
            <BtnPrimary onClick={()=>on2PScore("p2")}>P2 SCORED</BtnPrimary>
            <BtnGhost onClick={()=>on2PScore("null")}>NULL — NEXT TRICK</BtnGhost>
          </div>
        </div>
        <MenuBack/>
      </div>
    </div>
  );

  if (is2p&&phase==="2p_point") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontFamily:BB,fontSize:52,letterSpacing:2,color:C.white}}>{winner==="p1"?"P1":"P2"} SCORED</div>
        </div>
      </div>
    </div>
  );

  const attemptPhases=["p_first","cpu_first","p_second","cpu_resp"];
  if (attemptPhases.includes(phase)) return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div style={{borderLeft:`3px solid ${phase==="p_first"?C.white:C.muted}`,paddingLeft:16,margin:"14px 24px 0",transition:"border-color 0.3s"}}>
          <div style={{fontFamily:BB,fontSize:20,letterSpacing:1,lineHeight:1.2,color:phase==="p_first"?C.white:C.sub}}>{trick}</div>
        </div>
        <div style={{padding:"12px 24px 0"}}><TryDots current={tryNum}/></div>

        {phase==="p_first" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
            <div style={{flex:1}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button className="tap" onClick={()=>onAttempt(true)} style={{padding:"0",height:120,background:C.green,border:"none",borderRadius:2,color:C.bg,fontFamily:BB,fontSize:32,letterSpacing:4,cursor:"pointer",transition:"all 0.1s",boxShadow:`0 0 24px ${C.green}25`}}>LAND</button>
              <button className="tap" onClick={()=>onAttempt(false)} style={{padding:"0",height:120,background:`${C.red}08`,border:`1px solid ${C.red}30`,borderRadius:2,color:`${C.red}cc`,fontFamily:BB,fontSize:32,letterSpacing:4,cursor:"pointer",transition:"all 0.1s"}}>MISS</button>
            </div>
          </div>
        )}

        {phase==="cpu_first" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
            <div className="pls" style={{fontFamily:BB,fontSize:52,letterSpacing:6,color:C.white}}><Dots/></div>
          </div>
        )}

        {phase==="p_second" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
              <div style={{fontFamily:BB,fontSize:64,letterSpacing:3,lineHeight:0.9,color:cpuFirst?C.green:C.red,textShadow:`0 0 30px ${cpuFirst?C.green:C.red}25`}}>
                {cpuFirst?"LANDED":"MISSED"}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button className="tap" onClick={()=>onAttempt(true)} style={{padding:"0",height:100,background:C.green,border:"none",borderRadius:2,color:C.bg,fontFamily:BB,fontSize:28,letterSpacing:4,cursor:"pointer",transition:"all 0.1s",boxShadow:`0 0 20px ${C.green}20`}}>LAND</button>
              <button className="tap" onClick={()=>onAttempt(false)} style={{padding:"0",height:100,background:`${C.red}08`,border:`1px solid ${C.red}30`,borderRadius:2,color:`${C.red}cc`,fontFamily:BB,fontSize:28,letterSpacing:4,cursor:"pointer",transition:"all 0.1s"}}>MISS</button>
            </div>
          </div>
        )}

        {phase==="cpu_resp" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>YOU</div>
            <div style={{fontFamily:BB,fontSize:64,letterSpacing:3,lineHeight:0.9,color:pResult?C.green:C.red,marginBottom:24,textShadow:`0 0 30px ${pResult?C.green:C.red}25`}}>{pResult?"LANDED":"MISSED"}</div>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
            <div className="pls" style={{fontFamily:BB,fontSize:52,letterSpacing:6,color:C.white}}><Dots/></div>
          </div>
        )}

        <MenuBack/>
      </div>
    </div>
  );

  if (phase==="tie") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          <div style={{fontFamily:BB,fontSize:56,letterSpacing:2,lineHeight:0.9,color:C.white,textShadow:`0 0 30px ${C.white}10`}}>{msg}</div>
          <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.yellow,marginTop:8}}>TRY {Math.min(tryNum+1,3)} OF 3</div>
        </div>
      </div>
    </div>
  );

  if (phase==="point") {
    const pointColor = winner==="you"?C.green:C.red;
    return (
    <div style={root}>
      <div style={{position:"fixed",inset:0,background:pointColor,opacity:0,animation:"flash 0.6s ease-out",zIndex:3,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontFamily:BB,fontSize:52,letterSpacing:2,color:pointColor,textShadow:`0 0 40px ${pointColor}30`}}>
            {winner==="you"?"YOU SCORED":"CPU SCORED"}
          </div>
        </div>
      </div>
    </div>
    );
  }

  if (phase==="null") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{fontFamily:BB,fontSize:42,letterSpacing:2,color:C.sub,textShadow:`0 0 20px ${C.sub}10`}}>TRICK NULLED</div>
          <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:3,fontWeight:600}}>Next trick loading...</div>
        </div>
      </div>
    </div>
  );

  return null;
}
