import { useState } from "react";
import { SB } from "../supabase";
import { C, BB, BC, R, LOGO } from "../config";
import { BtnPrimary, IgLink } from "./ui";

function AuthScreen({ onAuth, onGuest, startTab="login" }) {
  const [tab, setTab] = useState(startTab);
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [name,   setName]   = useState("");
  const [err,    setErr]    = useState("");
  const [loading,setLoading]= useState(false);
  const [confirmed,setConfirmed] = useState(false);

  const inputStyle = {
    width:"100%", padding:"15px 16px", background:C.surface,
    border:`1px solid ${C.border}`, borderRadius:2, color:C.white,
    fontFamily:BC, fontSize:15, letterSpacing:3, marginBottom:12,
    outline:"none", transition:"border-color 0.15s",
  };

  async function handleSubmit() {
    setErr(""); setLoading(true);
    if (tab==="signup") {
      const { data, error } = await SB.auth.signUp({
        email, password:pw,
        options: { data: { username: name } },
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      setConfirmed(true);
      setLoading(false);
      return;
    } else {
      const { data, error } = await SB.auth.signInWithPassword({ email, password:pw });
      if (error) { setErr(error.message); setLoading(false); return; }
      let { data:prof } = await SB.from("profiles").select("username").eq("id",data.user.id).single();
      if (!prof) {
        const uname = data.user.user_metadata?.username || email.split("@")[0];
        await SB.from("profiles").insert({ id:data.user.id, username:uname });
        prof = { username:uname };
      }
      onAuth(data.user, prof.username);
    }
    setLoading(false);
  }

  return (
    <div style={{fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px",position:"relative"}}>
      <div style={{position:"relative",zIndex:1,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src={LOGO} alt="NXS" style={{width:100,height:100,objectFit:"contain",display:"block",margin:"0 auto 8px"}}/>
          <div style={{fontFamily:BB,fontSize:36,letterSpacing:8,color:C.white}}>KOMP</div>
          <div style={{fontFamily:BC,fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,marginTop:4}}>KENDAMA COMPETITION TRAINER</div>
          <div style={{marginTop:10,display:"flex",justifyContent:"center"}}>
            <IgLink size={12} fontSize={10}/>
          </div>
        </div>

        {confirmed ? (
          <div className="fadeUp" style={{textAlign:"center"}}>
            <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.green,marginBottom:16}}>CHECK YOUR EMAIL</div>
            <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,marginBottom:8}}>
              We sent a confirmation link to
            </div>
            <div style={{fontFamily:BC,fontSize:15,color:C.white,fontWeight:600,letterSpacing:2,marginBottom:24}}>
              {email}
            </div>
            <div style={{fontFamily:BC,fontSize:13,color:C.muted,lineHeight:1.6,letterSpacing:1,marginBottom:32}}>
              Click the link in the email, then come back here and log in.
            </div>
            <BtnPrimary onClick={()=>{setConfirmed(false);setTab("login");setErr("");}}>
              GO TO LOG IN
            </BtnPrimary>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:`1px solid ${C.border}`}}>
              {["login","signup"].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{
                  flex:1,padding:"12px 0",background:"transparent",border:"none",
                  borderBottom:`2px solid ${tab===t?C.white:"transparent"}`,
                  color:tab===t?C.white:C.muted,fontFamily:BB,fontSize:16,letterSpacing:4,
                  cursor:"pointer",transition:"all 0.15s",marginBottom:-1,
                }}>{t==="login"?"LOG IN":"SIGN UP"}</button>
              ))}
            </div>

            {tab==="signup" && (
              <input placeholder="Username" aria-label="Username" value={name} onChange={e=>setName(e.target.value)}
                style={inputStyle}/>
            )}
            <input placeholder="Email" aria-label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={inputStyle}/>
            <input placeholder="Password" aria-label="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)}
              style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>

            {err && <div style={{fontFamily:BC,fontSize:13,color:C.red,marginBottom:14,letterSpacing:3,lineHeight:1.4}}>{err}</div>}

            <BtnPrimary onClick={handleSubmit} disabled={loading} style={{marginTop:4}}>
              {loading ? "···" : tab==="login"?"LOG IN":"CREATE ACCOUNT"}
            </BtnPrimary>

            {/* Guest mode */}
            <button className="tap" onClick={onGuest} style={{
              width:"100%",padding:"16px 0",marginTop:16,background:"transparent",border:"none",
              color:C.muted,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",
              transition:"opacity 0.12s",
            }}>
              CONTINUE AS GUEST
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export default AuthScreen;
