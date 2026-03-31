import React from "react";
import { C, BB, BC, R, CPU_CFG, MODE_COLORS } from "../config";
import { Label, Div, BtnPrimary, Seg, BackBtn } from "../components/ui";
import InfoOverlay, { InfoBtn } from "../components/InfoOverlay";

export default function SettingsScreen(props) {
  const { selectedComp, selectedDiv, mode, openList, setOpenList, diff, setDiff,
    race, setRace, streaks, setStreaks, drillType, setDrillType, drillTarget, setDrillTarget,
    drillSource, setDrillSource, isGuest, bracketSize, setBracketSize,
    p1Name, setP1Name, p2Name, setP2Name, P1_COL, P2_COL,
    showInfo, setShowInfo, onStart, setScreen } = props;

  const modeLabel = {cpu:"BATTLE",drill:"DRILL","2p":"2 PLAYER",tournament:"TOURNEY"}[mode]||"";
  const startLabel = mode==="drill"?"START DRILL":"START "+modeLabel;
  const mc = MODE_COLORS[mode] || C.white;

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};
  const page = {position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",overflowY:"auto",WebkitOverflowScrolling:"touch"};

  const INFO_TEXT = {
    cpu:{title:"BATTLE",lines:[
      "A trick is called — you and the CPU both attempt it.",
      "Land it and the other misses → you score.",
      "Both land or both miss → replay (up to 3×).",
      `First to ${race} wins the match.`,
      "ROOKIE ~48% · AMATEUR ~68% · PRO ~87% land rate.",
      ...(streaks?["Streaks: CPU can go HOT (+12%) or COLD (−18%) randomly after points."]:["Streaks are OFF — CPU uses a steady land rate."]),
    ]},
    "2p":{title:"2 PLAYER",lines:[
      "A trick is called for both players.","Attempt it in real life, then tap who scored.",
      "Both land or both miss → null, next trick.",`First to ${race} wins.`,
    ]},
    drill_consistency:{title:"CONSISTENCY DRILL",lines:[
      `Practice each trick ${drillTarget}× in a row.`,"Use the dots as your target — tap NEXT TRICK when ready.",
      "SKIP any trick you want to come back to later.","WEAKEST pulls your lowest-rate tricks from battle stats.",
    ]},
    drill_firsttry:{title:"FIRST TRY DRILL",lines:[
      "One trick at a time — practice it, then move on.","Tap NEXT TRICK to advance through the list.",
      "SKIP any trick you don't want to attempt.","Pure training — no stats tracked.",
    ]},
    tournament:{title:"TOURNEY",lines:[
      "Single elimination bracket.","Win your match to advance — lose and you're out.",
      "ROOKIE ~48% · AMATEUR ~68% · PRO ~87% base rate.",
      "CPU gets +2% harder each round on top of your chosen base.",
      ...(selectedDiv?.trickSets?["Final round switches to TOP 16 trick list."]:[]),
      `First to ${race} per match.`,
    ]},
  };
  const infoKey = mode==="drill"?`drill_${drillType}`:mode;

  if (!selectedDiv) return null;

  return (
    <div style={root}>
      <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={INFO_TEXT[infoKey]} modeColor={mc}/>
      <InfoBtn onClick={()=>setShowInfo(true)}/>
      <div style={page}>
        <BackBtn onClick={()=>setScreen("compPick")}/>
        <div className="rise" style={{marginBottom:24}}>
          <div style={{fontFamily:BB,fontSize:40,letterSpacing:5,lineHeight:1,color:C.white}}>{selectedDiv.name}</div>
          <div style={{fontFamily:BC,fontSize:14,letterSpacing:3,marginTop:6,fontWeight:600}}>
            <span style={{color:C.muted}}>{selectedComp?.name} · </span>
            <span style={{color:mc}}>{modeLabel}</span>
          </div>
        </div>

        {selectedDiv.trickSets && mode!=="tournament" && (
          <Seg label="Trick List" val={openList} onChange={setOpenList} opts={
            selectedDiv.trickSets.map(s=>({key:s.key,label:s.label,sub:s.sub,color:mc}))
          }/>
        )}
        <Div mb={20}/>

        <div className="rise" key={mode}>
          {mode==="cpu" && (<>
            <Seg label="CPU Difficulty" val={diff} onChange={setDiff} opts={[
              {key:"easy",label:"ROOKIE",color:C.green},{key:"medium",label:"AMATEUR",color:C.yellow},{key:"hard",label:"PRO",color:C.red},
            ]}/>
            <Seg label="CPU Streaks" val={streaks} onChange={setStreaks} opts={[{key:true,label:"ON",color:C.green},{key:false,label:"OFF",color:C.red}]}/>
            <Seg label="Race To" val={race} onChange={setRace} opts={[{key:3,label:"3",color:C.blue},{key:5,label:"5",color:C.orange}]}/>
          </>)}

          {mode==="2p" && (<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[[p1Name,setP1Name,"Player 1",P1_COL],[p2Name,setP2Name,"Player 2",P2_COL]].map(([val,set,lbl,col])=>(
                <div key={lbl}>
                  <Label style={{textAlign:"center",marginBottom:8,color:col}}>{lbl}</Label>
                  <input value={val} onChange={e=>set(e.target.value||"")} placeholder={lbl.replace("Player ","P")} maxLength={12} aria-label={`${lbl} name`}
                    style={{width:"100%",padding:"12px 10px",background:C.surface,
                      border:`1px solid ${col}40`,borderLeft:`3px solid ${col}`,borderRadius:R,
                      color:C.white,fontFamily:BB,fontSize:22,letterSpacing:3,textAlign:"center",
                      outline:"none",transition:"border-color 0.15s"}}/>
                </div>
              ))}
            </div>
            <Seg label="Race To" val={race} onChange={setRace} opts={[{key:3,label:"3",color:C.blue},{key:5,label:"5",color:C.orange}]}/>
          </>)}

          {mode==="tournament" && (<>
            <Seg label="Base Difficulty" val={diff} onChange={setDiff} opts={[
              {key:"easy",label:"ROOKIE",color:C.green},{key:"medium",label:"AMATEUR",color:C.yellow},{key:"hard",label:"PRO",color:C.red},
            ]}/>
            <Seg label="Bracket Size" val={bracketSize} onChange={setBracketSize} opts={[{key:4,label:"4",color:C.blue},{key:8,label:"8",color:C.orange}]}/>
            <Seg label="Race To" val={race} onChange={setRace} opts={[{key:3,label:"3",color:C.blue},{key:5,label:"5",color:C.orange}]}/>
            {selectedDiv.trickSets && (
              <div style={{borderLeft:`3px solid ${C.amber}`,paddingLeft:14,marginBottom:20}}>
                <Label style={{letterSpacing:3,color:C.amber,marginBottom:4}}>Trick List Progression</Label>
                <div style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600,lineHeight:1.5}}>
                  Earlier rounds use REGULAR tricks. The final switches to TOP 16 — just like a real comp.
                </div>
              </div>
            )}
            <div style={{borderLeft:`3px solid ${C.muted}`,paddingLeft:14,marginBottom:20}}>
              <Label style={{letterSpacing:3,marginBottom:4}}>Difficulty Scaling</Label>
              <div style={{fontFamily:BC,fontSize:14,color:C.sub,fontWeight:600,lineHeight:1.5}}>
                CPU gets slightly harder each round (+2%) on top of your chosen base difficulty.
              </div>
            </div>
          </>)}

          {mode==="drill" && (<>
            <Seg label="Drill Type" val={drillType} onChange={setDrillType} opts={[
              {key:"consistency",label:"CONSISTENCY",color:C.yellow},{key:"firsttry",label:"FIRST TRY",color:C.blue},
            ]}/>
            {drillType==="consistency" && (
              <Seg label="Streak Target" val={drillTarget} onChange={setDrillTarget} opts={[
                {key:3,label:"3×",color:C.green},{key:5,label:"5×",color:C.yellow},{key:10,label:"10×",color:C.orange},
              ]}/>
            )}
            <Seg label="Trick Source" val={drillSource} onChange={setDrillSource} opts={[
              ...(!isGuest?[{key:"weakest",label:"WEAKEST",color:C.orange}]:[]),
              {key:"full",label:"FULL LIST",color:C.white},{key:"pick",label:"PICK",color:C.blue},
            ]}/>
          </>)}
        </div>

        <div style={{flex:1}}/>
        <BtnPrimary onClick={onStart}>{startLabel}</BtnPrimary>
      </div>
    </div>
  );
}
