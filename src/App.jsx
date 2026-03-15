import { useState, useEffect, useRef } from "react";

if (typeof document !== "undefined") {
  if (!document.getElementById("ekc-fonts")) {
    const s = document.createElement("style");
    s.id = "ekc-fonts";
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&display=swap');`;
    document.head.appendChild(s);
  }
  if (!document.getElementById("ekc-kf")) {
    const s = document.createElement("style");
    s.id = "ekc-kf";
    s.textContent = `
      @keyframes fu { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pop { from { opacity:0; transform:scale(0.82); } 60% { transform:scale(1.07); } to { opacity:1; transform:scale(1); } }
      @keyframes pls { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
      .fu  { animation: fu 0.35s ease both; }
      .pop { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      .pls { animation: pls 1.3s ease-in-out infinite; }
      .si  { animation: slideIn 0.3s ease both; }
      .btn-press:active { transform: scale(0.96); opacity: 0.88; }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    `;
    document.head.appendChild(s);
  }
}

const TRICKS = [
  "Around USA",
  "Airplane, J Stick, Poop, Inward J Stick",
  "Spike, Double Whirlwind",
  "Inward Lunar, Monkey Tap, Monkey Tap In",
  "One Turn Lighthouse Insta Trade Spike",
  "Big Cup, Nod On Bird, Over The Valley, Nod Off Mall Cup, Trade Airplane",
  "Stuntplane Fasthand Penguin Catch",
  "Pull Up Triple Kenflip Small Cup, Spike",
  "One Turn Lighthouse, 0.5 Stilt, 0.5 Lighthouse, Falling In",
  "Airplane, Double Inward J Stick",
  "Big Cup, Inward Turntable, Spike",
  "Swing Candlestick 0.5 Flip Spike",
  "Spike, Juggle Spike",
  "Ghost Lighthouse, Stuntplane",
  "Big Cup, Kneebounce Orbit Big Cup, Spike",
  "Switch Pull Up Spike, Earthturn",
  "Spacewalk Airplane",
  "Stuntplane, Inward Stuntplane Flip",
  "Slinger Spike",
  "Hanging Spike",
];

const CPU = {
  easy:   { base: 0.48, label: "ROOKIE",  color: "#4ade80" },
  medium: { base: 0.68, label: "AMATEUR", color: "#facc15" },
  hard:   { base: 0.87, label: "PRO",     color: "#ef4444" },
};

const rollCpu = (diff, streak) => {
  let r = CPU[diff].base;
  if (streak.active)
    r = streak.dir === "hot" ? Math.min(0.95, r + 0.18) : Math.max(0.08, r - 0.22);
  return Math.random() < r;
};

const advanceStreak = (streak) => {
  if (streak.active)
    return streak.left <= 1
      ? { active: false, dir: "hot", left: 0 }
      : { ...streak, left: streak.left - 1 };
  if (Math.random() < 0.22)
    return { active: true, dir: Math.random() < 0.5 ? "hot" : "cold", left: 2 + Math.floor(Math.random() * 2) };
  return streak;
};

const pickTrick = (pool) => {
  const i = Math.floor(Math.random() * pool.length);
  return { trick: pool[i], pool: pool.filter((_, j) => j !== i) };
};

const BB = "'Bebas Neue', sans-serif";

const NOISE = {
  position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.045,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
};

function Dots() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((d) => (d % 3) + 1), 450);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ letterSpacing: 6 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ opacity: i <= n ? 1 : 0.2 }}>●</span>
      ))}
    </span>
  );
}

