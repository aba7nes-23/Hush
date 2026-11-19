import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { loadBestScore, saveBestScore } from '@/game/persistence';
import {
  createGameState,
  movePlayer,
  resetGame,
  setGamePhase,
  stepGame,
  type GameDirection,
  type GameState,
} from '@/game/engine';

const KEY_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'back', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
] as const;
function Bird({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.34, 20, 16]} />
        <meshStandardMaterial color="#ef7653" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.77, -0.035]} castShadow>
        <sphereGeometry args={[0.255, 20, 16]} />
        <meshStandardMaterial color="#f28a63" roughness={0.68} />
      </mesh>
      <mesh position={[0.08, 0.84, -0.265]} rotation={[0.14, 0, 0.15]}>
        <coneGeometry args={[0.105, 0.24, 5]} />
        <meshStandardMaterial color="#f3c94f" roughness={0.6} />
      </mesh>
      <mesh position={[-0.095, 0.86, -0.244]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#264a44" />
      </mesh>
      <mesh position={[0.095, 0.86, -0.244]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#264a44" />
      </mesh>
      <mesh position={[-0.12, 0.13, 0.02]}>
        <boxGeometry args={[0.075, 0.23, 0.09]} />
        <meshStandardMaterial color="#e9ae43" />
      </mesh>
      <mesh position={[0.12, 0.13, 0.02]}>
        <boxGeometry args={[0.075, 0.23, 0.09]} />
        <meshStandardMaterial color="#e9ae43" />
      </mesh>
    </group>
  );
}

function RoadCar({ x, z, width, kind, color }: { x: number; z: number; width: number; kind: string; color: string }) {
  const truck = kind === 'truck';
  const bodyWidth = Math.max(width, truck ? 1.7 : 1.15);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, truck ? 0.45 : 0.35, 0]} castShadow>
        <boxGeometry args={[bodyWidth, truck ? 0.64 : 0.48, 0.76]} />
        <meshStandardMaterial color={color} roughness={0.48} />
      </mesh>
      <mesh position={[0, truck ? 0.76 : 0.61, 0.035]}>
        <boxGeometry args={[bodyWidth * 0.48, 0.3, 0.55]} />
        <meshStandardMaterial color={truck ? '#f0d28f' : '#c6e4dc'} roughness={0.35} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * bodyWidth * 0.32, 0.17, 0.29]}>
          <boxGeometry args={[0.25, 0.14, 0.08]} />
          <meshStandardMaterial color="#f6d36c" emissive="#f6d36c" emissiveIntensity={0.12} />
        </mesh>
      ))}
      {[-1, 1].map((side) => [-1, 1].map((front) => (
        <mesh key={`${side}-${front}`} position={[side * bodyWidth * 0.34, 0.15, front * 0.27]}>
          <cylinderGeometry args={[0.14, 0.14, 0.11, 12]} />
          <meshStandardMaterial color="#344b47" />
        </mesh>
      )))}
    </group>
  );
}

