import React, { useState, useEffect } from "react";
import { SB } from "../supabase";
import { C, BB, BC, R } from "../config";
import { BackBtn, Div } from "../components/ui";

// ───────────────────────────────────────────────────────────────────────────
// AdminScreen — hidden page for admin users only.
//
// Gate is handled in App.jsx (user.id check against ADMIN_USER_IDS).
// Layout:
//   • ALL TIME strip (always visible, unfiltered running totals)
//   • Date range selector (presets + custom date picker)
//   • Filtered section (signups/matches/tricks/feedback within range)
//
// To open: visit `?admin=1` while logged in as admin, OR tap the
// admin button on the home screen.
// ───────────────────────────────────────────────────────────────────────────

// ── Helpers: build [start, end) ISO strings for a given preset/date ───────
// Uses local time start-of-day so "today" means "today in Lisbon time" for
// a user in Lisbon — this is what admins intuitively expect.

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function dateRangeFor(preset, customFrom, customTo) {
  const now = new Date();
  if (preset === "today") {
    return { from: startOfLocalDay(now), to: endOfLocalDay(now), label: "TODAY" };
  }
  if (preset === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: startOfLocalDay(y), to: endOfLocalDay(y), label: "YESTERDAY" };
  }
  if (preset === "7d") {
    const from = new Date(now); from.setDate(from.getDate() - 6);
    return { from: startOfLocalDay(from), to: endOfLocalDay(now), label: "LAST 7 DAYS" };
  }
  if (preset === "30d") {
    const from = new Date(now); from.setDate(from.getDate() - 29);
    return { from: startOfLocalDay(from), to: endOfLocalDay(now), label: "LAST 30 DAYS" };
  }
  if (preset === "all") {
    return { from: null, to: null, label: "ALL TIME" };
  }
  if (preset === "custom" && customFrom) {
    const from = startOfLocalDay(new Date(customFrom));
    const to   = endOfLocalDay(new Date(customTo || customFrom));
    const sameDay = customFrom === (customTo || customFrom);
    return {
      from, to,
      label: sameDay
        ? from.toLocaleDateString()
        : `${from.toLocaleDateString()} → ${to.toLocaleDateString()}`,
    };
  }
  return { from: null, to: null, label: "ALL TIME" };
}

// Add date filter to a Supabase query (if the range is bounded)
function withDateRange(query, range) {
  if (range.from) query = query.gte("created_at", range.from.toISOString());
  if (range.to)   query = query.lte("created_at", range.to.toISOString());
  return query;
}

// ── Small UI bits ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = C.white }) {
  return (
    <div style={{ flex:1, minWidth:100, padding:"14px 12px", background:C.surface,
                  border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:R }}>
      <div style={{ fontFamily:BB, fontSize:28, lineHeight:1, color:C.white }}>{value}</div>
      <div style={{ fontFamily:BB, fontSize:10, letterSpacing:3, color:C.muted, marginTop:6 }}>{label}</div>
      {sub && <div style={{ fontFamily:BC, fontSize:11, color:C.sub, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ fontFamily:BB, fontSize:11, letterSpacing:4, color:C.muted,
                  marginBottom:12, marginTop:24, ...style }}>
      {children}
    </div>
  );
}

