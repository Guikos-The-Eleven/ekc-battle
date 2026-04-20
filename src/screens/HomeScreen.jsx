import React, { useState } from "react";
import { LOGOS, LOGO, C, BB, BC, R } from "../config";
import { Div, IgLink, FeedbackLink, DonateLink } from "../components/ui";

export default function HomeScreen({ user, username, isGuest, homeStats, setMode, setScreen, setDrillSource, goToAuth, handleSignOut, setFeedbackText, setFeedbackSent }) {

  // 3. Add this state to track the current logo
  const [logoIndex, setLogoIndex] = useState(0);

  // 4. Create a function to cycle to the next logo
  const cycleLogo = () => {
    // This loops back to 0 when it hits the end of the array
    setLogoIndex((prev) => (prev + 1) % LOGOS.length); 
  };

  const modeCards = [
    {key:"cpu",   label:"BATTLE",     desc:"1v1 vs CPU",          color:C.blue,    available:true},
    {key:"drill", label:"DRILL",      desc:"Train your tricks",   color:C.amber,  available:true},
    {key:"tournament", label:"TOURNEY", desc:"Bracket competition", color:C.copper,    available:true},
    {key:"2p",    label:"2 PLAYER",   desc:"Local head to head",  color:C.slate, available:true},
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
              color:C.sub,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.12s",padding:0,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="9" width="3" height="6" rx="0.5"/><rect x="6.5" y="5" width="3" height="10" rx="0.5"/><rect x="12" y="1" width="3" height="14" rx="0.5"/></svg>
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

        {/* Logo + Name */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",marginTop:8}}>
          <div className="rise">
            {/* 5. Update the img tag to use LOGOS[logoIndex] and add onClick */}
            <img 
              src={LOGOS[logoIndex]} 
              alt="NXS" 
              onClick={cycleLogo} // The secret tap!
              style={{
                width:180, height:180, objectFit:"contain", 
                display:"block", margin:"0 auto", 
                cursor:"pointer" // Shows a pointer on desktop
              }}
            />
          </div>
          <div className="rise" style={{animationDelay:"0.05s",animationFillMode:"both",textAlign:"center"}}>
            {/*<div style={{fontFamily:BB,fontSize:54,letterSpacing:12,color:C.white,marginTop:-2}}>KOMP</div> */ }
            {/*<div style={{fontFamily:BC,fontSize:11,letterSpacing:4,color:C.muted,fontWeight:600,marginTop:4}}>KENDAMA COMPETITION TRAINER</div> */ }
          </div>
        </div>

        {/* Stats snapshot */}
        {/* Stats snapshot - Estilo Opção B com Glow */}
        {homeStats && homeStats.total > 0 ? (
          <div className="fadeUp" style={{ width: "100%", marginTop: 20, marginBottom: 20, animationDelay: "0.1s", animationFillMode: "both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
              
              {/* WINS */}
              <div style={{ flex: 1, textAlign: "center", padding: "14px 0" }}>
                <div style={{ 
                  fontFamily: BB, fontSize: 34, lineHeight: 1, 
                  color:C.white, // Cor da Opção B
                  textShadow: "0px 0px 12px rgba(200, 200, 212, 0.4)" // Efeito Glow
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
          {modeCards.map((m,i)=>(
            <button key={m.key} className="tap fadeUp" onClick={()=>{
              if (!m.available) return;
              setMode(m.key);
              if (m.key==="drill" && isGuest) setDrillSource("full");
              setScreen("compPick");
            }} style={{
              // 2. Voltar à estrutura anterior (fundo superfície padrão, sem brilho)
              padding:"20px 16px 20px 24px", // Padding esquerdo aumentado para a barra
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius:R,
              cursor:m.available?"pointer":"default",textAlign:"left",
              transition:"all 0.12s",opacity:m.available?1:0.45,
              display:"flex",flexDirection:"column",justifyContent:"center",gap:4,
              position:"relative",overflow:"hidden",minWidth:0,
              animationDelay:`${0.12+i*0.06}s`,animationFillMode:"both",
              // REMOVIDO: boxShadow de glow agressivo
            }}>

              {/* 3. A NOVA BARRA À ESQUERDA */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 4, // Espessura da barra
                background: m.available ? m.color : `${C.border}A0`, // Cor ou borda/mute
                borderTopLeftRadius: R,
                borderBottomLeftRadius: R
              }} />

              {!m.available && <span style={{fontFamily:BB,fontSize:11,letterSpacing:3,color:C.muted,
                border:`1px solid ${C.muted}50`,padding:"3px 0",borderRadius:R,
                position:"absolute",top:10,right:10,minWidth:52,textAlign:"center"}}>SOON</span>}
              
              {/* 4. Título com a cor neon (mantida) e BRILHO REDUZIDO */}
              <div style={{
                fontFamily:BB,fontSize:26,letterSpacing:m.label.length>8?3:5,
                color:m.available?m.color:C.muted, // Mantém a cor aqui
                lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                // textShadow subtil para dar 'pop' sem agressividade
                textShadow: m.available ? `0 0 2px ${m.color}60` : "none" // Reduzido drasticamente
              }}>
                {m.label}
              </div>
              <div style={{fontFamily:BC,fontSize:13,letterSpacing:1,color:m.available?C.white:C.muted,fontWeight:600}}>
                {m.desc}
              </div>
            </button>
          ))}
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
