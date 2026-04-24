import React, { useState, useEffect, useReducer, useRef, useMemo } from "react";
import { SB } from "./supabase";
import { LOGOS, C, BB, BC, R, CPU_CFG, CPU_NAMES, haptic, getTricksForDiv, MODE_COLORS } from "./config";
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
import AdminScreen from "./screens/AdminScreen";

// Components
import AuthScreen from "./components/Auth";
import StatsScreen from "./components/Stats";
import { BtnPrimary } from "./components/ui";

// ─── ADMIN ────────────────────────────────────────────────────────────────────
// Users allowed to view the /admin page. Add your Supabase user.id here.
// Find yours: Supabase → Authentication → Users → click your row → copy the ID.
const ADMIN_USER_IDS = [
  // "00000000-0000-0000-0000-000000000000",   // ← paste your user.id here
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  const [user,     setUser]     = useState(null);
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest,  setIsGuest]  = useState(false);
  const [authStartTab, setAuthStartTab] = useState("login");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPw, setRecoveryPw] = useState("");
  const [recoveryErr, setRecoveryErr] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryDone, setRecoveryDone] = useState(false);

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
  const P2_COL = C.logored;

  // ── UI state ──
  const [showInfo, setShowInfo] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [homeStats, setHomeStats] = useState(null);

  // ── Refs for Supabase saves (only 2 needed now — fix #2) ──
  const userRef = useRef(user);
  const compDbKeyRef = useRef(null);
  const trickBufferRef = useRef([]);
  useEffect(()=>{ userRef.current = user; },[user]);
  const compDbKey = selectedComp && selectedDiv ? `${selectedComp.key}:${selectedDiv.key}` : null;
  useEffect(()=>{ compDbKeyRef.current = compDbKey; },[compDbKey]);

  // Reset info overlay on screen change
  useEffect(()=>{ setShowInfo(false); },[screen]);
  // Discard buffered trick attempts if player quits mid-match
  useEffect(()=>{ if (screen !== "battle") trickBufferRef.current = []; },[screen]);

  // ── Admin URL handler: visit with ?admin=1 to access stats page ──
  // Runs once user is known. Silently redirects home if not an admin.
  useEffect(()=>{
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1" && ADMIN_USER_IDS.includes(user.id)) {
      setScreen("admin");
      // Clean the URL so a refresh doesn't re-trigger
      window.history.replaceState({}, "", window.location.pathname);
    }
  },[user]);

  // ── Auth: check session on load (fix #8: .catch for error boundary) ──
  useEffect(()=>{
    SB.auth.getSession().then(async ({ data:{ session } })=>{
      if (session?.user) {
        const metaName = session.user.user_metadata?.username;
        const emailFallback = session.user.email.split("@")[0];
        let { data:prof } = await SB.from("profiles").select("username").eq("id",session.user.id).single();
        if (!prof) {
          // First login after confirmation — create profile from signup metadata
          const uname = metaName || emailFallback;
          await SB.from("profiles").insert({ id:session.user.id, username:uname });
          prof = { username:uname };
        } else if (metaName && prof.username === emailFallback && prof.username !== metaName) {
          // Self-heal: legacy profile was written with the email-split fallback,
          // but user's signup metadata has the real username. Fix it once.
          await SB.from("profiles").update({ username:metaName }).eq("id",session.user.id);
          prof = { username:metaName };
        }
        setUser(session.user); setUsername(prof.username);
      }
      setAuthLoading(false);
    }).catch(()=>{
      // Supabase unreachable — let guest mode through
      setAuthLoading(false);
    });
  },[]);

  // ── Listen for password recovery redirect ──
  useEffect(()=>{
    // Check URL hash for recovery token (catches it before onAuthStateChange)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }
    const { data:{ subscription } } = SB.auth.onAuthStateChange((event)=>{
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    return ()=> subscription.unsubscribe();
  },[]);

  // ── Home stats ──
  useEffect(()=>{
    if (!user) { setHomeStats(null); return; }
    if (screen !== "home") return;
    Promise.all([
      SB.from("match_results").select("won,tournament_result").eq("user_id",user.id),
      SB.from("trick_attempts").select("landed").eq("user_id",user.id),
    ]).then(([mRes, tRes])=>{
      const matches = mRes.data||[]; const tricks = tRes.data||[];
      const wins = matches.filter(m=>m.won).length;
      const trophies = matches.filter(m=>m.tournament_result==="champion").length;
      setHomeStats({wins, losses:matches.length-wins, total:matches.length, trophies,
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
  function saveTrickAttempt(trick, landed) {
    if (!trick) return;
    trickBufferRef.current.push({ trick, landed, competition: compDbKeyRef.current || "unknown" });
  }

  async function flushTrickBuffer() {
    const u = userRef.current;
    const buf = trickBufferRef.current;
    trickBufferRef.current = [];
    if (!u || !buf.length) return;
    const rows = buf.map(b => ({ user_id: u.id, ...b }));
    const { error } = await SB.from("trick_attempts").insert(rows);
    if (error) console.error("trick_attempts batch insert:", error.message);
  }

  function undoLastAttempt() {
    // Pop the last buffered trick attempt (not yet saved to Supabase)
    if (trickBufferRef.current.length) trickBufferRef.current.pop();
    dispatchGs({type:"UNDO"});
  }

  async function saveMatchResult(scores, won, gameLog, extra={}) {
    const u = userRef.current;
    if (!u) return;
    const base = {user_id:u.id, competition:compDbKeyRef.current||"unknown",
      difficulty:diff, race_to:extra.race_to||race, won, your_score:scores.you, cpu_score:scores.cpu,
      ...(extra.mode ? {mode:extra.mode} : {}),
      ...(extra.tournament_round != null ? {tournament_round:extra.tournament_round} : {}),
      ...(extra.tournament_result ? {tournament_result:extra.tournament_result} : {}),
      ...(extra.tournament_id ? {tournament_id:extra.tournament_id} : {}),
      ...(extra.bracket_size ? {bracket_size:extra.bracket_size} : {}),
    };
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
    flushTrickBuffer();
    if (tourneyRef.current && res.mode !== "2p") {
      handleTournamentResult(res.won, res.scores, res.gameLog, res.race);
    } else if (res.mode !== "2p") {
      saveMatchResult(res.scores, res.won, res.gameLog);
      setResult(res); setScreen("result");
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
  function getTourneyTrickList(ri, totalRounds, div, trickListMode) {
    if (!div?.trickSets) return null;
    // "fullcomp" = regular for early rounds, top16 for final
    if (trickListMode === "fullcomp") return ri >= totalRounds - 1 ? "top16" : "regular";
    // Otherwise player picks a fixed list for all rounds
    return trickListMode || "regular";
  }

  function getTourneyRaceTo(ri, totalRounds) {
    // All matches race to 3, final is race to 5
    return ri >= totalRounds - 1 ? 5 : 3;
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
    return {bracketSize:size,raceTo:3,baseDiff:diff,trickListMode:openList,players:seeds,rounds,currentRound:0,
      phase:"bracket",playerSeed:seeds.find(p=>p.isHuman).seed,tournamentId:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
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
    const tl = getTourneyTrickList(t.currentRound, totalRounds, selectedDiv, t.trickListMode);
    const nudge = getTourneyNudge(t.currentRound);
    const matchRace = getTourneyRaceTo(t.currentRound, totalRounds);
    // Use unified getTricksForDiv (fix #5)
    const tricks = getTricksForDiv(selectedDiv, tl||openList);
    const { pool } = buildPool(tricks);
    const trick = pool[0];
    const restPool = pool.slice(1);
    const init = {scores:{you:0,cpu:0},pool:restPool,trick,tryNum:1,
      playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
      cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0,
      gameLog:[],currentTries:[],cpuNudge:nudge,matchOver:false,scoredTricks:[],cpuName:oppName,
      tournamentRound:t.currentRound,
      config:{diff:t.baseDiff,race:matchRace,streaks:true,mode:"tournament"}};
    dispatchGs({type:"INIT_CPU",payload:init});
    if (tl) setOpenList(tl);
    setScreen("battle");
  }

  function simulateCpuMatch(match, roundIdx) {
    const t = tourneyRef.current||tourney;
    const rate = CPU_CFG[t?.baseDiff||"medium"].base + getTourneyNudge(roundIdx);
    const totalRounds = t?.rounds?.length||2;
    let s1=0, s2=0; const rt = getTourneyRaceTo(roundIdx, totalRounds);
    while (s1<rt && s2<rt) { Math.random()<rate+0.05*(Math.random()-0.5)?s1++:s2++; }
    return {...match, winner:s1>=rt?match.p1:match.p2, p1Score:s1, p2Score:s2, played:true};
  }

  function handleTournamentResult(won, scores, gameLog, matchRace) {
    let finalPhase = null;
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
      finalPhase = phase;

      // Save tournament match to Supabase
      const tournamentResult = (phase==="champion"||phase==="eliminated") ? phase : null;
      saveMatchResult(scores, won, gameLog, {
        mode: "tournament",
        race_to: matchRace || 3,
        tournament_round: prev.currentRound,
        tournament_id: prev.tournamentId,
        bracket_size: prev.bracketSize,
        ...(tournamentResult ? {tournament_result: tournamentResult} : {}),
      });

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
      <img src={LOGOS[2]} alt="KOMP" className="glow" style={{width:80,height:80,objectFit:"contain"}}/>
      <div className="fadeUp" style={{fontFamily:BB,fontSize:12,letterSpacing:6,color:C.muted,marginTop:16,animationDelay:"0.3s",animationFillMode:"both"}}>LOADING</div>
    </div>
  );

  // ── Password recovery screen ──
  if (recoveryMode) {
    const handleRecovery = async ()=>{
      setRecoveryErr(""); setRecoveryLoading(true);
      if (recoveryPw.length < 6) { setRecoveryErr("Password must be at least 6 characters"); setRecoveryLoading(false); return; }
      const { error } = await SB.auth.updateUser({ password: recoveryPw });
      if (error) { setRecoveryErr(error.message); setRecoveryLoading(false); return; }
      setRecoveryLoading(false);
      setRecoveryDone(true);
    };
    return (
      <div style={{fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px"}}>
        <div style={{width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <img src={LOGOS[0]} alt="KOMP" style={{width:220,height:"auto",display:"block",margin:"0 auto"}}/>
            <div style={{fontFamily:BC,fontSize:11,letterSpacing:4,color:C.muted,fontWeight:600,marginTop:6}}>KENDAMA COMPETITION TRAINER</div>
          </div>
          {recoveryDone ? (
            <div className="fadeUp" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.green,marginBottom:16}}>PASSWORD UPDATED</div>
              <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:2,lineHeight:1.6,marginBottom:32}}>
                You can now log in with your new password.
              </div>
              <BtnPrimary onClick={()=>{ setRecoveryMode(false); setRecoveryDone(false); setRecoveryPw(""); }}>
                GO TO LOG IN
              </BtnPrimary>
            </div>
          ) : (
            <>
              <div style={{fontFamily:BB,fontSize:22,letterSpacing:4,color:C.yellow,marginBottom:20,textAlign:"center"}}>SET NEW PASSWORD</div>
              <input placeholder="New password" aria-label="New password" type="password" value={recoveryPw}
                onChange={e=>setRecoveryPw(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleRecovery()}
                style={{width:"100%",padding:"15px 16px",background:C.surface,border:`1px solid ${C.border}`,
                  borderRadius:2,color:C.white,fontFamily:BC,fontSize:15,letterSpacing:3,marginBottom:12,outline:"none"}}/>
              {recoveryErr && <div style={{fontFamily:BC,fontSize:13,color:C.red,marginBottom:14,letterSpacing:3,lineHeight:1.4}}>{recoveryErr}</div>}
              <BtnPrimary onClick={handleRecovery} disabled={recoveryLoading}>
                {recoveryLoading ? "···" : "UPDATE PASSWORD"}
              </BtnPrimary>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Auth gate ──
  if (!user && !isGuest) return <AuthScreen onAuth={(u,n)=>{setUser(u);setUsername(n);}} onGuest={enterAsGuest} startTab={authStartTab}/>;

  // ── Screen router ──
  if (screen==="admin" && user && ADMIN_USER_IDS.includes(user.id)) return (
    <AdminScreen onBack={()=>setScreen("home")}/>
  );

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
    <BracketScreen tourney={tourney} selectedComp={selectedComp} selectedDiv={selectedDiv}
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
      P1_COL={P1_COL} P2_COL={P2_COL} isGuest={isGuest} haptic={haptic} username={username}
      onPlayAgain={()=>{dispatchGs({type:"END_MATCH"});setTimeout(()=>startGame(),50);}}
      onSettings={()=>{setScreen("settings");dispatchGs({type:"END_MATCH"});}}
      onMainMenu={()=>{setScreen("home");dispatchGs({type:"END_MATCH"});setTourney(null);setSelectedComp(null);setSelectedDiv(null);}}/>
  );

  if (screen==="battle" && gs) return (
    <BattleScreen gs={gs} dispatch={dispatchGs} mode={gs.config?.mode||mode} race={gs.config?.race||race}
      selectedDiv={selectedDiv} openList={openList}
      p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL}
      showInfo={showInfo} setShowInfo={setShowInfo}
      onMatchOver={handleMatchOver} saveTrickAttempt={saveTrickAttempt} onUndo={undoLastAttempt} setScreen={setScreen} username={username}/>
  );

  if (screen==="home") return (
    <HomeScreen user={user} username={username} isGuest={isGuest} homeStats={homeStats}
      setMode={setMode} setScreen={setScreen} setDrillSource={setDrillSource}
      goToAuth={goToAuth} handleSignOut={handleSignOut}
      setFeedbackText={setFeedbackText} setFeedbackSent={setFeedbackSent}/>
  );

  return null;
}
