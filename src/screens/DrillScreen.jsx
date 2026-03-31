import React, { useEffect } from "react";
import { C, BB, BC, R, haptic, MODE_COLORS } from "../config";
import { Label, Div, BtnPrimary, BtnGhost } from "../components/ui";
import InfoOverlay from "../components/InfoOverlay";

export default function DrillScreen({ drill, setDrill, drillType, drillTarget,
  showInfo, setShowInfo, onQuit, onPickMore, onSettings, onMainMenu }) {
  if (!drill) return null;

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};

  const info = drillType==="consistency"
    ? {title:"CONSISTENCY DRILL",lines:[`Practice each trick ${drillTarget}× in a row before moving on.`,"Tap NEXT TRICK when you're done with the current one.","SKIP to jump past any trick.","No stats are tracked — pure practice."]}
    : {title:"FIRST TRY DRILL",lines:["Go through the trick list one by one.","Tap NEXT TRICK to advance.","SKIP to jump past any trick.","No stats are tracked — pure practice."]};

  // Auto-advance after "cleared" animation (consistency)
  useEffect(()=>{
    if (drill.phase==="cleared" && drill.type==="consistency") {
      const t = setTimeout(()=>{
        setDrill(p=>{
          if (p.phase!=="cleared") return p;
          const next = p.queue[0];
          if (!next) return {...p, phase:"done"};
          return {...p, trick:next, queue:p.queue.slice(1), phase:"active"};
        });
      },1200);
      return ()=>clearTimeout(t);
    }
  },[drill.phase, drill.type]);

  function onNext() {
    haptic(15);
    const entry = {trick:drill.trick, skipped:false};
    const newCompleted = [...(drill.completed||[]), entry];

    if (drill.type==="consistency") {
      // Show cleared animation, then advance
      if (drill.queue.length>0) {
        setDrill(p=>({...p, completed:newCompleted, phase:"cleared"}));
      } else {
        setDrill(p=>({...p, completed:newCompleted, phase:"done"}));
      }
    } else {
      // First try: advance immediately
      if (drill.queue.length>0) {
        setDrill(p=>({...p, completed:newCompleted, trick:p.queue[0], queue:p.queue.slice(1),
          index:p.index+1}));
      } else {
        setDrill(p=>({...p, completed:newCompleted, phase:"done"}));
      }
    }
  }

  function onSkip() {
    haptic(8);
    const entry = {trick:drill.trick, skipped:true};
    const newCompleted = [...(drill.completed||[]), entry];

    if (drill.type==="consistency") {
      if (drill.queue.length>0) {
        setDrill(p=>({...p, completed:newCompleted, trick:p.queue[0], queue:p.queue.slice(1)}));
      } else {
        setDrill(p=>({...p, completed:newCompleted, phase:"done"}));
      }
    } else {
      if (drill.queue.length>0) {
        setDrill(p=>({...p, completed:newCompleted, trick:p.queue[0], queue:p.queue.slice(1),
          index:p.index+1}));
      } else {
        setDrill(p=>({...p, completed:newCompleted, phase:"done"}));
      }
    }
  }

  // ── Done state ──
  if (drill.phase==="done") {
    const isCons = drill.type==="consistency";
    const completed = drill.completed||[];
    const practiced = completed.filter(c=>!c.skipped);
    const skipped = completed.filter(c=>c.skipped);

    return (
      <div style={{...root,justifyContent:"center"}}>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
          <div className="pop" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
            <div style={{fontFamily:BB,fontSize:56,letterSpacing:2,lineHeight:0.9,color:C.white}}>
              DRILL DONE
            </div>
          </div>
          <div className="fadeUp" style={{animationDelay:"0.25s",animationFillMode:"both"}}>
            <Div mt={24} mb={24}/>
            <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:24}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:C.green}}>{practiced.length}</div>
                <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>PRACTICED</div>
              </div>
              {skipped.length>0 && (
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:C.muted}}>{skipped.length}</div>
                  <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>SKIPPED</div>
                </div>
              )}
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:BB,fontSize:56,lineHeight:0.9,color:C.white}}>{completed.length}</div>
                <div style={{fontFamily:BB,fontSize:12,letterSpacing:4,color:C.muted,marginTop:8}}>TOTAL</div>
              </div>
            </div>
            {completed.length>0 && (<><Div mb={16}/><div style={{maxHeight:220,overflowY:"auto",textAlign:"left"}}>
              {completed.map((c,i)=>(
                <div key={i} style={{borderLeft:`3px solid ${c.skipped?C.muted:C.green}`,paddingLeft:12,paddingTop:6,paddingBottom:6,marginBottom:4,
                  background:`${c.skipped?C.muted:C.green}06`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600}}>{c.trick}</span>
                  {c.skipped && <span style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.muted}}>SKIPPED</span>}
                </div>
              ))}
            </div></>)}
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

  // ── Cleared animation (consistency only) ──
  if (drill.phase==="cleared" && drill.type==="consistency") {
    return (
      <div style={root}>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div className="pop" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:56,letterSpacing:3,color:C.green,textShadow:`0 0 30px ${C.green}30`}}>NEXT</div>
            <div style={{fontFamily:BC,fontSize:15,color:C.muted,letterSpacing:3,fontWeight:600,marginTop:8}}>Loading trick...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active drill ──
  const isCons = drill.type==="consistency";
  const completed = drill.completed||[];
  const totalTricks = isCons ? completed.length + 1 + drill.queue.length : drill.total;
  const currentIndex = isCons ? completed.length + 1 : (drill.index||0) + 1;
  const progress = currentIndex / totalTricks;
  const progressLabel = `${currentIndex} / ${totalTricks}`;

  return (
    <div style={root}>
      <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={info} modeColor={MODE_COLORS.drill}/>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"calc(20px + env(safe-area-inset-top, 0px)) 24px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:5,color:C.muted}}>{isCons?`CONSISTENCY · ${drill.target}× IN A ROW`:"FIRST TRY"}</div>
            <div style={{fontFamily:BB,fontSize:16,letterSpacing:2,color:C.white}}>{progressLabel}</div>
          </div>
          <div style={{height:2,background:C.border,marginBottom:6}}>
            <div style={{height:2,background:isCons?C.green:C.white,width:`${Math.min(progress*100,100)}%`,
              transition:"width 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/>
          </div>
          <Div mt={12}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px"}}>
          <div className="slideIn" key={drill.trick} style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20}}>
            <div style={{fontFamily:BC,fontSize:drill.trick.length>40?34:42,letterSpacing:2,lineHeight:1.1,color:C.white}}>
              {drill.trick}
            </div>
          </div>
        </div>
        <div style={{padding:"0 24px 16px",display:"flex",flexDirection:"column",gap:10}}>
          <button className="tap" onClick={onNext} aria-label="Next trick" style={{
            padding:"0",height:120,width:"100%",background:C.yellow,border:"none",borderRadius:R,
            color:C.bg,fontFamily:BB,fontSize:34,letterSpacing:4,cursor:"pointer",
            boxShadow:`0 0 24px ${C.yellow}25`}}>NEXT TRICK</button>
          <button className="tap" onClick={onSkip} aria-label="Skip trick" style={{
            padding:"0",height:48,width:"100%",background:`${C.muted}08`,
            border:`1px solid ${C.border}`,borderRadius:R,color:C.muted,
            fontFamily:BB,fontSize:16,letterSpacing:5,cursor:"pointer"}}>SKIP</button>
        </div>
        <div style={{padding:"0 24px calc(12px + env(safe-area-inset-bottom, 0px))",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={onQuit} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",padding:0}}>← QUIT</button>
          <div style={{fontFamily:BB,fontSize:11,letterSpacing:4,color:C.muted}}>KOMP</div>
        </div>
      </div>
    </div>
  );
}
