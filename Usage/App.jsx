import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const LOGO = "data:image/png;base64,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";

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
  // If CPU has been landing a lot, slight regression; if missing, slight boost
  const nudge = (landRate - 0.5) * -0.06; // ±3% max
  return Math.max(0.10, Math.min(0.92, rate + nudge));
};

// Comeback: score differential adjusts rate
const applyComeback = (rate, cpuScore, playerScore, raceTo) => {
  const diff = playerScore - cpuScore;
  if (diff >= 2) return Math.min(0.90, rate + 0.05);  // CPU behind by 2+: small boost
  if (diff <= -2) return Math.max(0.15, rate - 0.04); // CPU ahead by 2+: slight nerf
  return rate;
};

// Clutch: at match point, tension heightens
const applyClutch = (rate, cpuScore, playerScore, raceTo) => {
  const cpuMatchPoint = cpuScore === raceTo - 1;
  const playerMatchPoint = playerScore === raceTo - 1;
  if (cpuMatchPoint && playerMatchPoint) return rate + 0.03; // Double match point: CPU focuses
  if (playerMatchPoint) return rate + 0.04;                  // Player match point: CPU desperate
  if (cpuMatchPoint) return rate - 0.02;                     // CPU match point: slight overconfidence
  return rate;
};

const cpuThinkTime = (diff) => {
  const [min, max] = CPU_CFG[diff].thinkMs;
  return min + Math.random() * (max - min);
};

const roll = (diff, streak, streaksOn, gameState={}) => {
  let r = CPU_CFG[diff].base;
  // Apply streak modifier
  if (streaksOn && streak.active)
    r = streak.dir==="hot" ? Math.min(0.88,r+0.12) : Math.max(0.12,r-0.18);
  // Apply momentum
  if (gameState.cpuMomentum) r = applyMomentum(r, gameState.cpuMomentum);
  // Apply comeback
  if (gameState.scores) r = applyComeback(r, gameState.scores.cpu, gameState.scores.you, gameState.raceTo || 3);
  // Apply clutch
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
const NOISE = {
  position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.07,
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat:"repeat",
};

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

const ResultRow = ({ landed }) => (
  <div style={{borderLeft:`3px solid ${landed?C.green:C.red}`,paddingLeft:14,paddingTop:8,paddingBottom:8,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",background:landed?`${C.green}06`:`${C.red}06`}}>
    <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:3,fontWeight:600}}>CPU</div>
    <div style={{fontFamily:BB,fontSize:20,letterSpacing:4,color:landed?C.green:C.red,textShadow:`0 0 20px ${landed?C.green:C.red}20`}}>
      {landed?"LANDED ✓":"MISSED ✗"}
    </div>
  </div>
);

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

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [tab,    setTab]    = useState("login"); // "login" | "signup"
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
      // Don't insert profile yet — user needs to confirm email first
      setConfirmed(true);
      setLoading(false);
      return;
    } else {
      const { data, error } = await SB.auth.signInWithPassword({ email, password:pw });
      if (error) { setErr(error.message); setLoading(false); return; }
      // Fetch profile — if missing (first login after confirmation), create it now
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
          <img src={LOGO} alt="NXS" style={{width:120,height:120,objectFit:"contain",mixBlendMode:"screen",marginBottom:12,display:"block",margin:"0 auto 12px"}}/>
          <div style={{fontFamily:BB,fontSize:9,letterSpacing:5,color:C.muted}}>NXS BATTLE · KENDAMA TRAINER</div>
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
            {/* Tab switcher */}
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
          </>
        )}
      </div>
    </div>
  );
}

