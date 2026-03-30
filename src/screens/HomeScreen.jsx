import React from "react";
import { LOGO, C, BB, BC, R } from "../config";
import { Div, IgLink, ChatIcon } from "../components/ui";

export default function HomeScreen({ user, username, isGuest, homeStats, setMode, setScreen, setDrillSource, goToAuth, handleSignOut, setFeedbackText, setFeedbackSent }) {
  const modeCards = [
    {key:"cpu",   label:"BATTLE",     desc:"1v1 vs CPU",          color:C.cyan,    available:true},
    {key:"drill", label:"DRILL",      desc:"Train your tricks",   color:C.molten,  available:true},
    {key:"tournament", label:"TOURNEY", desc:"Bracket competition", color:C.lime,    available:true},
    {key:"2p",    label:"2 PLAYER",   desc:"Local head to head",  color:C.magenta, available:true},
  ];

  return (
    <div style={{fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"}}>
      <div style={{position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",overflowY:"auto",WebkitOverflowScrolling:"touch",alignItems:"center"}}>

        {/* User bar */}
        <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
          <button onClick={()=>setScreen("stats")} style={{background:"transparent",border:"none",color:C.sub,fontFamily:BB,fontSize:13,letterSpacing:4,cursor:"pointer",padding:0}}>
            {username} · STATS →
          </button>
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
            <img src={LOGO} alt="NXS" style={{width:140,height:140,objectFit:"contain",display:"block",margin:"0 auto"}}/>
          </div>
          <div className="rise" style={{animationDelay:"0.05s",animationFillMode:"both",textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:54,letterSpacing:12,color:C.white,marginTop:-2}}>KOMP</div>
            <div style={{fontFamily:BC,fontSize:11,letterSpacing:4,color:C.muted,fontWeight:600,marginTop:4}}>KENDAMA COMPETITION TRAINER</div>
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
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4 }}>WINS</div>
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
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4 }}>LOSSES</div>
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
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 4 }}>WIN RATE</div>
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
                border:`1px solid ${C.muted}50`,padding:"3px 8px",borderRadius:R,
                position:"absolute",top:10,right:10}}>SOON</span>}
              
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
        <div style={{marginTop:16,display:"flex",justifyContent:"center",alignItems:"center",gap:20}}>
          <IgLink size={15} fontSize={13}/>
          <span style={{color:C.border,fontSize:10}}>·</span>
          <button className="tap" onClick={()=>{setFeedbackText("");setFeedbackSent(false);setScreen("feedback");}} style={{
            background:"transparent",border:"none",fontFamily:BC,fontSize:13,letterSpacing:3,
            color:C.muted,fontWeight:600,cursor:"pointer",padding:0,
            display:"inline-flex",alignItems:"center",gap:6,opacity:0.7,
          }}>
            <ChatIcon/>
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
