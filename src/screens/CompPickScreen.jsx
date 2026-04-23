import React, { useState } from "react";
import { C, BB, BC, R, COMPS_SORTED, MODE_COLORS } from "../config";
import { BackBtn, IgLink } from "../components/ui";
import InfoOverlay, { InfoBtn } from "../components/InfoOverlay";

export default function CompPickScreen({ mode, expandedComp, setExpandedComp, setSelectedComp, setSelectedDiv, setOpenList, setScreen }) {
  const modeLabel = {cpu:"BATTLE",drill:"DRILL","2p":"2 PLAYER",tournament:"TOURNEY"}[mode]||"";
  const modeColor = MODE_COLORS[mode] || C.white;
  const [showInfo, setShowInfo] = useState(false);
  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};
  const page = {position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",overflowY:"auto",WebkitOverflowScrolling:"touch"};

  const INFO_TEXT = {
    cpu:{ title:"BATTLE", lines:[
      "Choose a competition and division to battle against.",
      "Each division has its own official trick list from the real comp.",
      "Your CPU opponent will attempt the same tricks as you.",
      "Win by scoring more points than the CPU.",
    ]},
    drill:{ title:"DRILL", lines:[
      "Choose a competition and division to drill.",
      "Your drill will use the official tricks from that event.",
      "Track your landing rates and target your weakest tricks.",
    ]},
    "2p":{ title:"2 PLAYER", lines:[
      "Choose a competition and division for a local head-to-head.",
      "Both players attempt each called trick in real life.",
      "Tap who landed it — first to the target wins.",
    ]},
    tournament:{ title:"TOURNEY", lines:[
      "Choose a competition and division to run a tournament.",
      "You'll face CPU opponents in a single-elimination bracket.",
      "Each round gets slightly harder — win them all to become champion.",
    ]},
  };

  return (
    <div style={root}>
      <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={INFO_TEXT[mode]} modeColor={modeColor}/>
      <InfoBtn onClick={()=>setShowInfo(true)}/>
      <div style={page}>
        <BackBtn onClick={()=>{setScreen("home");setSelectedComp(null);setSelectedDiv(null);setExpandedComp(null);}}/>
        <div className="rise" style={{marginBottom:24}}>
          <div style={{display:"inline-block"}}>
            <div style={{fontFamily:BB,fontSize:38,letterSpacing:5,lineHeight:1,color:C.white}}>{modeLabel}</div>
            <div style={{width:"calc(100% - 5px)",height:3,background:modeColor,marginTop:6,opacity:0.9}}/>
          </div>
          <div style={{fontFamily:BC,fontSize:14,color:C.muted,letterSpacing:2,marginTop:10,fontWeight:600}}>Pick a competition</div>
        </div>
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",margin:"0 -24px",padding:"0 24px"}}>
          {COMPS_SORTED.map((comp)=>{
            const isOpen = expandedComp===comp.key;
            const isSoon = comp.soon;
            return (
              <div key={comp.key} style={{marginBottom:8,opacity:isSoon?0.4:1}}>
                <button className="tap" onClick={()=>!isSoon&&setExpandedComp(isOpen?null:comp.key)} style={{
                  width:"100%",padding:"18px 16px",
                  background:comp.banner
                    ? `linear-gradient(${C.surface}88, ${C.surface}88), url(${comp.banner}) right center/cover no-repeat`
                    : isOpen?`${C.white}06`:C.surface,
                  border:`1px solid ${isOpen?C.white+"20":C.border}`,borderRadius:R,
                  cursor:isSoon?"default":"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                  transition:"all 0.15s",position:"relative",overflow:"hidden",
                }}>
                  <div style={{textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontFamily:BB,fontSize:34,letterSpacing:4,color:isOpen?C.white:C.sub}}>{comp.name}</span>
                      {isSoon && <span style={{fontFamily:BC,fontSize:11,letterSpacing:2,color:C.muted,fontWeight:600,
                        border:`1px solid ${C.border}`,padding:"2px 0",borderRadius:R,minWidth:52,textAlign:"center",display:"inline-block"}}>SOON</span>}
                    </div>
                    <div style={{fontFamily:BC,fontSize:12,letterSpacing:2,color:C.muted,fontWeight:600,marginTop:2}}>
                      {comp.full}
                    </div>
                    <div style={{fontFamily:BC,fontSize:12,letterSpacing:2,color:C.muted,fontWeight:600,marginTop:1}}>
                      {comp.location}
                    </div>
                  </div>
                  {!isSoon && <span style={{fontFamily:BB,fontSize:16,color:C.muted,transition:"transform 0.2s",
                    transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>→</span>}
                </button>
                {isOpen && !isSoon && (
                  <div className="rise" style={{paddingLeft:16,borderLeft:`2px solid ${C.border}`,marginLeft:12,marginTop:4}}>
                    {comp.divisions.map((div)=>(
                      <button key={div.key} className="tap" onClick={()=>{
                        setSelectedComp(comp);setSelectedDiv(div);
                        setOpenList(div.trickSets?div.trickSets[0].key:"regular");
                        setExpandedComp(null);setScreen("settings");
                      }} style={{
                        width:"100%",padding:"16px 12px",background:"transparent",border:"none",
                        borderBottom:`1px solid ${C.divider}`,
                        cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                      }}>
                        <div style={{textAlign:"left"}}>
                          <span style={{fontFamily:BB,fontSize:24,letterSpacing:4,color:C.white}}>{div.name}</span>
                          {div.badge && <span style={{fontFamily:BC,fontSize:11,letterSpacing:2,color:C.muted,fontWeight:600,marginLeft:10}}>{div.badge}</span>}
                        </div>
                        <span style={{fontFamily:BB,fontSize:14,letterSpacing:3,color:C.muted}}>→</span>
                      </button>
                    ))}
                    {comp.ig && (
                      <div style={{padding:"10px 12px"}}>
                        <IgLink size={13} fontSize={11} href={comp.ig.href} label={comp.ig.label} style={{opacity:0.5}}/>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