// ─── STATS SCREEN ────────────────────────────────────────────────────────────
function StatsScreen({ user, username, onBack }) {
  const [matches,  setMatches]  = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [tab,      setTab]      = useState("record");   // "record" | "tricks"
  const [divKey,   setDivKey]   = useState("am_open");  // active division

  useEffect(()=>{
    SB.from("match_results").select("*").eq("user_id",user.id)
      .then(({data})=>setMatches(data||[]));
    SB.from("trick_attempts").select("trick,landed,competition").eq("user_id",user.id)
      .then(({data})=>setAttempts(data||[]));
  },[]);

  const DIVISIONS   = [{key:"am_open",label:"AM OPEN"},{key:"open",label:"PRO OPEN"}];
  const DIFFICULTIES= ["easy","medium","hard"];
  const DIFF_LABELS = {easy:"ROOKIE",medium:"AMATEUR",hard:"PRO"};
  const DIFF_COLORS = {easy:C.green,medium:C.yellow,hard:C.red};

  // ── Record data ──────────────────────────────────────────────────────────────
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

  // ── Trick data ───────────────────────────────────────────────────────────────
  const tricksForDiv = (key) => {
    const stats = {};
    (attempts||[]).filter(a=>(a.competition||"am_open")===key).forEach(a=>{
      if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
      if (a.landed) stats[a.trick].land++;
      else stats[a.trick].miss++;
    });
    return Object.entries(stats)
      .map(([t,s])=>({trick:t, rate:Math.round(s.land/(s.land+s.miss)*100), att:s.land+s.miss}))
      .sort((a,b)=>a.rate-b.rate);  // worst first — most actionable
  };

  const loading = matches===null || attempts===null;

  const root = {fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"};

  return (
    <div style={root}>
      
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* ── Header ── */}
        <div style={{padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <BackBtn onClick={onBack}/>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>{username}</div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,marginTop:6,fontWeight:600}}>Training Stats</div>
          </div>

          {/* Division switcher */}
          <div style={{display:"flex",gap:0,marginBottom:0}}>
            {DIVISIONS.map(d=>(
              <button key={d.key} onClick={()=>setDivKey(d.key)} style={{
                flex:1,padding:"10px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${divKey===d.key?C.white:"transparent"}`,
                color:divKey===d.key?C.white:C.muted,
                fontFamily:BB,fontSize:14,letterSpacing:3,
                cursor:"pointer",transition:"all 0.15s",
              }}>{d.label}</button>
            ))}
          </div>
          <Div/>

          {/* Tab switcher */}
          <div style={{display:"flex",gap:0,marginTop:0}}>
            {[["record","RECORD"],["tricks","TRICKS"]].map(([k,l])=>(
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

        {/* ── Scrollable content ── */}
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"24px 24px 32px"}}>

          {loading && <div style={{fontFamily:BC,fontSize:14,color:C.muted}}>Loading...</div>}

          {/* ── RECORD TAB ── */}
          {!loading && tab==="record" && (()=>{
            const rows = recordForDiv(divKey);
            const tot  = totalRecord(divKey);
            if (rows.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No matches yet for {DIVISIONS.find(d=>d.key===divKey)?.label}.<br/>Play vs CPU to track your record.
              </div>
            );
            return (
              <>
                {/* Big overall score */}
                <div style={{display:"flex",gap:0,marginBottom:28}}>
                  {[["WINS",tot.wins,C.green],["LOSSES",tot.losses,C.red]].map(([l,v,col])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:col}}>{v}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted,marginTop:8}}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Win rate bar */}
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

                {/* Per difficulty breakdown */}
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
                No trick data yet for {DIVISIONS.find(d=>d.key===divKey)?.label}.<br/>Attempt rates are tracked when you play vs CPU.
              </div>
            );

            // Split into weak (<50%) and strong (>=50%)
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
    setUser(null); setUsername(""); setIsGuest(false); setScreen("home");
  }

  function enterAsGuest() {
    setIsGuest(true); setUsername("Guest"); setScreen("home");
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

  const allTricks = () => {
    if (comp!=="open") return AM_TRICKS;
    if (openList==="top16") return OPEN_TOP16;
    if (openList==="mix")   return [...OPEN_REGULAR,...OPEN_TOP16];
    return OPEN_REGULAR;
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
      
      <img src={LOGO} alt="NXS" className="glow" style={{width:100,height:100,objectFit:"contain",mixBlendMode:"screen"}}/>
      <div className="fadeUp" style={{fontFamily:BB,fontSize:10,letterSpacing:6,color:C.muted,marginTop:16,animationDelay:"0.3s",animationFillMode:"both"}}>LOADING</div>
    </div>
  );

  // Auth gate
  if (!user) return <AuthScreen onAuth={(u,n)=>{setUser(u);setUsername(n);}}/>;

  // Stats screen
  if (screen==="stats") return <StatsScreen user={user} username={username} onBack={()=>setScreen("pick")}/>;

  // ── PICK ─────────────────────────────────────────────────────────────────────
  if (screen==="pick") return (
    <div style={root}>
      
      <div style={{...page,alignItems:"center"}}>

        {/* User bar */}
        <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <button onClick={()=>setScreen("stats")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:11,letterSpacing:4,cursor:"pointer",padding:0}}>
            {username} · STATS →
          </button>
          <button onClick={handleSignOut} style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:10,letterSpacing:4,cursor:"pointer",padding:0}}>
            LOG OUT
          </button>
        </div>

        <div className="rise" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%"}}>
          <img src={LOGO} alt="NXS" style={{width:300,height:300,objectFit:"contain",mixBlendMode:"screen"}}/>
        </div>

        <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.sub,marginBottom:20,textAlign:"center"}}>
          KENDAMA NXS · BATTLE TRAINER
        </div>

        <div className="rise" style={{width:"100%",animationDelay:"0.08s"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            {[
              {key:"am_open",label:"AM OPEN", badge:"AMATEUR"},
              {key:"open",   label:"PRO OPEN",badge:"PRO"},
            ].map((o,i)=>(
              <button key={o.key} className="tap" onClick={()=>{setComp(o.key);setScreen("settings");}} style={{
                padding:"22px 0",background:"transparent",border:"none",
                borderTop:`1px solid ${C.border}`,
                borderBottom:i===1?`1px solid ${C.border}`:"none",
                cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                transition:"opacity 0.1s",width:"100%",
              }}>
                <span style={{fontFamily:BB,fontSize:32,letterSpacing:4,color:C.white}}>{o.label}</span>
                <span style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.sub}}>{o.badge} →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  if (screen==="settings") return (
    <div style={root}>
      
      <div style={page}>
        <BackBtn onClick={()=>setScreen("pick")}/>
        <div className="rise" style={{marginBottom:28}}>
          <div style={{fontFamily:BB,fontSize:38,letterSpacing:5,lineHeight:1,color:C.white}}>
            {comp==="am_open"?"AM OPEN":"PRO OPEN"}
          </div>
          <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:4,marginTop:8,fontWeight:600}}>
            KENDAMA NXS · Battle Trainer
          </div>
        </div>
        <Div mb={24}/>
        {comp==="open" && (
          <Seg label="Trick List" val={openList} onChange={setOpenList} opts={[
            {key:"regular",label:"REGULAR",sub:"15 tricks"},
            {key:"top16",  label:"TOP 16", sub:"15 tricks"},
            {key:"mix",    label:"MIX",    sub:"all 30"},
          ]}/>
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
        
        {/* Flash overlay on result */}
        <div style={{position:"fixed",inset:0,background:resultColor,opacity:0,animation:"flash 0.8s ease-out",zIndex:2,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <div className="fadeUp" style={{animationDelay:"0s"}}>
            <img src={LOGO} alt="NXS" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",mixBlendMode:"screen",opacity:0.4}}/>
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
              <BtnGhost color={C.sub} onClick={()=>{setScreen("stats");setGs(null);}}>VIEW STATS →</BtnGhost>
            )}
            <BtnGhost onClick={()=>{setScreen("pick");setGs(null);setComp(null);}}>← MAIN MENU</BtnGhost>
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