function TryTrack({ current }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
      {[1, 2, 3].map((t) => (
        <div
          key={t}
          style={{
            width: 28, height: 28, borderRadius: 4,
            border: `2px solid ${t <= current ? "#fff" : "#2a2a2a"}`,
            background: t < current ? "#fff" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: BB, fontSize: 14,
            color: t < current ? "#000" : t === current ? "#fff" : "#333",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
}

function ResultCard({ label, landed }) {
  return (
    <div style={{
      background: "#111", borderRadius: 6, padding: "12px 18px",
      border: `2px solid ${landed ? "#4ade80" : "#ef4444"}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 16,
    }}>
      <span style={{ fontFamily: BB, fontSize: 13, letterSpacing: 4, opacity: 0.45 }}>{label}</span>
      <span style={{ fontFamily: BB, fontSize: 22, letterSpacing: 3, color: landed ? "#4ade80" : "#ef4444" }}>
        {landed ? "LANDED ✓" : "MISSED ✗"}
      </span>
    </div>
  );
}

function AttemptBtns({ onAttempt }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 28 }}>
      <button
        className="btn-press"
        onClick={() => onAttempt(true)}
        style={{
          padding: "22px", background: "#4ade80", border: "none", borderRadius: 6,
          color: "#000", fontFamily: BB, fontSize: 30, letterSpacing: 6,
          cursor: "pointer", transition: "transform 0.08s, opacity 0.08s",
        }}
      >
        LAND ✓
      </button>
      <button
        className="btn-press"
        onClick={() => onAttempt(false)}
        style={{
          padding: "22px", background: "transparent",
          border: "2px solid #ef4444", borderRadius: 6,
          color: "#ef4444", fontFamily: BB, fontSize: 30, letterSpacing: 6,
          cursor: "pointer", transition: "transform 0.08s, opacity 0.08s",
        }}
      >
        MISS ✗
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen]       = useState("menu");
  const [difficulty, setDiff]     = useState("medium");
  const [raceTarget, setRace]     = useState(3);
  const [finalScores, setFinalSc] = useState(null);
  const [gs, setGs]               = useState(null);

  const gsRef   = useRef(null);
  const diffRef = useRef(difficulty);
  const raceRef = useRef(raceTarget);

  useEffect(() => { gsRef.current   = gs;         }, [gs]);
  useEffect(() => { diffRef.current = difficulty; }, [difficulty]);
  useEffect(() => { raceRef.current = raceTarget; }, [raceTarget]);

  function resolveRound(pLanded, cLanded) {
    setGs((p) => {
      if (pLanded === cLanded) {
        if (p.tryNum >= 3)
          return { ...p, cpuResult: cLanded, phase: "round_null", message: "TRICK NULLED" };
        return {
          ...p, cpuResult: cLanded, phase: "try_tie",
          message: pLanded ? "BOTH LANDED" : "BOTH MISSED",
        };
      }
      const winner = pLanded ? "you" : "cpu";
      return {
        ...p,
        cpuResult:   cLanded,
        cpuStreak:   advanceStreak(p.cpuStreak),
        scores:      { ...p.scores, [winner]: p.scores[winner] + 1 },
        roundWinner: winner,
        phase:       "round_over",
        message:     winner === "you" ? "YOU SCORED!" : "CPU SCORED",
      };
    });
  }

  function handleAttempt(landed) {
    const s = gsRef.current;
    if (!s) return;
    if (s.phase === "player_turn_first") {
      setGs((p) => ({ ...p, playerResult: landed, phase: "cpu_thinking" }));
    } else if (s.phase === "player_turn_second") {
      resolveRound(landed, s.cpuFirstResult);
    }
  }

  function nextTrick(state) {
    const src = state.pool.length > 0 ? state.pool : [...TRICKS];
    const r = pickTrick(src);
    setGs({
      scores:        state.scores,
      pool:          r.pool,
      trick:         r.trick,
      tryNum:        1,
      playerFirst:   !state.playerFirst,
      phase:         "trick_reveal",
      cpuStreak:     state.cpuStreak,
      cpuFirstResult: null,
      playerResult:  null,
      cpuResult:     null,
      message:       "",
      roundWinner:   null,
    });
  }

  function startGame() {
    const r = pickTrick([...TRICKS]);
    const init = {
      scores:        { you: 0, cpu: 0 },
      pool:          r.pool,
      trick:         r.trick,
      tryNum:        1,
      playerFirst:   true,
      phase:         "trick_reveal",
      cpuStreak:     { active: false, dir: "hot", left: 0 },
      cpuFirstResult: null,
      playerResult:  null,
      cpuResult:     null,
      message:       "",
      roundWinner:   null,
    };
    gsRef.current = init;
    setGs(init);
    setScreen("battle");
  }

  useEffect(() => {
    if (!gs) return;
    let t;
    if (gs.phase === "trick_reveal") {
      t = setTimeout(() =>
        setGs((p) => ({ ...p, phase: p.playerFirst ? "player_turn_first" : "cpu_first" })),
        2000
      );
    } else if (gs.phase === "cpu_first") {
      t = setTimeout(() => {
        const s = gsRef.current;
        const landed = rollCpu(diffRef.current, s.cpuStreak);
        setGs((p) => ({ ...p, cpuFirstResult: landed, phase: "player_turn_second" }));
      }, 1600);
    } else if (gs.phase === "cpu_thinking") {
      t = setTimeout(() => {
        const s = gsRef.current;
        resolveRound(s.playerResult, rollCpu(diffRef.current, s.cpuStreak));
      }, 1600);
    } else if (gs.phase === "try_tie") {
      t = setTimeout(() =>
        setGs((p) => ({
          ...p,
          tryNum:        p.tryNum + 1,
          playerResult:  null,
          cpuFirstResult: null,
          cpuResult:     null,
          message:       "",
          phase: p.playerFirst ? "player_turn_first" : "cpu_first",
        })),
        1800
      );
    } else if (gs.phase === "round_null") {
      t = setTimeout(() => nextTrick(gsRef.current), 2000);
    } else if (gs.phase === "round_over") {
      t = setTimeout(() => {
        const s = gsRef.current;
        if (s.scores.you >= raceRef.current) { setFinalSc({ ...s.scores }); setScreen("win"); }
        else if (s.scores.cpu >= raceRef.current) { setFinalSc({ ...s.scores }); setScreen("lose"); }
        else nextTrick(s);
      }, 2200);
    }
    return () => clearTimeout(t);
  }, [gs?.phase, gs?.tryNum, gs?.trick]);

  const root = {
    fontFamily: "'Barlow Condensed', sans-serif",
    background: "#0a0a0a",
    color: "#fff",
    minHeight: "100vh",
    maxWidth: 440,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  // ── MENU ────────────────────────────────────────────────────────────────────
  if (screen === "menu") {
    return (
      <div style={root}>
        <div style={NOISE} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", padding: "36px 24px 28px" }}>

          {/* EKC Logo */}
          <div className="fu" style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: BB, fontSize: 76, letterSpacing: 10, lineHeight: 0.88, color: "#fff" }}>EKC</div>
            <div style={{ fontSize: 9, letterSpacing: 5, opacity: 0.4, marginTop: 8, textTransform: "uppercase" }}>
              European Kendama Championship
            </div>
          </div>

          <div className="fu" style={{ textAlign: "center", marginBottom: 24, animationDelay: "0.06s" }}>
            <div style={{ fontFamily: BB, fontSize: 38, letterSpacing: 5, lineHeight: 1 }}>AM OPEN</div>
            <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 6, opacity: 0.3, marginTop: 4 }}>
              BATTLE SIMULATOR · MAY 22–23 · '26
            </div>
          </div>

          <div style={{ height: 1, background: "#1e1e1e", marginBottom: 28 }} />

          {/* Difficulty */}
          <div className="fu" style={{ marginBottom: 22, animationDelay: "0.1s" }}>
            <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.3, textAlign: "center", marginBottom: 10 }}>
              CPU DIFFICULTY
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {Object.entries(CPU).map(([key, cfg]) => {
                const sel = difficulty === key;
                return (
                  <button
                    key={key}
                    className="btn-press"
                    onClick={() => setDiff(key)}
                    style={{
                      flex: 1, padding: "14px 4px",
                      background: sel ? cfg.color : "transparent",
                      border: `2px solid ${sel ? cfg.color : "#252525"}`,
                      color: sel ? "#000" : "#fff",
                      fontFamily: BB, fontSize: 15, letterSpacing: 2,
                      cursor: "pointer", borderRadius: 5,
                      transition: "all 0.15s",
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: "center", fontFamily: BB, fontSize: 10, opacity: 0.28, letterSpacing: 3, marginTop: 8 }}>
              {difficulty === "easy" ? "~48% BASE LAND RATE" : difficulty === "medium" ? "~68% BASE LAND RATE" : "~87% BASE LAND RATE"}
              {" · STREAKS VARY"}
            </div>
          </div>

          {/* Race to */}
          <div className="fu" style={{ marginBottom: 32, animationDelay: "0.14s" }}>
            <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.3, textAlign: "center", marginBottom: 10 }}>
              RACE TO
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[3, 5].map((n) => (
                <button
                  key={n}
                  className="btn-press"
                  onClick={() => setRace(n)}
                  style={{
                    flex: 1, padding: "18px",
                    background: raceTarget === n ? "#fff" : "transparent",
                    border: `2px solid ${raceTarget === n ? "#fff" : "#252525"}`,
                    color: raceTarget === n ? "#000" : "#fff",
                    fontFamily: BB, fontSize: 32, letterSpacing: 4,
                    cursor: "pointer", borderRadius: 5,
                    transition: "all 0.15s",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Start */}
          <button
            className="btn-press fu"
            onClick={startGame}
            style={{
              padding: "22px", background: "#fff", border: "none", borderRadius: 5,
              color: "#000", fontFamily: BB, fontSize: 28, letterSpacing: 8,
              cursor: "pointer", animationDelay: "0.18s",
              transition: "transform 0.08s, opacity 0.08s",
            }}
          >
            START BATTLE
          </button>

          <div style={{ textAlign: "center", fontFamily: BB, fontSize: 10, letterSpacing: 4, opacity: 0.18, marginTop: 12 }}>
            20 OFFICIAL EKC '26 TRICKS
          </div>
        </div>
      </div>
    );
  }

  // ── WIN / LOSE ───────────────────────────────────────────────────────────────
  if (screen === "win" || screen === "lose") {
    const won = screen === "win";
    const sc  = finalScores || { you: 0, cpu: 0 };
    return (
      <div style={{ ...root, justifyContent: "center", padding: "0 24px" }}>
        <div style={NOISE} />
        <div className="pop" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 6, opacity: 0.4, marginBottom: 10 }}>
            {won ? "CONGRATULATIONS" : "GG — KEEP TRAINING"}
          </div>
          <div style={{ fontFamily: BB, fontSize: 72, letterSpacing: 3, lineHeight: 0.88, color: won ? "#fff" : "#ef4444" }}>
            {won ? "YOU WIN" : "CPU WINS"}
          </div>
          <div style={{ height: 1, background: "#1e1e1e", margin: "24px 0" }} />
          <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 6, opacity: 0.3, marginBottom: 14 }}>
            FINAL SCORE
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            {[["YOU", sc.you], ["CPU", sc.cpu]].map(([lbl, val], i) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.4 }}>{lbl}</div>
                <div style={{ fontFamily: BB, fontSize: 80, lineHeight: 0.9 }}>{val}</div>
              </div>
            ))}
          </div>
          <button
            className="btn-press"
            onClick={() => setScreen("menu")}
            style={{
              marginTop: 36, width: "100%", padding: "20px",
              background: "#fff", border: "none", borderRadius: 5,
              color: "#000", fontFamily: BB, fontSize: 24, letterSpacing: 6,
              cursor: "pointer", transition: "transform 0.08s, opacity 0.08s",
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ── BATTLE ───────────────────────────────────────────────────────────────────
  if (!gs) return null;
  const { scores, trick, tryNum, playerFirst, phase, message, cpuFirstResult, playerResult, roundWinner, cpuStreak } = gs;
  const streakLabel = cpuStreak.active ? (cpuStreak.dir === "hot" ? "  🔥" : "  🥶") : "";
  const inAttempt   = ["player_turn_first","cpu_first","player_turn_second","cpu_thinking"].includes(phase);
  const pk          = `${phase}-${trick}-${tryNum}`;

  return (
    <div style={root}>
      <div style={NOISE} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Score header */}
        <div style={{ padding: "18px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.4, marginBottom: 2 }}>YOU</div>
              <div style={{ fontFamily: BB, fontSize: 58, lineHeight: 0.9 }}>{scores.you}</div>
            </div>
            <div style={{ fontFamily: BB, fontSize: 24, opacity: 0.18, paddingBottom: 8 }}>:</div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 4, opacity: 0.4, marginBottom: 2 }}>
                CPU{streakLabel}
              </div>
              <div style={{ fontFamily: BB, fontSize: 58, lineHeight: 0.9 }}>{scores.cpu}</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontFamily: BB, fontSize: 10, letterSpacing: 5, opacity: 0.22, marginTop: 6 }}>
            FIRST TO {raceTarget}
          </div>
          <div style={{ height: 1, background: "#181818", marginTop: 12 }} />
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 24px 0" }}>

          {/* TRICK REVEAL */}
          {phase === "trick_reveal" && (
            <div key={pk} className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 6, opacity: 0.28, marginBottom: 18 }}>NEXT TRICK</div>
              <div style={{ fontFamily: BB, fontSize: 32, letterSpacing: 2, lineHeight: 1.18, maxWidth: 300 }}>{trick}</div>
              <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8, opacity: 0.38 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                <div style={{ fontFamily: BB, fontSize: 12, letterSpacing: 5 }}>
                  {playerFirst ? "YOU GO FIRST" : "CPU GOES FIRST"}
                </div>
              </div>
            </div>
          )}

          {/* ATTEMPT PHASES */}
          {inAttempt && (
            <div key={pk} className="fu" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: BB, fontSize: 10, letterSpacing: 5, opacity: 0.28, marginBottom: 4 }}>TRICK</div>
                <div style={{ fontFamily: BB, fontSize: 20, letterSpacing: 1, lineHeight: 1.2, opacity: 0.82 }}>{trick}</div>
              </div>
              <TryTrack current={tryNum} />
              <div style={{ height: 1, background: "#181818", marginBottom: 18 }} />

              {/* Player goes first */}
              {phase === "player_turn_first" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.38 }}>YOU GO FIRST</div>
                    <div style={{ fontFamily: BB, fontSize: 26, letterSpacing: 3, marginTop: 6 }}>DID YOU LAND IT?</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <AttemptBtns onAttempt={handleAttempt} />
                </div>
              )}

              {/* CPU goes first — thinking */}
              {phase === "cpu_first" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.35 }}>CPU GOES FIRST</div>
                  <div className="pls" style={{ fontFamily: BB, fontSize: 28, letterSpacing: 3 }}>
                    ATTEMPTING <Dots />
                  </div>
                  {cpuStreak.active && (
                    <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 3, opacity: 0.45, marginTop: 8 }}>
                      {cpuStreak.dir === "hot" ? "🔥 CPU ON FIRE" : "🥶 CPU COLD SPELL"}
                    </div>
                  )}
                </div>
              )}

              {/* Player goes second — sees CPU result */}
              {phase === "player_turn_second" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <ResultCard label="CPU" landed={cpuFirstResult} />
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.38 }}>YOUR TURN</div>
                    <div style={{ fontFamily: BB, fontSize: 24, letterSpacing: 3, marginTop: 6 }}>
                      {cpuFirstResult ? "MATCH IT TO TIE!" : "LAND TO SCORE!"}
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <AttemptBtns onAttempt={handleAttempt} />
                </div>
              )}

              {/* CPU responds */}
              {phase === "cpu_thinking" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <ResultCard label="YOU" landed={playerResult} />
                  <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 5, opacity: 0.35 }}>CPU RESPONDING</div>
                  <div className="pls" style={{ fontFamily: BB, fontSize: 32, letterSpacing: 4 }}>
                    <Dots />
                  </div>
                  {cpuStreak.active && (
                    <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 3, opacity: 0.45, marginTop: 4 }}>
                      {cpuStreak.dir === "hot" ? "🔥 CPU IS HOT" : "🥶 CPU IS COLD"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TRY TIE */}
          {phase === "try_tie" && (
            <div key={pk} className="pop" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ fontFamily: BB, fontSize: 52, letterSpacing: 2, lineHeight: 1 }}>{message}</div>
              <div style={{ fontFamily: BB, fontSize: 12, letterSpacing: 6, opacity: 0.3, marginTop: 18 }}>
                TRY {Math.min(tryNum + 1, 3)} / 3
              </div>
            </div>
          )}

          {/* ROUND OVER */}
          {phase === "round_over" && (
            <div key={pk} className="pop" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{
                fontFamily: BB, fontSize: 56, letterSpacing: 2, lineHeight: 1,
                color: roundWinner === "you" ? "#4ade80" : "#ef4444",
              }}>
                {message}
              </div>
              <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 6, opacity: 0.25, marginTop: 18 }}>
                NEXT TRICK INCOMING
              </div>
            </div>
          )}

          {/* ROUND NULL */}
          {phase === "round_null" && (
            <div key={pk} className="fu" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ fontFamily: BB, fontSize: 46, letterSpacing: 2, opacity: 0.5 }}>TRICK NULLED</div>
              <div style={{ fontFamily: BB, fontSize: 11, letterSpacing: 6, opacity: 0.22, marginTop: 14 }}>MOVING ON...</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: "10px 24px 18px", textAlign: "center" }}>
          <button
            onClick={() => setScreen("menu")}
            style={{
              background: "transparent", border: "none", color: "#2e2e2e",
              fontFamily: BB, fontSize: 11, letterSpacing: 5, cursor: "pointer",
            }}
          >
            ← MENU
          </button>
        </div>

      </div>
    </div>
  );
}
