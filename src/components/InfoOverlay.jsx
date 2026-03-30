import React from "react";
import { C, BB, BC, R } from "../config";

export default function InfoOverlay({ showInfo, setShowInfo, info, modeColor }) {
  if (!showInfo || !info) return null;
  const col = modeColor || C.white;
  return (
    <div onClick={()=>setShowInfo(false)} style={{
      position:"fixed",inset:0,zIndex:100,
      background:"rgba(0,0,0,0.75)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:24,
    }}>
      <div className="pop" onClick={e=>e.stopPropagation()} style={{
        maxWidth:360,width:"100%",padding:"32px 28px",
        background:"#1a1a1f",border:`1px solid ${C.border}`,borderRadius:R,
        borderTop:`3px solid ${C.muted}`,
      }}>
        <div style={{fontFamily:BB,fontSize:24,letterSpacing:6,color:col,marginBottom:20}}>{info.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {info.lines.map((line,i)=>(
            <div key={i} style={{
              fontFamily:BC,fontSize:15,color:C.text,fontWeight:600,lineHeight:1.6,
              letterSpacing:1,paddingLeft:14,borderLeft:`3px solid ${col}60`,
            }}>{line}</div>
          ))}
        </div>
        <button onClick={()=>setShowInfo(false)} style={{
          width:"100%",marginTop:24,padding:"14px 0",
          background:`${C.white}08`,border:`1px solid ${C.border}`,borderRadius:R,
          fontFamily:BB,fontSize:14,letterSpacing:5,color:C.sub,cursor:"pointer",
        }}>GOT IT</button>
      </div>
    </div>
  );
}

export function InfoBtn({ onClick, style }) {
  return (
    <button className="tap" onClick={onClick} aria-label="Mode info" style={{
      position:"absolute",top:"calc(20px + env(safe-area-inset-top, 0px))",right:24,
      width:36,height:36,borderRadius:"50%",
      background:`${C.white}0a`,border:`1.5px solid ${C.border}`,
      color:C.sub,fontFamily:BB,fontSize:16,letterSpacing:0,
      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:5,transition:"all 0.12s",...style,
    }}>?</button>
  );
}
