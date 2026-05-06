import { useState, useEffect } from "react";
import { SB } from "../supabase";
import { LOGOS, C, BB, BC, R, COMPS_SORTED, isCompPast } from "../config";
import { Label, Div, BtnPrimary, BtnGhost, BackBtn } from "./ui";

function StatsScreen({ user, username, isGuest, onBack, onAuth, compDbKey, selectedComp, selectedDiv }) {
  const [matches,  setMatches]  = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [history,  setHistory]  = useState(null);
  const [tab,      setTab]      = useState("record");
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showAllTricks, setShowAllTricks] = useState(false);

  // Tournament history detail view
  const [tourneyDetail, setTourneyDetail] = useState(null); // { id, matches }

  // Last-viewed scope is persisted across sessions. An explicit
  // selectedComp/selectedDiv prop (e.g., when arriving from a game flow)
  // takes precedence; otherwise restore last viewed; otherwise first comp.
  const STATS_SCOPE_KEY = "komp.statsScope";
  const loadStoredScope = () => {
    try {
      const raw = typeof localStorage!=="undefined" && localStorage.getItem(STATS_SCOPE_KEY);
      if (!raw) return null;
      const { compKey, divKey } = JSON.parse(raw);
      const c = COMPS_SORTED.find(x => x.key === compKey);
      if (!c) return null;
      const d = c.divisions.find(x => x.key === divKey) || c.divisions[0];
      return { c, d };
    } catch { return null; }
  };
  const stored = loadStoredScope();
  const initComp = selectedComp || stored?.c || COMPS_SORTED[0];
  const initDiv  = (selectedComp ? selectedDiv : stored?.d) || initComp?.divisions[0];
  const [statsComp, setStatsComp] = useState(initComp);
  const [statsDiv,  setStatsDiv]  = useState(initDiv);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerShowPast, setPickerShowPast] = useState(false);
  const [expandedMode, setExpandedMode] = useState(null);
  const [drillDiff, setDrillDiff] = useState("easy");

  useEffect(() => {
    if (!statsComp || !statsDiv) return;
    try { localStorage.setItem(STATS_SCOPE_KEY, JSON.stringify({compKey:statsComp.key, divKey:statsDiv.key})); } catch {}
  }, [statsComp, statsDiv]);
  const statsDivKey = statsComp && statsDiv ? `${statsComp.key}:${statsDiv.key}` : "ekc_2026:am_open";
  const currentDivLabel = statsDiv?.name || "AM OPEN";

  useEffect(() => {
    if (!user) return;
    const key = statsDivKey;
    Promise.all([
      SB.from("match_results").select("*").eq("user_id",user.id).eq("competition",key),
      SB.from("trick_attempts").select("trick,landed,competition").eq("user_id",user.id).eq("competition",key),
      SB.from("match_results").select("*").eq("user_id",user.id).eq("competition",key)
        .order("created_at",{ascending:false}).limit(50),
    ]).then(([mRes, tRes, hRes])=>{
      setMatches(mRes.data||[]);
      setAttempts(tRes.data||[]);
      setHistory(hRes.data||[]);
    }).catch(()=>{
      setMatches([]); setAttempts([]); setHistory([]);
    });
  },[user, statsDivKey]);

  const DIFFICULTIES = ["easy","medium","hard"];
  const DIFF_LABELS = {easy:"ROOKIE",medium:"AMATEUR",hard:"PRO"};
  const DIFF_COLORS = {easy:C.green,medium:C.yellow,hard:C.red};

  // Filter helpers
  const battleMatches = () => (matches||[]).filter(m=>m.mode!=="tournament");
  const tourneyMatches = () => (matches||[]).filter(m=>m.mode==="tournament");
  const allMatches = () => (matches||[]);

  // Trophy count per difficulty
  const trophyCount = (d) => tourneyMatches().filter(m=>m.difficulty===d&&m.tournament_result==="champion").length;

  // ── NOW includes tournament matches in difficulty breakdown ──
  const recordForDiv = () => {
    const am = allMatches();
    return DIFFICULTIES.map(d=>{
      const sub = am.filter(m=>m.difficulty===d);
      const w = sub.filter(m=>m.won).length;
      return {diff:d, wins:w, losses:sub.length-w, total:sub.length};
    }).filter(r=>r.total>0);
  };
  const totalRecord = () => {
    const rows = recordForDiv();
    const wins = rows.reduce((a,r)=>a+r.wins,0);
    const tot = rows.reduce((a,r)=>a+r.total,0);
    return {wins, losses:tot-wins, total:tot};
  };
  const battleRecord = () => {
    const bm = battleMatches();
    const w = bm.filter(m=>m.won).length;
    return {wins:w, losses:bm.length-w, total:bm.length};
  };
  const tourneyRecord = () => {
    const tm = tourneyMatches();
    const w = tm.filter(m=>m.won).length;
    return {wins:w, losses:tm.length-w, total:tm.length};
  };
  const recordByDiffAndMode = (d, isTourney) => {
    const list = (matches||[]).filter(m =>
      m.difficulty===d && (isTourney ? m.mode==="tournament" : m.mode!=="tournament")
    );
    const w = list.filter(m=>m.won).length;
    return {wins:w, losses:list.length-w, total:list.length, rate:list.length>0?Math.round(w/list.length*100):0};
  };

  // Tournament-level stats per difficulty: attempts, trophies, best run reached.
  const tourneyStatsByDiff = (d) => {
    const tm = tourneyMatches().filter(m => m.difficulty===d);
    if (tm.length===0) return {attempts:0, won:0, bestLabel:null, bestRank:-1};
    const byId = {};
    tm.forEach(m => {
      const id = m.tournament_id || `t_${m.created_at}`;
      if (!byId[id]) byId[id] = {hasChampion:false, deepestRound:0, bracketSize:0};
      if (m.tournament_result==="champion") byId[id].hasChampion = true;
      if (m.tournament_round && m.tournament_round > byId[id].deepestRound) byId[id].deepestRound = m.tournament_round;
      if (m.bracket_size) byId[id].bracketSize = m.bracket_size;
    });
    const list = Object.values(byId);
    const attempts = list.length;
    const won = list.filter(t => t.hasChampion).length;
    let bestLabel = null, bestRank = -1;
    list.forEach(t => {
      let rank, label;
      if (t.hasChampion) { rank = 100; label = "CHAMPION"; }
      else {
        const totalR = t.bracketSize ? Math.log2(t.bracketSize) : 0;
        const fromEnd = totalR - t.deepestRound;
        if (fromEnd<=0)      { rank = 90; label = "RUNNER-UP"; }
        else if (fromEnd===1){ rank = 70; label = "SEMIFINAL"; }
        else if (fromEnd===2){ rank = 50; label = "QUARTERFINAL"; }
        else                 { rank = 30; label = `ROUND ${t.deepestRound||1}`; }
      }
      if (rank>bestRank) { bestRank = rank; bestLabel = label; }
    });
    return {attempts, won, bestLabel, bestRank};
  };
  const totalTourneyAttempts = () => DIFFICULTIES.reduce((a,d)=>a+tourneyStatsByDiff(d).attempts, 0);

  // Conversion-rate funnel per difficulty. Tournaments are about
  // progressing through a ladder, so meaningful stats are how often
  // you reach each milestone, not how many you "won". Three milestones
  // that work regardless of bracket size:
  //   - WON 1+ MATCH  (you got past your first match)
  //   - REACHED FINAL (you played the last match of the bracket)
  //   - CHAMPION      (you won the last match)
  const tourneyMilestonesByDiff = (d) => {
    const tm = tourneyMatches().filter(m => m.difficulty===d);
    const byId = {};
    tm.forEach(m => {
      const id = m.tournament_id || `t_${m.created_at}`;
      if (!byId[id]) byId[id] = {hasChampion:false, deepestRound:0, bracketSize:0};
      if (m.tournament_result==="champion") byId[id].hasChampion = true;
      if (m.tournament_round) byId[id].deepestRound = Math.max(byId[id].deepestRound, m.tournament_round);
      if (m.bracket_size) byId[id].bracketSize = m.bracket_size;
    });
    let total=0, won1=0, finalists=0, champions=0;
    Object.values(byId).forEach(t => {
      total++;
      const totalR = t.bracketSize ? Math.log2(t.bracketSize) : 0;
      // matches won = deepestRound (won them all if champion) or deepestRound-1 (eliminated)
      const matchesWon = t.hasChampion ? t.deepestRound : Math.max(0, t.deepestRound-1);
      if (matchesWon >= 1) won1++;
      if (totalR>0 && t.deepestRound >= totalR) finalists++;
      if (t.hasChampion) champions++;
    });
    const pct = (n) => total>0 ? Math.round(n/total*100) : 0;
    return {
      total,
      milestones: [
        {key:"won1",     label:"ADVANCED", count:won1,      pct:pct(won1)},
        {key:"final",    label:"FINALIST", count:finalists, pct:pct(finalists)},
        {key:"champion", label:"CHAMPION", count:champions, pct:pct(champions)},
      ],
    };
  };

  const tricksForDiv = () => {
    const stats = {};
    (attempts||[]).forEach(a=>{
      if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
      if (a.landed) stats[a.trick].land++; else stats[a.trick].miss++;
    });
    return Object.entries(stats)
      .map(([t,s])=>({trick:t, rate:Math.round(s.land/(s.land+s.miss)*100), att:s.land+s.miss}))
      .sort((a,b)=>a.rate-b.rate);
  };

  // ── History: battle matches + grouped tournaments ──
  const historyItems = () => {
    const h = history || [];
    const battles = h.filter(m=>m.mode!=="tournament");
    // Group tournament matches by tournament_id (or by time proximity fallback)
    const tourneyMap = {};
    h.filter(m=>m.mode==="tournament").forEach(m=>{
      const tid = m.tournament_id || groupKeyByTime(m);
      if (!tourneyMap[tid]) tourneyMap[tid] = [];
      tourneyMap[tid].push(m);
    });
    // Build tournament summary entries
    const tourneyEntries = Object.entries(tourneyMap).map(([tid, games])=>{
      games.sort((a,b)=>(a.tournament_round||0)-(b.tournament_round||0));
      const lastGame = games[games.length-1];
      const isChampion = games.some(g=>g.tournament_result==="champion");
      const isEliminated = games.some(g=>g.tournament_result==="eliminated");
      const wins = games.filter(g=>g.won).length;
      const losses = games.filter(g=>!g.won).length;
      return {
        type:"tournament", id:`t_${tid}`, tournamentId:tid,
        games, wins, losses, totalGames:games.length,
        isChampion, isEliminated, difficulty:lastGame.difficulty,
        bracket_size: lastGame.bracket_size || (games.length<=2?4:8),
        created_at: games[0].created_at,
      };
    });
    // Build battle entries
    const battleEntries = battles.map(m=>({type:"battle", ...m}));
    // Merge and sort by date desc
    const all = [...battleEntries, ...tourneyEntries];
    all.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return all.slice(0,20);
  };

  // Fallback grouping for old tournament matches without tournament_id
  const groupKeyByTime = (m) => {
    const d = new Date(m.created_at);
    const hour = Math.floor(d.getTime()/(1000*60*30)); // 30 min buckets
    return `${m.difficulty}_${hour}`;
  };

  const parseLog = (m) => {
    if (!m.game_log) return null;
    try { return typeof m.game_log==="string" ? JSON.parse(m.game_log) : m.game_log; }
    catch { return null; }
  };

  const loading = !isGuest && (matches===null || attempts===null);
  const root = {fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"};

  if (isGuest) return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px))"}}>
        <BackBtn onClick={onBack}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
          <img src={LOGOS[2]} alt="KOMP" style={{width:64,height:64,objectFit:"contain",opacity:0.3}}/>
          <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.white}}>TRACK YOUR PROGRESS</div>
          <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,maxWidth:280}}>
            Sign up to save your match history and trick stats across sessions.
          </div>
          <BtnPrimary onClick={()=>onAuth("signup")} style={{maxWidth:280,marginTop:8}}>SIGN UP FREE</BtnPrimary>
          <BtnGhost color={C.muted} onClick={onBack} style={{maxWidth:280}}>← BACK</BtnGhost>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:BB,fontSize:14,letterSpacing:6,color:C.muted}} role="status">LOADING STATS...</div>
      </div>
    </div>
  );

  const switchTab = (k) => { setTab(k); setExpandedMatch(null); setConfirmReset(false); setShowAllTricks(false); setTourneyDetail(null); };

  // ── Tournament Detail View (accordion, same as battle history) ──
  const renderTourneyDetail = () => {
    if (!tourneyDetail) return null;
    const { games, isChampion, bracket_size } = tourneyDetail;
    const ROUND_NAMES = bracket_size>=8
      ? ["QUARTER","SEMI","FINAL"]
      : ["SEMI","FINAL"];

    return (
      <div>
        <button className="tap" onClick={()=>setTourneyDetail(null)} style={{
          background:"transparent",border:"none",fontFamily:BB,fontSize:11,letterSpacing:3,
          color:C.muted,cursor:"pointer",padding:"0 0 16px",display:"flex",alignItems:"center",gap:6,
        }}>← BACK TO HISTORY</button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{fontFamily:BB,fontSize:22,letterSpacing:3,color:isChampion?C.yellow:C.red}}>
            {isChampion?"CHAMPION":"ELIMINATED"}
          </div>
          <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600}}>
            {bracket_size} PLAYERS
          </div>
        </div>

        {games.map((g,i)=>{
          const ri = g.tournament_round ?? i;
          const roundLabel = ROUND_NAMES[ri] || `R${ri+1}`;
          const col = g.won?C.green:C.red;
          const diffCol = DIFF_COLORS[g.difficulty]||C.sub;
          const date = new Date(g.created_at);
          const dateStr = `${date.getDate()}/${date.getMonth()+1}`;
          const log = parseLog(g);
          const hasLog = !!log;
          const isOpen = expandedMatch===`tg_${g.id||i}`;
          return (
            <div key={g.id||i} className="fadeUp" style={{
              borderLeft:`3px solid ${col}`,paddingLeft:14,marginBottom:8,
              background:`${col}06`,cursor:hasLog?"pointer":"default",
              animationDelay:`${i*0.06}s`,animationFillMode:"both",
            }} onClick={()=>hasLog && setExpandedMatch(isOpen?null:`tg_${g.id||i}`)}>
              <div style={{display:"flex",alignItems:"center",
                paddingTop:12,paddingBottom:isOpen&&log?6:12}}>
                <div style={{width:72,flexShrink:0}}>
                  <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.white,
                    border:`1px solid ${C.white}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>{roundLabel}</div>
                </div>
                <div style={{fontFamily:BB,fontSize:20,letterSpacing:2,color:col,width:28,textAlign:"center",flexShrink:0,marginLeft:8}}>
                  {g.won?"W":"L"}
                </div>
                <div style={{fontFamily:BB,fontSize:22,letterSpacing:1,color:C.white,marginLeft:8}}>
                  {g.your_score}–{g.cpu_score}
                </div>
                <div style={{flex:1}}/>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <div style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:diffCol,
                    border:`1px solid ${diffCol}30`,padding:"4px 0",borderRadius:R,
                    minWidth:80,textAlign:"center"}}>{DIFF_LABELS[g.difficulty]||g.difficulty}</div>
                  <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600,minWidth:32,textAlign:"right"}}>{dateStr}</div>
                  {hasLog && (
                    <div style={{fontFamily:BB,fontSize:10,color:C.muted,transition:"transform 0.2s",
                      transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
                  )}
                </div>
              </div>
              {isOpen && log && (
                <div style={{paddingBottom:14,paddingTop:4,borderTop:`1px solid ${C.divider}`}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"flex",gap:16,marginBottom:10,marginTop:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:C.sub,opacity:0.85}}/>
                      <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>YOU</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:C.sub,opacity:0.4}}/>
                      <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>CPU</span>
                    </div>
                    <span style={{color:C.border}}>·</span>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
                      <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>LAND</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:C.red}}/>
                      <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>MISS</span>
                    </div>
                  </div>
                  {log.map((t,ti)=>{
                    const rc = t.result==="you"?C.green:t.result==="cpu"?C.red:C.muted;
                    const rl = t.result==="you"?"YOU":t.result==="cpu"?"CPU":"NULL";
                    return (
                      <div key={ti} style={{borderLeft:`2px solid ${rc}`,paddingLeft:10,marginBottom:ti<log.length-1?10:0,paddingTop:2,paddingBottom:2}}>
                        <div style={{fontFamily:BC,fontSize:11,color:C.sub,fontWeight:600,lineHeight:1.3,marginBottom:4}}>{t.trick}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color:C.muted}}>
                            {t.playerFirst?"YOU 1ST":"CPU 1ST"}
                          </span>
                          <span style={{color:C.border}}>·</span>
                          {t.tries && t.tries.map((tr,j)=>(
                            <div key={j} style={{display:"inline-flex",alignItems:"center",gap:3}}>
                              <div title="You" style={{width:6,height:6,borderRadius:"50%",background:tr.you?C.green:C.red,opacity:0.85}}/>
                              <div title="CPU" style={{width:6,height:6,borderRadius:"50%",background:tr.cpu?C.green:C.red,opacity:0.45}}/>
                              {j<t.tries.length-1 && <span style={{color:C.border,fontSize:8,margin:"0 1px"}}>·</span>}
                            </div>
                          ))}
                          <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color:rc,marginLeft:"auto"}}>{rl}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <BackBtn onClick={onBack}/>
          <div style={{marginBottom:18}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white,marginBottom:10}}>TRAINING STATS</div>
            <button className="tap" onClick={()=>setPickerOpen(true)} style={{
              background:"transparent",border:"none",padding:0,cursor:"pointer",
              display:"inline-flex",alignItems:"center",gap:8,
            }}>
              <span style={{fontFamily:BB,fontSize:13,letterSpacing:3,color:C.sub}}>
                {statsComp?.name||""} · {statsDiv?.name||""}
              </span>
              <span style={{fontFamily:BB,fontSize:10,color:C.muted}}>▾</span>
            </button>
          </div>

          <div style={{display:"flex",gap:0}}>
            {[["record","RECORD"],["tricks","TRICKS"],["history","HISTORY"]].map(([k,l])=>(
              <button key={k} onClick={()=>switchTab(k)} style={{
                flex:1,padding:"12px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${tab===k?C.white:"transparent"}`,
                color:tab===k?C.white:C.muted,
                fontFamily:BB,fontSize:13,letterSpacing:4,cursor:"pointer",transition:"all 0.15s",
              }}>{l}</button>
            ))}
          </div>
          <Div/>
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"24px 24px 32px"}}>

          {tab==="record" && (()=>{
            const rows = recordForDiv();
            const bRec = battleRecord();
            const tRec = tourneyRecord();
            const tm = tourneyMatches();
            if (rows.length===0 && tm.length===0 && bRec.total===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No matches yet for {currentDivLabel}.<br/>Play vs CPU to track your record.
              </div>
            );

            const totals = totalRecord();
            const totalRate = totals.total>0?Math.round(totals.wins/totals.total*100):0;
            const totalTrophies = DIFFICULTIES.reduce((a,d)=>a+trophyCount(d),0);

            const bRate = bRec.total>0?Math.round(bRec.wins/bRec.total*100):0;
            const tRate = tRec.total>0?Math.round(tRec.wins/tRec.total*100):0;

            const Inline = ({n, label, color}) => (
              <span style={{display:"inline-flex",alignItems:"baseline",gap:5}}>
                <span style={{fontFamily:BB,fontSize:13,color:C.text}}>{n}</span>
                <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color}}>{label}</span>
              </span>
            );

            const tourneyAttempts = totalTourneyAttempts();

            const ModeCol = ({mode, label, dimmed, big, sub}) => {
              const expanded = expandedMode===mode;
              return (
                <button
                  onClick={()=>!dimmed && setExpandedMode(expanded?null:mode)}
                  className="tap"
                  style={{
                    flex:1,padding:"10px 4px",background:expanded?`${C.white}08`:"transparent",
                    border:"none",borderRadius:R,cursor:dimmed?"default":"pointer",
                    transition:"background 0.15s",textAlign:"center",opacity:dimmed?0.45:1,
                  }}
                >
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
                    <span style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted}}>{label}</span>
                    {!dimmed && (
                      <span style={{fontFamily:BB,fontSize:9,color:C.muted,
                        transition:"transform 0.2s",transform:expanded?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                    )}
                  </div>
                  <div style={{fontFamily:BB,fontSize:32,lineHeight:0.9,color:C.text}}>{big}</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:8,marginTop:12,minHeight:14}}>
                    {sub}
                  </div>
                </button>
              );
            };

            const BattleDrill = ({diff}) => {
              const rec = recordByDiffAndMode(diff, false);
              if (rec.total===0) return (
                <div style={{textAlign:"center",padding:"32px 0",fontFamily:BC,fontSize:13,color:C.muted,fontWeight:600}}>
                  No matches at this difficulty
                </div>
              );
              const lossRate = 100 - rec.rate;
              return (
                <div style={{padding:"4px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:18}}>
                    <span style={{fontFamily:BB,fontSize:40,lineHeight:0.9,color:C.text}}>{rec.total}</span>
                    <span style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted}}>
                      {rec.total===1?"GAME":"GAMES"}
                    </span>
                  </div>
                  <div style={{display:"flex",height:8,borderRadius:1,overflow:"hidden",marginBottom:10,gap:2}}>
                    <div style={{height:"100%",width:`${rec.rate}%`,background:C.green,transition:"width 0.4s"}}/>
                    <div style={{height:"100%",width:`${lossRate}%`,background:C.red,transition:"width 0.4s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                    <span style={{fontFamily:BB,fontSize:14,color:C.green,letterSpacing:1}}>{rec.wins} W</span>
                    <span style={{fontFamily:BB,fontSize:14,color:C.red,letterSpacing:1}}>{rec.losses} L</span>
                  </div>
                </div>
              );
            };

            const TourneyDrill = ({diff}) => {
              const stats = tourneyStatsByDiff(diff);
              const data = tourneyMilestonesByDiff(diff);
              if (data.total===0) return (
                <div style={{textAlign:"center",padding:"32px 0",fontFamily:BC,fontSize:13,color:C.muted,fontWeight:600}}>
                  No tournaments at this difficulty
                </div>
              );
              const colorMap = [C.sub, `${C.yellow}66`, C.yellow];
              return (
                <div style={{padding:"4px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:18,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontFamily:BB,fontSize:40,lineHeight:0.9,color:C.text}}>{data.total}</span>
                      <span style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted}}>
                        {data.total===1?"RUN":"RUNS"}
                      </span>
                    </div>
                    {stats.won>0 && (
                      <span style={{fontFamily:BB,fontSize:11,letterSpacing:2,color:C.yellow,
                        border:`1px solid ${C.yellow}40`,borderRadius:R,padding:"4px 8px"}}>
                        {stats.won} {stats.won===1?"TROPHY":"TROPHIES"}
                      </span>
                    )}
                  </div>
                  {data.milestones.map((m, i) => (
                    <div key={m.key} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0"}}>
                      <div style={{width:120,fontFamily:BB,fontSize:10,letterSpacing:2,color:C.muted,flexShrink:0}}>
                        {m.label}
                      </div>
                      <div style={{flex:1,height:5,background:C.divider,borderRadius:1,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.max(m.pct,m.count>0?2:0)}%`,
                          background:colorMap[i],transition:"width 0.4s"}}/>
                      </div>
                      <div style={{minWidth:38,fontFamily:BB,fontSize:13,color:C.text,textAlign:"right",flexShrink:0}}>
                        {m.pct}%
                      </div>
                    </div>
                  ))}
                </div>
              );
            };

            return (
              <>
                {/* HERO — overall mastery at a glance */}
                <div style={{textAlign:"center",marginBottom:32}}>
                  <div style={{fontFamily:BB,fontSize:72,lineHeight:0.9,color:C.text}}>{totalRate}%</div>
                  <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted,marginTop:8}}>OVERALL WIN RATE</div>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:10,marginTop:14,flexWrap:"wrap"}}>
                    <Inline n={totals.wins}   label="WINS"   color={C.green}/>
                    <span style={{color:C.border}}>·</span>
                    <Inline n={totals.losses} label="LOSSES" color={C.red}/>
                    {totalTrophies>0 && (
                      <>
                        <span style={{color:C.border}}>·</span>
                        <Inline n={totalTrophies} label={totalTrophies===1?"TROPHY":"TROPHIES"} color={C.yellow}/>
                      </>
                    )}
                  </div>
                </div>

                <Div mb={24}/>

                {/* MODE BREAKDOWN — tappable to drill into per-difficulty detail */}
                <div style={{display:"flex",gap:0,marginBottom:expandedMode?12:8}}>
                  <ModeCol
                    mode="battle"
                    label="BATTLE"
                    dimmed={bRec.total===0}
                    big={bRec.total===0 ? "—" : `${bRate}%`}
                    sub={bRec.total===0
                      ? <span style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.muted}}>NO MATCHES</span>
                      : <>
                          <Inline n={bRec.wins} label="W" color={C.green}/>
                          <span style={{color:C.border}}>·</span>
                          <Inline n={bRec.losses} label="L" color={C.red}/>
                        </>
                    }
                  />
                  <div style={{width:1,background:C.divider,margin:"8px 0"}}/>
                  <ModeCol
                    mode="tourney"
                    label="TOURNEY"
                    dimmed={tourneyAttempts===0}
                    big={tourneyAttempts===0 ? "—" : `${totalTrophies}`}
                    sub={tourneyAttempts===0
                      ? <span style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.muted}}>NO TOURNEYS</span>
                      : <span style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.yellow}}>
                          {totalTrophies===1?"TROPHY":"TROPHIES"}
                        </span>
                    }
                  />
                </div>

                {expandedMode && (
                  <div className="rise" style={{
                    marginTop:8,padding:"14px 4px 4px",
                    borderTop:`1px solid ${C.divider}`,
                  }}>
                    <div style={{display:"flex",gap:0,marginBottom:18}}>
                      {DIFFICULTIES.map(d => (
                        <button key={d} onClick={()=>setDrillDiff(d)} style={{
                          flex:1,padding:"8px 0",background:"transparent",border:"none",
                          borderBottom:`2px solid ${drillDiff===d?C.white:"transparent"}`,
                          color:drillDiff===d?C.white:C.muted,
                          fontFamily:BB,fontSize:11,letterSpacing:3,cursor:"pointer",transition:"all 0.15s",
                        }}>{DIFF_LABELS[d]}</button>
                      ))}
                    </div>
                    {expandedMode==="tourney"
                      ? <TourneyDrill diff={drillDiff}/>
                      : <BattleDrill  diff={drillDiff}/>
                    }
                  </div>
                )}
              </>
            );
          })()}

          {tab==="tricks" && (()=>{
            const list = tricksForDiv();
            if (list.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No trick data yet for {currentDivLabel}.<br/>Attempt rates are tracked when you play vs CPU.
              </div>
            );
            const weak   = list.filter(t=>t.rate<40);
            const mid    = list.filter(t=>t.rate>=40&&t.rate<70);
            const strong = list.filter(t=>t.rate>=70).reverse();
            const PREVIEW = 5;
            const totalAtt = list.reduce((a,t)=>a+t.att,0);
            const avgRate = Math.round(list.reduce((a,t)=>a+t.rate*t.att,0)/totalAtt);
            const hasMore = !showAllTricks && (weak.length>PREVIEW||mid.length>PREVIEW||strong.length>PREVIEW);

            const TrickRow = ({trick,rate,att}) => {
              const col = rate>=70?C.green:rate>=40?C.yellow:C.red;
              return (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",
                  borderBottom:`1px solid ${C.divider}`}}>
                  <div style={{width:3,height:20,background:col,borderRadius:1,flexShrink:0}}/>
                  <div style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600,flex:1,lineHeight:1.3,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{trick}</div>
                  <span style={{fontFamily:BC,fontSize:11,color:C.muted,flexShrink:0}}>{att}×</span>
                  <span style={{fontFamily:BB,fontSize:16,letterSpacing:1,color:C.text,flexShrink:0,
                    minWidth:38,textAlign:"right"}}>{rate}%</span>
                </div>
              );
            };

            const Section = ({label,color,items}) => {
              const show = showAllTricks ? items : items.slice(0,PREVIEW);
              if (items.length===0) return null;
              return (
                <div style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <Label style={{letterSpacing:4,color}}>{label}</Label>
                    <span style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600}}>{items.length}</span>
                  </div>
                  {show.map(t=><TrickRow key={t.trick} {...t}/>)}
                  {!showAllTricks && items.length>PREVIEW && (
                    <div style={{fontFamily:BC,fontSize:11,color:C.muted,textAlign:"center",marginTop:6}}>
                      +{items.length-PREVIEW} more
                    </div>
                  )}
                </div>
              );
            };

            const TierLegend = ({n, label, color}) => (
              <div style={{display:"inline-flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,background:color,borderRadius:1,display:"inline-block"}}/>
                <span style={{fontFamily:BB,fontSize:13,color:C.text,lineHeight:1}}>{n}</span>
                <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color:C.muted,lineHeight:1}}>{label}</span>
              </div>
            );

            return (
              <>
                {/* HERO — overall trick mastery at a glance */}
                <div style={{marginBottom:24,textAlign:"center"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <span style={{fontFamily:BB,fontSize:52,lineHeight:0.9,color:C.text}}>{avgRate}%</span>
                    <span style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted}}>AVG LAND RATE</span>
                  </div>
                  <div style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.muted,marginTop:8}}>
                    {list.length} TRICKS · {totalAtt} ATTEMPTS
                  </div>
                </div>

                {/* DISTRIBUTION — how your tricks split across tiers */}
                <div style={{marginBottom:28}}>
                  <div style={{display:"flex",height:6,borderRadius:1,overflow:"hidden",marginBottom:10,gap:2,background:C.divider}}>
                    {weak.length>0   && <div style={{flex:weak.length,  background:C.red,   transition:"flex 0.3s"}}/>}
                    {mid.length>0    && <div style={{flex:mid.length,   background:C.yellow,transition:"flex 0.3s"}}/>}
                    {strong.length>0 && <div style={{flex:strong.length,background:C.green, transition:"flex 0.3s"}}/>}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",rowGap:8,columnGap:10}}>
                    <TierLegend n={weak.length}   label="NEEDS WORK"     color={C.red}/>
                    <TierLegend n={mid.length}    label="GETTING THERE"  color={C.yellow}/>
                    <TierLegend n={strong.length} label="SOLID"          color={C.green}/>
                  </div>
                </div>

                <Section label="Needs Work"    color={C.red}    items={weak}/>
                <Section label="Getting There" color={C.yellow} items={mid}/>
                <Section label="Solid"         color={C.green}  items={strong}/>
                {hasMore && (
                  <button className="tap" onClick={()=>setShowAllTricks(true)} style={{
                    width:"100%",padding:"14px 0",marginTop:4,background:"transparent",border:`1px solid ${C.border}`,
                    borderRadius:R,fontFamily:BB,fontSize:12,letterSpacing:4,color:C.sub,cursor:"pointer",
                  }}>SHOW ALL {list.length} TRICKS</button>
                )}
              </>
            );
          })()}

          {tab==="history" && (()=>{
            // If viewing a tournament detail
            if (tourneyDetail) return renderTourneyDetail();

            const items = historyItems();
            if (items.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No match history yet for {currentDivLabel}.<br/>Play to start tracking.
              </div>
            );
            return (
              <>
                <Label style={{marginBottom:16,letterSpacing:4}}>Recent Matches</Label>
                {items.map((item,i)=>{
                  if (item.type==="tournament") {
                    // Tournament card
                    const col = item.isChampion?C.yellow:C.red;
                    const diffCol = DIFF_COLORS[item.difficulty]||C.sub;
                    const date = new Date(item.created_at);
                    const dateStr = `${date.getDate()}/${date.getMonth()+1}`;
                    return (
                      <div key={item.id} className="fadeUp" style={{
                        borderLeft:`3px solid ${col}`,paddingLeft:14,marginBottom:8,
                        background:`${col}08`,cursor:"pointer",
                        animationDelay:`${i*0.04}s`,animationFillMode:"both",
                      }} onClick={()=>setTourneyDetail(item)}>
                        <div style={{display:"flex",alignItems:"center",paddingTop:12,paddingBottom:12}}>
                          <div style={{width:72,flexShrink:0}}>
                            <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.white,
                              border:`1px solid ${C.white}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>TOURNEY</div>
                          </div>
                          <div style={{fontFamily:BB,fontSize:20,letterSpacing:2,color:col,width:28,textAlign:"center",flexShrink:0,marginLeft:8}}>
                            {item.isChampion?"W":"L"}
                          </div>
                          <div style={{flex:1}}/>
                          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                            <div style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:diffCol,
                              border:`1px solid ${diffCol}30`,padding:"4px 0",borderRadius:R,
                              minWidth:80,textAlign:"center"}}>{DIFF_LABELS[item.difficulty]||item.difficulty}</div>
                            <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600,minWidth:32,textAlign:"right"}}>{dateStr}</div>
                            <div style={{fontFamily:BB,fontSize:10,color:C.muted}}>▸</div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Battle match card (same as before)
                  const m = item;
                  const col = m.won?C.green:C.red;
                  const diffCol = DIFF_COLORS[m.difficulty]||C.sub;
                  const date = new Date(m.created_at);
                  const dateStr = `${date.getDate()}/${date.getMonth()+1}`;
                  const isOpen = expandedMatch===(m.id||i);
                  const log = parseLog(m);
                  const canExpand = !!log;

                  return (
                    <div key={m.id||i} className="fadeUp" style={{
                      borderLeft:`3px solid ${col}`,paddingLeft:14,
                      marginBottom:8,background:`${col}06`,
                      animationDelay:`${i*0.04}s`,animationFillMode:"both",
                      cursor:canExpand?"pointer":"default",
                    }} onClick={()=>canExpand && setExpandedMatch(isOpen?null:(m.id||i))}>
                      <div style={{display:"flex",alignItems:"center",
                        paddingTop:12,paddingBottom:isOpen&&log?6:12}}>
                        <div style={{width:72,flexShrink:0}}>
                          <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.white,
                            border:`1px solid ${C.white}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>BATTLE</div>
                        </div>
                        <div style={{fontFamily:BB,fontSize:20,letterSpacing:2,color:col,width:28,textAlign:"center",flexShrink:0,marginLeft:8}}>
                          {m.won?"W":"L"}
                        </div>
                        <div style={{fontFamily:BB,fontSize:22,letterSpacing:1,color:C.white,marginLeft:8}}>
                          {m.your_score}–{m.cpu_score}
                        </div>
                        <div style={{flex:1}}/>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                          <div style={{
                            fontFamily:BB,fontSize:10,letterSpacing:3,color:diffCol,
                            border:`1px solid ${diffCol}30`,padding:"4px 0",borderRadius:R,
                            minWidth:80,textAlign:"center",
                          }}>{DIFF_LABELS[m.difficulty]||m.difficulty}</div>
                          <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600,minWidth:32,textAlign:"right"}}>{dateStr}</div>
                          {canExpand && (
                            <div style={{fontFamily:BB,fontSize:10,color:C.muted,transition:"transform 0.2s",
                              transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
                          )}
                        </div>
                      </div>
                      {isOpen && log && (
                        <div style={{paddingBottom:14,paddingTop:4,borderTop:`1px solid ${C.divider}`}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:"flex",gap:16,marginBottom:10,marginTop:6}}>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:C.sub,opacity:0.85}}/>
                              <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>YOU</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:C.sub,opacity:0.4}}/>
                              <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>CPU</span>
                            </div>
                            <span style={{color:C.border}}>·</span>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
                              <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>LAND</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:C.red}}/>
                              <span style={{fontFamily:BC,fontSize:9,color:C.muted,letterSpacing:1,fontWeight:600}}>MISS</span>
                            </div>
                          </div>
                          {log.map((t,ti)=>{
                            const rc = t.result==="you"?C.green:t.result==="cpu"?C.red:C.muted;
                            const rl = t.result==="you"?"YOU":t.result==="cpu"?"CPU":"NULL";
                            return (
                              <div key={ti} style={{borderLeft:`2px solid ${rc}`,paddingLeft:10,marginBottom:ti<log.length-1?10:0,paddingTop:2,paddingBottom:2}}>
                                <div style={{fontFamily:BC,fontSize:11,color:C.sub,fontWeight:600,lineHeight:1.3,marginBottom:4}}>
                                  {t.trick}
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color:C.muted}}>
                                    {t.playerFirst?"YOU 1ST":"CPU 1ST"}
                                  </span>
                                  <span style={{color:C.border}}>·</span>
                                  {t.tries && t.tries.map((tr,j)=>(
                                    <div key={j} style={{display:"inline-flex",alignItems:"center",gap:3}}>
                                      <div title="You" style={{width:6,height:6,borderRadius:"50%",background:tr.you?C.green:C.red,opacity:0.85}}/>
                                      <div title="CPU" style={{width:6,height:6,borderRadius:"50%",background:tr.cpu?C.green:C.red,opacity:0.45}}/>
                                      {j<t.tries.length-1 && <span style={{color:C.border,fontSize:8,margin:"0 1px"}}>·</span>}
                                    </div>
                                  ))}
                                  <span style={{fontFamily:BB,fontSize:9,letterSpacing:2,color:rc,marginLeft:"auto"}}>
                                    {rl}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            );
          })()}


          <div style={{marginTop:40,paddingTop:24,borderTop:`1px solid ${C.divider}`}}>
            {!confirmReset ? (
              <div style={{display:"flex",gap:10}}>
                <button className="tap" onClick={()=>setConfirmReset("division")} style={{
                  flex:1,padding:"14px 0",background:"transparent",border:"none",
                  fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,cursor:"pointer",opacity:0.5,
                }}>RESET {currentDivLabel}</button>
                <button className="tap" onClick={()=>setConfirmReset("all")} style={{
                  flex:1,padding:"14px 0",background:"transparent",border:"none",
                  fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,cursor:"pointer",opacity:0.5,
                }}>RESET ALL STATS</button>
              </div>
            ) : (
              <div className="fadeUp" style={{textAlign:"center"}}>
                <div style={{fontFamily:BC,fontSize:13,color:C.red,letterSpacing:2,fontWeight:600,marginBottom:14,lineHeight:1.5}}>
                  {confirmReset==="division"
                    ?`Delete all stats for ${currentDivLabel}?`
                    :"Delete ALL match history and trick data across every competition?"}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button className="tap" onClick={()=>setConfirmReset(false)} style={{
                    flex:1,padding:"14px 0",background:"transparent",border:`1px solid ${C.border}`,
                    borderRadius:R,fontFamily:BB,fontSize:13,letterSpacing:4,color:C.sub,cursor:"pointer",
                  }}>CANCEL</button>
                  <button className="tap" onClick={async()=>{
                    if (confirmReset==="division") {
                      await SB.from("match_results").delete().eq("user_id",user.id).eq("competition",statsDivKey);
                      await SB.from("trick_attempts").delete().eq("user_id",user.id).eq("competition",statsDivKey);
                    } else {
                      await SB.from("match_results").delete().eq("user_id",user.id);
                      await SB.from("trick_attempts").delete().eq("user_id",user.id);
                    }
                    setMatches([]); setAttempts([]); setHistory([]);
                    setConfirmReset(false);
                  }} style={{
                    flex:1,padding:"14px 0",background:`${C.red}15`,border:`1px solid ${C.red}40`,
                    borderRadius:R,fontFamily:BB,fontSize:13,letterSpacing:4,color:C.red,cursor:"pointer",
                  }}>DELETE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {pickerOpen && (() => {
        const upcoming = COMPS_SORTED.filter(c=>!c.soon && !isCompPast(c));
        const past     = COMPS_SORTED.filter(c=>!c.soon &&  isCompPast(c)).reverse();

        const pick = (comp, div) => {
          setStatsComp(comp); setStatsDiv(div);
          switchTab("record"); setPickerOpen(false);
        };

        const CompBlock = ({comp, dimmed}) => (
          <div style={{marginBottom:18,opacity:dimmed?0.6:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
              <span style={{fontFamily:BB,fontSize:20,letterSpacing:3,color:C.white}}>{comp.name}</span>
              {dimmed && <span style={{fontFamily:BC,fontSize:10,letterSpacing:2,color:C.muted,fontWeight:600,
                border:`1px solid ${C.border}`,padding:"2px 6px",borderRadius:R}}>PAST</span>}
              <span style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600,letterSpacing:2}}>{comp.full}</span>
            </div>
            {comp.divisions.map(d=>{
              const active = statsComp?.key===comp.key && statsDiv?.key===d.key;
              return (
                <button key={d.key} className="tap" onClick={()=>pick(comp,d)} style={{
                  width:"100%",padding:"12px 14px",marginBottom:4,
                  background:active?`${C.white}10`:"transparent",
                  border:`1px solid ${active?C.white+"30":C.border}`,borderRadius:R,
                  display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",
                }}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,textAlign:"left"}}>
                    <span style={{fontFamily:BB,fontSize:16,letterSpacing:3,color:active?C.white:C.sub}}>{d.name}</span>
                    {d.badge && <span style={{fontFamily:BC,fontSize:10,letterSpacing:2,color:C.muted,fontWeight:600}}>{d.badge}</span>}
                  </div>
                  {active && <span style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.white}}>•</span>}
                </button>
              );
            })}
          </div>
        );

        const SectionHeader = ({label, onToggle, expanded}) => (
          <div onClick={onToggle} style={{
            display:"flex",alignItems:"center",gap:10,marginBottom:12,
            cursor:onToggle?"pointer":"default",userSelect:"none",
          }}>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted}}>{label}</div>
            <div style={{flex:1,height:1,background:C.divider}}/>
            {onToggle && (
              <div style={{fontFamily:BB,fontSize:10,color:C.muted,transition:"transform 0.2s",
                transform:expanded?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
            )}
          </div>
        );

        return (
          <>
            <div onClick={()=>setPickerOpen(false)} style={{
              position:"absolute",inset:0,background:"#000c",zIndex:50,
            }}/>
            <div className="rise" style={{
              position:"absolute",left:0,right:0,bottom:0,zIndex:51,
              background:C.bg,borderTop:`1px solid ${C.border}`,
              maxHeight:"78%",display:"flex",flexDirection:"column",
              paddingBottom:"env(safe-area-inset-bottom, 0px)",
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 10px"}}>
                <div style={{fontFamily:BB,fontSize:14,letterSpacing:4,color:C.muted}}>SELECT</div>
                <button className="tap" onClick={()=>setPickerOpen(false)} style={{
                  background:"transparent",border:"none",fontFamily:BB,fontSize:18,
                  color:C.muted,cursor:"pointer",padding:"4px 8px",
                }}>✕</button>
              </div>
              <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"6px 24px 24px"}}>
                {upcoming.length>0 && past.length>0 && (
                  <SectionHeader label="UPCOMING"/>
                )}
                {upcoming.map(c => <CompBlock key={c.key} comp={c}/>)}
                {past.length>0 && (
                  <SectionHeader
                    label="PAST"
                    onToggle={()=>setPickerShowPast(s=>!s)}
                    expanded={pickerShowPast}
                  />
                )}
                {pickerShowPast && past.map(c => <CompBlock key={c.key} comp={c} dimmed/>)}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default StatsScreen;