function PresetBtn({ active, label, onClick }) {
  return (
    <button onClick={onClick} className="tap"
      style={{ flex:"0 0 auto", padding:"8px 14px", background:active?C.logored:"transparent",
               border:`1px solid ${active?C.logored:C.border}`, borderRadius:R,
               color:active?C.white:C.sub, fontFamily:BB, fontSize:11, letterSpacing:2,
               cursor:"pointer", transition:"all 0.12s" }}>
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function AdminScreen({ onBack }) {
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState(null);
  const [allTime, setAllTime]     = useState(null);
  const [ranged, setRanged]       = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  // Date range state
  const [preset, setPreset]       = useState("today");
  const [customFrom, setCustomFrom] = useState(() => new Date().toISOString().slice(0,10));
  const [customTo, setCustomTo]     = useState(() => new Date().toISOString().slice(0,10));
  const [showCustom, setShowCustom] = useState(false);

  const range = dateRangeFor(preset, customFrom, customTo);

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const loadAllTime = async () => {
    const [u, m, t] = await Promise.all([
      SB.from("profiles").select("id", { count:"exact", head:true }),
      SB.from("match_results").select("id", { count:"exact", head:true }),
      SB.from("trick_attempts").select("id", { count:"exact", head:true }),
    ]);
    [u, m, t].forEach(r => { if (r.error) throw r.error; });
    return {
      users:   u.count || 0,
      matches: m.count || 0,
      tricks:  t.count || 0,
    };
  };

  const loadRanged = async (range) => {
    // Signups in range
    const signupsQ = withDateRange(
      SB.from("profiles").select("id,username,created_at", { count:"exact" }).order("created_at", { ascending:false }),
      range
    );
    // Matches in range (we pull fields so we can compute splits)
    const matchesQ = withDateRange(
      SB.from("match_results").select("user_id,won,mode,tournament_result,competition,difficulty,created_at"),
      range
    );
    // Trick attempts in range (lightweight — only need landed + count)
    const tricksQ = withDateRange(
      SB.from("trick_attempts").select("landed", { count:"exact" }),
      range
    );
    // Feedback in range
    const feedbackQ = withDateRange(
      SB.from("feedback").select("id,username,message,created_at").order("created_at", { ascending:false }),
      range
    );

    const [signups, matches, tricks, feedback] = await Promise.all([signupsQ, matchesQ, tricksQ, feedbackQ]);
    [signups, matches, tricks, feedback].forEach(r => { if (r.error) throw r.error; });

    const matchData = matches.data || [];
    const trickData = tricks.data || [];

    const battleMatches     = matchData.filter(m => !m.mode || m.mode === "cpu").length;
    const tournamentMatches = matchData.filter(m => m.mode === "tournament").length;
    const trophies          = matchData.filter(m => m.tournament_result === "champion").length;
    const trickLands        = trickData.filter(t => t.landed).length;
    const landRate          = trickData.length > 0
      ? Math.round((trickLands / trickData.length) * 100) : 0;

    const byComp = {};
    matchData.forEach(m => { if (m.competition) byComp[m.competition] = (byComp[m.competition] || 0) + 1; });

    const byDiff = { easy:0, medium:0, hard:0 };
    matchData.forEach(m => { if (m.difficulty && byDiff[m.difficulty] !== undefined) byDiff[m.difficulty]++; });

    const uniquePlayers = new Set(matchData.map(r => r.user_id).filter(Boolean)).size;

    return {
      signupCount:  signups.count || 0,
      signupList:   signups.data  || [],
      matchCount:   matchData.length,
      trickCount:   tricks.count || 0,
      battleMatches, tournamentMatches, trophies,
      landRate, trickLands,
      uniquePlayers,
      byComp, byDiff,
      feedback:     feedback.data || [],
    };
  };

  const loadAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [at, rg] = await Promise.all([
        loadAllTime(),
        loadRanged(range),
      ]);
      setAllTime(at);
      setRanged(rg);
      setRefreshedAt(new Date());
    } catch (e) {
      setErr(e.message || "Failed to load stats");
    }
    setLoading(false);
  };

  // Reload whenever the preset or custom dates change
  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [preset, customFrom, customTo]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily:BC, background:C.bg, color:C.text, minHeight:"100dvh",
                  maxWidth:440, margin:"0 auto", display:"flex", flexDirection:"column",
                  padding:"calc(20px + env(safe-area-inset-top, 0px)) 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px",
                  overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

      <BackBtn onClick={onBack} label="← BACK"/>

      <div className="rise" style={{ marginTop:12, marginBottom:16 }}>
        <div style={{ display:"inline-block" }}>
          <div style={{ fontFamily:BB, fontSize:40, letterSpacing:5, lineHeight:1, color:C.white }}>ADMIN</div>
          <div style={{ width:"calc(100% - 5px)", height:3, background:C.logored, marginTop:6, opacity:0.9 }}/>
        </div>
        <div style={{ fontFamily:BC, fontSize:12, color:C.muted, letterSpacing:2, marginTop:8, fontWeight:600 }}>
          Live stats · {refreshedAt ? refreshedAt.toLocaleTimeString() : "loading..."}
        </div>
      </div>

      <button onClick={loadAll} disabled={loading}
        style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:R,
                 color:loading?C.muted:C.white, fontFamily:BB, fontSize:12, letterSpacing:3,
                 padding:"10px 0", cursor:loading?"default":"pointer", marginBottom:20 }}>
        {loading ? "LOADING..." : "↻ REFRESH"}
      </button>

      {err && <div style={{ padding:12, background:`${C.red}15`, border:`1px solid ${C.red}50`,
        borderRadius:R, color:C.red, fontFamily:BC, fontSize:13, marginBottom:16 }}>{err}</div>}

      {/* ── ALL TIME (always unfiltered) ──────────────────────────────── */}
      {allTime && <>
        <SectionLabel style={{ marginTop:0 }}>ALL TIME</SectionLabel>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="USERS"   value={allTime.users}   color={C.green}/>
          <StatCard label="MATCHES" value={allTime.matches} color={C.logored}/>
          <StatCard label="TRICKS"  value={allTime.tricks}  color={C.white}/>
        </div>
      </>}

      {/* ── DATE PRESETS ─────────────────────────────────────────────── */}
      <SectionLabel>DATE RANGE · {range.label}</SectionLabel>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
        <PresetBtn active={preset==="today"}     label="TODAY"     onClick={()=>{setPreset("today");setShowCustom(false);}}/>
        <PresetBtn active={preset==="yesterday"} label="YESTERDAY" onClick={()=>{setPreset("yesterday");setShowCustom(false);}}/>
        <PresetBtn active={preset==="7d"}        label="7D"        onClick={()=>{setPreset("7d");setShowCustom(false);}}/>
        <PresetBtn active={preset==="30d"}       label="30D"       onClick={()=>{setPreset("30d");setShowCustom(false);}}/>
        <PresetBtn active={preset==="all"}       label="ALL"       onClick={()=>{setPreset("all");setShowCustom(false);}}/>
        <PresetBtn active={preset==="custom"}    label="CUSTOM"    onClick={()=>{setShowCustom(v=>!v);setPreset("custom");}}/>
      </div>

      {showCustom && (
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:BB, fontSize:9, letterSpacing:3, color:C.muted, marginBottom:4 }}>FROM</div>
            <input type="date" value={customFrom}
              onChange={e=>{setCustomFrom(e.target.value);setPreset("custom");}}
              style={{ width:"100%", padding:"10px 12px", background:C.surface,
                       border:`1px solid ${C.border}`, borderRadius:R,
                       color:C.white, fontFamily:BC, fontSize:13, outline:"none",
                       colorScheme:"dark" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:BB, fontSize:9, letterSpacing:3, color:C.muted, marginBottom:4 }}>TO</div>
            <input type="date" value={customTo}
              onChange={e=>{setCustomTo(e.target.value);setPreset("custom");}}
              style={{ width:"100%", padding:"10px 12px", background:C.surface,
                       border:`1px solid ${C.border}`, borderRadius:R,
                       color:C.white, fontFamily:BC, fontSize:13, outline:"none",
                       colorScheme:"dark" }}/>
          </div>
        </div>
      )}

      {/* ── FILTERED STATS ──────────────────────────────────────────── */}
      {ranged && <>
        <div style={{ display:"flex", gap:8 }}>
          <StatCard label="SIGNUPS"       value={ranged.signupCount}     color={C.green}/>
          <StatCard label="MATCHES"       value={ranged.matchCount}      color={C.logored}/>
          <StatCard label="ACTIVE PLAYERS" value={ranged.uniquePlayers}  sub="played ≥1 match" color={C.green}/>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <StatCard label="BATTLE"   value={ranged.battleMatches}     color={C.logored}/>
          <StatCard label="TOURNEY"  value={ranged.tournamentMatches} color={C.logored}/>
          <StatCard label="TROPHIES" value={ranged.trophies}          sub="champions" color={C.yellow}/>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <StatCard label="TRICKS"    value={ranged.trickCount}/>
          <StatCard label="LANDED"    value={ranged.trickLands}/>
          <StatCard label="LAND RATE" value={`${ranged.landRate}%`}
            color={ranged.landRate>=70?C.green:ranged.landRate>=40?C.yellow:C.red}/>
        </div>

        {/* Signup list */}
        {ranged.signupList.length > 0 && <>
          <SectionLabel>NEW SIGNUPS ({ranged.signupCount})</SectionLabel>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R, padding:"4px 14px", maxHeight:300, overflowY:"auto" }}>
            {ranged.signupList.map(u => (
              <div key={u.id} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:`1px solid ${C.divider}`, fontFamily:BC }}>
                <span style={{ fontSize:13, color:C.white }}>{u.username || "(no name)"}</span>
                <span style={{ fontSize:11, color:C.muted }}>{new Date(u.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>}

        {/* Comp breakdown */}
        {Object.keys(ranged.byComp).length > 0 && <>
          <SectionLabel>MATCHES BY COMP</SectionLabel>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:R, padding:"4px 14px" }}>
            {Object.entries(ranged.byComp).sort((a,b)=>b[1]-a[1]).map(([comp,n])=>(
              <div key={comp} style={{ display:"flex", justifyContent:"space-between",
                padding:"10px 0", borderBottom:`1px solid ${C.divider}`, fontFamily:BC }}>
                <span style={{ fontSize:13, color:C.sub }}>{comp}</span>
                <span style={{ fontFamily:BB, fontSize:14, color:C.white, letterSpacing:1 }}>{n}</span>
              </div>
            ))}
          </div>
        </>}

        {/* Difficulty breakdown */}
        {(ranged.byDiff.easy + ranged.byDiff.medium + ranged.byDiff.hard) > 0 && <>
          <SectionLabel>MATCHES BY DIFFICULTY</SectionLabel>
          <div style={{ display:"flex", gap:8 }}>
            <StatCard label="ROOKIE"   value={ranged.byDiff.easy}   color={C.green}/>
            <StatCard label="AMATEUR"  value={ranged.byDiff.medium} color={C.yellow}/>
            <StatCard label="PRO"      value={ranged.byDiff.hard}   color={C.red}/>
          </div>
        </>}

        {/* Feedback */}
        <SectionLabel>FEEDBACK ({ranged.feedback.length})</SectionLabel>
        {ranged.feedback.length === 0 ? (
          <div style={{ padding:16, background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:R, color:C.muted, fontFamily:BC, fontSize:13, textAlign:"center" }}>
            No feedback in this range.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {ranged.feedback.map(f => (
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
