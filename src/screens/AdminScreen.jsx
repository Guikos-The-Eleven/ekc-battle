import React, { useState, useEffect } from "react";
import { SB } from "../supabase";
import { C, BB, BC, R } from "../config";
import { BackBtn, BtnGhost, Div } from "../components/ui";

// ───────────────────────────────────────────────────────────────────────────
// AdminScreen — hidden page only accessible to the admin user.
// Gate is handled in App.jsx (user.id check against ADMIN_USER_IDS).
// No extra DB roles, no RLS gymnastics. If someone finds the URL, they still
// can't see the data unless they're logged in as the admin account.
//
// To open: visit `?admin=1` while logged in as admin.
// ───────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = C.white }) {
  return (
    <div style={{ flex:1, minWidth:120, padding:"16px 14px", background:C.surface,
                  border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:R }}>
      <div style={{ fontFamily:BB, fontSize:32, lineHeight:1, color:C.white }}>{value}</div>
      <div style={{ fontFamily:BB, fontSize:10, letterSpacing:3, color:C.muted, marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontFamily:BC, fontSize:11, color:C.sub, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily:BB, fontSize:11, letterSpacing:4, color:C.muted, marginBottom:12, marginTop:28 }}>
      {children}
    </div>
  );
}

export default function AdminScreen({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setErr(null);
    try {
      // Time windows
      const now = new Date();
      const day1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel fetches
      const [
        profilesAll,
        profilesRecent,
        matchesAll,
        matchesToday,
        matches7d,
        tricksAll,
        tricksToday,
        feedbackAll,
        activeUsers,
      ] = await Promise.all([
        // All profiles (total signups with a username)
        SB.from("profiles").select("id", { count:"exact", head:true }),
        // Signups in last 7 days
        SB.from("profiles").select("id", { count:"exact", head:true }).gte("created_at", day7),
        // All matches
        SB.from("match_results").select("won,mode,tournament_result,competition,difficulty", { count:"exact" }),
        // Matches today
        SB.from("match_results").select("id", { count:"exact", head:true }).gte("created_at", day1),
        // Matches 7d
        SB.from("match_results").select("id", { count:"exact", head:true }).gte("created_at", day7),
        // Trick attempts all
        SB.from("trick_attempts").select("landed", { count:"exact" }),
        // Trick attempts today
        SB.from("trick_attempts").select("id", { count:"exact", head:true }).gte("created_at", day1),
        // All feedback
        SB.from("feedback").select("id,username,message,created_at").order("created_at", { ascending:false }).limit(20),
        // Distinct active users (played match in 7d)
        SB.from("match_results").select("user_id").gte("created_at", day7),
      ]);

      // Error check — any failed fetch throws
      [profilesAll, profilesRecent, matchesAll, matchesToday, matches7d, tricksAll, tricksToday, feedbackAll, activeUsers]
        .forEach(r => { if (r.error) throw r.error; });

      // Derived stats
      const matchesData = matchesAll.data || [];
      const tricksData = tricksAll.data || [];
      const activeData = activeUsers.data || [];

      const wins = matchesData.filter(m => m.won).length;
      const losses = matchesData.length - wins;
      const trophies = matchesData.filter(m => m.tournament_result === "champion").length;
      const tournamentMatches = matchesData.filter(m => m.mode === "tournament").length;
      const battleMatches = matchesData.filter(m => !m.mode || m.mode === "cpu").length;

      const trickLands = tricksData.filter(t => t.landed).length;
      const globalLandRate = tricksData.length > 0
        ? Math.round((trickLands / tricksData.length) * 100) : 0;

      // Breakdown by competition
      const byComp = {};
      matchesData.forEach(m => {
        if (!m.competition) return;
        byComp[m.competition] = (byComp[m.competition] || 0) + 1;
      });

      // Breakdown by difficulty
      const byDiff = { easy:0, medium:0, hard:0 };
      matchesData.forEach(m => {
        if (m.difficulty && byDiff[m.difficulty] !== undefined) byDiff[m.difficulty]++;
      });

      // Active users (unique in 7d)
      const uniqueActive = new Set(activeData.map(r => r.user_id).filter(Boolean)).size;

      setStats({
        totalSignups: profilesAll.count || 0,
        signups7d:    profilesRecent.count || 0,
        totalMatches: matchesAll.count || 0,
        matchesToday: matchesToday.count || 0,
        matches7d:    matches7d.count || 0,
        tricksTotal:  tricksAll.count || 0,
        tricksToday:  tricksToday.count || 0,
        globalLandRate,
        wins, losses, trophies,
        tournamentMatches, battleMatches,
        activeUsers7d: uniqueActive,
        byComp, byDiff,
        feedback: feedbackAll.data || [],
      });
      setRefreshedAt(new Date());
    } catch (e) {
      setErr(e.message || "Failed to load stats");
    }
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const s = stats;

  return (
    <div style={{ fontFamily:BC, background:C.bg, color:C.text, minHeight:"100dvh",
                  maxWidth:440, margin:"0 auto", display:"flex", flexDirection:"column",
                  padding:"calc(20px + env(safe-area-inset-top, 0px)) 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px",
                  overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

      <BackBtn onClick={onBack} label="← BACK"/>

      <div className="rise" style={{ marginTop:12, marginBottom:16 }}>
        <div style={{ fontFamily:BB, fontSize:40, letterSpacing:5, lineHeight:1, color:C.white }}>ADMIN</div>
        <div style={{ width:48, height:3, background:C.logored, marginTop:6, opacity:0.9 }}/>
        <div style={{ fontFamily:BC, fontSize:12, color:C.muted, letterSpacing:2, marginTop:8, fontWeight:600 }}>
          Live stats · {refreshedAt ? refreshedAt.toLocaleTimeString() : "loading..."}
        </div>
      </div>

      <button onClick={loadStats} disabled={loading}
        style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:R,
                 color:loading?C.muted:C.white, fontFamily:BB, fontSize:12, letterSpacing:3,
                 padding:"10px 0", cursor:loading?"default":"pointer", marginBottom:20 }}>
        {loading ? "LOADING..." : "↻ REFRESH"}
      </button>

      {err && <div style={{ padding:12, background:`${C.red}15`, border:`1px solid ${C.red}50`,
        borderRadius:R, color:C.red, fontFamily:BC, fontSize:13, marginBottom:16 }}>{err}</div>}

      {s && <>
        {/* Headline */}
        <SectionLabel>USERS</SectionLabel>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="TOTAL SIGNUPS" value={s.totalSignups} color={C.green}/>
          <StatCard label="LAST 7 DAYS" value={s.signups7d} color={C.green}/>
          <StatCard label="ACTIVE 7D" value={s.activeUsers7d} sub="played ≥1 match" color={C.green}/>
        </div>

        <SectionLabel>MATCHES</SectionLabel>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="TOTAL" value={s.totalMatches} color={C.logored}/>
          <StatCard label="TODAY" value={s.matchesToday} color={C.logored}/>
          <StatCard label="LAST 7D" value={s.matches7d} color={C.logored}/>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <StatCard label="BATTLE" value={s.battleMatches} color={C.logored}/>
          <StatCard label="TOURNEY" value={s.tournamentMatches} color={C.logored}/>
          <StatCard label="TROPHIES WON" value={s.trophies} sub="total champions" color={C.yellow}/>
        </div>

        <SectionLabel>TRICKS</SectionLabel>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="ATTEMPTS" value={s.tricksTotal}/>
          <StatCard label="TODAY" value={s.tricksToday}/>
          <StatCard label="LAND RATE" value={`${s.globalLandRate}%`}
            sub="global avg" color={s.globalLandRate>=70?C.green:s.globalLandRate>=40?C.yellow:C.red}/>
        </div>

        {/* Competition breakdown */}
        {Object.keys(s.byComp).length > 0 && <>
          <SectionLabel>MATCHES BY COMP</SectionLabel>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R, padding:"4px 14px" }}>
            {Object.entries(s.byComp).sort((a,b)=>b[1]-a[1]).map(([comp,n])=>(
              <div key={comp} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:`1px solid ${C.divider}`, fontFamily:BC }}>
                <span style={{ fontSize:13, color:C.sub }}>{comp}</span>
                <span style={{ fontFamily:BB, fontSize:14, color:C.white, letterSpacing:1 }}>{n}</span>
              </div>
            ))}
          </div>
        </>}

        {/* Difficulty breakdown */}
        <SectionLabel>MATCHES BY DIFFICULTY</SectionLabel>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="ROOKIE" value={s.byDiff.easy} color={C.green}/>
          <StatCard label="AMATEUR" value={s.byDiff.medium} color={C.yellow}/>
          <StatCard label="PRO" value={s.byDiff.hard} color={C.red}/>
        </div>

        {/* Recent feedback */}
        <SectionLabel>RECENT FEEDBACK ({s.feedback.length})</SectionLabel>
        {s.feedback.length === 0 ? (
          <div style={{ padding:16, background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:R, color:C.muted, fontFamily:BC, fontSize:13, textAlign:"center" }}>
            No feedback yet.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {s.feedback.map(f => (
              <div key={f.id} style={{ background:C.surface, border:`1px solid ${C.border}`,
                borderLeft:`3px solid ${f.username==="Guest"?C.muted:C.green}`, borderRadius:R, padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontFamily:BB, fontSize:11, letterSpacing:2, color:C.white }}>
                    {f.username || "Guest"}
                  </span>
                  <span style={{ fontFamily:BC, fontSize:11, color:C.muted }}>
                    {new Date(f.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontFamily:BC, fontSize:13, color:C.text, lineHeight:1.4,
                  whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{f.message}</div>
              </div>
            ))}
          </div>
        )}

        <Div mb={40}/>
      </>}
    </div>
  );
}
