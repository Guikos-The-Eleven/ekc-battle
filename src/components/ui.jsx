import { useState, useEffect } from "react";
import { C, BB, BC, R } from "../config";

/* ── Label ─────────────────────────────────────────────────────────────────── */
const Label = ({ children, as: Tag="div", style={} }) => (
  <Tag style={{fontFamily:BC,fontSize:13,letterSpacing:1.5,color:C.sub,fontWeight:600,...style}}>{children}</Tag>
);

/* ── Divider ───────────────────────────────────────────────────────────────── */
const Div = ({ mt=0, mb=0 }) => <hr style={{height:1,background:C.divider,marginTop:mt,marginBottom:mb,border:"none"}} aria-hidden="true"/>;

/* ── Primary Button ────────────────────────────────────────────────────────── */
const BtnPrimary = ({ children, onClick, disabled=false, style={} }) => (
  <button className="tap" onClick={disabled?undefined:onClick} disabled={disabled}
    aria-disabled={disabled}
    style={{
      width:"100%",padding:"18px 20px",background:disabled?"#555":C.white,border:"none",borderRadius:R,
      color:C.bg,fontFamily:BB,fontSize:24,letterSpacing:5,cursor:disabled?"not-allowed":"pointer",
      transition:"all 0.15s ease",opacity:disabled?0.35:1,...style,
    }}>{children}</button>
);

/* ── Ghost Button ──────────────────────────────────────────────────────────── */
const BtnGhost = ({ children, onClick, color=C.muted, disabled=false, style={} }) => (
  <button className="tap" onClick={disabled?undefined:onClick} disabled={disabled}
    style={{
      width:"100%",padding:"16px 24px",background:"transparent",
      border:`1px solid ${color}`,borderRadius:R,color,
      fontFamily:BB,fontSize:20,letterSpacing:5,cursor:disabled?"not-allowed":"pointer",
      transition:"all 0.12s",...style,
    }}>{children}</button>
);

/* ── Segmented Control ─────────────────────────────────────────────────────── */
const Seg = ({ label, opts, val, onChange }) => (
  <fieldset style={{marginBottom:22,border:"none",padding:0}} role="radiogroup" aria-label={label}>
    {label && <Label as="legend" style={{textAlign:"center",marginBottom:12,width:"100%",fontSize:13}}>{label}</Label>}
    <div style={{display:"flex",gap:8}}>
      {opts.map(o=>{
        const sel = val===o.key;
        const selColor = o.color||"#c8c8c8";
        return (
          <button key={String(o.key)} className="tap" role="radio" aria-checked={sel}
            onClick={()=>onChange(o.key)} style={{
              flex:1, padding:o.sub?"14px 8px":"20px 8px",
              background:sel?(o.color?o.color+"22":"#ffffff0f"):"transparent",
              border:`1px solid ${sel?selColor:C.border}`,
              color:sel?(o.color||"#d8d8d8"):C.sub,
              fontFamily:BB,fontSize:17,letterSpacing:4,
              cursor:"pointer",borderRadius:R,transition:"all 0.12s",
            }}>
            <div>{o.label}</div>
            {o.sub && <div style={{fontSize:10,letterSpacing:2,opacity:sel?0.7:0.5,marginTop:4}}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  </fieldset>
);

/* ── Loading Dots ──────────────────────────────────────────────────────────── */
function Dots() {
  const [n,setN]=useState(1);
  useEffect(()=>{const t=setInterval(()=>setN(d=>(d%3)+1),450);return()=>clearInterval(t);},[]);
  return <span role="status" aria-label="Loading" style={{letterSpacing:5}}>{[1,2,3].map(i=><span key={i} style={{opacity:i<=n?1:0.18}}>●</span>)}</span>;
}

/* ── Streak Indicator ──────────────────────────────────────────────────────── */
function StreakDot({ streak }) {
  if (!streak?.active) return null;
  const hot = streak.dir==="hot";
  const col = hot?C.orange:C.blue;
  return (
    <div className="pls" role="status" aria-label={`CPU is ${hot?"hot":"cold"}`}
      style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:col,boxShadow:`0 0 8px ${col}80`}}/>
      <span style={{fontFamily:BC,fontSize:12,letterSpacing:3,color:col,fontWeight:600,opacity:0.9,textShadow:`0 0 12px ${col}40`}}>
        {hot?"HOT":"COLD"}
      </span>
    </div>
  );
}

/* ── Try Progress Dots ─────────────────────────────────────────────────────── */
const TryDots = ({ current }) => (
  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:18}} role="status" aria-label={`Try ${current} of 3`}>
    {[1,2,3].map(t=>(
      <div key={t} style={{width:32,height:3,background:t<current?C.white:t===current?C.sub:C.border,transition:"background 0.25s"}}/>
    ))}
  </div>
);

/* ── Back Button ───────────────────────────────────────────────────────────── */
const BackBtn = ({ onClick, label="← BACK" }) => (
  <nav>
    <button onClick={onClick} aria-label="Go back"
      style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:13,letterSpacing:5,cursor:"pointer",textAlign:"left",marginBottom:24,padding:0,display:"block"}}>{label}</button>
  </nav>
);

/* ── Instagram Icon ────────────────────────────────────────────────────────── */
const IgIcon = ({ size=14, color=C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none"/>
  </svg>
);

/* ── Instagram Link ────────────────────────────────────────────────────────── */
const IgLink = ({ size=14, fontSize=12, href="https://instagram.com/kendamanxs", label="Kendamanxs", style={} }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow ${label} on Instagram`} style={{
    fontFamily:BC,fontSize,letterSpacing:3,color:C.muted,fontWeight:600,
    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
    transition:"opacity 0.15s",...style,
  }}>
    <IgIcon size={size} color={C.muted}/>
    {label}
  </a>
);

/* ── Chat/Feedback Icon ────────────────────────────────────────────────────── */
const ChatIcon = ({ size=15, color=C.muted }) => ( // OPTICAL TWEAK: Size bumped to 15
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2.4" // OPTICAL TWEAK: Thicker stroke to match Instagram's density
    strokeLinecap="round" 
    strokeLinejoin="round" 
    aria-hidden="true" 
    style={{ display:"inline-block", verticalAlign:"middle", flexShrink:0 }}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

/* ── Chat/Feedback Link Wrapper ────────────────────────────────────────────── */
const FeedbackLink = ({ size=15, fontSize=12, href="#", label="Feedback", onClick, style={} }) => (
  <button onClick={onClick} aria-label={`Provide ${label}`} style={{
    background:"transparent",border:"none",cursor:"pointer",padding:0,
    fontFamily:BC,fontSize,letterSpacing:3,color:C.muted,fontWeight:600,
    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
    transition:"opacity 0.15s",...style,
  }}>
    <ChatIcon size={size} color={C.muted}/>
    {label}
  </button>
);

/* ── Heart/Donate Icon ─────────────────────────────────────────────────────── */
const HeartIcon = ({ size=14, color=C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

/* ── Donate Link ───────────────────────────────────────────────────────────── */
const DonateLink = ({ size=14, fontSize=12, href="#", label="Support", style={} }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} this project`} style={{
    fontFamily:BC,fontSize,letterSpacing:3,color:C.muted,fontWeight:600,
    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
    transition:"opacity 0.15s",...style,
  }}>
    <HeartIcon size={size} color={C.muted}/>
    {label}
  </a>
);

export { Label, Div, BtnPrimary, BtnGhost, Seg, Dots, StreakDot, TryDots, BackBtn, IgIcon, IgLink, ChatIcon, FeedbackLink, HeartIcon, DonateLink};
