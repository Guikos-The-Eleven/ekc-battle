import React from "react";
import { C, BB, BC, R, MODE_COLORS } from "../config";
import { Label, BtnPrimary, BtnGhost, BackBtn } from "../components/ui";
import InfoOverlay from "../components/InfoOverlay";

export default function BracketScreen({ tourney, selectedComp, selectedDiv,
  showInfo, setShowInfo, startTournamentMatch, onSkipAdvancing, onQuit, onNewTournament }) {
  if (!tourney) return null;
  const t = tourney;
  const totalRounds = t.rounds.length;
  const ROUND_NAMES = {2:["SEMI-FINAL","FINAL"],3:["QUARTER-FINAL","SEMI-FINAL","FINAL"]};
  const roundNames = ROUND_NAMES[totalRounds]||[];
  const getPlayer = (seed) => seed!==null&&seed!==undefined ? t.players.find(p=>p.seed===seed) : null;
  const isChampion = t.phase==="champion";
  const isEliminated = t.phase==="eliminated";
  const isAdvancing = t.phase==="advancing";
  const isActive = t.phase==="bracket"||isAdvancing;

  const nextMatch = isActive ? t.rounds[t.currentRound]?.find(m=>(m.p1===t.playerSeed||m.p2===t.playerSeed)&&!m.played) : null;
  const nextOpponent = nextMatch ? getPlayer(nextMatch.p1===t.playerSeed?nextMatch.p2:nextMatch.p1) : null;
  const lastRound = t.rounds[totalRounds-1];
  const championSeed = lastRound?.[0]?.played ? lastRound[0].winner : null;
  const champion = getPlayer(championSeed);

  const info = {title:"TOURNEY",lines:[
    "Single elimination bracket.","Win your match to advance — lose and you're out.",
    "CPU gets +2% harder each round.","All matches first to 3. Final is first to 5.",
  ]};

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};

  const PlayerSlot = ({seed, score, m, isTop, roundIdx}) => {
    const p = getPlayer(seed);
    const isWinner = m.played && m.winner===seed;
    const isMe = seed===t.playerSeed;
    const justAdvanced = isAdvancing && isMe && isWinner;
    const justAppeared = isAdvancing && isMe && !m.played && roundIdx===t.currentRound+1;
    if (!p) return (
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"5px 8px",borderBottom:isTop?`1px solid ${C.divider}`:undefined,minHeight:26}}>
        <span style={{fontFamily:BC,fontSize:10,color:C.border,fontWeight:600}}>TBD</span>
      </div>
    );
    return (
      <div className={justAppeared?"fadeUp":""} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"5px 8px",borderBottom:isTop?`1px solid ${C.divider}`:undefined,
        background:justAdvanced?`${C.green}15`:isWinner?`${C.white}06`:"transparent",
        opacity:m.played&&!isWinner?0.3:1,minHeight:26,transition:"all 0.4s ease",
        ...(justAppeared?{animationDelay:"0.6s",animationFillMode:"both"}:{})}}>
        <div style={{display:"flex",alignItems:"center",gap:4,overflow:"hidden",flex:1}}>
          {isMe && <div style={{width:3,height:3,borderRadius:"50%",background:C.green,flexShrink:0,
            boxShadow:(justAdvanced||justAppeared)?`0 0 8px ${C.green}`:undefined}}/>}
          <span style={{fontFamily:BC,fontSize:10,fontWeight:600,letterSpacing:1,
            color:(justAdvanced||justAppeared)?C.green:isMe?C.white:isWinner?C.sub:C.muted,
            textShadow:(justAdvanced||justAppeared)?`0 0 12px ${C.green}40`:undefined,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textTransform:"uppercase"}}>{p.name}</span>
        </div>
        {m.played && <span style={{fontFamily:BB,fontSize:12,letterSpacing:1,
          color:justAdvanced?C.green:isWinner?C.white:C.muted,marginLeft:6,flexShrink:0}}>{score}</span>}
      </div>
    );
  };

  const MatchBox = ({m, ri}) => {
    const isMyMatch = m.p1===t.playerSeed||m.p2===t.playerSeed;
    const justWon = isAdvancing && isMyMatch && m.played && m.winner===t.playerSeed;
    const accentCol = !m.played?C.border:isMyMatch?(m.winner===t.playerSeed?C.green:C.red):C.muted;
    return (
      <div style={{border:`1px solid ${justWon?C.green+"60":accentCol+"30"}`,borderRadius:R,
        borderLeft:`2px solid ${accentCol}`,background:C.surface,overflow:"hidden",width:"100%",
        boxShadow:justWon?`0 0 16px ${C.green}20`:undefined,transition:"box-shadow 0.5s ease"}}>
        <PlayerSlot seed={m.p1} score={m.p1Score} m={m} isTop={true} roundIdx={ri}/>
        <PlayerSlot seed={m.p2} score={m.p2Score} m={m} isTop={false} roundIdx={ri}/>
      </div>
    );
  };

  return (
    <div style={root}>
      <InfoOverlay showInfo={showInfo} setShowInfo={setShowInfo} info={info} modeColor={MODE_COLORS.tournament}/>
      {isAdvancing && <div style={{position:"fixed",inset:0,background:C.green,opacity:0,animation:"flash 0.8s ease-out",zIndex:3,pointerEvents:"none"}}/>}
      {isAdvancing && onSkipAdvancing && <>
        <div onClick={onSkipAdvancing} style={{position:"fixed",inset:0,zIndex:5}} aria-label="Tap to skip"/>
        <div style={{position:"fixed",bottom:"calc(20px + env(safe-area-inset-bottom, 0px))",left:0,right:0,
          textAlign:"center",zIndex:6,pointerEvents:"none"}}>
          <span className="pls" style={{fontFamily:BB,fontSize:9,letterSpacing:6,color:`${C.muted}60`}}>TAP TO SKIP</span>
        </div>
      </>}
      {isChampion && <div style={{position:"fixed",inset:0,background:C.yellow,opacity:0,animation:"flash 1.2s ease-out",zIndex:3,pointerEvents:"none"}}/>}
      {isEliminated && <div style={{position:"fixed",inset:0,background:C.red,opacity:0,animation:"flash 0.8s ease-out",zIndex:3,pointerEvents:"none"}}/>}
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",
        padding:`calc(20px + env(safe-area-inset-top, 0px)) 0 calc(16px + env(safe-area-inset-bottom, 0px)) 0`,overflow:"hidden"}}>

        <div style={{padding:"0 24px",marginBottom:12,flexShrink:0}}>
          <BackBtn onClick={onQuit} label="← QUIT"/>
          {isChampion && <div style={{textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:6,
              animation:"champFade 0.5s ease both",animationDelay:"0.2s",opacity:0}}>
              <div style={{height:1,width:0,background:`linear-gradient(90deg, transparent, ${C.yellow})`,
                animation:"champLine 0.6s ease both",animationDelay:"0.5s"}}/>
              <div style={{fontFamily:BC,fontSize:11,letterSpacing:6,fontWeight:600,color:C.yellow+"90",whiteSpace:"nowrap"}}>★</div>
              <div style={{height:1,width:0,background:`linear-gradient(270deg, transparent, ${C.yellow})`,
                animation:"champLine 0.6s ease both",animationDelay:"0.5s"}}/>
            </div>
            <div style={{animation:"champScale 0.6s cubic-bezier(0.34,1.56,0.64,1) both",animationDelay:"0.3s",opacity:0}}>
              <div style={{fontFamily:BB,fontSize:54,letterSpacing:4,color:C.yellow,lineHeight:1,
                animation:"champGlow 2s ease-in-out infinite",animationDelay:"1s"}}>CHAMPION</div>
            </div>
            <div style={{animation:"champFade 0.5s ease both",animationDelay:"0.7s",opacity:0}}>
              <div style={{fontFamily:BC,fontSize:13,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:8}}>
                {selectedDiv?.name} · {selectedComp?.name}
              </div>
            </div>
          </div>}
          {isEliminated && <div className="pop" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:42,letterSpacing:3,color:C.red}}>ELIMINATED</div>
            <div style={{fontFamily:BC,fontSize:13,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:4}}>Round {t.currentRound+1} of {totalRounds} · {selectedDiv?.name}</div>
          </div>}
          {isAdvancing && <div className="pop" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:34,letterSpacing:6,color:C.green,textShadow:`0 0 20px ${C.green}30`}}>ADVANCING</div>
            <div style={{fontFamily:BC,fontSize:13,color:C.sub,letterSpacing:2,fontWeight:600,marginTop:4}}>
              {t.lastWonScores?`${t.lastWonScores.you}–${t.lastWonScores.cpu}`:""} · Next: {roundNames[t.currentRound+1]||"FINAL"}
            </div>
          </div>}
          {!isAdvancing&&!isChampion&&!isEliminated&&isActive && <div className="rise" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:4,color:C.white}}>{roundNames[t.currentRound]||`ROUND ${t.currentRound+1}`}</div>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,letterSpacing:2,fontWeight:600,marginTop:4}}>{selectedDiv?.name} · {selectedComp?.name}</div>
          </div>}
        </div>

        <div style={{flex:1,overflowX:"auto",overflowY:"hidden",WebkitOverflowScrolling:"touch",
          padding:"8px 12px",display:"flex",alignItems:"stretch"}}>
          <div style={{display:"flex",alignItems:"stretch",gap:6,minWidth:t.bracketSize===8?640:380,width:"100%",height:"100%"}}>
            {t.rounds.map((round,ri)=>{
              const isCurrent = ri===t.currentRound&&isActive;
              return (
                <div key={ri} style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
                  <div style={{textAlign:"center",marginBottom:6,flexShrink:0,minHeight:18}}>
                    <div style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:isCurrent?C.white:C.muted}}>{roundNames[ri]||`R${ri+1}`}</div>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-around",gap:4}}>
                    {round.map((m,mi)=><MatchBox key={mi} m={m} ri={ri}/>)}
                  </div>
                </div>
              );
            })}
            <div style={{width:60,display:"flex",flexDirection:"column",flexShrink:0}}>
              <div style={{textAlign:"center",marginBottom:6,flexShrink:0,minHeight:18}}>
                <div style={{fontFamily:BB,fontSize:10,letterSpacing:3,color:C.yellow}}>WINNER</div>
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                <div style={{border:`1px solid ${champion?C.yellow+"40":C.border}`,borderRadius:R,
                  padding:"8px 6px",background:champion?`${C.yellow}08`:"transparent",textAlign:"center",width:"100%"}}>
                  {champion ? <span style={{fontFamily:BC,fontSize:11,fontWeight:600,letterSpacing:1,
                    color:champion.seed===t.playerSeed?C.yellow:C.sub,textTransform:"uppercase",
                    display:"block",textAlign:"center"}}>{champion.name}</span>
                  : <span style={{fontFamily:BC,fontSize:12,color:C.border,fontWeight:600}}>?</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding:"8px 24px 0",flexShrink:0}}>
          {isActive&&!isAdvancing&&nextMatch && (<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Label style={{letterSpacing:3}}>vs {nextOpponent?.name}</Label>
              <Label style={{letterSpacing:2,color:C.muted}}>{roundNames[t.currentRound]||`ROUND ${t.currentRound+1}`}</Label>
            </div>
            <BtnPrimary onClick={startTournamentMatch}>PLAY NEXT MATCH</BtnPrimary>
          </>)}
          {(isChampion||isEliminated) && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <BtnPrimary onClick={onNewTournament}>NEW TOURNAMENT</BtnPrimary>
              <BtnGhost onClick={onQuit}>← MAIN MENU</BtnGhost>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
