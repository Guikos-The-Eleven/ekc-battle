import { useState, useEffect, useRef } from "react";
import { SB } from "./supabase";
import { LOGO, C, BB, BC, R, AM_TRICKS, OPEN_REGULAR, OPEN_TOP16, COMPS, CPU_CFG, haptic, CPU_NAMES } from "./config";
import { applyMomentum, applyComeback, applyClutch, cpuThinkTime, roll, applyStreak, drawTrick } from "./cpu";
import { Label, Div, BtnPrimary, BtnGhost, Seg, Dots, StreakDot, TryDots, BackBtn, IgIcon, IgLink } from "./components/ui";
import AuthScreen from "./components/Auth";
import StatsScreen from "./components/Stats";

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

  // Drill mode state
  const [drillType,   setDrillType]   = useState("consistency"); // "consistency" | "firsttry"
  const [drillTarget, setDrillTarget] = useState(3);             // streak target for consistency
  const [drillSource, setDrillSource] = useState("weakest");     // "weakest" | "full" | "pick"
  const [drill,       setDrill]       = useState(null);          // active drill state
  const [pickedTricks, setPickedTricks] = useState([]);          // multi-select for pick mode
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [homeStats, setHomeStats] = useState(null);

  // Tournament state
  const [bracketSize, setBracketSize] = useState(8);
  const [tourney, setTourney] = useState(null); // {wins,losses,attempts}

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
  const tourneyRef  = useRef(tourney);

  useEffect(()=>{ gsRef.current      = gs;       },[gs]);
  useEffect(()=>{ diffRef.current    = diff;     },[diff]);
  useEffect(()=>{ raceRef.current    = race;     },[race]);
  useEffect(()=>{ modeRef.current    = mode;     },[mode]);
  useEffect(()=>{ openListRef.current= openList; },[openList]);
  useEffect(()=>{ streaksRef.current = streaks;  },[streaks]);
  useEffect(()=>{ userRef.current    = user;     },[user]);
  useEffect(()=>{ compDbKeyRef.current= compDbKey; },[compDbKey]);
  useEffect(()=>{ tourneyRef.current = tourney;  },[tourney]);

  // Tournament: auto-advance from "advancing" phase to next round
  useEffect(()=>{
    if (!tourney||tourney.phase!=="advancing") return;
    const t = setTimeout(()=>{
      setTourney(prev=>{
        if (!prev||prev.phase!=="advancing") return prev;
        return {...prev, currentRound:prev.currentRound+1, phase:"bracket", lastWonScores:undefined};
      });
    },2400);
    return ()=>clearTimeout(t);
  },[tourney?.phase]);

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

  // Fetch quick stats for home screen
  useEffect(()=>{
    if (!user) { setHomeStats(null); return; }
    Promise.all([
      SB.from("match_results").select("won").eq("user_id",user.id),
      SB.from("trick_attempts").select("landed").eq("user_id",user.id),
    ]).then(([mRes, tRes])=>{
      const matches = mRes.data||[];
      const tricks = tRes.data||[];
      const wins = matches.filter(m=>m.won).length;
      setHomeStats({
        wins, losses:matches.length-wins, total:matches.length,
        trickLands:tricks.filter(t=>t.landed).length, trickTotal:tricks.length,
      });
    });
  },[user]);

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
    const s = gsRef.current;
    const base = {
      user_id:u.id, competition:compDbKeyRef.current||"unknown",
      difficulty:diffRef.current, race_to:raceRef.current,
      won, your_score:scores.you, cpu_score:scores.cpu,
    };
    const payload = s?.gameLog?.length ? {...base, game_log:JSON.stringify(s.gameLog)} : base;
    const { error } = await SB.from("match_results").insert(payload);
    if (error) {
      // Retry without game_log in case column doesn't exist yet
      const { error:e2 } = await SB.from("match_results").insert(base);
      if (e2) console.error("match_results insert:", e2.message);
    }
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
      const newTries = [...(p.currentTries||[]), {you:pLanded, cpu:cLanded}];
      if (pLanded===cLanded) {
        const ns = applyStreak(p.cpuStreak,"null",streaksRef.current);
        if (p.tryNum>=3) {
          const entry = {trick:p.trick, playerFirst:p.playerFirst, tries:newTries, result:"null"};
          return {...p,cpuStreak:ns,phase:"null",gameLog:[...(p.gameLog||[]),entry],currentTries:[]};
        }
        return {...p,cpuStreak:ns,phase:"tie",msg:pLanded?"BOTH LANDED":"BOTH MISSED",currentTries:newTries};
      }
      const winner = pLanded?"you":"cpu";
      const newScores = {...p.scores,[winner]:p.scores[winner]+1};
      const matchOver = newScores.you>=raceRef.current||newScores.cpu>=raceRef.current;
      // Don't update streaks/momentum on match-ending point
      const ns = matchOver ? p.cpuStreak : applyStreak(p.cpuStreak,winner,streaksRef.current);
      haptic(winner==="you"?20:8);
      const entry = {trick:p.trick, playerFirst:p.playerFirst, tries:newTries, result:winner};
      return {...p,cpuStreak:ns,scores:newScores,winner,phase:"point",
        lastScoreKey:(p.lastScoreKey||0)+1,gameLog:[...(p.gameLog||[]),entry],currentTries:[]};
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
    if (!gs||(modeRef.current!=="cpu"&&modeRef.current!=="tournament")) return;
    let t;
    if (gs.phase==="reveal")
      t=setTimeout(()=>{if(!gsRef.current)return;setGs(p=>({...p,phase:p.playerFirst?"p_first":"cpu_first"}));},2000);
    else if (gs.phase==="cpu_first")
      t=setTimeout(()=>{const s=gsRef.current;if(!s)return;const landed=roll(diffRef.current,s.cpuStreak,streaksRef.current,{cpuMomentum:s.cpuMomentum,scores:s.scores,raceTo:raceRef.current,cpuNudge:s.cpuNudge||0});setGs(p=>({...p,cpuFirst:landed,cpuMomentum:[...p.cpuMomentum,landed].slice(-6),phase:"p_second"}));},cpuThinkTime(diffRef.current));
    else if (gs.phase==="cpu_resp")
      t=setTimeout(()=>{const s=gsRef.current;if(!s)return;const landed=roll(diffRef.current,s.cpuStreak,streaksRef.current,{cpuMomentum:s.cpuMomentum,scores:s.scores,raceTo:raceRef.current,cpuNudge:s.cpuNudge||0});setGs(p=>({...p,cpuMomentum:[...p.cpuMomentum,landed].slice(-6)}));resolveCpu(s.pResult,landed);},cpuThinkTime(diffRef.current));
    else if (gs.phase==="tie")
      t=setTimeout(()=>{if(!gsRef.current)return;setGs(p=>({...p,tryNum:p.tryNum+1,pResult:null,cpuFirst:null,msg:"",phase:p.playerFirst?"p_first":"cpu_first"}));},1800);
    else if (gs.phase==="null")
      t=setTimeout(()=>{const s=gsRef.current;if(!s)return;nextCpuTrick(s);},1800);
    else if (gs.phase==="point")
      t=setTimeout(()=>{
        const s=gsRef.current;
        if (!s) return;
        if (s.scores.you>=raceRef.current||s.scores.cpu>=raceRef.current) {
          const won = s.scores.you>=raceRef.current;
          saveMatchResult(s.scores, won);
          // Null gs immediately to stop all CPU logic
          gsRef.current=null; setGs(null);
          if (tourneyRef.current) {
            handleTournamentResult(won, s.scores);
          } else {
            setResult({scores:s.scores,won});
            setScreen("result");
          }
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
        cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0,
        gameLog:[],currentTries:[]};
      gsRef.current=init; setGs(init);
    } else {
      const init={scores:{p1:0,p2:0},pool:r.pool,trick:r.trick,
        playerFirst:true,phase:"2p_reveal",winner:null};
      gsRef.current=init; setGs(init);
    }
    setScreen("battle");
  }

  // ── DRILL logic ──────────────────────────────────────────────────────────────
  async function buildDrillQueue(source) {
    const tricks = allTricks();
    if (source==="full") {
      const shuffled = [...tricks].sort(()=>Math.random()-0.5);
      return shuffled;
    }
    if (source==="weakest" && userRef.current) {
      const { data } = await SB.from("trick_attempts").select("trick,landed,competition")
        .eq("user_id",userRef.current.id);
      const stats = {};
      (data||[]).filter(a=>a.competition===compDbKeyRef.current).forEach(a=>{
        if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
        if (a.landed) stats[a.trick].land++; else stats[a.trick].miss++;
      });
      // Sort: untried first (random), then lowest rate first
      const rated = tricks.map(t=>{
        const s = stats[t];
        if (!s) return {trick:t, rate:-1}; // untried
        return {trick:t, rate:s.land/(s.land+s.miss)};
      });
      rated.sort((a,b)=>a.rate-b.rate);
      return rated.map(r=>r.trick);
    }
    // fallback: shuffled
    return [...tricks].sort(()=>Math.random()-0.5);
  }

  async function startDrill() {
    if (drillSource==="pick") {
      setPickedTricks([]);
      setScreen("drill_pick");
      return;
    }
    const queue = await buildDrillQueue(drillSource);
    if (queue.length===0) return;
    if (drillType==="consistency") {
      setDrill({type:"consistency",target:drillTarget,trick:queue[0],streak:0,attempts:0,
        cleared:[],queue:queue.slice(1),totalAttempts:0,totalLands:0,bestStreak:0});
    } else {
      setDrill({type:"firsttry",trick:queue[0],queue:queue.slice(1),
        results:[],index:0,total:queue.length,phase:"active"});
    }
    setScreen("drill");
  }

  function startDrillPick(tricks) {
    const shuffled = [...tricks].sort(()=>Math.random()-0.5);
    if (drillType==="consistency") {
      setDrill({type:"consistency",target:drillTarget,trick:shuffled[0],streak:0,attempts:0,
        cleared:[],queue:shuffled.slice(1),totalAttempts:0,totalLands:0,bestStreak:0,pickMode:true});
    } else {
      setDrill({type:"firsttry",trick:shuffled[0],queue:shuffled.slice(1),
        results:[],index:0,total:shuffled.length,phase:"active",pickMode:true});
    }
    setScreen("drill");
  }

  function onDrillAttempt(landed) {
    haptic(landed?15:8);
    if (drill.type==="consistency") {
      saveTrickAttempt(drill.trick, landed);
      const newStreak = landed ? drill.streak+1 : 0;
      const newAttempts = drill.attempts+1;
      const newTotal = drill.totalAttempts+1;
      const newLands = drill.totalLands+(landed?1:0);
      const newBest = Math.max(drill.bestStreak, newStreak);

      if (newStreak >= drill.target) {
        // Trick cleared!
        haptic(30);
        const newCleared = [...drill.cleared, {trick:drill.trick, attempts:newAttempts}];
        if (drill.queue.length>0) {
          // Show cleared, then load next trick
          setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
            totalLands:newLands,bestStreak:newBest,cleared:newCleared,
            nextTrick:p.queue[0],nextQueue:p.queue.slice(1),phase:"cleared"}));
        } else {
          // Done — all tricks cleared
          setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
            totalLands:newLands,bestStreak:newBest,cleared:newCleared,phase:"done"}));
        }
      } else {
        setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
          totalLands:newLands,bestStreak:newBest}));
      }
    } else {
      // First try
      saveTrickAttempt(drill.trick, landed);
      const newResults = [...drill.results, {trick:drill.trick, landed}];
      if (drill.queue.length>0) {
        setDrill(p=>({...p,results:newResults,phase:"ft_result"}));
        setTimeout(()=>{
          setDrill(p=>({...p,trick:p.queue[0],queue:p.queue.slice(1),
            index:p.index+1,phase:"active"}));
        },1200);
      } else {
        setDrill(p=>({...p,results:newResults,phase:"done"}));
      }
    }
  }

  // ── TOURNAMENT logic ──────────────────────────────────────────────────────────
  const ROUND_NAMES = {2:["SEMI-FINAL","FINAL"],3:["QUARTER-FINAL","SEMI-FINAL","FINAL"]};

  function getTourneyDiff(roundIdx, totalRounds, div, baseDiff) {
    // User-chosen base stays the same — just the key for display
    return baseDiff||"medium";
  }

  // Small CPU rate nudge per round: +2% per round after the first
  function getTourneyNudge(roundIdx) {
    return roundIdx * 0.02;
  }

  function getTourneyTrickList(roundIdx, totalRounds, div) {
    // For PRO OPEN: switch to top16 in the final
    if (div?.trickSets) {
      if (roundIdx >= totalRounds-1) return "top16"; // Final uses top16
      return "regular"; // Earlier rounds use regular
    }
    return null; // AM OPEN uses single list
  }

  function generateBracket(size) {
    const names = [...CPU_NAMES].sort(()=>Math.random()-0.5).slice(0,size-1);
    const players = [{seed:0, name:username||"YOU", isHuman:true, eliminated:false}];
    names.forEach((n,i)=>players.push({seed:i+1, name:n, isHuman:false, eliminated:false}));
    // Shuffle seeding
    const seeds = players.sort(()=>Math.random()-0.5).map((p,i)=>({...p,seed:i}));
    const totalRounds = size===4?2:3;
    const rounds = [];
    // Round 1 matches
    const r1 = [];
    for (let i=0;i<size;i+=2) r1.push({p1:seeds[i].seed,p2:seeds[i+1].seed,winner:null,p1Score:0,p2Score:0,played:false});
    rounds.push(r1);
    // Future rounds (empty slots)
    let matchCount = size/4;
    while (matchCount>=1) { rounds.push(Array.from({length:matchCount},()=>({p1:null,p2:null,winner:null,p1Score:0,p2Score:0,played:false}))); matchCount/=2; }
    return {bracketSize:size,raceTo:race,baseDiff:diff,players:seeds,rounds,currentRound:0,
      phase:"bracket",playerSeed:seeds.find(p=>p.isHuman).seed};
  }

  function simulateCpuMatch(match, players, roundIdx, totalRounds, div) {
    const t = tourneyRef.current||tourney;
    const baseDiff = t?.baseDiff||"medium";
    const rate = CPU_CFG[baseDiff].base + getTourneyNudge(roundIdx);
    let s1=0, s2=0;
    const rt = t?.raceTo||race;
    while (s1<rt && s2<rt) { Math.random()<rate+0.05*(Math.random()-0.5) ? s1++ : s2++; }
    return {...match, winner:s1>=rt?match.p1:match.p2, p1Score:s1, p2Score:s2, played:true};
  }

  function startTournament() {
    const t = generateBracket(bracketSize);
    setTourney(t);
    setScreen("bracket");
  }

  function startTournamentMatch() {
    const t = tourneyRef.current||tourney;
    if (!t) return;
    const round = t.rounds[t.currentRound];
    const myMatch = round.find(m=>m.p1===t.playerSeed||m.p2===t.playerSeed);
    if (!myMatch) return;
    const totalRounds = t.rounds.length;
    const tl = getTourneyTrickList(t.currentRound, totalRounds, selectedDiv);
    setDiff(t.baseDiff);
    if (tl) setOpenList(tl);
    setRace(t.raceTo);
    setStreaks(true);
    const nudge = getTourneyNudge(t.currentRound);
    // Get tricks using the correct list for this round
    const getTricks = () => {
      if (!selectedDiv) return AM_TRICKS;
      if (selectedDiv.tricks) return selectedDiv.tricks;
      if (selectedDiv.trickSets) {
        const set = selectedDiv.trickSets.find(s => s.key === (tl||openList));
        return set ? set.tricks : selectedDiv.trickSets[0].tricks;
      }
      return [];
    };
    const r = drawTrick([],getTricks());
    const init={scores:{you:0,cpu:0},pool:r.pool,trick:r.trick,tryNum:1,
      playerFirst:true,phase:"reveal",cpuStreak:{active:false,dir:"hot",left:0},
      cpuFirst:null,pResult:null,msg:"",winner:null,cpuMomentum:[],lastScoreKey:0,
      gameLog:[],currentTries:[],cpuNudge:nudge};
    gsRef.current=init; setGs(init);
    setScreen("battle");
  }

  function handleTournamentResult(won, scores) {
    setTourney(prev=>{
      if (!prev) return prev;
      const t = {...prev, rounds:prev.rounds.map(r=>r.map(m=>({...m})))};
      const round = t.rounds[t.currentRound];
      // Update player match
      const mi = round.findIndex(m=>m.p1===t.playerSeed||m.p2===t.playerSeed);
      if (mi>=0) {
        const m = round[mi];
        const isP1 = m.p1===t.playerSeed;
        round[mi] = {...m, winner:won?t.playerSeed:(isP1?m.p2:m.p1),
          p1Score:isP1?scores.you:scores.cpu, p2Score:isP1?scores.cpu:scores.you, played:true};
        if (!won) {
          const pi = t.players.findIndex(p=>p.seed===t.playerSeed);
          if (pi>=0) t.players[pi] = {...t.players[pi], eliminated:true};
        }
      }
      // Simulate remaining CPU matches in this round
      round.forEach((m,i)=>{
        if (!m.played && m.p1!==null && m.p2!==null) {
          round[i] = simulateCpuMatch(m, t.players, t.currentRound, t.rounds.length, selectedDiv);
          const loser = round[i].winner===round[i].p1?round[i].p2:round[i].p1;
          const li = t.players.findIndex(p=>p.seed===loser);
          if (li>=0) t.players[li] = {...t.players[li], eliminated:true};
        }
      });
      // Populate next round
      if (t.currentRound < t.rounds.length-1) {
        const nextRound = t.rounds[t.currentRound+1];
        for (let i=0;i<round.length;i+=2) {
          const ni = Math.floor(i/2);
          if (ni<nextRound.length) {
            nextRound[ni] = {...nextRound[ni], p1:round[i]?.winner, p2:round[i+1]?.winner};
          }
        }
      }
      // Set phase: advancing (won, more rounds), champion, or eliminated
      const lastRound = t.rounds[t.rounds.length-1];
      if (lastRound[0]?.played) {
        t.phase = lastRound[0].winner===t.playerSeed?"champion":"eliminated";
      } else if (!won) {
        t.phase = "eliminated";
      } else {
        // Don't increment round yet — advancing animation will do it
        t.phase = "advancing";
        t.lastWonScores = scores;
      }
      return t;
    });
    // Go straight to bracket — no result screen
    setGs(null);
    setScreen("bracket");
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

  // ── DRILL: PICK SCREEN ───────────────────────────────────────────────────────
  if (screen==="drill_pick") {
    const tricks = allTricks();
    const clearedTricks = drill?.cleared?.map(c=>c.trick) || [];
    const available = tricks.filter(t=>!clearedTricks.includes(t));
    const allSelected = pickedTricks.length===available.length && available.length>0;

    const toggleTrick = (t) => {
      setPickedTricks(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
    };
    const toggleAll = () => {
      setPickedTricks(allSelected?[]:available);
    };

    return (
      <div style={root}>
        <div style={{...page,paddingBottom:0}}>
          <BackBtn onClick={()=>setScreen("settings")}/>
          <div className="rise" style={{marginBottom:16}}>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:4,lineHeight:1,color:C.white}}>
              {drillType==="consistency"?"PICK TRICKS":"FIRST TRY"}
            </div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:3,marginTop:6,fontWeight:600}}>
              {drillType==="consistency"
                ?`Select tricks · land ${drillTarget}× in a row each`
                :"Select tricks · one attempt each"}
            </div>
          </div>

          {/* Select all / count */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <button className="tap" onClick={toggleAll} style={{
              background:"transparent",border:"none",fontFamily:BB,fontSize:10,letterSpacing:4,
              color:allSelected?C.white:C.muted,cursor:"pointer",padding:0,
            }}>{allSelected?"DESELECT ALL":"SELECT ALL"}</button>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:2,color:pickedTricks.length>0?C.white:C.muted}}>
              {pickedTricks.length} selected
            </div>
          </div>
          <Div mb={8}/>

          {/* Trick list */}
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",margin:"0 -24px",padding:"0 24px"}}>
            {tricks.map((t,i)=>{
              const done = clearedTricks.includes(t);
              const selected = pickedTricks.includes(t);
              return (
                <button key={i} className="tap" onClick={()=>!done&&toggleTrick(t)} disabled={done} style={{
                  width:"100%",padding:"13px 0",background:selected?`${C.white}06`:"transparent",border:"none",
                  borderTop:i===0?`1px solid ${C.border}`:"none",
                  borderBottom:`1px solid ${C.border}`,
                  cursor:done?"default":"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                  opacity:done?0.3:1,transition:"all 0.1s",
                }}>
                  {/* Checkbox */}
                  <div style={{width:18,height:18,borderRadius:2,marginRight:12,flexShrink:0,
                    border:`1.5px solid ${done?C.border:selected?C.green:C.muted}`,
                    background:selected?C.green:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.15s",
                  }}>
                    {selected && <span style={{color:C.bg,fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontFamily:BC,fontSize:13,color:done?C.muted:selected?C.white:C.sub,fontWeight:600,
                    textAlign:"left",lineHeight:1.3,flex:1,paddingRight:12,transition:"color 0.1s"}}>{t}</span>
                  {done && <span style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.green}}>CLEARED</span>}
                </button>
              );
            })}
          </div>

          {/* START button — fixed at bottom */}
          <div style={{padding:"16px 0 calc(16px + env(safe-area-inset-bottom, 0px))",
            borderTop:`1px solid ${C.divider}`,marginTop:8}}>
            <BtnPrimary onClick={()=>startDrillPick(pickedTricks)}
              style={{opacity:pickedTricks.length===0?0.3:1,pointerEvents:pickedTricks.length===0?"none":"auto"}}>
              START DRILL · {pickedTricks.length} TRICK{pickedTricks.length!==1?"S":""}
            </BtnPrimary>
          </div>
        </div>
      </div>
    );
  }

  // ── DRILL: ACTIVE SCREEN ─────────────────────────────────────────────────────
  if (screen==="drill" && drill) {

    // Done state — drill result
    if (drill.phase==="done") {
      const isCons = drill.type==="consistency";
      const cleared = drill.cleared||[];
      const ftResults = drill.results||[];
      const ftLanded = ftResults.filter(r=>r.landed).length;
      const ftRate = ftResults.length>0 ? Math.round(ftLanded/ftResults.length*100) : 0;

      return (
        <div style={{...root,justifyContent:"center"}}>
          <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
            <div className="fadeUp" style={{animationDelay:"0s"}}>
              <img src={LOGO} alt="NXS" style={{width:48,height:48,objectFit:"contain",margin:"0 auto 16px",display:"block",opacity:0.3}}/>
            </div>
            <div className="pop" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
              <div style={{fontFamily:BB,fontSize:48,letterSpacing:2,lineHeight:0.9,color:C.white}}>
                {isCons?"DRILL DONE":"FIRST TRY"}
              </div>
            </div>

            <div className="fadeUp" style={{animationDelay:"0.25s",animationFillMode:"both"}}>
              <Div mt={24} mb={24}/>
              {isCons ? (
                <>
                  <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.green}}>{cleared.length}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginTop:8}}>CLEARED</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.white}}>{drill.totalAttempts}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginTop:8}}>ATTEMPTS</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.yellow}}>{drill.bestStreak}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginTop:8}}>BEST RUN</div>
                    </div>
                  </div>
                  {cleared.length>0 && (
                    <>
                      <Div mb={16}/>
                      {cleared.map((c,i)=>(
                        <div key={i} style={{borderLeft:`3px solid ${C.green}`,paddingLeft:12,paddingTop:6,paddingBottom:6,
                          marginBottom:4,textAlign:"left",background:`${C.green}06`}}>
                          <span style={{fontFamily:BC,fontSize:12,color:C.sub,fontWeight:600}}>{c.trick}</span>
                          <span style={{fontFamily:BC,fontSize:10,color:C.muted,marginLeft:8}}>{c.attempts} att</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:ftRate>=50?C.green:C.red}}>{ftRate}%</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginTop:8}}>FIRST TRY RATE</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:C.white}}>{ftLanded}/{ftResults.length}</div>
                      <div style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginTop:8}}>LANDED</div>
                    </div>
                  </div>
                  {ftResults.length>0 && (
                    <>
                      <Div mb={16}/>
                      <div style={{maxHeight:200,overflowY:"auto",textAlign:"left"}}>
                        {ftResults.map((r,i)=>(
                          <div key={i} style={{borderLeft:`3px solid ${r.landed?C.green:C.red}`,paddingLeft:12,
                            paddingTop:5,paddingBottom:5,marginBottom:3,background:`${r.landed?C.green:C.red}06`}}>
                            <span style={{fontFamily:BC,fontSize:12,color:C.sub,fontWeight:600}}>{r.trick}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="fadeUp" style={{marginTop:28,display:"flex",flexDirection:"column",gap:12,animationDelay:"0.45s",animationFillMode:"both"}}>
              {drill.pickMode && (
                <BtnPrimary onClick={()=>{
                  setPickedTricks([]);
                  setDrill(p=>({...p,phase:undefined,trick:null,streak:0,attempts:0}));
                  setScreen("drill_pick");
                }}>PICK MORE TRICKS</BtnPrimary>
              )}
              <BtnGhost color={C.sub} onClick={()=>{setDrill(null);setScreen("settings");}}>← SETTINGS</BtnGhost>
              <BtnGhost onClick={()=>{setDrill(null);setScreen("home");setSelectedComp(null);setSelectedDiv(null);}}>← MAIN MENU</BtnGhost>
            </div>
          </div>
        </div>
      );
    }

    // Cleared animation (consistency, auto-queue)
    if (drill.phase==="cleared" && drill.type==="consistency") {
      setTimeout(()=>{
        setDrill(p=>{
          if (p.phase!=="cleared") return p;
          return {...p,trick:p.nextTrick,queue:p.nextQueue,streak:0,attempts:0,
            nextTrick:undefined,nextQueue:undefined,phase:undefined};
        });
      },1400);
      return (
        <div style={root}>
          <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div className="pop" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:48,letterSpacing:3,color:C.green,textShadow:`0 0 30px ${C.green}30`}}>CLEARED</div>
              <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:3,fontWeight:600,marginTop:8}}>Next trick loading...</div>
            </div>
          </div>
        </div>
      );
    }

    // First-try flash result
    if (drill.phase==="ft_result" && drill.type==="firsttry") {
      const last = drill.results[drill.results.length-1];
      const col = last?.landed?C.green:C.red;
      return (
        <div style={root}>
          <div style={{position:"fixed",inset:0,background:col,opacity:0,animation:"flash 0.6s ease-out",zIndex:3,pointerEvents:"none"}}/>
          <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div className="pop" style={{fontFamily:BB,fontSize:56,letterSpacing:3,color:col}}>
              {last?.landed?"LANDED":"MISSED"}
            </div>
          </div>
        </div>
      );
    }

    // Active drill screen
    const isCons = drill.type==="consistency";
    const progress = isCons ? drill.streak/drill.target : (drill.index+1)/drill.total;
    const progressLabel = isCons
      ? `${drill.streak} / ${drill.target}`
      : `${drill.index+1} / ${drill.total}`;

    return (
      <div style={root}>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>

          {/* Drill header */}
          <div style={{padding:"calc(20px + env(safe-area-inset-top, 0px)) 24px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted}}>
                {isCons?"CONSISTENCY":"FIRST TRY"}
              </div>
              <div style={{fontFamily:BB,fontSize:14,letterSpacing:2,color:C.white}}>{progressLabel}</div>
            </div>
            {/* Progress bar */}
            <div style={{height:2,background:C.border,marginBottom:6}}>
              <div style={{height:2,background:isCons?C.green:C.white,width:`${Math.min(progress*100,100)}%`,
                transition:"width 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/>
            </div>
            {isCons && drill.cleared.length>0 && (
              <div style={{fontFamily:BC,fontSize:10,color:C.muted,letterSpacing:2,fontWeight:600,textAlign:"right"}}>
                {drill.cleared.length} cleared · {drill.totalAttempts} total
              </div>
            )}
            <Div mt={12}/>
          </div>

          {/* Trick display */}
          <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px",gap:16}}>
            <div className="slideIn" key={drill.trick} style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20}}>
              <div style={{fontFamily:BB,fontSize:drill.trick.length>40?28:36,letterSpacing:2,lineHeight:1.1,color:C.white}}>
                {drill.trick}
              </div>
            </div>
            {isCons && drill.streak>0 && (
              <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:8,paddingLeft:23}}>
                <div style={{display:"flex",gap:3}}>
                  {Array.from({length:drill.target}).map((_,i)=>(
                    <div key={i} style={{width:14,height:3,
                      background:i<drill.streak?C.green:C.border,
                      boxShadow:i<drill.streak?`0 0 4px ${C.green}40`:undefined,
                      transition:"all 0.2s"}}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LAND / MISS buttons */}
          <div style={{padding:"0 24px 28px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button className="tap" onClick={()=>onDrillAttempt(true)} style={{
                padding:"0",height:isCons?120:140,background:C.green,border:"none",borderRadius:2,
                color:C.bg,fontFamily:BB,fontSize:32,letterSpacing:4,cursor:"pointer",
                transition:"all 0.1s",boxShadow:`0 0 24px ${C.green}25`}}>LAND</button>
              <button className="tap" onClick={()=>onDrillAttempt(false)} style={{
                padding:"0",height:isCons?120:140,background:`${C.red}08`,
                border:`1px solid ${C.red}30`,borderRadius:2,color:`${C.red}cc`,
                fontFamily:BB,fontSize:32,letterSpacing:4,cursor:"pointer",
                transition:"all 0.1s"}}>MISS</button>
            </div>
          </div>

          {/* Footer */}
          <div style={{padding:"0 24px calc(16px + env(safe-area-inset-bottom, 0px))",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>{
              setPickedTricks([]);setDrill(null);setScreen("settings");
            }} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:11,letterSpacing:5,cursor:"pointer",padding:0}}>
              ← QUIT
            </button>
            <div style={{fontFamily:BB,fontSize:9,letterSpacing:4,color:C.muted}}>KOMP</div>
          </div>
        </div>
      </div>
    );
  }

  // ── FEEDBACK SCREEN ─────────────────────────────────────────────────────────
  if (screen==="feedback") {
    const sendFeedback = async () => {
      if (!feedbackText.trim()) return;
      // Try saving to Supabase feedback table
      try {
        await SB.from("feedback").insert({
          user_id: user?.id || null,
          username: username || "Guest",
          message: feedbackText.trim(),
        });
      } catch {}
      setFeedbackSent(true);
    };

    return (
      <div style={root}>
        <div style={page}>
          <BackBtn onClick={()=>{setScreen("home");setFeedbackText("");setFeedbackSent(false);}}/>

          {feedbackSent ? (
            <div className="fadeUp" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:16}}>
              <div style={{fontFamily:BB,fontSize:42,letterSpacing:3,color:C.green}}>THANKS</div>
              <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,maxWidth:300}}>
                Your feedback helps us make KOMP better for everyone.
              </div>
              <BtnGhost color={C.sub} onClick={()=>{setScreen("home");setFeedbackText("");setFeedbackSent(false);}} style={{marginTop:16,maxWidth:280}}>← BACK</BtnGhost>
            </div>
          ) : (
            <>
              <div className="rise" style={{marginBottom:24}}>
                <div style={{fontFamily:BB,fontSize:32,letterSpacing:4,lineHeight:1,color:C.white}}>
                  FEEDBACK
                </div>
                <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:2,marginTop:8,fontWeight:600,lineHeight:1.5}}>
                  Found a bug? Want a feature? Have a trick list to add? Tell us.
                </div>
              </div>
              <Div mb={20}/>
              <Label style={{letterSpacing:3,marginBottom:8}}>Your message</Label>
              <textarea
                value={feedbackText}
                onChange={e=>setFeedbackText(e.target.value)}
                placeholder="What's on your mind..."
                rows={6}
                style={{
                  width:"100%",padding:"14px 16px",background:C.surface,
                  border:`1px solid ${C.border}`,borderRadius:R,color:C.white,
                  fontFamily:BC,fontSize:15,letterSpacing:2,lineHeight:1.5,
                  outline:"none",resize:"vertical",minHeight:140,
                  transition:"border-color 0.15s",
                }}
              />
              <div style={{fontFamily:BC,fontSize:10,color:C.muted,marginTop:6,letterSpacing:1}}>
                {feedbackText.length > 0 ? `${feedbackText.length} characters` : ""}
              </div>
              <div style={{flex:1}}/>
              <BtnPrimary onClick={sendFeedback}
                style={{opacity:feedbackText.trim().length<3?0.3:1,pointerEvents:feedbackText.trim().length<3?"none":"auto",marginTop:20}}>
                SEND FEEDBACK
              </BtnPrimary>
              <div style={{marginTop:12,textAlign:"center"}}>
                <a href="https://github.com/Guikos-The-Eleven/ekc-battle/issues" target="_blank" rel="noopener noreferrer" style={{
                  fontFamily:BC,fontSize:10,letterSpacing:2,color:C.muted,textDecoration:"none",opacity:0.5,
                }}>or open an issue on GitHub</a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── BRACKET SCREEN ────────────────────────────────────────────────────────────
  if (screen==="bracket" && tourney) {
    const t = tourney;
    const totalRounds = t.rounds.length;
    const roundNames = ROUND_NAMES[totalRounds]||[];
    const getPlayer = (seed) => seed!==null&&seed!==undefined ? t.players.find(p=>p.seed===seed) : null;
    const isChampion = t.phase==="champion";
    const isEliminated = t.phase==="eliminated";
    const isAdvancing = t.phase==="advancing";
    const isActive = t.phase==="bracket"||isAdvancing;

    const nextMatch = isActive ? t.rounds[t.currentRound]?.find(m=>
      (m.p1===t.playerSeed||m.p2===t.playerSeed)&&!m.played) : null;
    const nextDiff = isActive ? getTourneyDiff(t.currentRound, totalRounds, selectedDiv, t.baseDiff) : null;
    const nextTrickList = isActive ? getTourneyTrickList(t.currentRound, totalRounds, selectedDiv) : null;
    const nextOpponent = nextMatch ? getPlayer(nextMatch.p1===t.playerSeed?nextMatch.p2:nextMatch.p1) : null;
    const lastRound = t.rounds[totalRounds-1];
    const championSeed = lastRound?.[0]?.played ? lastRound[0].winner : null;
    const champion = getPlayer(championSeed);

    const PlayerSlot = ({seed, score, m, isTop, roundIdx}) => {
      const p = getPlayer(seed);
      const isWinner = m.played && m.winner===seed;
      const isMe = seed===t.playerSeed;
      const justAdvanced = isAdvancing && isMe && isWinner;
      const justAppeared = isAdvancing && isMe && !m.played && roundIdx===t.currentRound+1;
      if (!p) return (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"5px 8px",borderBottom:isTop?`1px solid ${C.divider}`:undefined,minHeight:26}}>
          <span style={{fontFamily:BC,fontSize:10,color:C.border,fontWeight:600}}>TBD</span>
        </div>
      );
      return (
        <div className={justAppeared?"fadeUp":""} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"5px 8px",borderBottom:isTop?`1px solid ${C.divider}`:undefined,
          background:justAdvanced?`${C.green}15`:isWinner?`${C.white}06`:"transparent",
          opacity:m.played&&!isWinner?0.3:1,minHeight:26,
          transition:"all 0.4s ease",
          ...(justAppeared?{animationDelay:"0.6s",animationFillMode:"both"}:{})}}>
          <div style={{display:"flex",alignItems:"center",gap:4,overflow:"hidden",flex:1}}>
            {isMe && <div style={{width:3,height:3,borderRadius:"50%",
              background:C.green,flexShrink:0,
              boxShadow:(justAdvanced||justAppeared)?`0 0 8px ${C.green}`:undefined}}/>}
            <span style={{fontFamily:BC,fontSize:10,fontWeight:600,letterSpacing:1,
              color:(justAdvanced||justAppeared)?C.green:isMe?C.white:isWinner?C.sub:C.muted,
              textShadow:(justAdvanced||justAppeared)?`0 0 12px ${C.green}40`:undefined,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</span>
          </div>
          {m.played && <span style={{fontFamily:BB,fontSize:12,letterSpacing:1,
            color:justAdvanced?C.green:isWinner?C.white:C.muted,marginLeft:6,flexShrink:0}}>{score}</span>}
        </div>
      );
    };

    const MatchBox = ({m, ri}) => {
      const isMyMatch = m.p1===t.playerSeed||m.p2===t.playerSeed;
      const justWon = isAdvancing && isMyMatch && m.played && m.winner===t.playerSeed;
      const accentCol = !m.played?C.border:isMyMatch?(m.winner===t.playerSeed?C.green:C.red):C.muted;
      return (
        <div style={{border:`1px solid ${justWon?C.green+"60":accentCol+"30"}`,borderRadius:R,
          borderLeft:`2px solid ${accentCol}`,
          background:C.surface,overflow:"hidden",width:"100%",
          boxShadow:justWon?`0 0 16px ${C.green}20`:undefined,
          transition:"box-shadow 0.5s ease"}}>
          <PlayerSlot seed={m.p1} score={m.p1Score} m={m} isTop={true} roundIdx={ri}/>
          <PlayerSlot seed={m.p2} score={m.p2Score} m={m} isTop={false} roundIdx={ri}/>
        </div>
      );
    };

    return (
    <div style={root}>
      {/* Flash overlay for advancing */}
      {isAdvancing && (
        <div style={{position:"fixed",inset:0,background:C.green,opacity:0,animation:"flash 0.8s ease-out",zIndex:3,pointerEvents:"none"}}/>
      )}
      {isEliminated && (
        <div style={{position:"fixed",inset:0,background:C.red,opacity:0,animation:"flash 0.8s ease-out",zIndex:3,pointerEvents:"none"}}/>
      )}
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",
        padding:`calc(20px + env(safe-area-inset-top, 0px)) 0 calc(16px + env(safe-area-inset-bottom, 0px)) 0`,
        overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"0 24px",marginBottom:12,flexShrink:0}}>
          <BackBtn onClick={()=>{setTourney(null);setScreen("home");setSelectedComp(null);setSelectedDiv(null);}} label="← QUIT"/>

          {isChampion && (
            <div className="pop" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:42,letterSpacing:3,color:C.yellow,textShadow:`0 0 30px ${C.yellow}30`}}>CHAMPION</div>
              <div style={{fontFamily:BC,fontSize:11,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:4}}>
                {selectedDiv?.name} · {selectedComp?.name}
              </div>
            </div>
          )}
          {isEliminated && (
            <div className="pop" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:36,letterSpacing:3,color:C.red}}>ELIMINATED</div>
              <div style={{fontFamily:BC,fontSize:11,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:4}}>
                Round {t.currentRound+1} of {totalRounds} · {selectedDiv?.name}
              </div>
            </div>
          )}
          {isAdvancing && (
            <div className="pop" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:28,letterSpacing:6,color:C.green,textShadow:`0 0 20px ${C.green}30`}}>
                ADVANCING
              </div>
              <div style={{fontFamily:BC,fontSize:11,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:4}}>
                {t.lastWonScores?`${t.lastWonScores.you}–${t.lastWonScores.cpu}`:""} · Next: {roundNames[t.currentRound+1]||"FINAL"}
              </div>
            </div>
          )}
          {!isAdvancing && !isChampion && !isEliminated && isActive && (
            <div className="rise" style={{textAlign:"center"}}>
              <div style={{fontFamily:BB,fontSize:24,letterSpacing:4,color:C.white}}>
                {roundNames[t.currentRound]||`ROUND ${t.currentRound+1}`}
              </div>
              <div style={{fontFamily:BC,fontSize:10,color:C.muted,letterSpacing:2,fontWeight:600,marginTop:4}}>
                {selectedDiv?.name} · {selectedComp?.name}
              </div>
            </div>
          )}
        </div>

        {/* Bracket — horizontal layout */}
        <div style={{flex:1,overflowX:"auto",overflowY:"hidden",WebkitOverflowScrolling:"touch",
          padding:"8px 12px",display:"flex",alignItems:"stretch"}}>
          <div style={{display:"flex",alignItems:"stretch",gap:6,
            minWidth:t.bracketSize===8?640:380,width:"100%",height:"100%"}}>

            {t.rounds.map((round,ri)=>{
              const diffForRound = getTourneyDiff(ri, totalRounds, selectedDiv, t.baseDiff);
              const tlForRound = getTourneyTrickList(ri, totalRounds, selectedDiv);
              const diffCol = CPU_CFG[diffForRound]?.color||C.muted;
              const isCurrent = ri===t.currentRound&&isActive;

              return (
                <div key={ri} style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
                  {/* Round header */}
                  <div style={{textAlign:"center",marginBottom:6,flexShrink:0}}>
                    <div style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:isCurrent?C.white:C.muted}}>
                      {roundNames[ri]||`R${ri+1}`}
                    </div>
                    <div style={{fontFamily:BC,fontSize:7,letterSpacing:1,color:diffCol,fontWeight:600,marginTop:1}}>
                      {CPU_CFG[diffForRound]?.label}{ri>0?` +${ri*2}%`:""}{tlForRound?" · "+tlForRound.toUpperCase():""}
                    </div>
                  </div>

                  {/* Matches — evenly spaced */}
                  <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-around",gap:4}}>
                    {round.map((m,mi)=><MatchBox key={mi} m={m} ri={ri}/>)}
                  </div>
                </div>
              );
            })}

            {/* Champion slot */}
            <div style={{width:60,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",flexShrink:0}}>
              <div style={{fontFamily:BB,fontSize:8,letterSpacing:3,color:C.yellow,marginBottom:6}}>WINNER</div>
              <div style={{border:`1px solid ${champion?C.yellow+"40":C.border}`,borderRadius:R,
                padding:"8px 6px",background:champion?`${C.yellow}08`:"transparent",textAlign:"center",width:"100%"}}>
                {champion ? (
                  <span style={{fontFamily:BC,fontSize:9,fontWeight:600,letterSpacing:1,
                    color:champion.seed===t.playerSeed?C.yellow:C.sub}}>{champion.name}</span>
                ) : (
                  <span style={{fontFamily:BC,fontSize:10,color:C.border,fontWeight:600}}>?</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div style={{padding:"8px 24px 0",flexShrink:0}}>
          {isActive && !isAdvancing && nextMatch && (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <Label style={{letterSpacing:3}}>vs {nextOpponent?.name}</Label>
                <Label style={{letterSpacing:2,color:CPU_CFG[nextDiff]?.color}}>{CPU_CFG[nextDiff]?.label}{t.currentRound>0?` +${t.currentRound*2}%`:""}
                  {nextTrickList?" · "+nextTrickList.toUpperCase():""}</Label>
              </div>
              <BtnPrimary onClick={startTournamentMatch}>PLAY NEXT MATCH</BtnPrimary>
            </>
          )}
          {(isChampion||isEliminated) && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <BtnPrimary onClick={()=>{setTourney(null);setScreen("settings");}}>NEW TOURNAMENT</BtnPrimary>
              <BtnGhost onClick={()=>{setTourney(null);setScreen("home");setSelectedComp(null);setSelectedDiv(null);}}>← MAIN MENU</BtnGhost>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }

  // ── HOME SCREEN — MODE SELECTOR ─────────────────────────────────────────────
  if (screen==="home") {
    const modeCards = [
      {key:"cpu",   label:"BATTLE",     desc:"1v1 vs CPU",          color:C.green,  available:true},
      {key:"drill", label:"DRILL",      desc:"Train your tricks",   color:C.yellow, available:true},
      {key:"tournament", label:"TOURNAMENT", desc:"Bracket competition", color:C.orange, available:true},
      {key:"2p",    label:"2 PLAYER",   desc:"Local head to head",  color:C.sub,    available:true},
    ];

    return (
    <div style={root}>
      <div style={{...page,alignItems:"center"}}>

        {/* User bar */}
        <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
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

        {/* Logo + Name */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",marginTop:8}}>
          <div className="rise">
            <img src={LOGO} alt="NXS" style={{width:140,height:140,objectFit:"contain",display:"block",margin:"0 auto"}}/>
          </div>
          <div className="rise" style={{animationDelay:"0.05s",animationFillMode:"both",textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:46,letterSpacing:12,color:C.white,marginTop:-2}}>KOMP</div>
            <div style={{fontFamily:BC,fontSize:9,letterSpacing:4,color:C.muted,fontWeight:600,marginTop:4}}>KENDAMA COMPETITION TRAINER</div>
          </div>
        </div>

        {/* Stats snapshot */}
        {homeStats && homeStats.total>0 ? (
          <div className="fadeUp" style={{width:"100%",marginTop:20,marginBottom:20,animationDelay:"0.1s",animationFillMode:"both"}}>
            <div style={{display:"flex",alignItems:"center",gap:0,width:"100%"}}>
              <div style={{flex:1,textAlign:"center",padding:"14px 0"}}>
                <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:C.green}}>{homeStats.wins}</div>
                <div style={{fontFamily:BB,fontSize:8,letterSpacing:4,color:C.muted,marginTop:4}}>WINS</div>
              </div>
              <div style={{width:1,height:28,background:C.divider}}/>
              <div style={{flex:1,textAlign:"center",padding:"14px 0"}}>
                <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:C.red}}>{homeStats.losses}</div>
                <div style={{fontFamily:BB,fontSize:8,letterSpacing:4,color:C.muted,marginTop:4}}>LOSSES</div>
              </div>
              <div style={{width:1,height:28,background:C.divider}}/>
              <div style={{flex:1,textAlign:"center",padding:"14px 0"}}>
                <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:C.white}}>
                  {Math.round(homeStats.wins/homeStats.total*100)}%
                </div>
                <div style={{fontFamily:BB,fontSize:8,letterSpacing:4,color:C.muted,marginTop:4}}>WIN RATE</div>
              </div>
              {homeStats.trickTotal>0 && <>
                <div style={{width:1,height:28,background:C.divider}}/>
                <div style={{flex:1,textAlign:"center",padding:"14px 0"}}>
                  <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:C.yellow}}>
                    {Math.round(homeStats.trickLands/homeStats.trickTotal*100)}%
                  </div>
                  <div style={{fontFamily:BB,fontSize:8,letterSpacing:4,color:C.muted,marginTop:4}}>TRICK RATE</div>
                </div>
              </>}
            </div>
          </div>
        ) : (
          <div style={{marginTop:20,marginBottom:20}}/>
        )}

        {/* Mode cards — 2x2 grid, fills remaining space */}
        <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:8,flex:1}}>
          {modeCards.map((m,i)=>(
            <button key={m.key} className="tap fadeUp" onClick={()=>{
              if (!m.available) return;
              setMode(m.key);
              setScreen("compPick");
            }} style={{
              padding:"20px 16px",background:m.available?C.surface:"transparent",
              border:`1px solid ${m.available?C.border:`${C.border}50`}`,borderRadius:R,
              borderLeft:`3px solid ${m.available?m.color:`${C.muted}30`}`,
              cursor:m.available?"pointer":"default",textAlign:"left",
              transition:"all 0.12s",opacity:m.available?1:0.3,
              display:"flex",flexDirection:"column",justifyContent:"center",gap:4,
              position:"relative",
              animationDelay:`${0.12+i*0.06}s`,animationFillMode:"both",
            }}>
              {!m.available && <span style={{fontFamily:BC,fontSize:8,letterSpacing:2,color:C.muted,fontWeight:600,
                border:`1px solid ${C.border}`,padding:"1px 5px",borderRadius:R,
                position:"absolute",top:10,right:10}}>SOON</span>}
              <div style={{fontFamily:BB,fontSize:20,letterSpacing:5,color:m.available?C.white:C.muted,lineHeight:1}}>
                {m.label}
              </div>
              <div style={{fontFamily:BC,fontSize:11,letterSpacing:1,color:m.available?C.sub:C.muted,fontWeight:600}}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{marginTop:16,display:"flex",justifyContent:"center",alignItems:"center",gap:20}}>
          <IgLink size={13} fontSize={11}/>
          <span style={{color:C.border,fontSize:10}}>·</span>
          <button className="tap" onClick={()=>{setFeedbackText("");setFeedbackSent(false);setScreen("feedback");}} style={{
            background:"transparent",border:"none",fontFamily:BC,fontSize:11,letterSpacing:3,
            color:C.muted,fontWeight:600,cursor:"pointer",padding:0,
            display:"inline-flex",alignItems:"center",gap:6,opacity:0.7,
          }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Feedback
          </button>
        </div>
      </div>
    </div>
    );
  }

  // ── COMP/DIVISION PICKER ─────────────────────────────────────────────────────
  if (screen==="compPick") {
    const modeLabel = {cpu:"BATTLE",drill:"DRILL","2p":"2 PLAYER",tournament:"TOURNAMENT"}[mode]||"";
    return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={()=>{setScreen("home");setSelectedComp(null);setSelectedDiv(null);}}/>
        <div className="rise" style={{marginBottom:24}}>
          <div style={{fontFamily:BB,fontSize:32,letterSpacing:5,lineHeight:1,color:C.white}}>
            {modeLabel}
          </div>
          <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,marginTop:6,fontWeight:600}}>
            Choose a competition & division
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",margin:"0 -24px",padding:"0 24px"}}>
          {COMPS.map((comp,ci)=>(
            <div key={comp.key} style={{marginBottom:ci<COMPS.length-1?28:0}}>
              {/* Comp header */}
              <div style={{marginBottom:12}}>
                <div style={{fontFamily:BB,fontSize:22,letterSpacing:4,color:C.sub}}>{comp.name}</div>
                <div style={{fontFamily:BC,fontSize:11,letterSpacing:2,color:C.muted,fontWeight:600,marginTop:2}}>
                  {comp.full} · {comp.location}
                </div>
              </div>

              {/* Division rows */}
              {comp.divisions.map((div,di)=>(
                <button key={div.key} className="tap" onClick={()=>{
                  setSelectedComp(comp);
                  setSelectedDiv(div);
                  setOpenList(div.trickSets?div.trickSets[0].key:"regular");
                  setScreen("settings");
                }} style={{
                  width:"100%",padding:"18px 0",background:"transparent",border:"none",
                  borderTop:`1px solid ${C.border}`,
                  borderBottom:di===comp.divisions.length-1?`1px solid ${C.border}`:"none",
                  cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                  transition:"opacity 0.1s",
                }}>
                  <span style={{fontFamily:BB,fontSize:24,letterSpacing:4,color:C.white}}>{div.name}</span>
                  <span style={{fontFamily:BB,fontSize:12,letterSpacing:3,color:C.muted}}>→</span>
                </button>
              ))}

              {/* Comp IG */}
              {comp.ig && (
                <div style={{marginTop:10,display:"flex",justifyContent:"flex-start"}}>
                  <IgLink size={12} fontSize={10} href={comp.ig.href} label={comp.ig.label} style={{opacity:0.5}}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  if (screen==="settings" && selectedDiv) {
    const modeLabel = {cpu:"BATTLE",drill:"DRILL","2p":"2 PLAYER",tournament:"TOURNAMENT"}[mode]||"";
    const startLabel = mode==="drill"?"START DRILL":"START "+modeLabel;

    return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={()=>setScreen("compPick")}/>
        <div className="rise" style={{marginBottom:24}}>
          <div style={{fontFamily:BB,fontSize:34,letterSpacing:5,lineHeight:1,color:C.white}}>
            {selectedDiv.name}
          </div>
          <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:3,marginTop:6,fontWeight:600}}>
            {selectedComp?.name} · {modeLabel}
          </div>
        </div>

        {/* Trick list selector (PRO OPEN) — not for tournament, it auto-switches */}
        {selectedDiv.trickSets && mode!=="tournament" && (
          <Seg label="Trick List" val={openList} onChange={setOpenList} opts={
            selectedDiv.trickSets.map(s=>({key:s.key,label:s.label,sub:s.sub}))
          }/>
        )}

        <Div mb={20}/>

        {/* Mode-specific options */}
        <div className="rise" key={mode}>
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
            <Seg label="Race To" val={race} onChange={setRace} opts={[
              {key:3,label:"3"},
              {key:5,label:"5"},
            ]}/>
          </>)}

          {mode==="2p" && (
            <Seg label="Race To" val={race} onChange={setRace} opts={[
              {key:3,label:"3"},
              {key:5,label:"5"},
            ]}/>
          )}

          {mode==="tournament" && (<>
            <Seg label="Base Difficulty" val={diff} onChange={setDiff} opts={[
              {key:"easy",  label:"ROOKIE",  color:C.green, sub:"~48%"},
              {key:"medium",label:"AMATEUR", color:C.yellow,sub:"~68%"},
              {key:"hard",  label:"PRO",     color:C.red,   sub:"~87%"},
            ]}/>
            <Seg label="Bracket Size" val={bracketSize} onChange={setBracketSize} opts={[
              {key:4,label:"4",sub:"2 rounds"},
              {key:8,label:"8",sub:"3 rounds"},
            ]}/>
            <Seg label="Race To" val={race} onChange={setRace} opts={[
              {key:3,label:"3"},
              {key:5,label:"5"},
            ]}/>
            {selectedDiv.trickSets && (
              <div style={{borderLeft:`3px solid ${C.orange}`,paddingLeft:14,marginBottom:20}}>
                <Label style={{letterSpacing:3,color:C.orange,marginBottom:4}}>Trick List Progression</Label>
                <div style={{fontFamily:BC,fontSize:12,color:C.sub,fontWeight:600,lineHeight:1.5}}>
                  Earlier rounds use REGULAR tricks. The final switches to TOP 16 — just like a real comp.
                </div>
              </div>
            )}
            <div style={{borderLeft:`3px solid ${C.muted}`,paddingLeft:14,marginBottom:20}}>
              <Label style={{letterSpacing:3,marginBottom:4}}>Difficulty Scaling</Label>
              <div style={{fontFamily:BC,fontSize:12,color:C.sub,fontWeight:600,lineHeight:1.5}}>
                CPU gets slightly harder each round (+2%) on top of your chosen base difficulty.
              </div>
            </div>
          </>)}

          {mode==="drill" && (<>
            <Seg label="Drill Type" val={drillType} onChange={setDrillType} opts={[
              {key:"consistency",label:"CONSISTENCY",sub:`land ${drillTarget}× in a row`},
              {key:"firsttry",   label:"FIRST TRY",  sub:"one shot per trick"},
            ]}/>
            {drillType==="consistency" && (
              <Seg label="Streak Target" val={drillTarget} onChange={setDrillTarget} opts={[
                {key:3, label:"3×"},
                {key:5, label:"5×"},
                {key:10,label:"10×"},
              ]}/>
            )}
            <Seg label="Trick Source" val={drillSource} onChange={setDrillSource} opts={[
              {key:"weakest",label:"WEAKEST",sub:"from stats"},
              {key:"full",   label:"FULL LIST",sub:"shuffled"},
              {key:"pick",   label:"PICK",sub:"choose tricks"},
            ]}/>
          </>)}
        </div>

        <div style={{flex:1}}/>
        <BtnPrimary onClick={mode==="drill"?startDrill:mode==="tournament"?startTournament:startGame}>
          {startLabel}
        </BtnPrimary>
      </div>
    </div>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (screen==="result" && result) {
    const { scores, won, mode:rm } = result;
    const is2p = rm==="2p";
    const winLabel = is2p?(scores.p1>=race?"P1 WINS":"P2 WINS"):(won?"YOU WIN":"CPU WINS");
    const subLabel = is2p?"Match Over":(won?"Well Done":"Keep Training");
    const resultColor = won?C.green:C.red;
    return (
      <div style={{...root,justifyContent:"center"}}>
        <div style={{position:"fixed",inset:0,background:resultColor,opacity:0,animation:"flash 0.8s ease-out",zIndex:2,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <div className="fadeUp" style={{animationDelay:"0s"}}>
            <img src={LOGO} alt="NXS" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",opacity:0.4}}/>
          </div>
          <div className="fadeUp" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
            <Label style={{marginBottom:12,letterSpacing:5}}>{subLabel}</Label>
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
            <BtnGhost onClick={()=>{setScreen("home");setGs(null);setTourney(null);setSelectedComp(null);setSelectedDiv(null);}}>← MAIN MENU</BtnGhost>
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
      <button onClick={()=>setScreen("settings")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:11,letterSpacing:5,cursor:"pointer",padding:0}}>← QUIT</button>
      <div style={{fontFamily:BB,fontSize:9,letterSpacing:4,color:C.muted}}>
        KOMP
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
