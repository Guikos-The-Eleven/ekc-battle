import { applyStreak } from "./cpu";

// ─── GAME STATE REDUCER ─────────────────────────────────────────────────────
// Handles all game state transitions atomically. Config (diff, race, streaks,
// mode) is stored inside the state at game start, so timer callbacks never
// need external refs.

function resolveRound(state, pLanded, cLanded) {
  const newTries = [...(state.currentTries||[]), {you:pLanded, cpu:cLanded}];
  const cfg = state.config;

  if (pLanded === cLanded) {
    const ns = applyStreak(state.cpuStreak, "null", cfg.streaks);
    if (state.tryNum >= 3) {
      const entry = {trick:state.trick, playerFirst:state.playerFirst, tries:newTries, result:"null"};
      return {...state, cpuStreak:ns, phase:"null",
        gameLog:[...(state.gameLog||[]), entry], currentTries:[]};
    }
    return {...state, cpuStreak:ns, phase:"tie",
      msg:pLanded?"BOTH LANDED":"BOTH MISSED", currentTries:newTries};
  }

  const winner = pLanded ? "you" : "cpu";
  const newScores = {...state.scores, [winner]:state.scores[winner]+1};
  const matchOver = newScores.you >= cfg.race || newScores.cpu >= cfg.race;
  // Don't update streaks on match-ending point
  const ns = matchOver ? state.cpuStreak : applyStreak(state.cpuStreak, winner, cfg.streaks);
  const entry = {trick:state.trick, playerFirst:state.playerFirst, tries:newTries, result:winner};

  return {...state, cpuStreak:ns, scores:newScores, winner, phase:"point",
    lastScoreKey:(state.lastScoreKey||0)+1,
    gameLog:[...(state.gameLog||[]), entry], currentTries:[],
    scoredTricks:[...(state.scoredTricks||[]), state.trick],
    matchOver};
}

export default function gameReducer(state, action) {
  if (!state && action.type !== "INIT_CPU" && action.type !== "INIT_2P") return null;

  switch (action.type) {

    // ── Initialization ────────────────────────────────────────────────────
    case "INIT_CPU":
    case "INIT_2P":
      return action.payload;

    case "END_MATCH":
      return null;

    // ── CPU / Tournament: phase transitions ───────────────────────────────
    case "ADVANCE_REVEAL":
      return {...state, phase:state.playerFirst ? "p_first" : "cpu_first"};

    case "CPU_FIRST_ROLLED":
      return {...state,
        cpuFirst:action.landed,
        cpuMomentum:[...state.cpuMomentum, action.landed].slice(-6),
        phase:"p_second"};

    case "PLAYER_ATTEMPT_FIRST":
      return {...state, _prev:{...state, _prev:null}, pResult:action.landed, phase:"cpu_resp"};

    case "PLAYER_ATTEMPT_SECOND": {
      const prev = {...state, _prev:null};
      const res = resolveRound(state, action.landed, state.cpuFirst);
      return {...res, _prev:prev};
    }

    case "CPU_RESPONDED": {
      const prev = state._prev;
      const updated = {...state,
        cpuMomentum:[...state.cpuMomentum, action.landed].slice(-6)};
      const resolved = resolveRound(updated, state.pResult, action.landed);
      return {...resolved, _prev:prev};
    }

    case "TIE_ADVANCE":
      return {...state, tryNum:state.tryNum+1, pResult:null, cpuFirst:null, msg:"",
        phase:state.playerFirst ? "p_first" : "cpu_first"};

    case "NEXT_TRICK":
      return {...state, trick:action.trick, pool:action.pool, tryNum:1,
        playerFirst:!state.playerFirst, phase:"reveal",
        cpuFirst:null, pResult:null, msg:"", winner:null, currentTries:[], _prev:null};

    // ── 2P: phase transitions ─────────────────────────────────────────────
    case "2P_ADVANCE":
      return {...state, phase:"2p_score"};

    case "2P_SCORE": {
      if (action.winner === "null") {
        return {...state, trick:action.trick, pool:action.pool,
          playerFirst:!state.playerFirst, phase:"2p_reveal", winner:null};
      }
      const scores = {...state.scores, [action.winner]:state.scores[action.winner]+1};
      const matchOver = scores.p1 >= state.config.race || scores.p2 >= state.config.race;
      return {...state, scores, winner:action.winner, phase:"2p_point", matchOver,
        scoredTricks:[...(state.scoredTricks||[]), state.trick]};
    }

    case "2P_NEXT_TRICK":
      return {...state, trick:action.trick, pool:action.pool,
        playerFirst:!state.playerFirst, phase:"2p_reveal", winner:null,
        matchOver:false};

    // ── Reshuffle: pool exhausted, show interstitial ────────────────────
    case "RESHUFFLE":
      return {...state, phase:"reshuffle"};

    case "RESHUFFLE_DONE": {
      const is2p = state.config.mode === "2p";
      return {...state, trick:action.trick, pool:action.pool, tryNum:1,
        playerFirst:!state.playerFirst,
        phase:is2p ? "2p_reveal" : "reveal",
        cpuFirst:null, pResult:null, msg:"", winner:null, currentTries:[],
        scoredTricks:action.resetScored ? [] : state.scoredTricks};
    }

    // ── Undo: restore previous state before last player action ─────────
    case "UNDO":
      return state._prev || state;

    default:
      return state;
  }
}
