import { useState, useEffect, useRef } from "react";

const LOGO = "data:image/png;base64,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";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg: "#0b0b0c",
  surface: "#121214",
  border: "#1f1f23",
  divider: "#19191c",
  white: "#fafafa",
  text: "#f3f3f3",
  sub: "#8a8a90",
  muted: "#4a4a50",
  green: "#3ddc84",
  red: "#ff4d4f",
  yellow: "#f4c430",
  orange: "#ff7a18",
  blue: "#4da3ff",
};
const BB = "'Bebas Neue', sans-serif";
const BC = "'Barlow Condensed', sans-serif";
const R  = "2px";

// ─── FONTS + KEYFRAMES ──────────────────────────────────────────────────────
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
      .rise { animation: rise 0.3s ease both }
      .pop  { animation: pop  0.38s cubic-bezier(0.34,1.56,0.64,1) both }
      .pls  { animation: pulse 1.4s ease-in-out infinite }
      .glow { animation: glow  1.1s ease-in-out infinite }
      .tap:active { transform:scale(0.96); opacity:0.82; }
      * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; margin:0; padding:0; }
    `;
    document.head.appendChild(s);
  }
}

// ─── TRICK LISTS ────────────────────────────────────────────────────────────
const AM_TRICKS = [
  "Around USA",
  "Airplane, J Stick, Poop, Inward J Stick",
  "Spike, Double Whirlwind",
  "Inward Lunar, Monkey Tap, Monkey Tap In",
  "One Turn Lighthouse Insta Trade Spike",
  "Big Cup, Nod On Bird, Over The Valley, Nod Off Mall Cup, Trade Airplane",
  "Stuntplane Fasthand Penguin Catch",
  "Pull Up Triple Kenflip Small Cup, Spike",
  "One Turn Lighthouse, 0.5 Stilt, 0.5 Lighthouse, Falling In",
  "Airplane, Double Inward J Stick",
  "Big Cup, Inward Turntable, Spike",
  "Swing Candlestick 0.5 Flip Spike",
  "Spike, Juggle Spike",
  "Ghost Lighthouse, Stuntplane",
  "Big Cup, Kneebounce Orbit Big Cup, Spike",
  "Switch Pull Up Spike, Earthturn",
  "Spacewalk Airplane",
  "Stuntplane, Inward Stuntplane Flip",
  "Slinger Spike",
  "Hanging Spike",
];

const OPEN_REGULAR = [
  "Around The Ken, Trade Downspike",
  "Spike, Trade Sara Grip Downspike Fasthand Kengrip",
  "Stuntplane, Inward Stuntplane Flip Fasthand",
  "Pull Up Kenflip Big Cup, Kenflip Spike",
  "Spike, Triple Inward Whirlwind",
  "Hanging Inward 0.5 Candlestick, Trade Inward 0.5 Flip Spike",
  "One Turn Tap Insta Lighthouse Flip Insta Inward Lighthouse Flip Tap Lighthouse, Trade Spike",
  "Around Stalls, Flex Spike",
  "Big Cup, Trade Axe, In",
  "Spacewalk One Turn Tap In",
  "One Turn Lunar, Armbounce Lunar, 0.5 Swap Spike",
  "Pull Up Muscle Spike",
  "Spike, 123 Slinger",
  "One Turn Airplane, Airplane, Inward One Turn Airplane",
  "Gooncircle Big Cup, Nod On Bird, Spike",
];

const OPEN_TOP16 = [
  "Airplane, Quad Tap In",
  "Around Sara Grip Handlestall",
  "Pull Up Speed Up Tap Stilt, Speed Up Spike Tap In",
  "Lighthouse, Two Turn Armbounce Insta Two Turn Lighthouse, In",
  "Pull Up Triple Kenflip Ghost Juggle Late Triple Kenflip Spike",
  "Airplane, Trip J Stick Penguin Airplane",
  "Handlestall, One Turn Trade Lighthouse Insta One Turn Swap Handlestall, Trade In",
  "One Turn Finger Balance Lighthouse, Inward Finger Balance Lighthouse Flip, Inward One Turn Swap Spike",
  "One Turn Cush Stuntplane Fasthand, Kenflip Toss Cush Stuntplane Fasthand",
  "Spacewalk One Turn Swap Penguin Spike Fasthand Ken Grip",
  "Lighthouse, Triple Lighthouse Flip Insta Triple Lighthouse Flip, Trade Spike",
  "Switch Swing Spike, Juggle Spike",
  "Lunar, Tre Flip Insta Backflip, In",
  "C-Whip, One Turn Lighthouse Insta One Turn Stuntplane Fasthand",
  "Big Cup, Trade Three Turn Inward Lighthouse, Trade Downspike",
];

// ─── CPU CONFIG ──────────────────────────────────────────────────────────────
const CPU_CFG = {
  easy:   { base: 0.48, label: "ROOKIE",  color: C.green  },
  medium: { base: 0.68, label: "AMATEUR", color: C.yellow },
  hard:   { base: 0.87, label: "PRO",     color: C.red    },
};

const roll = (diff, streak, streaksOn) => {
  let r = CPU_CFG[diff].base;
  if (streaksOn && streak.active)
    r = streak.dir === "hot" ? Math.min(0.88, r + 0.12) : Math.max(0.12, r - 0.20);
  return Math.random() < r;
};

// Called every trick (not just on points) so streak lengths are real trick counts
const tickStreak = (s, streaksOn) => {
  if (!streaksOn) return { active:false, dir:"hot", left:0 };
  if (s.active) return s.left <= 1 ? { active:false, dir:"hot", left:0 } : { ...s, left:s.left-1 };
  if (Math.random() < 0.10) return { active:true, dir:Math.random()<0.5?"hot":"cold", left:2+Math.floor(Math.random()*2) };
  return s;
};

const drawTrick = (pool, all) => {
  const src = pool.length > 0 ? pool : [...all];
  const i = Math.floor(Math.random() * src.length);
  return { trick: src[i], pool: src.filter((_,j)=>j!==i) };
};

// ─── SHARED UI ATOMS ────────────────────────────────────────────────────────
const NOISE = {
  position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.038,
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat:"repeat",
};

// Label — small uppercase category text
const Label = ({ children, style={} }) => (
  <div style={{
    fontFamily:BC,
    fontSize:11,
    letterSpacing:1.5,
    color:C.sub,
    fontWeight:600,
    ...style
  }}>
    {children}
  </div>
);

// Divider
const Div = ({ mt=0, mb=0 }) => (
  <div style={{ height:1, background:C.divider, marginTop:mt, marginBottom:mb }} />
);

// Primary button — off-white fill
const BtnPrimary = ({ children, onClick, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%",
    padding:"18px 20px",
    background:"#d4d4d4",
    border:"none",
    borderRadius:2,
    color:"#0b0b0c",
    fontFamily:BB,
    fontSize:20,
    letterSpacing:5,
    cursor:"pointer",
    transition:"opacity 0.1s ease",
    ...style,
  }}>
    {children}
  </button>
);

// Ghost button — outline only
const BtnGhost = ({ children, onClick, color=C.muted, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%", padding:"14px 24px",
    background:"transparent", border:`1px solid ${color}`, borderRadius:R,
    color, fontFamily:BB, fontSize:16, letterSpacing:5,
    cursor:"pointer", transition:"transform 0.08s, opacity 0.08s",
    ...style,
  }}>{children}</button>
);

// Segment control
const Seg = ({ label, opts, val, onChange }) => (
  <div style={{ marginBottom:22 }}>
    {label && <Label style={{ textAlign:"center", marginBottom:10 }}>{label}</Label>}
    <div style={{ display:"flex", gap:8 }}>
      {opts.map(o => {
        const sel = val === o.key;
        const selColor = o.color || "#c8c8c8";
        return (
          <button key={o.key} className="tap" onClick={()=>onChange(o.key)} style={{
            flex:1, padding: o.sub ? "11px 6px" : "15px 6px",
            background: sel ? (o.color ? o.color+"22" : "#ffffff0f") : "transparent",
            border:`1px solid ${sel ? selColor : C.border}`,
            color: sel ? (o.color || "#c8c8c8") : C.muted,
            fontFamily:BB, fontSize:14, letterSpacing:3,
            cursor:"pointer", borderRadius:R, transition:"all 0.12s",
          }}>
            <div>{o.label}</div>
            {o.sub && <div style={{ fontSize:9, letterSpacing:2, opacity:sel?0.6:0.4, marginTop:3 }}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  </div>
);

// Animated dots for "thinking"
function Dots() {
  const [n,setN] = useState(1);
  useEffect(()=>{ const t=setInterval(()=>setN(d=>(d%3)+1),450); return()=>clearInterval(t); },[]);
  return <span style={{letterSpacing:5}}>{[1,2,3].map(i=><span key={i} style={{opacity:i<=n?1:0.18}}>●</span>)}</span>;
}

// Streak indicator — subtle colored underline on CPU label, no banner
function StreakDot({ streak }) {
  if (!streak?.active) return null;
  const hot = streak.dir === "hot";
  const col = hot ? C.orange : C.blue;
  return (
    <div className="pls" style={{
      display:"inline-flex", alignItems:"center", gap:5,
      marginTop:4,
    }}>
      <div style={{width:5,height:5,borderRadius:"50%",background:col}}/>
      <span style={{fontFamily:BC,fontSize:10,letterSpacing:3,color:col,fontWeight:600,opacity:0.85}}>
        {hot?"HOT":"COLD"}
      </span>
    </div>
  );
}

// Result row — just shows outcome, no label
const ResultRow = ({ landed }) => (
  <div style={{
    borderLeft:`3px solid ${landed ? C.green : C.red}`,
    paddingLeft:14, paddingTop:6, paddingBottom:6,
    marginBottom:16,
    display:"flex", alignItems:"center", justifyContent:"space-between",
  }}>
    <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:3,fontWeight:600}}>CPU</div>
    <div style={{fontFamily:BB, fontSize:20, letterSpacing:4, color:landed?C.green:C.red}}>
      {landed?"LANDED ✓":"MISSED ✗"}
    </div>
  </div>
);

// Try indicator
const TryDots = ({ current }) => (
  <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:16 }}>
    {[1,2,3].map(t => (
      <div key={t} style={{
        width:28, height:3,
        background: t < current ? C.white : t === current ? C.sub : C.border,
        transition:"background 0.2s",
      }}/>
    ))}
  </div>
);

// Back button
const BackBtn = ({ onClick, label="← BACK" }) => (
  <button onClick={onClick} style={{
    background:"transparent", border:"none", color:C.muted,
    fontFamily:BB, fontSize:11, letterSpacing:5, cursor:"pointer",
    textAlign:"left", marginBottom:24, padding:0, display:"block",
  }}>{label}</button>
);

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("pick");
  const [comp,     setComp]     = useState(null);
  const [openList, setOpenList] = useState("regular");
  const [mode,     setMode]     = useState("cpu");
  const [diff,     setDiff]     = useState("medium");
  const [race,     setRace]     = useState(3);
  const [streaks,  setStreaks]  = useState(true);
  const [result,   setResult]   = useState(null);
  const [gs,       setGs]       = useState(null);

  const gsRef        = useRef(null);
  const diffRef      = useRef(diff);
  const raceRef      = useRef(race);
  const modeRef      = useRef(mode);
  const openListRef  = useRef(openList);
  const streaksRef   = useRef(streaks);

  useEffect(()=>{ gsRef.current      = gs;       },[gs]);
  useEffect(()=>{ diffRef.current    = diff;     },[diff]);
  useEffect(()=>{ raceRef.current    = race;     },[race]);
  useEffect(()=>{ modeRef.current    = mode;     },[mode]);
  useEffect(()=>{ openListRef.current = openList;},[openList]);
  useEffect(()=>{ streaksRef.current = streaks;  },[streaks]);

  const allTricks = () => {
    if (comp !== "open") return AM_TRICKS;
    if (openList === "top16") return OPEN_TOP16;
    if (openList === "mix")   return [...OPEN_REGULAR, ...OPEN_TOP16];
    return OPEN_REGULAR;
  };

  // ── CPU logic ────────────────────────────────────────────────────────────────
  function resolveCpu(pLanded, cLanded) {
    setGs(p => {
      // Always tick streak on every trick resolution (ties + points)
      const newStreak = tickStreak(p.cpuStreak, streaksRef.current);
      if (pLanded === cLanded) {
        if (p.tryNum >= 3) return { ...p, cpuStreak:newStreak, phase:"null" };
        return { ...p, cpuStreak:newStreak, phase:"tie", msg: pLanded ? "BOTH LANDED" : "BOTH MISSED" };
      }
      const winner = pLanded ? "you" : "cpu";
      return { ...p, cpuStreak:newStreak,
        scores:{...p.scores,[winner]:p.scores[winner]+1}, winner, phase:"point" };
    });
  }

  function onAttempt(landed) {
    const s = gsRef.current;
    if (!s) return;
    if (s.phase==="p_first")  setGs(p=>({...p, pResult:landed, phase:"cpu_resp"}));
    if (s.phase==="p_second") resolveCpu(landed, s.cpuFirst);
  }

  function nextCpuTrick(state) {
    const r = drawTrick(state.pool, allTricks());
    setGs({ ...state, trick:r.trick, pool:r.pool, tryNum:1,
      playerFirst:!state.playerFirst, phase:"reveal",
      cpuFirst:null, pResult:null, msg:"", winner:null });
  }

  useEffect(()=>{
    if (!gs || modeRef.current!=="cpu") return;
    let t;
    if (gs.phase==="reveal")
      t=setTimeout(()=>setGs(p=>({...p,phase:p.playerFirst?"p_first":"cpu_first"})),2000);
    else if (gs.phase==="cpu_first")
      t=setTimeout(()=>{
        const s=gsRef.current;
        setGs(p=>({...p,cpuFirst:roll(diffRef.current,s.cpuStreak,streaksRef.current),phase:"p_second"}));
      },1600);
    else if (gs.phase==="cpu_resp")
      t=setTimeout(()=>{ const s=gsRef.current; resolveCpu(s.pResult,roll(diffRef.current,s.cpuStreak,streaksRef.current)); },1600);
    else if (gs.phase==="tie")
      t=setTimeout(()=>setGs(p=>({...p,tryNum:p.tryNum+1,pResult:null,cpuFirst:null,msg:"",
        phase:p.playerFirst?"p_first":"cpu_first"})),1800);
    else if (gs.phase==="null")
      t=setTimeout(()=>nextCpuTrick(gsRef.current),1800);
    else if (gs.phase==="point")
      t=setTimeout(()=>{
        const s=gsRef.current;
        if (s.scores.you>=raceRef.current||s.scores.cpu>=raceRef.current) {
          setResult({scores:s.scores,won:s.scores.you>=raceRef.current});
          setScreen("result");
        } else nextCpuTrick(s);
      },2000);
    return ()=>clearTimeout(t);
  },[gs?.phase,gs?.trick,gs?.tryNum]);

  // ── 2P logic ─────────────────────────────────────────────────────────────────
  function on2PScore(winner) {
    setGs(p => {
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
    const r = drawTrick([],allTricks());
    if (mode==="cpu") {
      const init={scores:{you:0,cpu:0},pool:r.pool,trick:r.trick,tryNum:1,
        playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
        cpuFirst:null,pResult:null,msg:"",winner:null};
      gsRef.current=init; setGs(init);
    } else {
      const init={scores:{p1:0,p2:0},pool:r.pool,trick:r.trick,
        playerFirst:true,phase:"2p_reveal",winner:null};
      gsRef.current=init; setGs(init);
    }
    setScreen("battle");
  }

  const root = {
    fontFamily:BC, background:C.bg, color:C.text,
    minHeight:"100vh", maxWidth:440, margin:"0 auto",
    display:"flex", flexDirection:"column", position:"relative",
  };

  const page = {
    position:"relative", zIndex:1, flex:1,
    display:"flex", flexDirection:"column", padding:"28px 22px",
  };

  // ── PICK ─────────────────────────────────────────────────────────────────────
  if (screen==="pick") return (
    <div style={root}>
      <div style={NOISE}/>
      <div style={{...page, alignItems:"center"}}>

        {/* Logo centred in all remaining space */}
        <div className="rise" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%"}}>
          <img src={LOGO} alt="EKC" style={{width:300,height:300,objectFit:"contain",mixBlendMode:"screen"}}/>
        </div>

        {/* Tagline */}
        <div style={{fontFamily:BB,fontSize:9,letterSpacing:5,color:C.muted,marginBottom:20,textAlign:"center"}}>
          EUROPEAN KENDAMA CHAMPIONSHIP · MAY 22–23 · UTRECHT, NL
        </div>

        {/* Competition rows */}
        <div className="rise" style={{width:"100%",animationDelay:"0.08s"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            {[
              {key:"am_open", label:"AM OPEN",  badge:"AMATEUR"},
              {key:"open",    label:"PRO OPEN", badge:"PRO"},
            ].map((o,i)=>(
              <button key={o.key} className="tap" onClick={()=>{setComp(o.key);setScreen("settings");}} style={{
                padding:"22px 0",
                background:"transparent",
                border:"none",
                borderTop:`1px solid ${C.border}`,
                borderBottom: i===1 ? `1px solid ${C.border}` : "none",
                cursor:"pointer",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                transition:"opacity 0.1s",
                width:"100%",
              }}>
                <span style={{fontFamily:BB,fontSize:32,letterSpacing:4,color:C.white}}>{o.label}</span>
                <span style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted}}>{o.badge} →</span>
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
      <div style={NOISE}/>
      <div style={page}>
        <BackBtn onClick={()=>setScreen("pick")}/>

        {/* Header */}
        <div className="rise" style={{marginBottom:28}}>
          <div style={{fontFamily:BB,fontSize:38,letterSpacing:5,lineHeight:1,color:C.white}}>
            {comp==="am_open"?"AM OPEN":"PRO OPEN"}
          </div>
          <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:4,marginTop:8,fontWeight:600}}>
            European Kendama Championship · '26
          </div>
        </div>

        <Div mb={24}/>

        {comp==="open" && (
          <Seg label="Trick List" val={openList} onChange={setOpenList} opts={[
            {key:"regular", label:"REGULAR", sub:"15 tricks"},
            {key:"top16",   label:"TOP 16",  sub:"15 tricks"},
            {key:"mix",     label:"MIX",     sub:"all 30"},
          ]}/>
        )}

        <Seg label="Game Mode" val={mode} onChange={setMode} opts={[
          {key:"cpu", label:"CPU"},
          {key:"2p",  label:"2 PLAYER"},
        ]}/>

        {mode==="cpu" && (<>
          <Seg label="CPU Difficulty" val={diff} onChange={setDiff} opts={[
            {key:"easy",   label:"ROOKIE",  color:C.green,  sub:"~48%"},
            {key:"medium", label:"AMATEUR", color:C.yellow, sub:"~68%"},
            {key:"hard",   label:"PRO",     color:C.red,    sub:"~87%"},
          ]}/>
          <Seg label="CPU Streaks" val={streaks} onChange={setStreaks} opts={[
            {key:true,  label:"ON",  sub:"hot · cold"},
            {key:false, label:"OFF", sub:"steady rate"},
          ]}/>
        </>)}

        <Seg label="Race To" val={race} onChange={setRace} opts={[
          {key:3, label:"3"},
          {key:5, label:"5"},
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
    const winLabel = is2p ? (scores.p1>=race?"P1 WINS":"P2 WINS") : (won?"YOU WIN":"CPU WINS");
    return (
      <div style={{...root,justifyContent:"center"}}>
        <div style={NOISE}/>
        <div className="pop" style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <img src={LOGO} alt="EKC" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",mixBlendMode:"screen",opacity:0.5}}/>
          <Label style={{marginBottom:12,letterSpacing:6}}>{is2p?"Match Over":(won?"Well Done":"Keep Training")}</Label>
          <div style={{
            fontFamily:BB,fontSize:62,letterSpacing:2,lineHeight:0.88,
            color:won?C.white:C.red,
            textShadow:won?"0 0 40px rgba(255,255,255,0.12)":"0 0 40px rgba(255,77,79,0.2)",
          }}>{winLabel}</div>
          <Div mt={24} mb={24}/>
          <Label style={{marginBottom:16,letterSpacing:5}}>Final Score</Label>
          <div style={{display:"flex",justifyContent:"center",gap:32}}>
            {(is2p?[["P1",scores.p1],["P2",scores.p2]]:[["YOU",scores.you],["CPU",scores.cpu]]).map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <Label style={{marginBottom:6}}>{l}</Label>
                <div style={{fontFamily:BB,fontSize:76,lineHeight:0.9,color:C.white}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:10}}>
            <BtnPrimary onClick={()=>{setScreen("settings");setGs(null);}}>PLAY AGAIN</BtnPrimary>
            <BtnGhost onClick={()=>{setScreen("pick");setGs(null);setComp(null);}}>← MAIN MENU</BtnGhost>
          </div>
        </div>
      </div>
    );
  }

  // ── BATTLE ───────────────────────────────────────────────────────────────────
  if (!gs) return null;
  const {scores,trick,tryNum,playerFirst,phase,msg,cpuFirst,pResult,winner,cpuStreak} = gs;
  const is2p = mode==="2p";
  const pk   = `${phase}-${trick}-${tryNum||0}`;

  // Shared score header
  const ScoreBar = () => (
    <div style={{padding:"18px 24px 0"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:16}}>
        {is2p
          ? [["P1",scores.p1,null],["P2",scores.p2,null]].map(([l,v])=>(
              <div key={l} style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:4}}>{l}</Label>
                <div style={{fontFamily:BB,fontSize:52,lineHeight:0.9}}>{v}</div>
                <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:8}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<v?C.white:C.border,transition:"background 0.25s"}}/>
                  ))}
                </div>
              </div>
            ))
          : <>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:4}}>You</Label>
                <div style={{fontFamily:BB,fontSize:52,lineHeight:0.9}}>{scores.you}</div>
                <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:8}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.you?C.green:C.border,transition:"background 0.25s"}}/>
                  ))}
                </div>
              </div>
              <div style={{fontFamily:BB,fontSize:20,color:C.border,paddingTop:22}}>:</div>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:4}}>CPU</Label>
                <div style={{fontFamily:BB,fontSize:52,lineHeight:0.9}}>{scores.cpu}</div>
                <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:8}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.cpu?C.red:C.border,transition:"background 0.25s"}}/>
                  ))}
                </div>
                {!is2p && <StreakDot streak={cpuStreak}/>}
              </div>
            </>
        }
      </div>
      <Div mt={16}/>
    </div>
  );

  const MenuBack = () => (
    <div style={{padding:"10px 24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={()=>setScreen("settings")} style={{background:"transparent",border:"none",
        color:C.muted,fontFamily:BB,fontSize:10,letterSpacing:5,cursor:"pointer",padding:0}}>← MENU</button>
      <div style={{fontFamily:BB,fontSize:9,letterSpacing:4,color:C.border}}>
        EKC '26 · {comp==="am_open"?"AM OPEN":"PRO OPEN"} · UTRECHT
      </div>
    </div>
  );

  // Trick reveal (shared for CPU and 2P)
  if (phase==="reveal"||phase==="2p_reveal") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",
          justifyContent:"center",padding:"0 28px",gap:22}}>
          <div style={{fontFamily:BB,fontSize:10,letterSpacing:8,color:C.muted}}>NEXT TRICK</div>
          <div style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20}}>
            <div style={{fontFamily:BB,fontSize:40,letterSpacing:2,lineHeight:1.1,color:C.white}}>{trick}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:20,height:1,background:C.border}}/>
            <div style={{fontFamily:BB,fontSize:10,letterSpacing:6,color:C.muted}}>
              {is2p?(playerFirst?"P1 FIRST":"P2 FIRST"):(playerFirst?"YOU FIRST":"CPU FIRST")}
            </div>
          </div>
        </div>
        <MenuBack/>
      </div>
    </div>
  );

  // 2P scoring screen
  if (is2p&&phase==="2p_score") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 24px 0"}}>
          <div style={{borderLeft:`3px solid ${C.muted}`,paddingLeft:16,marginBottom:20}}>
            <Label style={{marginBottom:6}}>Trick</Label>
            <div style={{fontFamily:BB,fontSize:24,letterSpacing:2,lineHeight:1.2,color:C.white}}>{trick}</div>
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

  // 2P point flash
  if (is2p&&phase==="2p_point") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontFamily:BB,fontSize:52,letterSpacing:2,color:C.white}}>
            {winner==="p1"?"P1":"P2"} SCORED
          </div>
        </div>
      </div>
    </div>
  );

  // CPU attempt phases
  const attemptPhases=["p_first","cpu_first","p_second","cpu_resp"];
  if (attemptPhases.includes(phase)) return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>

        {/* Trick strip — always visible at top */}
        <div style={{
          borderLeft:`3px solid ${phase==="p_first"?C.white:C.muted}`,
          paddingLeft:16, margin:"14px 24px 0",
          transition:"border-color 0.3s",
        }}>
          <div style={{fontFamily:BB,fontSize:20,letterSpacing:1,lineHeight:1.2,color:phase==="p_first"?C.white:C.sub}}>{trick}</div>
        </div>

        {/* Try bars */}
        <div style={{padding:"12px 24px 0"}}>
          <TryDots current={tryNum}/>
        </div>

        {/* ── YOU GO FIRST: just the two buttons, big ── */}
        {phase==="p_first" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
            <div style={{flex:1}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="tap" onClick={()=>onAttempt(true)} style={{
                padding:"0", height:120,
                background:C.green, border:"none", borderRadius:2,
                color:C.bg, fontFamily:BB, fontSize:32, letterSpacing:4,
                cursor:"pointer", transition:"opacity 0.1s",
              }}>LAND</button>
              <button className="tap" onClick={()=>onAttempt(false)} style={{
                padding:"0", height:120,
                background:"transparent", border:`1px solid ${C.border}`,
                borderRadius:2,
                color:C.muted, fontFamily:BB, fontSize:32, letterSpacing:4,
                cursor:"pointer", transition:"opacity 0.1s",
              }}>MISS</button>
            </div>
          </div>
        )}

        {/* ── CPU GOES FIRST: minimal waiting state ── */}
        {phase==="cpu_first" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
            <div className="pls" style={{fontFamily:BB,fontSize:52,letterSpacing:6,color:C.white}}>
              <Dots/>
            </div>
          </div>
        )}

        {/* ── YOU GO SECOND: CPU result shown large, then buttons ── */}
        {phase==="p_second" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
            {/* CPU outcome — hero element */}
            <div style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:4,
            }}>
              <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
              <div style={{
                fontFamily:BB, fontSize:64, letterSpacing:3, lineHeight:0.9,
                color:cpuFirst?C.green:C.red,
              }}>
                {cpuFirst?"LANDED":"MISSED"}
              </div>
            </div>
            {/* Action buttons */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button className="tap" onClick={()=>onAttempt(true)} style={{
                padding:"0", height:100,
                background:C.green, border:"none", borderRadius:2,
                color:C.bg, fontFamily:BB, fontSize:28, letterSpacing:4,
                cursor:"pointer", transition:"opacity 0.1s",
              }}>LAND</button>
              <button className="tap" onClick={()=>onAttempt(false)} style={{
                padding:"0", height:100,
                background:"transparent", border:`1px solid ${C.border}`,
                borderRadius:2,
                color:C.muted, fontFamily:BB, fontSize:28, letterSpacing:4,
                cursor:"pointer", transition:"opacity 0.1s",
              }}>MISS</button>
            </div>
          </div>
        )}

        {/* ── CPU RESPONDS: your result shown, CPU deciding ── */}
        {phase==="cpu_resp" && (
          <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>YOU</div>
            <div style={{
              fontFamily:BB,fontSize:64,letterSpacing:3,lineHeight:0.9,
              color:pResult?C.green:C.red,
              marginBottom:24,
            }}>
              {pResult?"LANDED":"MISSED"}
            </div>
            <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted}}>CPU</div>
            <div className="pls" style={{fontFamily:BB,fontSize:52,letterSpacing:6,color:C.white}}>
              <Dots/>
            </div>
          </div>
        )}

        <MenuBack/>
      </div>
    </div>
  );

  // Tie
  if (phase==="tie") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:8}}>
          <div style={{fontFamily:BB,fontSize:56,letterSpacing:2,lineHeight:0.9,color:C.white}}>{msg}</div>
          <div style={{fontFamily:BB,fontSize:11,letterSpacing:8,color:C.muted,marginTop:8}}>TRY {Math.min(tryNum+1,3)} OF 3</div>
        </div>
      </div>
    </div>
  );

  // Point
  if (phase==="point") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",
          justifyContent:"center",textAlign:"center"}}>
          <div style={{fontFamily:BB,fontSize:52,letterSpacing:2,color:winner==="you"?C.green:C.red}}>
            {winner==="you"?"YOU SCORED":"CPU SCORED"}
          </div>
        </div>
      </div>
    </div>
  );

  // Null
  if (phase==="null") return (
    <div style={root}><div style={NOISE}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar/>
        <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",textAlign:"center",gap:10}}>
          <div style={{fontFamily:BB,fontSize:42,letterSpacing:2,color:C.sub}}>TRICK NULLED</div>
          <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:3}}>Moving on...</div>
        </div>
      </div>
    </div>
  );

  return null;
}
