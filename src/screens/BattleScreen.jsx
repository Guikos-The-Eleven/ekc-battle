import React, { useEffect } from "react";
import { C, BB, BC, R, haptic, CPU_CFG, getTricksForDiv, MODE_COLORS } from "../config";
import { Label, Div, Dots, TryDots, BtnGhost } from "../components/ui";
import { roll, cpuThinkTime, drawTrick } from "../cpu";
import ScoreBar from "../components/ScoreBar";
import InfoOverlay from "../components/InfoOverlay";

export default function BattleScreen({ gs, dispatch, mode, race, selectedDiv, openList,
  p1Name, p2Name, P1_COL, P2_COL, showInfo, setShowInfo, onMatchOver, saveTrickAttempt, setScreen }) {

  const is2p = mode==="2p";
  const cfg = gs?.config;
  const modeColor = MODE_COLORS[mode] || C.white;

  const allTricks = () => getTricksForDiv(selectedDiv, openList);

  // ── Game Loop (fix #3 + #4: proper useEffect cleanup, no setTimeout in render) ──
  useEffect(()=>{
    if (!gs || (cfg?.mode !== "cpu" && cfg?.mode !== "tournament")) return;
    let t;
    const { phase } = gs;

    if (phase === "reveal") {
      t = setTimeout(()=>dispatch({type:"ADVANCE_REVEAL"}), 2000);
    }
    else if (phase === "cpu_first") {
      t = setTimeout(()=>{
        const landed = roll(cfg.diff, gs.cpuStreak, cfg.streaks, {
          cpuMomentum:gs.cpuMomentum, scores:gs.scores, raceTo:cfg.race, cpuNudge:gs.cpuNudge||0
        });
        dispatch({type:"CPU_FIRST_ROLLED", landed});
      }, cpuThinkTime(cfg.diff));
    }
    else if (phase === "cpu_resp") {
      t = setTimeout(()=>{
        const landed = roll(cfg.diff, gs.cpuStreak, cfg.streaks, {
          cpuMomentum:gs.cpuMomentum, scores:gs.scores, raceTo:cfg.race, cpuNudge:gs.cpuNudge||0
        });
        dispatch({type:"CPU_RESPONDED", landed});
      }, cpuThinkTime(cfg.diff));
    }
    else if (phase === "tie") {
      t = setTimeout(()=>dispatch({type:"TIE_ADVANCE"}), 1800);
    }
    else if (phase === "null") {
      t = setTimeout(()=>{
        const r = drawTrick(gs.pool, allTricks());
        dispatch({type:"NEXT_TRICK", trick:r.trick, pool:r.pool});
      }, 1800);
    }
    else if (phase === "point") {
      t = setTimeout(()=>{
        if (gs.matchOver) {
          const won = gs.scores.you >= cfg.race;
          dispatch({type:"END_MATCH"});
          onMatchOver({scores:gs.scores, won, gameLog:gs.gameLog});
        } else {
          const r = drawTrick(gs.pool, allTricks());
          dispatch({type:"NEXT_TRICK", trick:r.trick, pool:r.pool});
        }
      }, 2000);
    }
    return ()=>clearTimeout(t);
  },[gs?.phase, gs?.trick, gs?.tryNum]);

  // ── 2P Game Loop ──
  useEffect(()=>{
    if (!gs || cfg?.mode !== "2p") return;
    let t;
    if (gs.phase === "2p_reveal") {
      t = setTimeout(()=>dispatch({type:"2P_ADVANCE"}), 2200);
    }
    else if (gs.phase === "2p_point") {
      t = setTimeout(()=>{
        if (gs.matchOver) {
          dispatch({type:"END_MATCH"});
          onMatchOver({scores:gs.scores, won:gs.scores.p1>=cfg.race, mode:"2p"});
        } else {
          const r = drawTrick(gs.pool, allTricks());
          dispatch({type:"2P_NEXT_TRICK", trick:r.trick, pool:r.pool});
        }
      }, 1800);
    }
    return ()=>clearTimeout(t);
  },[gs?.phase, gs?.trick]);

  if (!gs) return null;

  const { scores, trick, tryNum, playerFirst, phase, msg, cpuFirst, pResult, winner, lastScoreKey } = gs;
  const pk = `${phase}-${trick}-${tryNum||0}`;

  const onAttempt = (landed) => {
    haptic(landed?15:8);
    saveTrickAttempt(trick, landed);
    if (phase === "p_first")  dispatch({type:"PLAYER_ATTEMPT_FIRST", landed});
    if (phase === "p_second") dispatch({type:"PLAYER_ATTEMPT_SECOND", landed});
  };

  const on2PScore = (w) => {
    if (w === "null") {
      const r = drawTrick(gs.pool, allTricks());
      dispatch({type:"2P_SCORE", winner:"null", trick:r.trick, pool:r.pool});
    } else {
      haptic(20);
      dispatch({type:"2P_SCORE", winner:w});
    }
  };

  // ── Info for overlay ──
  const info = {title:"BATTLE",lines:[
    "A trick is called — you and the CPU both attempt it.",
    "Land it and the other misses → you score.",
    "Both land or both miss → replay (up to 3×).",
    `First to ${race} wins the match.`,
  ]};

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};

  const MenuBack = () => (
    <div style={{padding:"12px 24px calc(22px + env(safe-area-inset-bottom, 0px))",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={()=>setScreen("settings")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",padding:0}}>← QUIT</button>
      <div style={{fontFamily:BB,fontSize:9,letterSpacing:4,color:C.muted}}>KOMP</div>
    </div>
  );

  // ── REVEAL ──
  if (phase==="reveal"||phase==="2p_reveal") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={info} modeColor={modeColor}/>
        <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
        <div key={pk} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px",gap:22}}>
          <div className="slideIn" style={{fontFamily:BB,fontSize:12,letterSpacing:8,color:C.muted,animationDelay:"0s"}}>NEXT TRICK</div>
          <div className="slideIn" style={{borderLeft:`3px solid ${C.white}`,paddingLeft:20,animationDelay:"0.08s",animationFillMode:"both"}}>
            <div style={{fontFamily:BB,fontSize:trick.length>40?38:48,letterSpacing:2,lineHeight:1.1,color:C.white}}>{trick}</div>
          </div>
          <div className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,animationDelay:"0.2s",animationFillMode:"both"}}>
            <div style={{width:20,height:1,background:C.border}}/>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:6,color:is2p?(playerFirst?P1_COL:P2_COL):(playerFirst?C.green:C.red)}}>
              {is2p?(playerFirst?`${p1Name||"P1"} FIRST`:`${p2Name||"P2"} FIRST`):(playerFirst?"YOU FIRST":"CPU FIRST")}
            </div>
          </div>
        </div>
        <MenuBack/>
      </div>
    </div>
  );

  // ── 2P SCORE ──
  if (is2p && phase==="2p_score") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 24px 0"}}>
          <div style={{borderLeft:`3px solid ${C.muted}`,paddingLeft:16,marginBottom:16}}>
            <Label style={{marginBottom:6}}>Trick</Label>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:2,lineHeight:1.2,color:C.white}}>{trick}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:20,height:1,background:C.border}}/>
            <div style={{fontFamily:BB,fontSize:12,letterSpacing:6,color:playerFirst?P1_COL:P2_COL}}>{playerFirst?`${p1Name||"P1"} FIRST`:`${p2Name||"P2"} FIRST`}</div>
          </div>
          <Div mb={20}/>
          <Label style={{textAlign:"center",marginBottom:16,letterSpacing:5}}>Who scored?</Label>
          <div style={{display:"flex",flexDirection:"column",gap:10,flex:1,justifyContent:"center"}}>
            {[["p1",p1Name||"P1",P1_COL],["p2",p2Name||"P2",P2_COL]].map(([k,n,col])=>(
              <button key={k} className="tap" onClick={()=>on2PScore(k)} style={{
                width:"100%",padding:"18px 20px",background:`${col}15`,border:`1px solid ${col}40`,
                borderLeft:`3px solid ${col}`,borderRadius:R,color:col,
                fontFamily:BB,fontSize:24,letterSpacing:5,cursor:"pointer",transition:"all 0.12s",
              }}>{n} SCORED</button>
            ))}
            <BtnGhost onClick={()=>on2PScore("null")}>NULL — NEXT TRICK</BtnGhost>
          </div>
        </div>
        <MenuBack/>
      </div>
    </div>
  );

  // ── 2P POINT ──
  if (is2p && phase==="2p_point") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontFamily:BB,fontSize:56,letterSpacing:2,color:winner==="p1"?P1_COL:P2_COL,
            textShadow:`0 0 30px ${winner==="p1"?P1_COL:P2_COL}30`}}>{winner==="p1"?(p1Name||"P1"):(p2Name||"P2")} SCORED</div>
        </div>
      </div>
    </div>
  );

  // ── CPU ATTEMPT PHASES ──
  const attemptPhases = ["p_first","cpu_first","p_second","cpu_resp"];
  if (attemptPhases.includes(phase)) {
    const LandMissButtons = ({height=120, fontSize=38}) => (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button className="tap" onClick={()=>onAttempt(true)} aria-label="Land trick" style={{
          padding:"0",height,background:C.green,border:"none",borderRadius:2,color:C.bg,
          fontFamily:BB,fontSize,letterSpacing:4,cursor:"pointer",transition:"all 0.1s",
          boxShadow:`0 0 24px ${C.green}25`}}>LAND</button>
        <button className="tap" onClick={()=>onAttempt(false)} aria-label="Miss trick" style={{
          padding:"0",height,background:`${C.red}08`,border:`1px solid ${C.red}30`,borderRadius:2,
          color:`${C.red}cc`,fontFamily:BB,fontSize,letterSpacing:4,cursor:"pointer",transition:"all 0.1s"}}>MISS</button>
      </div>
    );

    return (
      <div style={root}>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
          <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={info} modeColor={modeColor}/>
          <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
          <div style={{borderLeft:`3px solid ${phase==="p_first"?C.white:C.muted}`,paddingLeft:16,margin:"14px 24px 0",transition:"border-color 0.3s"}}>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:1,lineHeight:1.2,color:phase==="p_first"?C.white:C.sub}}>{trick}</div>
          </div>
          <div style={{padding:"12px 24px 0"}}><TryDots current={tryNum}/></div>

          {phase==="p_first" && (
            <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
              <div style={{flex:1}}/><LandMissButtons/>
            </div>
          )}
          {phase==="cpu_first" && (
            <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
              <div style={{fontFamily:BB,fontSize:13,letterSpacing:8,color:C.muted}}>CPU</div>
              <div className="pls" style={{fontFamily:BB,fontSize:62,letterSpacing:6,color:C.white}}><Dots/></div>
            </div>
          )}
          {phase==="p_second" && (
            <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",padding:"0 24px 28px"}}>
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                <div style={{fontFamily:BB,fontSize:13,letterSpacing:8,color:C.muted}}>CPU</div>
                <div style={{fontFamily:BB,fontSize:76,letterSpacing:3,lineHeight:0.9,color:cpuFirst?C.green:C.red,textShadow:`0 0 30px ${cpuFirst?C.green:C.red}25`}}>
                  {cpuFirst?"LANDED":"MISSED"}
                </div>
              </div>
              <LandMissButtons height={100} fontSize={34}/>
            </div>
          )}
          {phase==="cpu_resp" && (
            <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
              <div style={{fontFamily:BB,fontSize:13,letterSpacing:8,color:C.muted}}>YOU</div>
              <div style={{fontFamily:BB,fontSize:76,letterSpacing:3,lineHeight:0.9,color:pResult?C.green:C.red,marginBottom:24,textShadow:`0 0 30px ${pResult?C.green:C.red}25`}}>{pResult?"LANDED":"MISSED"}</div>
              <div style={{fontFamily:BB,fontSize:13,letterSpacing:8,color:C.muted}}>CPU</div>
              <div className="pls" style={{fontFamily:BB,fontSize:62,letterSpacing:6,color:C.white}}><Dots/></div>
            </div>
          )}
          <MenuBack/>
        </div>
      </div>
    );
  }

  // ── TIE ──
  if (phase==="tie") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
        <div key={pk} className="pop" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          <div style={{fontFamily:BB,fontSize:66,letterSpacing:2,lineHeight:0.9,color:C.white,textShadow:`0 0 30px ${C.white}10`}}>{msg}</div>
          <div style={{fontFamily:BB,fontSize:13,letterSpacing:8,color:C.yellow,marginTop:8}}>TRY {Math.min(tryNum+1,3)} OF 3</div>
        </div>
      </div>
    </div>
  );

  // ── POINT ──
  if (phase==="point") {
    const pointColor = winner==="you"?C.green:C.red;
    return (
      <div style={root}>
        <div style={{position:"fixed",inset:0,background:pointColor,opacity:0,animation:"flash 0.6s ease-out",zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
          <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
          <div key={pk} className="pop" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:62,letterSpacing:2,color:pointColor,textShadow:`0 0 40px ${pointColor}30`}}>
              {winner==="you"?"YOU SCORED":"CPU SCORED"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NULL ──
  if (phase==="null") return (
    <div style={root}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column"}}>
        <ScoreBar gs={gs} race={race} mode={mode} p1Name={p1Name} p2Name={p2Name} P1_COL={P1_COL} P2_COL={P2_COL} showInfo={showInfo} setShowInfo={setShowInfo}/>
        <div key={pk} className="rise" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
          <div style={{fontFamily:BB,fontSize:50,letterSpacing:2,color:C.sub,textShadow:`0 0 20px ${C.sub}10`}}>TRICK NULLED</div>
          <div style={{fontFamily:BC,fontSize:15,color:C.muted,letterSpacing:3,fontWeight:600}}>Next trick loading...</div>
        </div>
      </div>
    </div>
  );

  return null;
}