function LaneScene({ game }: { game: GameState }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, -2.5);
    camera.updateProjectionMatrix();
  }, [camera]);
  const relativeLanes = useMemo(() => game.lanes.filter((lane) => lane.index >= game.player.lane - 3 && lane.index <= game.player.lane + 10), [game.lanes, game.player.lane]);
  return (
    <>
      <color attach="background" args={['#a9d9d2']} />
      <fog attach="fog" args={['#a9d9d2', 11, 25]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[-4, 10, 7]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={['#fff3d2', '#759b7d', 0.58]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, -2]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#8fc8bf" roughness={1} />
      </mesh>
      {relativeLanes.map((lane) => {
        const z = game.player.lane - lane.index;
        const isRoad = lane.kind === 'road';
        const isRiver = lane.kind === 'river';
        const surface = isRoad ? '#535d59' : isRiver ? '#72b9b6' : (lane.index % 2 ? '#8ac878' : '#91cf7d');
        return (
          <group key={lane.index} position={[0, 0, z]}>
            <mesh position={[0, -0.09, 0]}>
              <boxGeometry args={[13.5, 0.18, 0.98]} />
              <meshStandardMaterial color={surface} roughness={isRiver ? 0.34 : 0.92} />
            </mesh>
            {isRoad && [-3.9, -1.3, 1.3, 3.9].map((x) => (
              <mesh key={x} position={[x, 0.012, 0]}>
                <boxGeometry args={[0.72, 0.018, 0.045]} />
                <meshStandardMaterial color="#ddcf9a" />
              </mesh>
            ))}
            {isRiver && <mesh position={[0, 0.015, 0]}><boxGeometry args={[13.5, 0.018, 0.98]} /><meshStandardMaterial color="#83c9c5" transparent opacity={0.62} /></mesh>}
            {!isRoad && !isRiver && [-1, 1].map((side) => (
              <group key={side} position={[side * 5.8, 0, 0]}>
                <mesh position={[0, 0.37, 0]} castShadow>
                  <cylinderGeometry args={[0.34, 0.52, 0.72, 7]} />
                  <meshStandardMaterial color={lane.index % 2 ? '#4f9e72' : '#579d70'} />
                </mesh>
                <mesh position={[0, 0.82, 0]} castShadow>
                  <sphereGeometry args={[0.58, 9, 7]} />
                  <meshStandardMaterial color={lane.index % 2 ? '#75b96f' : '#6eae68'} />
                </mesh>
              </group>
            ))}
            {lane.hazards.map((hazard) => {
              const hx = hazard.x;
              if (hazard.kind === 'car' || hazard.kind === 'truck') {
                return <RoadCar key={hazard.id} x={hx} z={0} width={hazard.width} kind={hazard.kind} color={hazard.color} />;
              }
              if (hazard.kind === 'log') {
                return (
                  <group key={hazard.id} position={[hx, 0.12, 0]}>
                    <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.3, 0.3, Math.max(hazard.width, 1), 10]} />
                      <meshStandardMaterial color={hazard.color || '#956641'} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.18, 0.18, Math.max(hazard.width - 0.12, 0.7), 10]} />
                      <meshStandardMaterial color="#bd8b58" roughness={0.7} />
                    </mesh>
                  </group>
                );
              }
              return (
                <group key={hazard.id} position={[hx, 0.15, 0]}>
                  <mesh castShadow><sphereGeometry args={[0.42, 14, 9]} /><meshStandardMaterial color={hazard.color || '#75a979'} roughness={0.72} /></mesh>
                  <mesh position={[0, 0.17, -0.29]}><sphereGeometry args={[0.22, 12, 9]} /><meshStandardMaterial color="#8fc28b" /></mesh>
                </group>
              );
            })}
          </group>
        );
      })}
      <Bird position={[game.player.x, 0.02, 0]} />
    </>
  );
}

function GameLoop({ gameRef, updateGame }: { gameRef: React.MutableRefObject<GameState>; updateGame: (next: GameState) => void }) {
  const [, getControls] = useKeyboardControls();
  const previous = useRef<Record<string, boolean>>({});
  const publishTimer = useRef(0);
  useFrame((_, delta) => {
    const previousPhase = gameRef.current.phase;
    const keys = getControls() as Record<string, boolean>;
    const directions: GameDirection[] = ['forward', 'back', 'left', 'right'];
    let next = gameRef.current;
    let moved = false;
    for (const direction of directions) {
      if (keys[direction] && !previous.current[direction]) {
        if (next.phase === 'ready') next = setGamePhase(next, 'playing');
        if (next.phase === 'playing') {
          next = movePlayer(next, direction);
          moved = true;
        }
      }
      previous.current[direction] = Boolean(keys[direction]);
    }
    if (next.phase === 'playing') next = stepGame(next, Math.min(delta, 0.05));
    gameRef.current = next;
    publishTimer.current += delta;
    if (moved || publishTimer.current > 0.045 || next.phase !== previousPhase) {
      publishTimer.current = 0;
      updateGame(next);
    }
  });
  return null;
}

