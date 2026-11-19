import assert from "node:assert/strict";
import {
  createGameState,
  movePlayer,
  resetGame,
  setGamePhase,
  stepGame,
} from "./engine";

const initial = createGameState(12);
assert.equal(initial.phase, "ready");
assert.equal(initial.player.lane, 0);
assert.equal(initial.bestScore, 12);

const firstHop = movePlayer(initial, "forward");
assert.equal(firstHop.player.lane, 1);
assert.equal(firstHop.score, 1);
assert.equal(firstHop.phase, "playing");

const movedRight = movePlayer(firstHop, "right");
assert.equal(movedRight.player.x, 1);
assert.equal(movePlayer(movedRight, "right").player.x, 2);

const paused = setGamePhase(firstHop, "paused");
assert.equal(paused.phase, "paused");
assert.equal(movePlayer(paused, "forward"), paused);
assert.equal(setGamePhase(paused, "playing").phase, "playing");

const advanced = movePlayer({ ...initial, player: { x: 0, lane: 19 } }, "forward");
assert.ok(advanced.lanes.some((lane) => lane.index >= 40), "lanes extend as the player advances");
assert.equal(advanced.bestScore, 20);

const running = stepGame(firstHop, 0.02);
assert.equal(running.phase, "playing");
assert.ok(running.elapsed > 0);
assert.equal(stepGame(paused, 0.05), paused, "paused simulations stay frozen");
assert.equal(resetGame(8).bestScore, 8);

const roadLane = initial.lanes.find((lane) => lane.index === 2);
assert.ok(roadLane);
const trafficCollision = stepGame({
  ...initial,
  player: { x: roadLane.hazards[0].x, lane: roadLane.index },
  phase: "playing",
}, 0.02);
assert.equal(trafficCollision.phase, "gameover", "cars stop a crossing");

const riverLane = initial.lanes.find((lane) => lane.index === 5);
assert.ok(riverLane);
const logPosition = 0;
const riverState = {
  ...initial,
  player: { x: logPosition, lane: riverLane.index },
  phase: "playing" as const,
  lanes: initial.lanes.map((lane) => lane.index === riverLane.index
    ? { ...lane, hazards: [{ ...lane.hazards[0], x: logPosition, width: 2 }] }
    : lane),
};
const ridingLog = stepGame(riverState, 0.04);
assert.equal(ridingLog.phase, "playing", "a log supports the player");
assert.ok(ridingLog.player.x !== logPosition, "the player moves with the log");

const riverGap = {
  ...riverState,
  player: { x: 0, lane: riverLane.index },
  lanes: riverState.lanes.map((lane) => lane.index === riverLane.index
    ? { ...lane, hazards: lane.hazards.map((hazard, index) => ({ ...hazard, x: index === 0 ? -4.5 : 4.5, width: 2 })) }
    : lane),
};
assert.equal(stepGame(riverGap, 0.02).phase, "gameover", "an unsupported river crossing ends the run");

console.log("Game engine checks passed.");
