import React from "react";
import { C, BB, BC } from "../config";
import { Label, Div, StreakDot } from "./ui";

export default function ScoreBar({ gs, race, mode, p1Name, p2Name, P1_COL, P2_COL, showInfo, setShowInfo, username }) {
  if (!gs) return null;
  const { scores, phase, winner, cpuStreak, lastScoreKey } = gs;
  const is2p = mode === "2p";

  const youMatchPoint = !is2p && scores.you === race - 1;
  const cpuMatchPoint = !is2p && scores.cpu === race - 1;

  return (
    <div style={{padding:"calc(20px + env(safe-area-inset-top, 0px)) 24px 0",position:"relative"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:16}}>
        {is2p
          ? <>
              {[[p1Name||"P1",scores.p1,P1_COL],[p2Name||"P2",scores.p2,P2_COL]].map(([l,v,col],idx)=>(
                <React.Fragment key={l}>
                  {idx===1 && <div style={{fontFamily:BB,fontSize:22,color:C.border,paddingTop:24}}>vs</div>}
                  <div style={{flex:1,textAlign:"center"}}>
                    <Label style={{marginBottom:6,letterSpacing:4,color:col,textTransform:"uppercase"}}>{l}</Label>
                    <div key={`${l}-${v}`} className="scorePulse" style={{fontFamily:BB,fontSize:62,lineHeight:1,color:C.white}}>{v}</div>
                    <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                      {Array.from({length:race}).map((_,i)=>(
                        <div key={i} style={{width:16,height:2,background:i<v?col:C.border,transition:"background 0.25s",
                          boxShadow:i<v?`0 0 4px ${col}40`:undefined}}/>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </>
          : <>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:6,letterSpacing:4,color:youMatchPoint?C.green:C.sub}}>
                  {youMatchPoint?"MATCH PT":(username||"You")}
                </Label>
                <div key={`you-${scores.you}-${lastScoreKey}`} className={phase==="point"&&winner==="you"?"scorePulse":""} style={{fontFamily:BB,fontSize:62,lineHeight:1,textShadow:youMatchPoint?`0 0 20px ${C.green}30`:undefined}}>{scores.you}</div>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.you?C.green:C.border,transition:"background 0.25s",boxShadow:i<scores.you?`0 0 4px ${C.green}40`:undefined}}/>
                  ))}
                </div>
              </div>
              <div style={{fontFamily:BB,fontSize:24,color:C.border,paddingTop:24}}>:</div>
              <div style={{flex:1,textAlign:"center"}}>
                <Label style={{marginBottom:6,letterSpacing:4,color:cpuMatchPoint?C.red:C.sub}}>
                  {cpuMatchPoint?"MATCH PT":(gs.cpuName||"CPU")}
                </Label>
                <div key={`cpu-${scores.cpu}-${lastScoreKey}`} className={phase==="point"&&winner==="cpu"?"scorePulse":""} style={{fontFamily:BB,fontSize:62,lineHeight:1,textShadow:cpuMatchPoint?`0 0 20px ${C.red}30`:undefined}}>{scores.cpu}</div>
                <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:race}).map((_,i)=>(
                    <div key={i} style={{width:16,height:2,background:i<scores.cpu?C.red:C.border,transition:"background 0.25s",boxShadow:i<scores.cpu?`0 0 4px ${C.red}40`:undefined}}/>
                  ))}
                </div>
                {!is2p && <StreakDot streak={cpuStreak}/>}
              </div>
            </>
        }
      </div>
      <Div mt={18}/>
    </div>
  );
}
