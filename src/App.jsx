import React, { useState, useEffect, useReducer, useRef, useMemo } from "react";
import { SB } from "./supabase";
import { LOGO, C, BB, BC, R, CPU_CFG, CPU_NAMES, haptic, getTricksForDiv, MODE_COLORS } from "./config";
import gameReducer from "./gameReducer";
import { buildPool } from "./cpu";

// Screens
import HomeScreen from "./screens/HomeScreen";
import CompPickScreen from "./screens/CompPickScreen";
import SettingsScreen from "./screens/SettingsScreen";
import BattleScreen from "./screens/BattleScreen";
import ResultScreen from "./screens/ResultScreen";
import BracketScreen from "./screens/BracketScreen";
import DrillScreen from "./screens/DrillScreen";
import DrillPickScreen from "./screens/DrillPickScreen";
import FeedbackScreen from "./screens/FeedbackScreen";

// Components
import AuthScreen from "./components/Auth";
import StatsScreen from "./components/Stats";

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  const [user,     setUser]     = useState(null);
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest,  setIsGuest]  = useState(false);
  const [authStartTab, setAuthStartTab] = useState("login");

  // ── Navigation & selection ──
  const [screen,   setScreen]   = useState("home");
  const [selectedComp, setSelectedComp] = useState(null);
  const [selectedDiv,  setSelectedDiv]  = useState(null);
  const [openList, setOpenList] = useState("regular");
  const [mode,     setMode]     = useState("cpu");
  const [expandedComp, setExpandedComp] = useState(null);

  // ── Game config ──
  const [diff,     setDiff]     = useState("medium");
  const [race,     setRace]     = useState(3);
  const [streaks,  setStreaks]  = useState(true);

  // ── Game state (useReducer — fix #2: eliminates ref syncing) ──
  const [gs, dispatchGs] = useReducer(gameReducer, null);
  const [result,   setResult]   = useState(null);

  // ── Drill state ──
  const [drillType,   setDrillType]   = useState("consistency");
  const [drillTarget, setDrillTarget] = useState(3);
  const [drillSource, setDrillSource] = useState("weakest");
  const [drillAlert, setDrillAlert] = useState("");
  const [drill,       setDrill]       = useState(null);
  const [pickedTricks, setPickedTricks] = useState([]);

  // ── Tournament state ──
  const [bracketSize, setBracketSize] = useState(8);
  const [tourney, setTourney] = useState(null);
  const tourneyRef = useRef(tourney);
  useEffect(()=>{ tourneyRef.current = tourney; },[tourney]);

  // ── 2P state ──
  const [p1Name, setP1Name] = useState("P1");
  const [p2Name, setP2Name] = useState("P2");
  const P1_COL = C.green;
  const P2_COL = C.orange;

  // ── UI state ──
  const [showInfo, setShowInfo] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [homeStats, setHomeStats] = useState(null);

  // ── Refs for Supabase saves (only 2 needed now — fix #2) ──
  const userRef = useRef(user);
  const compDbKeyRef = useRef(null);
  useEffect(()=>{ userRef.current = user; },[user]);
  const compDbKey = selectedComp && selectedDiv ? `${selectedComp.key}:${selectedDiv.key}` : null;
  useEffect(()=>{ compDbKeyRef.current = compDbKey; },[compDbKey]);

  // Reset info overlay on screen change
  useEffect(()=>{ setShowInfo(false); },[screen]);

  // ── Auth: check session on load (fix #8: .catch for error boundary) ──
  useEffect(()=>{
    SB.auth.getSession().then(async ({ data:{ session } })=>{
      if (session?.user) {
        let { data:prof } = await SB.from("profiles").select("username").eq("id",session.user.id).single();
        if (!prof) {
          const fallbackName = session.user.email.split("@")[0];
          await SB.from("profiles").insert({ id:session.user.id, username:fallbackName });
          prof = { username:fallbackName };
        }
        setUser(session.user); setUsername(prof.username);
      }
      setAuthLoading(false);
    }).catch(()=>{
      // Supabase unreachable — let guest mode through
      setAuthLoading(false);
    });
  },[]);

  // ── Home stats ──
  useEffect(()=>{
    if (!user) { setHomeStats(null); return; }
    if (screen !== "home") return;
    Promise.all([
      SB.from("match_results").select("won").eq("user_id",user.id),
      SB.from("trick_attempts").select("landed").eq("user_id",user.id),
    ]).then(([mRes, tRes])=>{
      const matches = mRes.data||[]; const tricks = tRes.data||[];
      const wins = matches.filter(m=>m.won).length;
      setHomeStats({wins, losses:matches.length-wins, total:matches.length,
        trickLands:tricks.filter(t=>t.landed).length, trickTotal:tricks.length});
    }).catch(()=>setHomeStats(null));
  },[user, screen]);

  // ── Shared trick helper (fix #5: single source of truth) ──
  const allTricks = useMemo(()=>{
    return () => getTricksForDiv(selectedDiv, openList);
  },[selectedDiv, openList]);

  // ── Auth helpers ──
  async function handleSignOut() {
    await SB.auth.signOut();
    setUser(null); setUsername(""); setIsGuest(false);
    setScreen("home"); setSelectedComp(null); setSelectedDiv(null);
  }
  function enterAsGuest() { setIsGuest(true); setUsername("Guest"); setScreen("home"); }
  function goToAuth(tab="login") { setAuthStartTab(tab); setIsGuest(false); setUser(null); setUsername(""); setScreen("home"); }

  // ── Supabase save helpers (haptic separated from state — fix #12) ──
  async function saveTrickAttempt(trick, landed) {
    const u = userRef.current;
    if (!u || !trick) return;
    const { error } = await SB.from("trick_attempts").insert({
      user_id:u.id, trick, landed, competition:compDbKeyRef.current||"unknown",
    });
    if (error) console.error("trick_attempts insert:", error.message);
  }

  async function saveMatchResult(scores, won, gameLog) {
    const u = userRef.current;
    if (!u) return;
    const base = {user_id:u.id, competition:compDbKeyRef.current||"unknown",
      difficulty:diff, race_to:race, won, your_score:scores.you, cpu_score:scores.cpu};
    const payload = gameLog?.length ? {...base, game_log:JSON.stringify(gameLog)} : base;
    const { error } = await SB.from("match_results").insert(payload);
    if (error) {
      const { error:e2 } = await SB.from("match_results").insert(base);
      if (e2) console.error("match_results insert:", e2.message);
    }
  }

  // ── Game start ──
  function startGame() {
    const tricks = allTricks();
    const { pool } = buildPool(tricks);
    const trick = pool[0];
    const restPool = pool.slice(1);
    if (mode==="cpu"||mode==="tournament") {
      const init = {scores:{you:0,cpu:0},pool:restPool,trick,tryNum:1,
        playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
        cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0,
        gameLog:[],currentTries:[],matchOver:false,scoredTricks:[],
        config:{diff,race,streaks,mode}};
      dispatchGs({type:"INIT_CPU",payload:init});
    } else {
      const init = {scores:{p1:0,p2:0},pool:restPool,trick,
        playerFirst:Math.random()<0.5,phase:"2p_reveal",winner:null,matchOver:false,
        scoredTricks:[],config:{race,mode:"2p"}};
      dispatchGs({type:"INIT_2P",payload:init});
    }
    setScreen("battle");
  }

  // ── Match over handler ──
  function handleMatchOver(res) {
    if (res.mode !== "2p") saveMatchResult(res.scores, res.won, res.gameLog);
    if (tourneyRef.current && res.mode !== "2p") {
      handleTournamentResult(res.won, res.scores);
    } else {
      setResult(res); setScreen("result");
    }
  }

  // ── Drill start ──
  async function buildDrillQueue(source) {
    const tricks = allTricks();
    if (source==="pick") return [...tricks].sort(()=>Math.random()-0.5);
    if ((source==="weakest"||source==="full") && userRef.current) {
      const { data } = await SB.from("trick_attempts").select("trick,landed,competition")
        .eq("user_id",userRef.current.id);
      const stats = {};
      (data||[]).filter(a=>a.competition===compDbKeyRef.current).forEach(a=>{
        if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
        if (a.landed) stats[a.trick].land++; else stats[a.trick].miss++;
      });
      const rated = tricks.map(t=>{
        const s = stats[t]; if (!s) return null;
        return {trick:t,rate:Math.round(s.land/(s.land+s.miss)*100)};
      }).filter(Boolean);
      let filtered;
      if (source==="weakest") {
        // "Needs Work" — rate < 40%
        filtered = rated.filter(r=>r.rate<40).sort((a,b)=>a.rate-b.rate);
      } else {
        // "Getting There" — rate 40–69%
        filtered = rated.filter(r=>r.rate>=40&&r.rate<70).sort((a,b)=>a.rate-b.rate);
      }
      if (filtered.length>0) return filtered.map(r=>r.trick);
      return [];
    }
    return [...tricks].sort(()=>Math.random()-0.5);
  }

  async function startDrill() {
    if (drillSource==="pick") { setPickedTricks([]); setScreen("drill_pick"); return; }
    const queue = await buildDrillQueue(drillSource);
    if (queue.length===0) {
      const label = drillSource==="weakest"?"NEEDS WORK":"GETTING THERE";
      setDrillAlert(`No ${label} tricks found. Use PICK to choose specific tricks.`);
      return;
    }
    if (drillType==="consistency") {
      setDrill({type:"consistency",target:drillTarget,trick:queue[0],
        completed:[],queue:queue.slice(1),phase:"active"});
    } else {
      setDrill({type:"firsttry",trick:queue[0],queue:queue.slice(1),
        completed:[],index:0,total:queue.length,phase:"active"});
    }
    setScreen("drill");
  }

  function startDrillPick(tricks) {
    const shuffled = [...tricks].sort(()=>Math.random()-0.5);
    if (drillType==="consistency") {
      setDrill({type:"consistency",target:drillTarget,trick:shuffled[0],
        completed:[],queue:shuffled.slice(1),phase:"active",pickMode:true});
    } else {
      setDrill({type:"firsttry",trick:shuffled[0],queue:shuffled.slice(1),
        completed:[],index:0,total:shuffled.length,phase:"active",pickMode:true});
    }
    setScreen("drill");
  }

  // ── Tournament (fix #7: proper immutability) ──
  function getTourneyNudge(ri) { return ri*0.02; }
  function getTourneyTrickList(ri, totalRounds, div) {
    if (div?.trickSets) return ri>=totalRounds-1?"top16":"regular";
    return null;
  }

  function generateBracket(size) {
    const names = [...CPU_NAMES].sort(()=>Math.random()-0.5).slice(0,size-1);
    const players = [{seed:0,name:username||"YOU",isHuman:true,eliminated:false}];
    names.forEach((n,i)=>players.push({seed:i+1,name:n,isHuman:false,eliminated:false}));
    const seeds = players.sort(()=>Math.random()-0.5).map((p,i)=>({...p,seed:i}));
    const totalRounds = size===4?2:3;
    const rounds = [];
    const r1 = [];
    for (let i=0;i<size;i+=2) r1.push({p1:seeds[i].seed,p2:seeds[i+1].seed,winner:null,p1Score:0,p2Score:0,played:false});
    rounds.push(r1);
    let mc = size/4;
    while (mc>=1) { rounds.push(Array.from({length:mc},()=>({p1:null,p2:null,winner:null,p1Score:0,p2Score:0,played:false}))); mc/=2; }
    return {bracketSize:size,raceTo:race,baseDiff:diff,players:seeds,rounds,currentRound:0,
      phase:"bracket",playerSeed:seeds.find(p=>p.isHuman).seed};
  }

  function startTournament() { setTourney(generateBracket(bracketSize)); setScreen("bracket"); }

  function startTournamentMatch() {
    const t = tourneyRef.current||tourney;
    if (!t) return;
    const round = t.rounds[t.currentRound];
    const myMatch = round.find(m=>m.p1===t.playerSeed||m.p2===t.playerSeed);
    if (!myMatch) return;
    const oppSeed = myMatch.p1===t.playerSeed?myMatch.p2:myMatch.p1;
    const oppName = t.players.find(p=>p.seed===oppSeed)?.name||"CPU";
    const totalRounds = t.rounds.length;
    const tl = getTourneyTrickList(t.currentRound, totalRounds, selectedDiv);
    const nudge = getTourneyNudge(t.currentRound);
    // Use unified getTricksForDiv (fix #5)
    const tricks = getTricksForDiv(selectedDiv, tl||openList);
    const { pool } = buildPool(tricks);
    const trick = pool[0];
    const restPool = pool.slice(1);
    const init = {scores:{you:0,cpu:0},pool:restPool,trick,tryNum:1,
      playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
      cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0,
      gameLog:[],currentTries:[],cpuNudge:nudge,matchOver:false,scoredTricks:[],cpuName:oppName,
      config:{diff:t.baseDiff,race:t.raceTo,streaks:true,mode:"tournament"}};
    dispatchGs({type:"INIT_CPU",payload:init});
    if (tl) setOpenList(tl);
    setScreen("battle");
  }

  function simulateCpuMatch(match, roundIdx) {
    const t = tourneyRef.current||tourney;
    const rate = CPU_CFG[t?.baseDiff||"medium"].base + getTourneyNudge(roundIdx);
    let s1=0, s2=0; const rt = t?.raceTo||race;
    while (s1<rt && s2<rt) { Math.random()<rate+0.05*(Math.random()-0.5)?s1++:s2++; }
    return {...match, winner:s1>=rt?match.p1:match.p2, p1Score:s1, p2Score:s2, played:true};
  }

  function handleTournamentResult(won, scores) {
    setTourney(prev=>{
      if (!prev) return prev;
      // Deep clone for immutability (fix #7)
      const players = prev.players.map(p=>({...p}));
      const rounds = prev.rounds.map(r=>r.map(m=>({...m})));
      const round = rounds[prev.currentRound];
      const mi = round.findIndex(m=>m.p1===prev.playerSeed||m.p2===prev.playerSeed);
      if (mi>=0) {
        const m = round[mi];
        const isP1 = m.p1===prev.playerSeed;
        round[mi] = {...m, winner:won?prev.playerSeed:(isP1?m.p2:m.p1),
          p1Score:isP1?scores.you:scores.cpu, p2Score:isP1?scores.cpu:scores.you, played:true};
        if (!won) {
          const pi = players.findIndex(p=>p.seed===prev.playerSeed);
          if (pi>=0) players[pi] = {...players[pi], eliminated:true};
        }
      }
      // Simulate CPU matches
      round.forEach((m,i)=>{
        if (!m.played && m.p1!==null && m.p2!==null) {
          round[i] = simulateCpuMatch(m, prev.currentRound);
          const loser = round[i].winner===round[i].p1?round[i].p2:round[i].p1;
          const li = players.findIndex(p=>p.seed===loser);
          if (li>=0) players[li] = {...players[li], eliminated:true};
        }
      });
      // Populate next round
      if (prev.currentRound < rounds.length-1) {
        const nextRound = rounds[prev.currentRound+1];
        for (let i=0;i<round.length;i+=2) {
          const ni = Math.floor(i/2);
          if (ni<nextRound.length) nextRound[ni] = {...nextRound[ni], p1:round[i]?.winner, p2:round[i+1]?.winner};
        }
      }
      // Determine phase
      const lastRound = rounds[rounds.length-1];
      let phase;
      if (lastRound[0]?.played) {
        phase = lastRound[0].winner===prev.playerSeed?"champion":"eliminated";
      } else if (!won) {
        phase = "eliminated";
      } else {
        phase = "advancing";
      }
      return {...prev, players, rounds, phase, lastWonScores:phase==="advancing"?scores:undefined};
    });
    dispatchGs({type:"END_MATCH"});
    setScreen("bracket");
  }

  // Tournament auto-advance
  const advancingSkipRef = useRef(null);
  useEffect(()=>{
    if (!tourney||tourney.phase!=="advancing") return;
    const cb = ()=>{
      setTourney(prev=>{
        if (!prev||prev.phase!=="advancing") return prev;
        return {...prev, currentRound:prev.currentRound+1, phase:"bracket", lastWonScores:undefined};
      });
    };
    const t = setTimeout(cb, 2400);
    advancingSkipRef.current = { tid:t, cb };
    return ()=>{ clearTimeout(t); advancingSkipRef.current = null; };
  },[tourney?.phase]);

  const skipAdvancing = () => {
    const s = advancingSkipRef.current;
    if (s) { clearTimeout(s.tid); advancingSkipRef.current = null; s.cb(); }
  };

  // ── Loading ──
  if (authLoading) return (
    <div style={{fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}} role="status" aria-label="Loading app">
      <img src={LOGO} alt="KOMP" className="glow" style={{width:100,height:100,objectFit:"contain"}}/>
      <div className="fadeUp" style={{fontFamily:BB,fontSize:12,letterSpacing:6,color:C.muted,marginTop:16,animationDelay:"0.3s",animationFillMode:"both"}}>LOADING</div>
    </div>
  );

  // ── Auth gate ──
  if (!user && !isGuest) return <AuthScreen onAuth={(u,n)=>{setUser(u);setUsername(n);}} onGuest={enterAsGuest} startTab={authStartTab}/>;

  // ── Screen router ──
  if (screen==="stats") return (
    <StatsScreen user={user} username={username} isGuest={isGuest}
      onBack={()=>setScreen(selectedDiv?"settings":"home")} onAuth={goToAuth}
      compDbKey={compDbKey} selectedComp={selectedComp} selectedDiv={selectedDiv}/>
  );

  if (screen==="feedback") return (
    <FeedbackScreen user={user} username={username}
      onBack={()=>{setScreen("home");setFeedbackText("");setFeedbackSent(false);}}/>
  );

  if (screen==="drill_pick") return (
    <DrillPickScreen allTricks={allTricks} drill={drill} pickedTricks={pickedTricks}
      setPickedTricks={setPickedTricks} drillType={drillType} drillTarget={drillTarget}
      startDrillPick={startDrillPick} onBack={()=>setScreen("settings")}/>
  );

  if (screen==="drill" && drill) return (
    <DrillScreen drill={drill} setDrill={setDrill}
      drillType={drillType} drillTarget={drillTarget} showInfo={showInfo} setShowInfo={setShowInfo}
      onQuit={()=>{setPickedTricks([]);setDrill(null);setScreen("settings");}}
      onPickMore={()=>{setPickedTricks([]);setDrill(p=>({...p,phase:undefined,trick:null,completed:[]}));setScreen("drill_pick");}}
      onSettings={()=>{setDrill(null);setScreen("settings");}}
      onMainMenu={()=>{setDrill(null);setScreen("home");setSelectedComp(null);setSelectedDiv(null);}}/>
  );

  if (screen==="bracket" && tourney) return (
    <BracketScreen tourney={tourney} selectedComp={selectedComp} selectedDiv={selectedDiv} race={race}
      showInfo={showInfo} setShowInfo={setShowInfo} startTournamentMatch={startTournamentMatch}
      onSkipAdvancing={skipAdvancing}
      onQuit={()=>{setTourney(null);setScreen("home");setSelectedComp(null);setSelectedDiv(null);}}
      onNewTournament={()=>{setTourney(null);setScreen("settings");}}/>
  );

  if (screen==="compPick") return (
    <CompPickScreen mode={mode} expandedComp={expandedComp} setExpandedComp={setExpandedComp}
      setSelectedComp={setSelectedComp} setSelectedDiv={setSelectedDiv} setOpenList={setOpenList} setScreen={setScreen}/>
  );

  if (screen==="settings" && selectedDiv) return (
    <SettingsScreen selectedComp={selectedComp} selectedDiv={selectedDiv} mode={mode}
      openList={openList} setOpenList={setOpenList} diff={diff} setDiff={setDiff}
      race={race} setRace={setRace} streaks={streaks} setStreaks={setStreaks}
      drillType={drillType} setDrillType={setDrillType} drillTarget={drillTarget} setDrillTarget={setDrillTarget}
      drillSource={drillSource} setDrillSource={setDrillSource} isGuest={isGuest}
      drillAlert={drillAlert} setDrillAlert={setDrillAlert}
      bracketSize={bracketSize} setBracketSize={setBracketSize}
      p1Name={p1Name} setP1Name={setP1Name} p2Name={p2Name} setP2Name={setP2Name}
      P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}
      onStart={mode==="drill"?startDrill:mode==="tournament"?startTournament:startGame} setScreen={setScreen}/>
  );

  if (screen==="result" && result) return (
    <ResultScreen result={result} race={race} p1Name={p1Name} p2Name={p2Name}
      P1_COL={P1_COL} P2_COL={P2_COL} isGuest={isGuest} haptic={haptic}
      onPlayAgain={()=>{setScreen("settings");dispatchGs({type:"END_MATCH"});}}
      onViewStats={()=>{if(isGuest){goToAuth("signup");return;}setScreen("stats");dispatchGs({type:"END_MATCH"});}}
      onMainMenu={()=>{setScreen("home");dispatchGs({type:"END_MATCH"});setTourney(null);setSelectedComp(null);setSelectedDiv(null);}}/>
  );

  if (screen==="battle" && gs) return (
    <BattleScreen gs={gs} dispatch={dispatchGs} mode={gs.config?.mode||mode} race={gs.config?.race||race}
      selectedDiv={selectedDiv} openList={openList}
      p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL}
      showInfo={showInfo} setShowInfo={setShowInfo}
      onMatchOver={handleMatchOver} saveTrickAttempt={saveTrickAttempt} setScreen={setScreen}/>
  );

  if (screen==="home") return (
    <HomeScreen user={user} username={username} isGuest={isGuest} homeStats={homeStats}
      setMode={setMode} setScreen={setScreen} setDrillSource={setDrillSource}
      goToAuth={goToAuth} handleSignOut={handleSignOut}
      setFeedbackText={setFeedbackText} setFeedbackSent={setFeedbackSent}/>
  );

  return null;
}
