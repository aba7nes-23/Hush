import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  VideoCanvas,
  VideoPausedContext,
  type VideoAspectRatio,
  useVideoPlayer,
} from '@/lib/video';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';
import { Scene03 } from './scenes/Scene03';
import { Scene04 } from './scenes/Scene04';
import { Scene05 } from './scenes/Scene05';

export const SCENE_DURATIONS = {
  scene01: 4800,
  scene02: 4800,
  scene03: 4800,
  scene04: 4800,
  scene05: 4800,
};

export const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';

const SCENE_COMPONENTS = {
  scene01: Scene01,
  scene02: Scene02,
  scene03: Scene03,
  scene04: Scene04,
  scene05: Scene05,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const result: Record<string, number> = {};
  let elapsed = 0;
  for (const [key, duration] of Object.entries(SCENE_DURATIONS)) {
    result[key] = elapsed / 1000;
    elapsed += duration;
  }
  return result;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop, paused });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey as keyof typeof SCENE_COMPONENTS];
  const keyedStart = useMemo(() => SCENE_START_SEC[baseSceneKey] ?? 0, [baseSceneKey]);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    if (paused) {
      audio.pause();
      return;
    }
    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      if (Math.abs(audio.currentTime - keyedStart) > AUDIO_SEEK_EPSILON_SEC) {
        audio.currentTime = keyedStart;
      }
    }
    audio.play().catch(() => {});
  }, [baseSceneKey, currentSceneKey, keyedStart, muted, paused]);

  return (
    <>
      <VideoPausedContext.Provider value={paused}>
        <VideoCanvas
          aspectRatio={VIDEO_ASPECT_RATIO}
          className="film-stage"
          style={{ backgroundColor: 'var(--color-bg-light)' }}
        >
          <AnimatePresence mode="sync" initial={false}>
            {SceneComponent ? <SceneComponent key={currentSceneKey} /> : null}
          </AnimatePresence>
        </VideoCanvas>
      </VideoPausedContext.Provider>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </>
  );
}
