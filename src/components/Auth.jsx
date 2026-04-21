import { useState } from "react";
import { SB } from "../supabase";
import { C, BB, BC, R, LOGOS } from "../config";
import { BtnPrimary, IgLink } from "./ui";

// ── Validation helpers ──────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validateSignup = (name, email, pw) => {
  if (!name.trim() || name.trim().length < 2) return "Username must be at least 2 characters";
  if (name.trim().length > 20) return "Username must be 20 characters or fewer";
  if (/[^a-zA-Z0-9_\-]/.test(name.trim())) return "Username: letters, numbers, _ and - only";
  if (!isValidEmail(email)) return "Enter a valid email address";
  if (pw.length < 6) return "Password must be at least 6 characters";
  return null;
};
const validateLogin = (email, pw) => {
  if (!isValidEmail(email)) return "Enter a valid email address";
  if (pw.length < 1) return "Enter your password";
  return null;
};

function AuthScreen({ onAuth, onGuest, startTab="login" }) {
  const [tab, setTab] = useState(startTab);
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [name,   setName]   = useState("");
  const [err,    setErr]    = useState("");
  const [loading,setLoading]= useState(false);
  const [confirmed,setConfirmed] = useState(false);
  const [resetSent,setResetSent] = useState(false);

  const inputStyle = {
    width:"100%", padding:"15px 16px", background:C.surface,
    border:`1px solid ${C.border}`, borderRadius:2, color:C.white,
    fontFamily:BC, fontSize:15, letterSpacing:3, marginBottom:12,
    outline:"none", transition:"border-color 0.15s",
  };

  async function handleSubmit() {
    setErr(""); setLoading(true);
    try {
      if (tab==="signup") {
        const valErr = validateSignup(name, email, pw);
        if (valErr) { setErr(valErr); setLoading(false); return; }
        const { data:signUpData, error } = await SB.auth.signUp({
          email, password:pw,
          options: { data: { username: name.trim() } },
        });
        if (error) { setErr(error.message); setLoading(false); return; }
        if (signUpData?.user?.identities?.length === 0) {
          setErr("An account with this email already exists. Try logging in.");
          setLoading(false);
          return;
        }
        setConfirmed(true);
        setLoading(false);
        return;
      } else if (tab==="forgot") {
        if (!isValidEmail(email)) { setErr("Enter a valid email address"); setLoading(false); return; }
        const { error } = await SB.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) { setErr(error.message); setLoading(false); return; }
        setResetSent(true);
        setLoading(false);
        return;
      } else {
        const valErr = validateLogin(email, pw);
        if (valErr) { setErr(valErr); setLoading(false); return; }
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
    } catch (e) {
      setErr("Connection error — check your internet and try again");
    }
    setLoading(false);
  }

  // ── Confirmation screens (signup + reset) ──
  const renderConfirmation = () => {
    if (confirmed) return (
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
    );
    if (resetSent) return (
      <div className="fadeUp" style={{textAlign:"center"}}>
        <div style={{fontFamily:BB,fontSize:28,letterSpacing:3,color:C.yellow,marginBottom:16}}>CHECK YOUR EMAIL</div>
        <div style={{fontFamily:BC,fontSize:14,color:C.sub,lineHeight:1.6,letterSpacing:1,marginBottom:8}}>
          We sent a password reset link to
        </div>
        <div style={{fontFamily:BC,fontSize:15,color:C.white,fontWeight:600,letterSpacing:2,marginBottom:24}}>
          {email}
        </div>
        <div style={{fontFamily:BC,fontSize:13,color:C.muted,lineHeight:1.6,letterSpacing:1,marginBottom:32}}>
          Click the link in the email to set a new password.
        </div>
        <BtnPrimary onClick={()=>{setResetSent(false);setTab("login");setErr("");}}>
          BACK TO LOG IN
        </BtnPrimary>
      </div>
    );
    return null;
  };

  return (
    <div style={{fontFamily:BC,background:C.bg,color:C.white,height:"100dvh",maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px",position:"relative"}}>
      <div style={{position:"relative",zIndex:1,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src={LOGOS[0]} alt="KOMP" style={{width:220,height:"auto",display:"block",margin:"0 auto"}}/>
          <div style={{fontFamily:BC,fontSize:11,letterSpacing:4,color:C.muted,fontWeight:600,marginTop:6}}>KENDAMA COMPETITION TRAINER</div>
          <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>
            <IgLink size={12} fontSize={10}/>
          </div>
        </div>

        {(confirmed || resetSent) ? renderConfirmation() : (
          <>
            <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:`1px solid ${C.border}`}}>
              {["login","signup"].map(t=>(
                <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{
                  flex:1,padding:"12px 0",background:"transparent",border:"none",
                  borderBottom:`2px solid ${(tab===t||(tab==="forgot"&&t==="login"))?C.white:"transparent"}`,
                  color:(tab===t||(tab==="forgot"&&t==="login"))?C.white:C.muted,fontFamily:BB,fontSize:16,letterSpacing:4,
                  cursor:"pointer",transition:"all 0.15s",marginBottom:-1,
                }}>{t==="login"?"LOG IN":"SIGN UP"}</button>
              ))}
            </div>

            {tab==="forgot" && (
              <div style={{fontFamily:BC,fontSize:13,color:C.sub,letterSpacing:2,lineHeight:1.5,marginBottom:16}}>
                Enter your email and we'll send you a reset link.
              </div>
            )}

            {tab==="signup" && (
              <input placeholder="Username" aria-label="Username" value={name} onChange={e=>setName(e.target.value)}
                maxLength={20} style={inputStyle}/>
            )}
            <input placeholder="Email" aria-label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
              style={inputStyle}/>
            {tab!=="forgot" && (
              <input placeholder="Password" aria-label="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)}
                style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            )}

            {tab==="login" && (
              <button onClick={()=>{setTab("forgot");setErr("");}} style={{
                background:"transparent",border:"none",color:C.muted,fontFamily:BC,
                fontSize:12,letterSpacing:2,cursor:"pointer",marginBottom:12,padding:0,
                transition:"color 0.15s",
              }}>FORGOT PASSWORD?</button>
            )}

            {err && <div style={{fontFamily:BC,fontSize:13,color:C.red,marginBottom:14,letterSpacing:3,lineHeight:1.4}}>{err}</div>}

            <BtnPrimary onClick={handleSubmit} disabled={loading} style={{marginTop:4}}>
              {loading ? "···" : tab==="login"?"LOG IN":tab==="signup"?"CREATE ACCOUNT":"SEND RESET LINK"}
            </BtnPrimary>

            {tab==="forgot" && (
              <button className="tap" onClick={()=>{setTab("login");setErr("");}} style={{
                width:"100%",padding:"16px 0",marginTop:12,background:"transparent",border:"none",
                color:C.muted,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",
                transition:"opacity 0.12s",
              }}>BACK TO LOG IN</button>
            )}

            {tab!=="forgot" && (
              <button className="tap" onClick={onGuest} style={{
                width:"100%",padding:"16px 0",marginTop:16,background:"transparent",border:"none",
                color:C.muted,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",
                transition:"opacity 0.12s",
              }}>
                CONTINUE AS GUEST
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AuthScreen;
