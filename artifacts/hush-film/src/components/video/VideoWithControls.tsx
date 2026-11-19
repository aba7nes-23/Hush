import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const SCENE_DETAILS: Record<string, { title: string; filePath: string }> = {
  scene01: { title: 'A little space', filePath: 'src/components/video/scenes/Scene01.tsx' },
  scene02: { title: 'No profile', filePath: 'src/components/video/scenes/Scene02.tsx' },
  scene03: { title: 'A room, not an inbox', filePath: 'src/components/video/scenes/Scene03.tsx' },
  scene04: { title: 'Clear, with honest limits', filePath: 'src/components/video/scenes/Scene04.tsx' },
  scene05: { title: 'Hush', filePath: 'src/components/video/scenes/Scene05.tsx' },
};

function announceSceneSelection(index: number, sceneKeys: string[]) {
  const key = sceneKeys[index];
  const details = SCENE_DETAILS[key];
  if (!details?.filePath) return;
  window.parent.postMessage({
    type: 'REPLIT_VIDEO_SCENE_SELECTED',
    payload: { sceneIndex: index, sceneCount: sceneKeys.length, sceneTitle: details.title || key, filePath: details.filePath, lineNumber: 1 },
  }, '*');
}

function formatPlaybackTime(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
}

function PlaybackStatus({
  sceneKeys, activeIndex, activeDuration, activeStartTime, totalDuration, tick, paused, onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  activeStartTime: number;
  totalDuration: number;
  tick: number;
  paused: boolean;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedBaseRef = useRef(0);

  useEffect(() => {
    setElapsed(0);
    elapsedBaseRef.current = 0;
  }, [tick]);

  useEffect(() => {
    if (paused) return undefined;
    const startedAt = performance.now();
    const timer = window.setInterval(() => setElapsed(elapsedBaseRef.current + performance.now() - startedAt), 60);
    return () => {
      window.clearInterval(timer);
      elapsedBaseRef.current += performance.now() - startedAt;
    };
  }, [tick, paused]);

  const progress = activeDuration ? Math.min(1, elapsed / activeDuration) : 0;
  const totalElapsed = Math.min(totalDuration, activeStartTime + Math.min(elapsed, activeDuration));
  return (
    <>
      <div className="film-progress">
        {sceneKeys.map((key, index) => (
          <button key={key} onClick={() => onJumpTo(index)} aria-label={`Jump to scene ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined}>
            <span style={{ width: `${index < activeIndex ? 100 : index === activeIndex ? progress * 100 : 0}%` }} />
          </button>
        ))}
      </div>
      <span className="film-counter">{activeIndex + 1}/{sceneKeys.length}</span>
      <span className="film-time" role="timer" aria-label={`Playback time ${formatPlaybackTime(totalElapsed)} of ${formatPlaybackTime(totalDuration)}`}>
        {formatPlaybackTime(totalElapsed)} / {formatPlaybackTime(totalDuration)}
      </span>
    </>
  );
}

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;
  const sensorRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const controls = useSceneControls(SCENE_DURATIONS);
  const {
    sceneKeys, activeIndex, locked, paused, mountKey, tick, durations, activeDuration,
    activeStartTime, totalDuration, onSceneChange, jumpTo, toggleLock, togglePause,
  } = controls;

  const handleJumpTo = useCallback((index: number) => {
    jumpTo(index);
    announceSceneSelection(index, sceneKeys);
  }, [jumpTo, sceneKeys]);

  useEffect(() => {
    if (!paused) return undefined;
    const frozen = document.getAnimations().filter((animation) => animation.playState === 'running');
    frozen.forEach((animation) => animation.pause());
    return () => frozen.forEach((animation) => animation.play());
  }, [paused]);

  useEffect(() => {
    if (!(collapsed && tapPinned)) return undefined;
    const onDocumentPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      if (sensorRef.current && !sensorRef.current.contains(event.target as Node)) setTapPinned(false);
    };
    document.addEventListener('pointerdown', onDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown);
  }, [collapsed, tapPinned]);

  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      if (!value) { setHovering(false); setTapPinned(false); }
      return !value;
    });
  }, []);

  if (!isIframed) return <VideoTemplate />;
  const visible = !collapsed || hovering || tapPinned;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop
        paused={paused}
        muted={muted}
        onSceneChange={onSceneChange}
      />
      <div
        ref={sensorRef}
        className="film-control-sensor"
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovering(true); }}
        onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovering(false); }}
        onPointerDown={(event) => { if (event.pointerType !== 'mouse' && collapsed) setTapPinned(true); }}
      >
        <div style={{ flex: 1, width: '100%' }} aria-hidden="true" />
        <div className={`film-control-bar${visible ? '' : ' is-hidden'}`} aria-hidden={!visible}>
          <button className="film-control-button" onClick={togglePause} aria-label={paused ? 'Play' : 'Pause'} title={paused ? 'Play' : 'Pause'}>
            {paused ? <Play size={23} /> : <Pause size={23} />}
          </button>
          <button className="film-control-button" onClick={toggleLock} aria-label={locked ? 'Loop current scene: on' : 'Loop current scene: off'} title={locked ? 'Loop current scene: on' : 'Loop current scene: off'} aria-pressed={locked}>
            <Repeat size={22} />
          </button>
          <button className="film-control-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted}>
            {muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>
          <div className="film-control-divider" aria-hidden="true" />
          <PlaybackStatus
            sceneKeys={sceneKeys}
            activeIndex={activeIndex}
            activeDuration={activeDuration}
            activeStartTime={activeStartTime}
            totalDuration={totalDuration}
            tick={tick}
            paused={paused}
            onJumpTo={handleJumpTo}
          />
          <button className="film-control-button" onClick={handleToggleCollapsed} aria-label={collapsed ? 'Show controls' : 'Hide controls'} title={collapsed ? 'Show controls' : 'Hide controls'} aria-expanded={!collapsed}>
            {collapsed ? <ChevronUp size={26} /> : <ChevronDown size={26} />}
          </button>
        </div>
      </div>
    </div>
  );
}
