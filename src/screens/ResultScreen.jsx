import React from "react";
import { LOGO, C, BB, BC, R } from "../config";
import { Label, Div, BtnPrimary, BtnGhost } from "../components/ui";

export default function ResultScreen({ result, race, p1Name, p2Name, P1_COL, P2_COL, isGuest, onPlayAgain, onViewStats, onMainMenu, haptic, username }) {
  if (!result) return null;
  const { scores, won, mode:rm } = result;
  const is2p = rm==="2p";
  const p1Won = is2p && scores.p1>=race;
  const displayName = (username||"YOU").toUppersCase();
  const winLabel = is2p?(p1Won?`${p1Name||"P1"} WINS`:`${p2Name||"P2"} WINS`):(won?`${displayName} WIN${username?"S":""}`:"CPU WINS");
  const subLabel = is2p?"Match Over":(won?"Well Done":"Keep Training");
  const resultColor = is2p?(p1Won?P1_COL:P2_COL):(won?C.green:C.red);

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden",justifyContent:"center"};

  return (
    <div style={root}>
      <div style={{position:"fixed",inset:0,background:resultColor,opacity:0,animation:"flash 0.8s ease-out",zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
        <div className="fadeUp" style={{animationDelay:"0s"}}>
          <img src={LOGO} alt="KOMP" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",opacity:0.4}}/>
        </div>
        <div className="fadeUp" style={{animationDelay:"0.1s",animationFillMode:"both"}}>
          <Label style={{marginBottom:12,letterSpacing:5}}>{subLabel}</Label>
        </div>
        <div className="pop" style={{animationDelay:"0.15s",animationFillMode:"both"}}>
          <div style={{fontFamily:BB,fontSize:is2p?56:72,letterSpacing:2,lineHeight:0.88,color:resultColor,textShadow:`0 0 40px ${resultColor}30`}}>{winLabel}</div>
        </div>
        <div className="fadeUp" style={{animationDelay:"0.35s",animationFillMode:"both"}}>
          <Div mt={28} mb={28}/>
          <Label style={{marginBottom:16,letterSpacing:5}}>Final Score</Label>
          <div style={{display:"flex",justifyContent:"center",gap:32}}>
            {(is2p
              ?[[p1Name||"P1",scores.p1,P1_COL],[p2Name||"P2",scores.p2,P2_COL]]
              :[[displayName,scores.you,C.green],["CPU",scores.cpu,C.red]]
            ).map(([l,v,col],i)=>(
              <div key={l} className="fadeUp" style={{textAlign:"center",animationDelay:`${0.45+i*0.1}s`,animationFillMode:"both"}}>
                <Label style={{marginBottom:8,color:is2p?col:C.sub,textTransform:"uppercase"}}>{l}</Label>
                <div style={{fontFamily:BB,fontSize:88,lineHeight:0.9,color:C.white}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="fadeUp" style={{marginTop:36,display:"flex",flexDirection:"column",gap:12,animationDelay:"0.65s",animationFillMode:"both"}}>
          <BtnPrimary onClick={()=>{haptic(12);onPlayAgain();}}>PLAY AGAIN</BtnPrimary>
          {!is2p && <BtnGhost color={C.sub} onClick={onViewStats}>VIEW STATS →</BtnGhost>}
          <BtnGhost onClick={onMainMenu}>← MAIN MENU</BtnGhost>
        </div>
      </div>
    </div>
  );
}
