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
  const [confirmReset, setConfirmReset] = useState(false); // false | "division" | "all"

  // Comp + division state
  const initComp = selectedComp || COMPS[0];
  const initDiv = selectedDiv || initComp?.divisions[0];
  const [statsComp, setStatsComp] = useState(initComp);
  const [statsDiv,  setStatsDiv]  = useState(initDiv);
  const statsDivKey = statsComp && statsDiv ? `${statsComp.key}:${statsDiv.key}` : "ekc_2026:am_open";

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

  const currentDivLabel = statsDiv?.name || "AM OPEN";

  return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <BackBtn onClick={onBack}/>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>{username}</div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,marginTop:6,fontWeight:600}}>Training Stats</div>
          </div>

          {/* Comp switcher (only if multiple comps) */}
          {COMPS.length>1 && (
            <>
              <div style={{display:"flex",gap:0,marginBottom:0}}>
                {COMPS.map(c=>(
                  <button key={c.key} onClick={()=>{setStatsComp(c);setStatsDiv(c.divisions[0]);setExpandedMatch(null);setConfirmReset(false);}} style={{
                    flex:1,padding:"10px 0",background:"transparent",border:"none",
                    borderBottom:`2px solid ${statsComp?.key===c.key?C.white:"transparent"}`,
                    color:statsComp?.key===c.key?C.white:C.muted,
                    fontFamily:BB,fontSize:13,letterSpacing:3,
                    cursor:"pointer",transition:"all 0.15s",
                  }}>{c.name}</button>
                ))}
              </div>
              <Div/>
            </>
          )}

          {/* Division switcher */}
          <div style={{display:"flex",gap:0,marginBottom:0}}>
            {(statsComp?.divisions||[]).map(d=>(
              <button key={d.key} onClick={()=>{setStatsDiv(d);setExpandedMatch(null);setConfirmReset(false);}} style={{
                flex:1,padding:"10px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${statsDiv?.key===d.key?C.white:"transparent"}`,
                color:statsDiv?.key===d.key?C.white:C.muted,
                fontFamily:BB,fontSize:14,letterSpacing:3,
                cursor:"pointer",transition:"all 0.15s",
              }}>{d.name}</button>
            ))}
          </div>
          <Div/>

          {/* Tab switcher: RECORD | TRICKS | HISTORY */}
          <div style={{display:"flex",gap:0,marginTop:0}}>
            {[["record","RECORD"],["tricks","TRICKS"],["history","HISTORY"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setTab(k);setExpandedMatch(null);setConfirmReset(false);}} style={{
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
            const rows = recordForDiv(statsDivKey);
            const tot  = totalRecord(statsDivKey);
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
            const list = tricksForDiv(statsDivKey);
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
            const rows = historyForDiv(statsDivKey);
            if (rows.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No match history yet for {currentDivLabel}.<br/>Play vs CPU to start tracking.
              </div>
            );

            const parseLog = (m) => {
              if (!m.game_log) return null;
              try { return typeof m.game_log==="string" ? JSON.parse(m.game_log) : m.game_log; }
              catch { return null; }
            };

            return (
              <>
                <Label style={{marginBottom:16,letterSpacing:4}}>Last {rows.length} Matches</Label>
                {rows.map((m,i)=>{
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

                      {/* Summary row */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                        paddingTop:12,paddingBottom:isOpen&&log?6:12}}>
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
                          {canExpand && (
                            <div style={{fontFamily:BB,fontSize:10,color:C.muted,transition:"transform 0.2s",
                              transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
                          )}
                        </div>
                      </div>

                      {/* Expanded trick detail */}
                      {isOpen && log && (
                        <div style={{paddingBottom:14,paddingTop:4,borderTop:`1px solid ${C.divider}`}} onClick={e=>e.stopPropagation()}>
                          {/* Legend */}
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
                                  {/* Try indicators */}
                                  {t.tries.map((tr,j)=>(
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

          {/* Reset stats */}
          {!loading && (
            <div style={{marginTop:40,paddingTop:24,borderTop:`1px solid ${C.divider}`}}>
              {!confirmReset ? (
                <div style={{display:"flex",gap:10}}>
                  <button className="tap" onClick={()=>setConfirmReset("division")} style={{
                    flex:1,padding:"14px 0",background:"transparent",border:"none",
                    fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,cursor:"pointer",
                    opacity:0.5,transition:"opacity 0.15s",
                  }}>RESET {currentDivLabel}</button>
                  <button className="tap" onClick={()=>setConfirmReset("all")} style={{
                    flex:1,padding:"14px 0",background:"transparent",border:"none",
                    fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,cursor:"pointer",
                    opacity:0.5,transition:"opacity 0.15s",
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
                      // Refetch
                      const {data:m} = await SB.from("match_results").select("*").eq("user_id",user.id);
                      const {data:a} = await SB.from("trick_attempts").select("trick,landed,competition").eq("user_id",user.id);
                      const {data:h} = await SB.from("match_results").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);
                      setMatches(m||[]); setAttempts(a||[]); setHistory(h||[]);
                      setConfirmReset(false);
                    }} style={{
                      flex:1,padding:"14px 0",background:`${C.red}15`,border:`1px solid ${C.red}40`,
                      borderRadius:R,fontFamily:BB,fontSize:13,letterSpacing:4,color:C.red,cursor:"pointer",
                    }}>DELETE</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
