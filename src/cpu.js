import { CPU_CFG } from "./config";

// Momentum: recent results nudge CPU rate (last 4 outcomes tracked)
const applyMomentum = (rate, momentum=[]) => {
  if (momentum.length < 2) return rate;
  const recent = momentum.slice(-4);
  const landRate = recent.filter(Boolean).length / recent.length;
  const nudge = (landRate - 0.5) * -0.06;
  return Math.max(0.10, Math.min(0.92, rate + nudge));
};

// Comeback: score differential adjusts rate
const applyComeback = (rate, cpuScore, playerScore, raceTo) => {
  const diff = playerScore - cpuScore;
  if (diff >= 2) return Math.min(0.90, rate + 0.05);
  if (diff <= -2) return Math.max(0.15, rate - 0.04);
  return rate;
};

// Clutch: at match point, tension heightens
const applyClutch = (rate, cpuScore, playerScore, raceTo) => {
  const cpuMatchPoint = cpuScore === raceTo - 1;
  const playerMatchPoint = playerScore === raceTo - 1;
  if (cpuMatchPoint && playerMatchPoint) return rate + 0.03;
  if (playerMatchPoint) return rate + 0.04;
  if (cpuMatchPoint) return rate - 0.02;
  return rate;
};

const cpuThinkTime = (diff) => {
  const [min, max] = CPU_CFG[diff].thinkMs;
  return min + Math.random() * (max - min);
};

const roll = (diff, streak, streaksOn, gameState={}) => {
  let r = CPU_CFG[diff].base;
  if (gameState.cpuNudge) r = Math.min(0.92, r + gameState.cpuNudge);
  if (streaksOn && streak.active)
    r = streak.dir==="hot" ? Math.min(0.88,r+0.12) : Math.max(0.12,r-0.18);
  if (gameState.cpuMomentum) r = applyMomentum(r, gameState.cpuMomentum);
  if (gameState.scores) r = applyComeback(r, gameState.scores.cpu, gameState.scores.you, gameState.raceTo || 3);
  if (gameState.scores) r = applyClutch(r, gameState.scores.cpu, gameState.scores.you, gameState.raceTo || 3);
  return Math.random() < r;
};

const applyStreak = (streak, pointWinner, streaksOn) => {
  if (!streaksOn) return { active:false, dir:"hot", left:0 };
  if (pointWinner==="cpu") {
    // If cold streak active, it persists (CPU scoring doesn't break cold)
    if (streak.active && streak.dir==="cold")
      return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
    // If hot, keep it
    if (streak.active && streak.dir==="hot") return streak;
    // 20% chance to start hot
    return Math.random()<0.20 ? { active:true, dir:"hot", left:0 } : { active:false, dir:"hot", left:0 };
  }
  if (pointWinner==="you") {
    // Hot streak ends immediately when player scores
    if (streak.active && streak.dir==="hot") return { active:false, dir:"hot", left:0 };
    // Cold streak: if active, decrement
    if (streak.active && streak.dir==="cold")
      return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
    // 22% chance to start cold (only if no streak active)
    return Math.random()<0.22 ? { active:true, dir:"cold", left:2+Math.floor(Math.random()*2) } : { active:false, dir:"hot", left:0 };
  }
  // Null: cold decrements, hot persists
  if (streak.active && streak.dir==="cold")
    return streak.left<=1 ? { active:false, dir:"hot", left:0 } : { ...streak, left:streak.left-1 };
  return streak;
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const drawTrick = (pool) => {
  if (pool.length === 0) return null;
  const i = Math.floor(Math.random()*pool.length);
  return { trick:pool[i], pool:pool.filter((_,j)=>j!==i) };
};

const buildPool = (all, scoredTricks = []) => {
  let available = all.filter(t => !scoredTricks.includes(t));
  const reset = available.length === 0;
  if (reset) available = [...all];
  const pool = shuffle(available);
  return { pool, reset };
};

export { applyMomentum, applyComeback, applyClutch, cpuThinkTime, roll, applyStreak, drawTrick, buildPool, shuffle };
