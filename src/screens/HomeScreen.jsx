import React from "react";
import { LOGOS, C, BB, BC, R } from "../config"; 
import { Div, IgLink, FeedbackLink, DonateLink } from "../components/ui";

export default function HomeScreen({ user, username, isGuest, homeStats, setMode, setScreen, setDrillSource, goToAuth, handleSignOut, setFeedbackText, setFeedbackSent }) {

  const modeCards = [
    {key:"cpu",        label:"BATTLE",   desc:"1v1 vs CPU",          accentColor:C.logored, available:true},
    {key:"drill",      label:"DRILL",    desc:"Train your tricks",   accentColor:C.green,   available:true},
    {key:"tournament", label:"TOURNEY",  desc:"Bracket competition", accentColor:C.logored, available:true},
    {key:"2p",         label:"2 PLAYER", desc:"Local head to head",  accentColor:C.green,   available:true},
  ];

  return (
    <div style={{fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"}}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",overflowY:"auto",WebkitOverflowScrolling:"touch",alignItems:"center"}}>

        {/* User bar */}
        <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:BB,fontSize:13,letterSpacing:4,color:C.sub}}>{username}</span>
            <button className="tap" onClick={()=>setScreen("stats")} aria-label="Stats" style={{
              width:36,height:36,borderRadius:"50%",
              background:`${C.white}0a`,border:`1.5px solid ${C.border}`,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.12s",padding:0,overflow:"hidden",
            }}>
              <img src={LOGOS[2]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            </button>
          </div>
          {isGuest ? (
            <button onClick={()=>goToAuth("signup")} style={{background:"transparent",border:"none",color:C.green,fontFamily:BB,fontSize:12,letterSpacing:4,cursor:"pointer",padding:0}}>
              SIGN UP
            </button>
          ) : (
            <button onClick={handleSignOut} style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:12,letterSpacing:4,cursor:"pointer",padding:0}}>
              LOG OUT
            </button>
          )}
        </div>

        {/* Logo (green-dot variant echoes the home green accents) */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",marginTop:8}}>
          <div className="rise">
            <img 
              src={LOGOS[3]} 
              alt="KOMP" 
              style={{
                width: 180, height: 180, objectFit:"contain", 
                display:"block", margin:"0 auto"
              }}
            />
          </div>
        </div>

        {/* Stats snapshot */}
        {homeStats && homeStats.total > 0 ? (
          <div className="fadeUp" style={{ width: "100%", marginTop: 20, marginBottom: 20, animationDelay: "0.1s", animationFillMode: "both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
              
              {/* WINS */}
              <div style={{ flex: 1, textAlign: "center", padding: "14px 0" }}>
                <div style={{ 
                  fontFamily: BB, fontSize: 34, lineHeight: 1, 
                  color:C.white,
                  textShadow: "0px 0px 12px rgba(200, 200, 212, 0.4)" 
                }}>
                  {homeStats.wins}
                </div>
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4, paddingLeft: 4 }}>WINS</div>
              </div>

              <div style={{ width: 1, height: 28, background: C.divider }} />

              {/* LOSSES */}
              <div style={{ flex: 1, textAlign: "center", padding: "14px 0" }}>
                <div style={{ 
                  fontFamily: BB, fontSize: 34, lineHeight: 1, 
                  color:C.white, 
                  textShadow: "0px 0px 12px rgba(200, 200, 212, 0.4)" 
                }}>
                  {homeStats.losses}
                </div>
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4, paddingLeft: 4 }}>LOSSES</div>
              </div>

              <div style={{ width: 1, height: 28, background: C.divider }} />

              {/* WIN RATE */}
              <div style={{ flex: 1, textAlign: "center", padding: "14px 0" }}>
                <div style={{ 
                  fontFamily: BB, fontSize: 34, lineHeight: 1, 
                  color:C.white, 
                  textShadow: "0px 0px 12px rgba(200, 200, 212, 0.4)" 
                }}>
                  {Math.round((homeStats.wins / homeStats.total) * 100)}%
                </div>
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4, paddingLeft: 4 }}>WIN RATE</div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20, marginBottom: 20 }} />
        )}

        {/* Mode cards */}
        <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:8,flex:1}}>
          {modeCards.map((m,i)=>{
            const accentColor = m.available ? m.accentColor : C.muted;

            return (
              <button key={m.key} className="tap fadeUp" onClick={()=>{
                if (!m.available) return;
                setMode(m.key);
                if (m.key==="drill" && isGuest) setDrillSource("full");
                setScreen("compPick");
              }} style={{
                padding:"20px 16px 20px 24px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius:R,
                cursor:m.available?"pointer":"default",textAlign:"left",
                transition:"all 0.12s",opacity:m.available?1:0.45,
                display:"flex",flexDirection:"column",justifyContent:"center",gap:4,
                position:"relative",overflow:"hidden",minWidth:0,
                animationDelay:`${0.12+i*0.06}s`,animationFillMode:"both",
              }}>

                {/* Left Accent Bar */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 4, 
                  background: m.available ? accentColor : `${C.border}A0`, 
                  borderTopLeftRadius: R,
                  borderBottomLeftRadius: R
                }} />

                {!m.available && <span style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.muted,
                  border:`1px solid ${C.muted}50`,padding:"3px 0",borderRadius:R,
                  position:"absolute",top:10,right:10,minWidth:52,textAlign:"center"}}>SOON</span>}
                
                {/* Title */}
                <div style={{
                  fontFamily:BB,fontSize:26,letterSpacing:m.label.length>8?3:5,
                  color: m.available ? C.white : C.muted, 
                  lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  textShadow: "none" 
                }}>
                  {m.label}
                </div>
                <div style={{fontFamily:BC,fontSize:13,letterSpacing:1,color:m.available?C.white:C.muted,fontWeight:600}}>
                  {m.desc}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{marginTop:16,display:"flex",justifyContent:"center",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <IgLink size={13} fontSize={12} style={{letterSpacing:2}}/>
          <span style={{color:C.border,fontSize:10}}>·</span>
          <FeedbackLink size={13} fontSize={12} label="Feedback" onClick={()=>{setFeedbackText("");setFeedbackSent(false);setScreen("feedback");}} style={{letterSpacing:2}}/>
          <span style={{color:C.border,fontSize:10}}>·</span>
          <DonateLink size={13} fontSize={12} href="https://ko-fi.com/kompapp" label="Support" style={{letterSpacing:2}}/>
        </div>
      </div>
    </div>
  );
}