function GamePageInner() {
  const [game, setGame] = useState<GameState>(() => createGameState(loadBestScore()));
  const gameRef = useRef(game);
  gameRef.current = game;
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const updateGame = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
    if (next.score > bestScore) {
      setBestScore(next.score);
      saveBestScore(next.score);
    }
    if (next.bestScore > bestScore) {
      setBestScore(next.bestScore);
      saveBestScore(next.bestScore);
    }
  }, [bestScore]);

  const startRun = useCallback(() => {
    const fresh = resetGame(bestScore);
    const playing = setGamePhase(fresh, 'playing');
    updateGame(playing);
  }, [bestScore, updateGame]);

  const move = useCallback((direction: GameDirection) => {
    let next = gameRef.current;
    if (next.phase === 'ready') next = setGamePhase(next, 'playing');
    if (next.phase === 'playing') next = movePlayer(next, direction);
    updateGame(next);
  }, [updateGame]);

  const togglePause = useCallback(() => {
    const phase = gameRef.current.phase;
    if (phase === 'playing') updateGame(setGamePhase(gameRef.current, 'paused'));
    else if (phase === 'paused') updateGame(setGamePhase(gameRef.current, 'playing'));
  }, [updateGame]);

  const restart = useCallback(() => {
    updateGame(createGameState(bestScore));
  }, [bestScore, updateGame]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  const overlay = game.phase !== 'playing';
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 28) {
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy < 0 ? 'forward' : 'back');
    }
    setTouchStart(null);
  };

  return (
    <main className="arcade-shell">
      <header className="arcade-topbar">
        <div className="brand-lockup"><span className="brand-mark"><ArrowUp size={19} strokeWidth={3} /></span><span>little<span style={{ color: '#e96e4b' }}>crossing</span></span></div>
        <div className="top-note">A tiny game for the in-between</div>
      </header>
      <section className="arcade-main">
        <div className="arcade-heading">
          <div><div className="eyebrow">The meadow crossing · no rush, just go</div><h1 className="game-title">One more crossing.</h1></div>
          <div className="score-strip">
            <div className="score-box" data-testid="text-live-score"><span className="score-label">This run</span><span className="score-value">{game.score}</span></div>
            <div className="score-box" data-testid="text-best-score"><span className="score-label"><Trophy size={10} style={{ verticalAlign: '-1px', marginRight: 4 }} />Best</span><span className="score-value">{bestScore}</span></div>
          </div>
        </div>
        <div className="game-layout">
          <div
            className="game-frame"
            onTouchStart={(event) => setTouchStart({ x: event.touches[0].clientX, y: event.touches[0].clientY })}
            onTouchEnd={onTouchEnd}
            data-testid="game-scene"
          >
            <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0, 7.4, 8.4], fov: 38 }} gl={{ antialias: true, alpha: false }}>
              <GameLoop gameRef={gameRef} updateGame={updateGame} />
              <LaneScene game={game} />
            </Canvas>
            <div className="scene-wash" />
            <div className="frame-topline">
              <div className="run-chip"><span className="run-dot" />{game.phase === 'playing' ? 'Crossing in progress' : game.phase === 'paused' ? 'Taking a breather' : game.phase === 'gameover' ? 'Run complete' : 'The way is yours'}</div>
              {game.phase === 'playing' && <button className="pause-button" aria-label="Pause game" data-testid="button-pause" onClick={togglePause}><Pause size={15} /></button>}
            </div>
            {overlay && (
              <div className="game-overlay">
                <section className="overlay-card" data-testid="game-state-card">
                  <div className="overlay-kicker">{game.phase === 'ready' ? 'Welcome to the meadow' : game.phase === 'paused' ? 'A little pause' : 'That was a good run'}</div>
                  <h2 className="overlay-title">{game.phase === 'ready' ? <>Ready,<br />little bird?</> : game.phase === 'paused' ? <>Take your<br />time.</> : <>Well crossed.</>}</h2>
                  <p className="overlay-copy">
                    {game.phase === 'ready' ? 'Dodge the traffic, find a log, and see how far your feet can take you.' : game.phase === 'paused' ? 'The road can wait. Pick it up whenever you are ready.' : `You made it across ${game.score} ${game.score === 1 ? 'lane' : 'lanes'}. Fancy another go?`}
                  </p>
                  <button className="primary-action" onClick={game.phase === 'ready' ? startRun : game.phase === 'paused' ? togglePause : restart} data-testid="button-start">
                    {game.phase === 'paused' ? <Play size={17} fill="currentColor" /> : game.phase === 'gameover' ? <RotateCcw size={17} /> : <ArrowUp size={18} strokeWidth={3} />}
                    {game.phase === 'ready' ? 'Start crossing' : game.phase === 'paused' ? 'Back to it' : 'Cross again'}
                  </button>
                  {game.phase === 'gameover' && <div className="helper-line">BEST CROSSING · {bestScore} LANES</div>}
                  {game.phase === 'ready' && <div className="helper-line">USE ARROWS OR WASD TO MOVE</div>}
                </section>
              </div>
            )}
            <div className="touch-pad" aria-label="Touch movement controls">
              <button className="pad-up" onClick={() => move('forward')} aria-label="Move forward" data-testid="button-move-forward"><ArrowUp size={20} /></button>
              <button className="pad-left" onClick={() => move('left')} aria-label="Move left" data-testid="button-move-left"><ArrowLeft size={20} /></button>
              <button className="pad-center" tabIndex={-1} aria-hidden="true" />
              <button className="pad-right" onClick={() => move('right')} aria-label="Move right" data-testid="button-move-right"><ArrowRight size={20} /></button>
              <button className="pad-down" onClick={() => move('back')} aria-label="Move back" data-testid="button-move-back"><ArrowDown size={20} /></button>
            </div>
          </div>
          <aside className="game-sidebar">
            <section className="side-card character-card">
              <div className="character-sun" />
              <svg className="bird-portrait" viewBox="0 0 140 140" role="img" aria-label="Pip the meadow bird">
                <ellipse cx="69" cy="115" rx="35" ry="7" fill="#476b4f" opacity=".16" />
                <ellipse cx="69" cy="79" rx="35" ry="37" fill="#ef7653" />
                <circle cx="69" cy="49" r="27" fill="#f28a63" />
                <path d="M83 49l23 9-22 8z" fill="#f3c94f" />
                <circle cx="60" cy="45" r="3.2" fill="#294741" /><circle cx="77" cy="45" r="3.2" fill="#294741" />
                <path d="M50 79q-20 8-21 24 17 0 33-16M88 80q21 6 24 21-17 3-34-12" fill="#df6547" />
                <path d="M57 109v12m23-12v12" stroke="#dfa542" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <div className="bird-name">Meet Pip</div><div className="bird-tag">Meadow scout</div>
            </section>
            <section className="side-card desktop-controls">
              <h3 className="side-title">Find your way</h3>
              <div className="control-row"><span className="control-label">Move</span><span><kbd className="key-cap">↑</kbd><kbd className="key-cap">←</kbd><kbd className="key-cap">↓</kbd><kbd className="key-cap">→</kbd></span></div>
              <div className="control-row" style={{ marginTop: 13 }}><span className="control-label">Or use</span><span><kbd className="key-cap">W</kbd><kbd className="key-cap">A</kbd><kbd className="key-cap">S</kbd><kbd className="key-cap">D</kbd></span></div>
            </section>
            <section className="side-card desktop-controls">
              <h3 className="side-title">Little reminders</h3>
              <div className="control-label" style={{ lineHeight: 1.6 }}>Logs make good bridges. Turtles have their own plans. Keep looking ahead.</div>
            </section>
          </aside>
        </div>
        <footer className="arcade-foot"><span>MADE FOR A QUICK BREATHER</span><button className="play-again-mini" onClick={restart} data-testid="button-new-run">Start fresh</button><span>ESC / P TO PAUSE</span></footer>
      </section>
    </main>
  );
}

export default function GamePage() {
  return <KeyboardControls map={KEY_MAP as any}><GamePageInner /></KeyboardControls>;
}
