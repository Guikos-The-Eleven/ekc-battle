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
        .order("created_at",{ascending:false}).limit(10),
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

  const recordForDiv = () => {
    const dm = matches||[];
    return DIFFICULTIES.map(d=>{
      const sub = dm.filter(m=>m.difficulty===d);
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
  const historyForDiv = () => (history||[]).slice(0,10);
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

  const switchTab = (k) => { setTab(k); setExpandedMatch(null); setConfirmReset(false); setShowAllTricks(false); };

  return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <BackBtn onClick={onBack}/>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>{username}</div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,marginTop:6,fontWeight:600}}>Training Stats</div>
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
            const tot = totalRecord();
            if (rows.length===0) return (
              <div style={{fontFamily:BC,fontSize:14,color:C.muted,lineHeight:1.6}}>
                No matches yet for {currentDivLabel}.<br/>Play vs CPU to track your record.
              </div>
            );
            const overallRate = Math.round(tot.wins/tot.total*100);
            const diffData = DIFFICULTIES.map(d=>{
              const r = rows.find(x=>x.diff===d);
              return r ? {diff:d, wins:r.wins, losses:r.losses, total:r.total, rate:Math.round(r.wins/r.total*100), active:true}
                       : {diff:d, wins:0, losses:0, total:0, rate:0, active:false};
            });
            return (
              <>
                {/* Overall summary */}
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:20,marginBottom:8}}>
                  <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.green}}>{tot.wins}</div>
                  <div style={{fontFamily:BB,fontSize:18,color:C.muted,letterSpacing:2}}>–</div>
                  <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.red}}>{tot.losses}</div>
                </div>
                <div style={{textAlign:"center",marginBottom:28}}>
                  <span style={{fontFamily:BB,fontSize:12,letterSpacing:5,color:overallRate>=60?C.green:overallRate>=40?C.yellow:C.red}}>{overallRate}%</span>
                  <span style={{fontFamily:BB,fontSize:10,letterSpacing:4,color:C.muted,marginLeft:8}}>WIN RATE · {tot.total} MATCHES</span>
                </div>

                <Div mb={24}/>

                {/* Three-column difficulty breakdown */}
                <div style={{display:"flex",gap:0}}>
                  {diffData.map(d=>{
                    const col = DIFF_COLORS[d.diff];
                    const dim = !d.active;
                    return (
                      <div key={d.diff} style={{
                        flex:1,borderLeft:`3px solid ${dim?C.border:col}`,
                        padding:"2px 0",opacity:dim?0.4:1,
                        transition:"opacity 0.3s",textAlign:"center",
                      }}>
                        <div style={{fontFamily:BB,fontSize:15,letterSpacing:4,color:dim?C.muted:C.white,marginBottom:14}}>
                          {DIFF_LABELS[d.diff]}
                        </div>
                        <div style={{marginBottom:10}}>
                          <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:dim?C.muted:C.green}}>{d.active?d.wins:"—"}</div>
                          <div style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:C.muted,marginTop:4}}>WINS</div>
                        </div>
                        <div style={{marginBottom:10}}>
                          <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:dim?C.muted:C.red}}>{d.active?d.losses:"—"}</div>
                          <div style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:C.muted,marginTop:4}}>LOSSES</div>
                        </div>
                        <div>
                          <div style={{fontFamily:BB,fontSize:28,lineHeight:1,color:dim?C.muted:C.white}}>{d.active?`${d.rate}%`:"—"}</div>
                          <div style={{fontFamily:BB,fontSize:9,letterSpacing:3,color:C.muted,marginTop:4}}>WIN RATE</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

            const Section = ({label,color,items,total}) => {
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
            const rows = historyForDiv();
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
                  const isOpen = expandedMatch===(m.id||i);
                  const log = parseLog(m);
                  const canExpand = !!log;
                  const trickCount = log ? log.length : (m.your_score + m.cpu_score);

                  return (
                    <div key={m.id||i} className="fadeUp" style={{
                      borderLeft:`3px solid ${col}`,paddingLeft:14,
                      marginBottom:8,background:`${col}06`,
                      animationDelay:`${i*0.04}s`,animationFillMode:"both",
                      cursor:canExpand?"pointer":"default",
                    }} onClick={()=>canExpand && setExpandedMatch(isOpen?null:(m.id||i))}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                        paddingTop:12,paddingBottom:isOpen&&log?6:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{fontFamily:BB,fontSize:20,letterSpacing:2,color:col,width:24}}>{m.won?"W":"L"}</div>
                          <div style={{fontFamily:BB,fontSize:22,letterSpacing:1,color:C.white}}>
                            {m.your_score}–{m.cpu_score}
                          </div>
                          <div style={{fontFamily:BC,fontSize:11,color:C.muted,fontWeight:600}}>{trickCount} tricks</div>
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
