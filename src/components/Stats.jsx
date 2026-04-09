import { useState, useEffect } from "react";
import { SB } from "../supabase";
import { LOGO, C, BB, BC, R, COMPS } from "../config";
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

  const initComp = selectedComp || COMPS[0];
  const initDiv = selectedDiv || initComp?.divisions[0];
  const [statsComp, setStatsComp] = useState(initComp);
  const [statsDiv,  setStatsDiv]  = useState(initDiv);
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
          <img src={LOGO} alt="NXS" style={{width:64,height:64,objectFit:"contain",opacity:0.3}}/>
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
                  <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.copper,
                    border:`1px solid ${C.copper}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>{roundLabel}</div>
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
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>TRAINING STATS</div>
          </div>

          <div style={{display:"flex",gap:0}}>
            {COMPS.filter(c=>!c.soon).map(c=>(
              <button key={c.key} onClick={()=>{setStatsComp(c);setStatsDiv(c.divisions[0]);switchTab("record");}} style={{
                flex:1,padding:"10px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${statsComp?.key===c.key?C.white:"transparent"}`,
                color:statsComp?.key===c.key?C.white:C.muted,
                fontFamily:BB,fontSize:13,letterSpacing:3,cursor:"pointer",transition:"all 0.15s",
              }}>{c.name}</button>
            ))}
          </div>
          <Div/>
          <div style={{display:"flex",gap:0}}>
            {(statsComp?.divisions||[]).map(d=>(
              <button key={d.key} onClick={()=>{setStatsDiv(d);switchTab("record");}} style={{
                flex:1,padding:"10px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${statsDiv?.key===d.key?C.white:"transparent"}`,
                color:statsDiv?.key===d.key?C.white:C.muted,
                fontFamily:BB,fontSize:14,letterSpacing:3,cursor:"pointer",transition:"all 0.15s",
              }}>{d.name}</button>
            ))}
          </div>
          <Div/>
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
            const bRate = bRec.total>0?Math.round(bRec.wins/bRec.total*100):0;
            const tRate = tRec.total>0?Math.round(tRec.wins/tRec.total*100):0;
            const diffData = DIFFICULTIES.map(d=>{
              const r = rows.find(x=>x.diff===d);
              return r ? {diff:d, wins:r.wins, losses:r.losses, total:r.total, rate:Math.round(r.wins/r.total*100), active:true}
                       : {diff:d, wins:0, losses:0, total:0, rate:0, active:false};
            });

            const SummaryCol = ({label, color, wins, losses, rate, total, dimmed}) => (
              <div style={{flex:1,textAlign:"center",opacity:dimmed?0.35:1}}>
                <div style={{fontFamily:BB,fontSize:14,letterSpacing:4,color,marginBottom:12}}>{label}</div>
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:10,marginBottom:6}}>
                  <div style={{fontFamily:BB,fontSize:36,lineHeight:0.9,color:dimmed?C.muted:C.green}}>{dimmed?"—":wins}</div>
                  <div style={{fontFamily:BB,fontSize:14,color:C.muted}}>–</div>
                  <div style={{fontFamily:BB,fontSize:36,lineHeight:0.9,color:dimmed?C.muted:C.red}}>{dimmed?"—":losses}</div>
                </div>
                <div>
                  <span style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:dimmed?C.muted:rate>=60?C.green:rate>=40?C.yellow:C.red}}>{dimmed?"—":`${rate}%`}</span>
                  {!dimmed && <span style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:C.muted,marginLeft:6}}>{total} MATCHES</span>}
                </div>
              </div>
            );

            return (
              <>
                {/* Two-column summary: BATTLE vs TOURNEY */}
                <div style={{display:"flex",gap:0,marginBottom:24}}>
                  <SummaryCol label="BATTLE" color={C.blue} wins={bRec.wins} losses={bRec.losses} rate={bRate} total={bRec.total} dimmed={bRec.total===0}/>
                  <div style={{width:1,background:C.divider,margin:"8px 0"}}/>
                  <SummaryCol label="TOURNEY" color={C.copper} wins={tRec.wins} losses={tRec.losses} rate={tRate} total={tRec.total} dimmed={tRec.total===0}/>
                </div>

                <Div mb={16}/>

                {/* Three-column difficulty breakdown — table for guaranteed alignment */}
                <table style={{width:"100%",borderCollapse:"collapse",textAlign:"center",tableLayout:"fixed"}}>
                  <tbody>
                    {/* Header */}
                    <tr>
                      {diffData.map(d=>{
                        const col = DIFF_COLORS[d.diff];
                        const trophies = trophyCount(d.diff);
                        const dim = !d.active && !trophies;
                        return (
                          <td key={d.diff} style={{padding:"0 4px 14px",opacity:dim?0.4:1}}>
                            <div style={{fontFamily:BB,fontSize:15,letterSpacing:4,color:dim?C.muted:C.white,marginBottom:8}}>
                              {DIFF_LABELS[d.diff]}
                            </div>
                            <div style={{height:2,background:dim?C.border:col,margin:"0 12px"}}/>
                          </td>
                        );
                      })}
                    </tr>
                    {/* Stat rows */}
                    {[
                      {key:"wins",  label:"WINS",        val:d=>d.active?d.wins:"—",   color:d=>C.green},
                      {key:"loss",  label:"LOSSES",      val:d=>d.active?d.losses:"—", color:d=>C.red},
                      {key:"rate",  label:"WIN RATE",    val:d=>d.active?`${d.rate}%`:"—", color:d=>C.white},
                      {key:"trophy",label:"TOURNEYS WON",val:d=>{const t=trophyCount(d.diff);return t;}, color:d=>{const t=trophyCount(d.diff);return t>0?C.yellow:C.muted}},
                    ].map(row=>(
                      <tr key={row.key}>
                        {diffData.map(d=>{
                          const trophies = trophyCount(d.diff);
                          const dim = !d.active && !trophies;
                          return (
                            <td key={d.diff} style={{padding:"0 4px 14px",opacity:dim?0.4:1,verticalAlign:"top"}}>
                              <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:dim?C.muted:row.color(d)}}>{row.val(d)}</div>
                              <div style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:C.muted,marginTop:5}}>{row.label}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            const TrickRow = ({trick,rate,att}) => {
              const col = rate>=70?C.green:rate>=40?C.yellow:C.red;
              return (
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",
                  borderBottom:`1px solid ${C.divider}`}}>
                  <div style={{width:3,height:20,background:col,borderRadius:1,flexShrink:0}}/>
                  <div style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600,flex:1,lineHeight:1.3,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{trick}</div>
                  <span style={{fontFamily:BC,fontSize:11,color:C.muted,flexShrink:0}}>{att}×</span>
                  <span style={{fontFamily:BB,fontSize:16,letterSpacing:1,color:col,flexShrink:0,
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

            const totalAtt = list.reduce((a,t)=>a+t.att,0);
            const avgRate = Math.round(list.reduce((a,t)=>a+t.rate*t.att,0)/totalAtt);
            const hasMore = !showAllTricks && (weak.length>PREVIEW||mid.length>PREVIEW||strong.length>PREVIEW);

            return (
              <>
                <div style={{marginBottom:28,textAlign:"center"}}>
                  <div style={{fontFamily:BB,fontSize:52,lineHeight:0.9,color:avgRate>=70?C.green:avgRate>=40?C.yellow:C.red}}>{avgRate}%</div>
                  <div style={{fontFamily:BB,fontSize:10,letterSpacing:5,color:C.muted,marginTop:8}}>AVG LAND RATE · {list.length} TRICKS · {totalAtt} ATTEMPTS</div>
                </div>
                <Section label="Needs Work" color={C.red} items={weak}/>
                <Section label="Getting There" color={C.yellow} items={mid}/>
                <Section label="Solid" color={C.green} items={strong}/>
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
                            <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.copper,
                              border:`1px solid ${C.copper}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>TOURNEY</div>
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
                          <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.blue,
                            border:`1px solid ${C.blue}30`,padding:"3px 0",borderRadius:R,textAlign:"center"}}>BATTLE</div>
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
    </div>
  );
}

export default StatsScreen;
