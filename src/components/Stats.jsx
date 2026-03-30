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

  const initComp = selectedComp || COMPS[0];
  const initDiv = selectedDiv || initComp?.divisions[0];
  const [statsComp, setStatsComp] = useState(initComp);
  const [statsDiv,  setStatsDiv]  = useState(initDiv);
  const statsDivKey = statsComp && statsDiv ? `${statsComp.key}:${statsDiv.key}` : "ekc_2026:am_open";

  // Fix #11: filter server-side by competition key
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

  const DIFFICULTIES= ["easy","medium","hard"];
  const DIFF_LABELS = {easy:"ROOKIE",medium:"AMATEUR",hard:"PRO"};
  const DIFF_COLORS = {easy:C.green,medium:C.yellow,hard:C.red};

  const recordForDiv = () => {
    const dm = matches||[];
    return DIFFICULTIES.map(d=>{
      const sub = dm.filter(m=>m.difficulty===d);
      const w   = sub.filter(m=>m.won).length;
      return {diff:d, wins:w, losses:sub.length-w, total:sub.length};
    }).filter(r=>r.total>0);
  };

  const totalRecord = () => {
    const rows = recordForDiv();
    const wins = rows.reduce((a,r)=>a+r.wins,0);
    const tot  = rows.reduce((a,r)=>a+r.total,0);
    return {wins, losses:tot-wins, total:tot};
  };

  const tricksForDiv = () => {
    const stats = {};
    (attempts||[]).forEach(a=>{
      if (!stats[a.trick]) stats[a.trick]={land:0,miss:0};
      if (a.landed) stats[a.trick].land++;
      else stats[a.trick].miss++;
    });
    return Object.entries(stats)
      .map(([t,s])=>({trick:t, rate:Math.round(s.land/(s.land+s.miss)*100), att:s.land+s.miss}))
      .sort((a,b)=>a.rate-b.rate);
  };

  const historyForDiv = () => (history||[]).slice(0,10);

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
            Sign up to save your match history and trick stats across sessions.
          </div>
          <BtnPrimary onClick={()=>onAuth("signup")} style={{maxWidth:280,marginTop:8}}>SIGN UP FREE</BtnPrimary>
          <BtnGhost color={C.muted} onClick={onBack} style={{maxWidth:280}}>← BACK</BtnGhost>
        </div>
      </div>
    </div>
  );

  // Loading
  if (loading) return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:BB,fontSize:14,letterSpacing:6,color:C.muted}} role="status">LOADING STATS...</div>
      </div>
    </div>
  );

  const record = recordForDiv();
  const tot = totalRecord();
  const tricks = tricksForDiv();
  const hist = historyForDiv();

  // Reset functions
  const resetDivision = async () => {
    await SB.from("match_results").delete().eq("user_id",user.id).eq("competition",statsDivKey);
    await SB.from("trick_attempts").delete().eq("user_id",user.id).eq("competition",statsDivKey);
    setMatches([]); setAttempts([]); setHistory([]); setConfirmReset(false);
  };
  const resetAll = async () => {
    await SB.from("match_results").delete().eq("user_id",user.id);
    await SB.from("trick_attempts").delete().eq("user_id",user.id);
    setMatches([]); setAttempts([]); setHistory([]); setConfirmReset(false);
  };

  return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",
        padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0",overflow:"hidden"}}>
        <BackBtn onClick={onBack}/>
        <div className="rise" style={{marginBottom:8}}>
          <div style={{fontFamily:BB,fontSize:36,letterSpacing:4,lineHeight:1,color:C.white}}>STATS</div>
          <div style={{fontFamily:BC,fontSize:13,color:C.muted,letterSpacing:2,marginTop:4,fontWeight:600}}>{username}</div>
        </div>

        {/* Comp tabs */}
        <div style={{display:"flex",gap:0,marginBottom:2,borderBottom:`1px solid ${C.border}`}}>
          {COMPS.filter(c=>!c.soon).map(c=>(
            <button key={c.key} className="tap" onClick={()=>{setStatsComp(c);setStatsDiv(c.divisions[0]);setTab("record");setExpandedMatch(null);}} style={{
              flex:1,padding:"10px 0",background:"transparent",border:"none",
              borderBottom:`2px solid ${statsComp?.key===c.key?C.white:"transparent"}`,
              color:statsComp?.key===c.key?C.white:C.muted,fontFamily:BB,fontSize:14,letterSpacing:3,
              cursor:"pointer",transition:"all 0.15s",marginBottom:-1,
            }}>{c.name}</button>
          ))}
        </div>

        {/* Division tabs */}
        {statsComp && (
          <div style={{display:"flex",gap:0,marginBottom:8,borderBottom:`1px solid ${C.divider}`}}>
            {statsComp.divisions.map(d=>(
              <button key={d.key} className="tap" onClick={()=>{setStatsDiv(d);setTab("record");setExpandedMatch(null);}} style={{
                flex:1,padding:"8px 0",background:"transparent",border:"none",
                borderBottom:`2px solid ${statsDiv?.key===d.key?C.sub:"transparent"}`,
                color:statsDiv?.key===d.key?C.sub:C.muted,fontFamily:BB,fontSize:12,letterSpacing:3,
                cursor:"pointer",marginBottom:-1,
              }}>{d.name}</button>
            ))}
          </div>
        )}

        {/* Content tabs */}
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          {["record","tricks","history"].map(t=>(
            <button key={t} className="tap" onClick={()=>{setTab(t);setExpandedMatch(null);}} style={{
              background:tab===t?`${C.white}08`:"transparent",border:`1px solid ${tab===t?C.border:"transparent"}`,
              borderRadius:R,padding:"6px 12px",color:tab===t?C.white:C.muted,
              fontFamily:BB,fontSize:12,letterSpacing:3,cursor:"pointer",
            }}>{t.toUpperCase()}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:"calc(20px + env(safe-area-inset-bottom, 0px))"}}>

          {tab==="record" && (
            <div className="rise">
              {tot.total===0 ? (
                <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                  <div style={{fontFamily:BB,fontSize:18,letterSpacing:4,marginBottom:8}}>NO MATCHES YET</div>
                  <div style={{fontFamily:BC,fontSize:13,letterSpacing:1}}>Play a battle to see your record here.</div>
                </div>
              ) : (
                <>
                  <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.green}}>{tot.wins}</div>
                      <div style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted,marginTop:6}}>WINS</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.red}}>{tot.losses}</div>
                      <div style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted,marginTop:6}}>LOSSES</div>
                    </div>
                    {tot.total>0 && <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.white}}>{Math.round(tot.wins/tot.total*100)}%</div>
                      <div style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted,marginTop:6}}>WIN RATE</div>
                    </div>}
                  </div>
                  <Div mb={16}/>
                  {record.map(r=>(
                    <div key={r.diff} style={{borderLeft:`3px solid ${DIFF_COLORS[r.diff]}`,paddingLeft:14,marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontFamily:BB,fontSize:16,letterSpacing:3,color:DIFF_COLORS[r.diff]}}>{DIFF_LABELS[r.diff]}</span>
                        <span style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600}}>{r.wins}W – {r.losses}L</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab==="tricks" && (
            <div className="rise">
              {tricks.length===0 ? (
                <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                  <div style={{fontFamily:BB,fontSize:18,letterSpacing:4,marginBottom:8}}>NO TRICK DATA</div>
                  <div style={{fontFamily:BC,fontSize:13,letterSpacing:1}}>Land or miss some tricks to track your rates.</div>
                </div>
              ) : (
                tricks.map((t,i)=>(
                  <div key={i} style={{borderLeft:`3px solid ${t.rate>=50?C.green:C.red}`,paddingLeft:12,
                    paddingTop:8,paddingBottom:8,marginBottom:3,background:`${t.rate>=50?C.green:C.red}06`,
                    display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600,flex:1,paddingRight:8}}>{t.trick}</span>
                    <span style={{fontFamily:BB,fontSize:16,letterSpacing:1,color:t.rate>=50?C.green:C.red,flexShrink:0}}>{t.rate}%</span>
                    <span style={{fontFamily:BC,fontSize:11,color:C.muted,marginLeft:8,flexShrink:0}}>{t.att} att</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab==="history" && (
            <div className="rise">
              {hist.length===0 ? (
                <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
                  <div style={{fontFamily:BB,fontSize:18,letterSpacing:4,marginBottom:8}}>NO HISTORY</div>
                  <div style={{fontFamily:BC,fontSize:13,letterSpacing:1}}>Your recent matches will appear here.</div>
                </div>
              ) : (
                hist.map((h,i)=>{
                  const expanded = expandedMatch===i;
                  const log = h.game_log ? (typeof h.game_log==="string"?JSON.parse(h.game_log):h.game_log) : null;
                  return (
                    <div key={i} style={{marginBottom:6}}>
                      <button className="tap" onClick={()=>setExpandedMatch(expanded?null:i)} style={{
                        width:"100%",padding:"12px 12px",background:C.surface,
                        border:`1px solid ${C.border}`,borderRadius:R,
                        borderLeft:`3px solid ${h.won?C.green:C.red}`,
                        cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                      }}>
                        <div style={{textAlign:"left"}}>
                          <span style={{fontFamily:BB,fontSize:16,letterSpacing:2,color:h.won?C.green:C.red}}>
                            {h.won?"WIN":"LOSS"}
                          </span>
                          <span style={{fontFamily:BC,fontSize:13,color:C.muted,marginLeft:8}}>
                            {h.your_score}–{h.cpu_score}
                          </span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <span style={{fontFamily:BC,fontSize:11,color:DIFF_COLORS[h.difficulty],fontWeight:600,letterSpacing:2}}>
                            {DIFF_LABELS[h.difficulty]}
                          </span>
                          <span style={{fontFamily:BB,fontSize:12,color:C.muted,marginLeft:8,
                            transform:expanded?"rotate(90deg)":"rotate(0deg)",display:"inline-block",transition:"transform 0.2s"}}>→</span>
                        </div>
                      </button>
                      {expanded && log && (
                        <div className="rise" style={{paddingLeft:16,borderLeft:`2px solid ${C.border}`,marginLeft:12,marginTop:2}}>
                          {log.map((entry,j)=>(
                            <div key={j} style={{padding:"4px 0",borderBottom:`1px solid ${C.divider}`,
                              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <span style={{fontFamily:BC,fontSize:12,color:C.sub,fontWeight:600,flex:1,paddingRight:8}}>{entry.trick}</span>
                              <span style={{fontFamily:BB,fontSize:12,letterSpacing:1,
                                color:entry.result==="you"?C.green:entry.result==="cpu"?C.red:C.muted}}>
                                {entry.result==="you"?"WIN":entry.result==="cpu"?"LOSS":"NULL"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Reset section */}
          <div style={{marginTop:32,paddingTop:16,borderTop:`1px solid ${C.divider}`}}>
            {!confirmReset ? (
              <div style={{display:"flex",gap:8}}>
                <button className="tap" onClick={()=>setConfirmReset("division")} style={{
                  flex:1,padding:"10px 8px",background:"transparent",border:`1px solid ${C.red}20`,
                  borderRadius:R,fontFamily:BB,fontSize:11,letterSpacing:3,color:`${C.red}80`,cursor:"pointer",
                }}>RESET {statsDiv?.name}</button>
                <button className="tap" onClick={()=>setConfirmReset("all")} style={{
                  flex:1,padding:"10px 8px",background:"transparent",border:`1px solid ${C.red}20`,
                  borderRadius:R,fontFamily:BB,fontSize:11,letterSpacing:3,color:`${C.red}80`,cursor:"pointer",
                }}>RESET ALL</button>
              </div>
            ) : (
              <div className="rise" style={{textAlign:"center"}}>
                <div style={{fontFamily:BC,fontSize:13,color:C.red,letterSpacing:1,marginBottom:12,fontWeight:600}}>
                  {confirmReset==="all"?"Delete ALL stats permanently?":"Delete stats for this division?"}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <BtnGhost color={C.muted} onClick={()=>setConfirmReset(false)} style={{flex:1}}>CANCEL</BtnGhost>
                  <button className="tap" onClick={confirmReset==="all"?resetAll:resetDivision} style={{
                    flex:1,padding:"12px 8px",background:`${C.red}15`,border:`1px solid ${C.red}40`,
                    borderRadius:R,fontFamily:BB,fontSize:14,letterSpacing:3,color:C.red,cursor:"pointer",
                  }}>CONFIRM</button>
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
