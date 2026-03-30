import React, { useState } from "react";
import { SB } from "../supabase";
import { C, BB, BC, R } from "../config";
import { Label, Div, BtnPrimary, BtnGhost, BackBtn } from "../components/ui";

export default function FeedbackScreen({ user, username, onBack }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!text.trim()) return;
    setError("");
    try {
      const { error:e } = await SB.from("feedback").insert({
        user_id: user?.id || null, username: username || "Guest", message: text.trim(),
      });
      if (e) throw e;
      setSent(true);
    } catch {
      setError("Failed to send — check your connection and try again.");
    }
  };

  const root = {fontFamily:BC,background:C.bg,color:C.text,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative",overscrollBehavior:"none",overflow:"hidden"};
  const page = {position:"relative",zIndex:1,flex:1,display:"flex",flexDirection:"column",padding:"calc(28px + env(safe-area-inset-top, 0px)) 24px calc(28px + env(safe-area-inset-bottom, 0px)) 24px",overflowY:"auto",WebkitOverflowScrolling:"touch"};

  return (
    <div style={root}>
      <div style={page}>
        <BackBtn onClick={onBack}/>
        {sent ? (
          <div className="fadeUp" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:16}}>
            <div style={{fontFamily:BB,fontSize:50,letterSpacing:3,color:C.green}}>THANKS</div>
            <div style={{fontFamily:BC,fontSize:16,color:C.sub,lineHeight:1.6,letterSpacing:1,maxWidth:300}}>
              Your feedback helps us make KOMP better for everyone.
            </div>
            <BtnGhost color={C.sub} onClick={onBack} style={{marginTop:16,maxWidth:280}}>← BACK</BtnGhost>
          </div>
        ) : (
          <>
            <div className="rise" style={{marginBottom:24}}>
              <div style={{fontFamily:BB,fontSize:38,letterSpacing:4,lineHeight:1,color:C.white}}>FEEDBACK</div>
              <div style={{fontFamily:BC,fontSize:15,color:C.muted,letterSpacing:2,marginTop:8,fontWeight:600,lineHeight:1.5}}>
                Found a bug? Want a feature? Have a trick list to add? Tell us.
              </div>
            </div>
            <Div mb={20}/>
            <Label style={{letterSpacing:3,marginBottom:8}}>Your message</Label>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's on your mind..." rows={6}
              style={{width:"100%",padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:R,
                color:C.white,fontFamily:BC,fontSize:18,letterSpacing:2,lineHeight:1.5,
                outline:"none",resize:"vertical",minHeight:140,transition:"border-color 0.15s"}}/>
            <div style={{fontFamily:BC,fontSize:12,color:C.muted,marginTop:6,letterSpacing:1}}>
              {text.length>0?`${text.length} characters`:""}
            </div>
            {error && <div style={{fontFamily:BC,fontSize:13,color:C.red,marginTop:8,letterSpacing:2}}>{error}</div>}
            <div style={{flex:1}}/>
            <BtnPrimary onClick={send} disabled={text.trim().length<3} style={{marginTop:20}}>SEND FEEDBACK</BtnPrimary>
            <div style={{marginTop:12,textAlign:"center"}}>
              <a href="https://github.com/Guikos-The-Eleven/ekc-battle/issues" target="_blank" rel="noopener noreferrer" style={{
                fontFamily:BC,fontSize:12,letterSpacing:2,color:C.muted,textDecoration:"none",opacity:0.5,
              }}>or open an issue on GitHub</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
