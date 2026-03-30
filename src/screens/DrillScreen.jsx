import React, { useEffect, useRef } from "react";
import { C, BB, BC, R, haptic, MODE_COLORS } from "../config";
import { Label, Div, BtnPrimary, BtnGhost } from "../components/ui";
import InfoOverlay, { InfoBtn } from "../components/InfoOverlay";

export default function DrillScreen({ drill, setDrill, saveTrickAttempt, drillType, drillTarget,
  showInfo, setShowInfo, onQuit, onPickMore, onSettings, onMainMenu }) {
  if (!drill) return null;

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};

  const info = drillType==="consistency"
    ? {title:"CONSISTENCY DRILL",lines:[`Land each trick ${drillTarget}× in a row to clear it.`,"Miss once and the streak resets to 0.","Clear all tricks to finish the drill."]}
    : {title:"FIRST TRY DRILL",lines:["One attempt per trick — land or miss.","Tests your first-try rate under pressure."]};

  // Fix #3: setTimeout for cleared/ft_result phases moved to useEffect
  useEffect(()=>{
    if (drill.phase==="cleared" && drill.type==="consistency") {
      const t = setTimeout(()=>{
        setDrill(p=>{
          if (p.phase!=="cleared") return p;
          return {...p,trick:p.nextTrick,queue:p.nextQueue,streak:0,attempts:0,
            nextTrick:undefined,nextQueue:undefined,phase:undefined};
        });
      },1400);
      return ()=>clearTimeout(t);
    }
  },[drill.phase, drill.type]);

  useEffect(()=>{
    if (drill.phase==="ft_result" && drill.type==="firsttry") {
      const t = setTimeout(()=>{
        setDrill(p=>({...p,trick:p.queue[0],queue:p.queue.slice(1),
          index:p.index+1,phase:"active"}));
      },1200);
      return ()=>clearTimeout(t);
    }
  },[drill.phase, drill.type]);

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
        haptic(30);
        const newCleared = [...drill.cleared, {trick:drill.trick, attempts:newAttempts}];
        if (drill.queue.length>0) {
          setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
            totalLands:newLands,bestStreak:newBest,cleared:newCleared,
            nextTrick:p.queue[0],nextQueue:p.queue.slice(1),phase:"cleared"}));
        } else {
          setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
            totalLands:newLands,bestStreak:newBest,cleared:newCleared,phase:"done"}));
        }
      } else {
        setDrill(p=>({...p,streak:newStreak,attempts:newAttempts,totalAttempts:newTotal,
          totalLands:newLands,bestStreak:newBest}));
      }
    } else {
      saveTrickAttempt(drill.trick, landed);
      const newResults = [...drill.results, {trick:drill.trick, landed}];
      if (drill.queue.length>0) {
        setDrill(p=>({...p,results:newResults,phase:"ft_result"}));
      } else {
        setDrill(p=>({...p,results:newResults,phase:"done"}));
      }
    }
  }

  // ── Done state ──
  if (drill.phase==="done") {
    const isCons = drill.type==="consistency";
    const cleared = drill.cleared||[];
    const ftResults = drill.results||[];
    const ftLanded = ftResults.filter(r=>r.landed).length;
    const ftRate = ftResults.length>0 ? Math.round(ftLanded/ftResults.length*100) : 0;

    return (
      <div style={{...root,justifyContent:"center"}}>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <div className="pop" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
            <div style={{fontFamily:BB,fontSize:56,letterSpacing:2,lineHeight:0.9,color:C.white}}>
              {isCons?"DRILL DONE":"FIRST TRY"}
            </div>
          </div>
          <div className="fadeUp" style={{animationDelay:"0.25s",animationFillMode:"both"}}>
            <Div mt={24} mb={24}/>
            {isCons ? (
              <>
                <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
                  {[[cleared.length,C.green,"CLEARED"],[drill.totalAttempts,C.white,"ATTEMPTS"],[drill.bestStreak,C.yellow,"BEST RUN"]].map(([v,c,l])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:c}}>{v}</div>
                      <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>{l}</div>
                    </div>
                  ))}
                </div>
                {cleared.length>0 && (<><Div mb={16}/>{cleared.map((c,i)=>(
                  <div key={i} style={{borderLeft:`3px solid ${C.green}`,paddingLeft:12,paddingTop:6,paddingBottom:6,marginBottom:4,textAlign:"left",background:`${C.green}06`}}>
                    <span style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600}}>{c.trick}</span>
                    <span style={{fontFamily:BC,fontSize:14,color:C.muted,marginLeft:8}}>{c.attempts} att</span>
                  </div>
                ))}</>)}
              </>
            ) : (
              <>
                <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:BB,fontSize:66,lineHeight:0.9,color:ftRate>=50?C.green:C.red}}>{ftRate}%</div>
                    <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>FIRST TRY RATE</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:BB,fontSize:66,lineHeight:0.9,color:C.white}}>{ftLanded}/{ftResults.length}</div>
                    <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>LANDED</div>
                  </div>
                </div>
                {ftResults.length>0 && (<><Div mb={16}/><div style={{maxHeight:200,overflowY:"auto",textAlign:"left"}}>
                  {ftResults.map((r,i)=>(
                    <div key={i} style={{borderLeft:`3px solid ${r.landed?C.green:C.red}`,paddingLeft:12,paddingTop:5,paddingBottom:5,marginBottom:3,background:`${r.landed?C.green:C.red}06`}}>
                      <span style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600}}>{r.trick}</span>
                    </div>
                  ))}
                </div></>)}
              </>
            )}
          </div>
          <div className="fadeUp" style={{marginTop:28,display:"flex",flexDirection:"column",gap:12,animationDelay:"0.45s",animationFillMode:"both"}}>
            {drill.pickMode && <BtnPrimary onClick={onPickMore}>PICK MORE TRICKS</BtnPrimary>}
            <BtnGhost color={C.sub} onClick={onSettings}>← SETTINGS</BtnGhost>
            <BtnGhost onClick={onMainMenu}>← MAIN MENU</BtnGhost>
          </div>
        </div>
      </div>
    );
  }

  // ── Cleared animation ──
  if (drill.phase==="cleared" && drill.type==="consistency") {
    return (
      <div style={root}>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div className="pop" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:56,letterSpacing:3,color:C.green,textShadow:`0 0 30px ${C.green}30`}}>CLEARED</div>
            <div style={{fontFamily:BC,fontSize:15,color:C.muted,letterSpacing:3,fontWeight:600,marginTop:8}}>Next trick loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── First-try flash ──
  if (drill.phase==="ft_result" && drill.type==="firsttry") {
    const last = drill.results[drill.results.length-1];
    const col = last?.landed?C.green:C.red;
    return (
      <div style={root}>
        <div style={{position:"fixed",inset:0,background:col,opacity:0,animation:"flash 0.6s ease-out",zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div className="pop" style={{fontFamily:BB,fontSize:66,letterSpacing:3,color:col}}>
            {last?.landed?"LANDED":"MISSED"}
          </div>
        </div>
      </div>
    );
  }

  // ── Active drill ──
  const isCons = drill.type==="consistency";
  const progress = isCons ? drill.streak/drill.target : (drill.index+1)/drill.total;
  const progressLabel = isCons ? `${drill.streak} / ${drill.target}` : `${drill.index+1} / ${drill.total}`;

  return (
    <div style={root}>
      <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={info} modeColor={MODE_COLORS.drill}/>
      <InfoBtn onClick={()=>setShowInfo(true)}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"calc(20px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:5,color:C.muted}}>{isCons?"CONSISTENCY":"FIRST TRY"}</div>
            <div style={{fontFamily:BB,fontSize:16,letterSpacing:2,color:C.white}}>{progressLabel}</div>
          </div>
          <div style={{height:2,background:C.border,marginBottom:6}}>
            <div style={{height:2,background:isCons?C.green:C.white,width:`${Math.min(progress*100,100)}%`,
              transition:"width 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/>
          </div>
          {isCons && drill.cleared.length>0 && (
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,fontWeight:600,textAlign:"right"}}>
              {drill.cleared.length} cleared · {drill.totalAttempts} total
            </div>
          )}
          <Div mt={12}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px",gap:16}}>
          <div className="slideIn" key={drill.trick} style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20}}>
            <div style={{fontFamily:BB,fontSize:drill.trick.length>40?34:42,letterSpacing:2,lineHeight:1.1,color:C.white}}>
              {drill.trick}
            </div>
          </div>
          {isCons && drill.streak>0 && (
            <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:8,paddingLeft:23}}>
              <div style={{display:"flex",gap:3}}>
                {Array.from({length:drill.target}).map((_,i)=>(
                  <div key={i} style={{width:14,height:3,background:i<drill.streak?C.green:C.border,
                    boxShadow:i<drill.streak?`0 0 4px ${C.green}40`:undefined,transition:"all 0.2s"}}/>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"0 24px 28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button className="tap" onClick={()=>onDrillAttempt(true)} aria-label="Land trick" style={{
              padding:"0",height:isCons?120:140,background:C.green,border:"none",borderRadius:2,
              color:C.bg,fontFamily:BB,fontSize:38,letterSpacing:4,cursor:"pointer",
              boxShadow:`0 0 24px ${C.green}25`}}>LAND</button>
            <button className="tap" onClick={()=>onDrillAttempt(false)} aria-label="Miss trick" style={{
              padding:"0",height:isCons?120:140,background:`${C.red}08`,
              border:`1px solid ${C.red}30`,borderRadius:2,color:`${C.red}cc`,
              fontFamily:BB,fontSize:38,letterSpacing:4,cursor:"pointer"}}>MISS</button>
          </div>
        </div>
        <div style={{padding:"0 24px calc(16px + env(safe-area-inset-bottom, 0px))",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onQuit} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",padding:0}}>← QUIT</button>
          <div style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted}}>KOMP</div>
        </div>
      </div>
    </div>
  );
}
