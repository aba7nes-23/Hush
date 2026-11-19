export type GameDirection = "forward" | "back" | "left" | "right";
export type LaneKind = "grass" | "road" | "river";
export type HazardKind = "car" | "truck" | "log" | "turtle";
export type GamePhase = "ready" | "playing" | "paused" | "gameover";
export type LaneDirection = -1 | 1;

export interface PlayerState {
  x: number;
  lane: number;
}

export interface Hazard {
  id: string;
  x: number;
  width: number;
  kind: HazardKind;
  color: string;
}

export interface Lane {
  index: number;
  kind: LaneKind;
  speed: number;
  direction: LaneDirection;
  hazards: Hazard[];
}

export interface GameState {
  player: PlayerState;
  lanes: Lane[];
  score: number;
  bestScore: number;
  phase: GamePhase;
  elapsed: number;
}

export const GRID_MIN_X = -5;
export const GRID_MAX_X = 5;
export const LANE_BEHIND = 7;
export const LANES_AHEAD = 20;
const WRAP_MIN_X = -7;
const WRAP_MAX_X = 7;
const WRAP_WIDTH = WRAP_MAX_X - WRAP_MIN_X;
const PLAYER_HALF_WIDTH = 0.34;

const CAR_COLORS = ["#f36f4f", "#f6c34a", "#69a8d9", "#a984db", "#f3eee1"];

function randomFor(lane: number, salt: number): number {
  const value = Math.sin(lane * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function getLaneKind(index: number): LaneKind {
  if (index <= 1 || index % 4 === 0) return "grass";
  return index % 5 === 0 ? "river" : "road";
}

function createLane(index: number): Lane {
  const kind = getLaneKind(index);
  if (kind === "grass") {
    return { index, kind, speed: 0, direction: 1, hazards: [] };
  }

  const direction: LaneDirection = randomFor(index, 1) > 0.5 ? 1 : -1;
  const speed = kind === "road"
    ? 1.8 + randomFor(index, 2) * 1.35
    : 0.65 + randomFor(index, 3) * 0.55;
  const count = kind === "road" ? 3 : 3;
  const spacing = kind === "road" ? 4.7 : 4.9;
  const start = -((count - 1) * spacing) / 2;
  const hazards = Array.from({ length: count }, (_, itemIndex): Hazard => {
    const isTruck = kind === "road" && randomFor(index, itemIndex + 5) > 0.74;
    const isTurtle = kind === "river" && randomFor(index, itemIndex + 7) > 0.68;
    return {
      id: `${index}-${itemIndex}`,
      x: start + itemIndex * spacing + (randomFor(index, itemIndex + 11) - 0.5) * 1.3,
      width: kind === "river" ? (isTurtle ? 2.15 : 2.8) : (isTruck ? 1.7 : 1.05),
      kind: kind === "river" ? (isTurtle ? "turtle" : "log") : (isTruck ? "truck" : "car"),
      color: kind === "river" ? "#8c5639" : CAR_COLORS[Math.floor(randomFor(index, itemIndex + 17) * CAR_COLORS.length)],
    };
  });

  return { index, kind, speed, direction, hazards };
}

function createLanes(from: number, through: number): Lane[] {
  return Array.from({ length: through - from + 1 }, (_, offset) => createLane(from + offset));
}

function getLane(state: GameState, index: number): Lane | undefined {
  return state.lanes.find((lane) => lane.index === index);
}

function ensureLanes(state: GameState): Lane[] {
  const desiredEnd = state.player.lane + LANES_AHEAD;
  const existingEnd = state.lanes.at(-1)?.index ?? -1;
  const appended = existingEnd < desiredEnd ? createLanes(existingEnd + 1, desiredEnd) : [];
  const keepFrom = Math.max(-LANE_BEHIND, state.player.lane - LANE_BEHIND);
  return [...state.lanes, ...appended].filter((lane) => lane.index >= keepFrom);
}

function isOnHazard(playerX: number, hazards: Hazard[]): Hazard | undefined {
  return hazards.find((hazard) => Math.abs(hazard.x - playerX) <= hazard.width / 2 + PLAYER_HALF_WIDTH);
}

function wrapX(x: number): number {
  return ((((x - WRAP_MIN_X) % WRAP_WIDTH) + WRAP_WIDTH) % WRAP_WIDTH) + WRAP_MIN_X;
}

export function createGameState(bestScore = 0): GameState {
  const safeBest = Math.max(0, Math.floor(bestScore));
  return {
    player: { x: 0, lane: 0 },
    lanes: createLanes(-LANE_BEHIND, LANES_AHEAD),
    score: 0,
    bestScore: safeBest,
    phase: "ready",
    elapsed: 0,
  };
}

export function movePlayer(state: GameState, direction: GameDirection): GameState {
  if (state.phase === "paused" || state.phase === "gameover") return state;

  const player = { ...state.player };
  switch (direction) {
    case "forward":
      player.lane += 1;
      break;
    case "back":
      player.lane = Math.max(0, player.lane - 1);
      break;
    case "left":
      player.x = Math.max(GRID_MIN_X, player.x - 1);
      break;
    case "right":
      player.x = Math.min(GRID_MAX_X, player.x + 1);
      break;
  }

  const score = Math.max(state.score, player.lane);
  return {
    ...state,
    player,
    lanes: ensureLanes({ ...state, player }),
    score,
    bestScore: Math.max(state.bestScore, score),
    phase: "playing",
  };
}

export function stepGame(state: GameState, deltaSeconds: number): GameState {
  if (state.phase !== "playing" || deltaSeconds <= 0) return state;
  const delta = Math.min(deltaSeconds, 0.05);
  const lanes = state.lanes.map((lane) => ({
    ...lane,
    hazards: lane.hazards.map((hazard) => ({
      ...hazard,
      x: wrapX(hazard.x + lane.direction * lane.speed * delta),
    })),
  }));

  let player = { ...state.player };
  const currentLane = lanes.find((lane) => lane.index === player.lane);
  let phase: GamePhase = "playing";

  if (currentLane?.kind === "road" && isOnHazard(player.x, currentLane.hazards)) {
    phase = "gameover";
  } else if (currentLane?.kind === "river") {
    const raft = isOnHazard(player.x, currentLane.hazards);
    if (!raft) {
      phase = "gameover";
    } else {
      player.x += currentLane.direction * currentLane.speed * delta;
      if (player.x < GRID_MIN_X - 0.4 || player.x > GRID_MAX_X + 0.4) {
        phase = "gameover";
      }
    }
  }

  const next: GameState = {
    ...state,
    player,
    lanes: ensureLanes({ ...state, player }),
    phase,
    elapsed: state.elapsed + delta,
    bestScore: Math.max(state.bestScore, state.score),
  };
  return next;
}

export function setGamePhase(state: GameState, phase: GamePhase): GameState {
  if (state.phase === "gameover") return state;
  if (phase === "paused" && state.phase !== "playing") return state;
  if (phase === "playing" && state.phase !== "paused" && state.phase !== "ready") return state;
  return { ...state, phase };
}

export function resetGame(bestScore = 0): GameState {
  return createGameState(bestScore);
}
