import { useState, useEffect } from "react";
import { C, BB, BC, R, LOGO } from "../config";

// ─── UI ATOMS ────────────────────────────────────────────────────────────────
const Label = ({ children, style={} }) => (
  <div style={{fontFamily:BC,fontSize:11,letterSpacing:1.5,color:C.sub,fontWeight:600,...style}}>{children}</div>
);
const Div = ({ mt=0, mb=0 }) => <div style={{height:1,background:C.divider,marginTop:mt,marginBottom:mb}}/>;

const BtnPrimary = ({ children, onClick, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%",padding:"18px 20px",background:"#d4d4d4",border:"none",borderRadius:2,
    color:"#0b0b0c",fontFamily:BB,fontSize:20,letterSpacing:5,cursor:"pointer",
    transition:"opacity 0.1s ease",...style,
  }}>{children}</button>
);

const BtnGhost = ({ children, onClick, color=C.muted, style={} }) => (
  <button className="tap" onClick={onClick} style={{
    width:"100%",padding:"16px 24px",background:"transparent",
    border:`1px solid ${color}`,borderRadius:R,color,
    fontFamily:BB,fontSize:16,letterSpacing:5,cursor:"pointer",
    transition:"opacity 0.12s",...style,
  }}>{children}</button>
);

const Seg = ({ label, opts, val, onChange }) => (
  <div style={{marginBottom:22}}>
    {label && <Label style={{textAlign:"center",marginBottom:12}}>{label}</Label>}
    <div style={{display:"flex",gap:8}}>
      {opts.map(o=>{
        const sel = val===o.key;
        const selColor = o.color||"#c8c8c8";
        return (
          <button key={String(o.key)} className="tap" onClick={()=>onChange(o.key)} style={{
            flex:1, padding:o.sub?"12px 6px":"16px 6px",
            background:sel?(o.color?o.color+"22":"#ffffff0f"):"transparent",
            border:`1px solid ${sel?selColor:C.border}`,
            color:sel?(o.color||"#d8d8d8"):C.sub,
            fontFamily:BB,fontSize:14,letterSpacing:3,
            cursor:"pointer",borderRadius:R,transition:"all 0.12s",
          }}>
            <div>{o.label}</div>
            {o.sub && <div style={{fontSize:9,letterSpacing:2,opacity:sel?0.7:0.5,marginTop:4}}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  </div>
);

function Dots() {
  const [n,setN]=useState(1);
  useEffect(()=>{const t=setInterval(()=>setN(d=>(d%3)+1),450);return()=>clearInterval(t);},[]);
  return <span style={{letterSpacing:5}}>{[1,2,3].map(i=><span key={i} style={{opacity:i<=n?1:0.18}}>●</span>)}</span>;
}

function StreakDot({ streak }) {
  if (!streak?.active) return null;
  const hot = streak.dir==="hot";
  const col = hot?C.orange:C.blue;
  return (
    <div className="pls" style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:col,boxShadow:`0 0 8px ${col}80`}}/>
      <span style={{fontFamily:BC,fontSize:10,letterSpacing:3,color:col,fontWeight:600,opacity:0.9,textShadow:`0 0 12px ${col}40`}}>
        {hot?"HOT":"COLD"}
      </span>
    </div>
  );
}

const TryDots = ({ current }) => (
  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:18}}>
    {[1,2,3].map(t=>(
      <div key={t} style={{width:32,height:3,background:t<current?C.white:t===current?C.sub:C.border,transition:"background 0.2s"}}/>
    ))}
  </div>
);

const BackBtn = ({ onClick, label="← BACK" }) => (
  <button onClick={onClick} style={{background:"transparent",border:"none",color:C.muted,fontFamily:BB,fontSize:11,letterSpacing:5,cursor:"pointer",textAlign:"left",marginBottom:24,padding:0,display:"block"}}>{label}</button>
);

const IgIcon = ({ size=14, color=C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}>
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none"/>
  </svg>
);

const IgLink = ({ size=14, fontSize=12, href="https://instagram.com/kendamanxs", label="kendamanxs", style={} }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{
    fontFamily:BC,fontSize,letterSpacing:3,color:C.muted,fontWeight:600,
    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
    transition:"opacity 0.15s",...style,
  }}>
    <IgIcon size={size} color={C.muted}/>
    {label}
  </a>
);

export { Label, Div, BtnPrimary, BtnGhost, Seg, Dots, StreakDot, TryDots, BackBtn, IgIcon, IgLink };
