import React from "react";
import { LOGO, C, BB, BC, R } from "../config";
import { Label, Div, BtnPrimary, BtnGhost } from "../components/ui";

export default function ResultScreen({ result, race, p1Name, p2Name, P1_COL, P2_COL, isGuest, onPlayAgain, onSettings, onMainMenu, haptic, username }) {
  if (!result) return null;
  const { scores, won, mode:rm } = result;
  const is2p = rm==="2p";
  const p1Won = is2p && scores.p1>=race;
  const winLabel = is2p?(p1Won?`${p1Name||"P1"} WINS`:`${p2Name||"P2"} WINS`):(won?"WIN":"DEFEAT");
  const resultColor = is2p?(p1Won?P1_COL:P2_COL):(won?C.green:C.red);

  const leftScore = is2p ? scores.p1 : scores.you;
  const rightScore = is2p ? scores.p2 : scores.cpu;

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden",justifyContent:"center"};

  return (
    <div style={root}>
      <div style={{position:"fixed",inset:0,background:resultColor,opacity:0,animation:"flash 0.8s ease-out",zIndex:2,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"0 24px"}}>
        <div className="fadeUp" style={{animationDelay:"0s"}}>
          <img src={LOGO} alt="KOMP" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 20px",display:"block",opacity:0.4}}/>
        </div>
        <div className="pop" style={{animationDelay:"0.15s",animationFillMode:"both"}}>
          <div style={{fontFamily:BB,fontSize:is2p?56:72,letterSpacing:2,lineHeight:0.88,color:resultColor,textShadow:`0 0 40px ${resultColor}30`}}>{winLabel}</div>
        </div>
        <div className="fadeUp" style={{animationDelay:"0.35s",animationFillMode:"both"}}>
          <Div mt={28} mb={28}/>
          <div style={{display:"flex",justifyContent:"center",alignItems:"baseline",gap:24}}>
            <div className="fadeUp" style={{animationDelay:"0.45s",animationFillMode:"both",textAlign:"center",minWidth:60}}>
              {is2p && <Label style={{marginBottom:8,color:P1_COL,textTransform:"uppercase"}}>{p1Name||"P1"}</Label>}
              <div style={{fontFamily:BB,fontSize:88,lineHeight:0.9,color:C.white}}>{leftScore}</div>
            </div>
            <div className="fadeUp" style={{animationDelay:"0.5s",animationFillMode:"both"}}>
              <div style={{fontFamily:BB,fontSize:48,lineHeight:0.9,color:C.muted}}>:</div>
            </div>
            <div className="fadeUp" style={{animationDelay:"0.55s",animationFillMode:"both",textAlign:"center",minWidth:60}}>
              {is2p && <Label style={{marginBottom:8,color:P2_COL,textTransform:"uppercase"}}>{p2Name||"P2"}</Label>}
              <div style={{fontFamily:BB,fontSize:88,lineHeight:0.9,color:C.white}}>{rightScore}</div>
            </div>
          </div>
        </div>
        <div className="fadeUp" style={{marginTop:36,display:"flex",flexDirection:"column",gap:12,animationDelay:"0.65s",animationFillMode:"both"}}>
          <BtnPrimary onClick={()=>{haptic(12);onPlayAgain();}}>PLAY AGAIN</BtnPrimary>
          <BtnGhost color={C.sub} onClick={onSettings}>SETTINGS</BtnGhost>
          <BtnGhost onClick={onMainMenu}>← MAIN MENU</BtnGhost>
        </div>
      </div>
    </div>
  );
}
