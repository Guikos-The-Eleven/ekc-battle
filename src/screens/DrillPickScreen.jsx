import React from "react";
import { C, BB, BC, R } from "../config";
import { Label, Div, BtnPrimary, BackBtn } from "../components/ui";

export default function DrillPickScreen({ allTricks, drill, pickedTricks, setPickedTricks, drillType, drillTarget, startDrillPick, onBack }) {
  const tricks = allTricks();
  const completedTricks = drill?.completed?.filter(c=>!c.skipped).map(c=>c.trick) || [];
  const available = tricks.filter(t=>!completedTricks.includes(t));
  const allSelected = pickedTricks.length===available.length && available.length>0;
  const toggleTrick = (t) => setPickedTricks(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const toggleAll = () => setPickedTricks(allSelected?[]:available);

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};
  const page = {position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px 0",overflowY:"auto",WebkitOverflowScrolling:"touch"};

  return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={onBack}/>
        <div className="rise" style={{marginBottom:16}}>
          <div style={{fontFamily:BB,fontSize:34,letterSpacing:4,lineHeight:1,color:C.white}}>
            {drillType==="consistency"?"PICK TRICKS":"FIRST TRY"}
          </div>
          <div style={{fontFamily:BC,fontSize:14,color:C.muted,letterSpacing:3,marginTop:6,fontWeight:600}}>
            {drillType==="consistency"?`Select tricks · practice ${drillTarget}× each`:"Select tricks · one attempt each"}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <button className="tap" onClick={toggleAll} style={{
            background:"transparent",border:"none",fontFamily:BB,fontSize:12,letterSpacing:4,
            color:allSelected?C.white:C.muted,cursor:"pointer",padding:0,
          }}>{allSelected?"DESELECT ALL":"SELECT ALL"}</button>
          <div style={{fontFamily:BB,fontSize:12,letterSpacing:2,color:pickedTricks.length>0?C.white:C.muted}}>
            {pickedTricks.length} selected
          </div>
        </div>
        <Div mb={8}/>
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",margin:"0 -24px",padding:"0 24px"}}>
          {tricks.map((t,i)=>{
            const done = completedTricks.includes(t);
            const selected = pickedTricks.includes(t);
            return (
              <button key={i} className="tap" onClick={()=>!done&&toggleTrick(t)} disabled={done} style={{
                width:"100%",padding:"13px 0",background:selected?`${C.white}06`:"transparent",border:"none",
                borderTop:i===0?`1px solid ${C.border}`:"none",borderBottom:`1px solid ${C.border}`,
                cursor:done?"default":"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                opacity:done?0.3:1,transition:"all 0.1s",
              }}>
                <div style={{width:18,height:18,borderRadius:2,marginRight:12,flexShrink:0,
                  border:`1.5px solid ${done?C.border:selected?C.green:C.muted}`,
                  background:selected?C.green:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",
                }}>
                  {selected && <span style={{color:C.bg,fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontFamily:BC,fontSize:15,color:done?C.muted:selected?C.white:C.sub,fontWeight:600,
                  textAlign:"left",lineHeight:1.3,flex:1,paddingRight:12,transition:"color 0.1s"}}>{t}</span>
                {done && <span style={{fontFamily:BB,fontSize:12,letterSpacing:3,color:C.green}}>DONE</span>}
              </button>
            );
          })}
        </div>
        <div style={{padding:"16px 0 calc(16px + env(safe-area-inset-bottom, 0px))",borderTop:`1px solid ${C.divider}`,marginTop:8}}>
          <BtnPrimary onClick={()=>startDrillPick(pickedTricks)}
            style={{opacity:pickedTricks.length===0?0.3:1,pointerEvents:pickedTricks.length===0?"none":"auto"}}>
            START DRILL · {pickedTricks.length} TRICK{pickedTricks.length!==1?"S":""}
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}
