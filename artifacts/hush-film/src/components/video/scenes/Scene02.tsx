import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene02() {
  const [copy, setCopy] = useState(0);
  const [keyBuilt, setKeyBuilt] = useState(false);
  const [handoff, setHandoff] = useState(false);
  useSceneTimer([
    { time: 1850, callback: () => setCopy(1) },
    { time: 2550, callback: () => setKeyBuilt(true) },
    { time: 3300, callback: () => setCopy(2) },
    { time: 4480, callback: () => setHandoff(true) },
  ]);

  return (
    <motion.section
      className="film-stage"
      style={{ background: '#F2EBDC', color: '#14221B' }}
      initial={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, rotate: -1.2, transition: { duration: 0.4, ease: 'easeInOut' } }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0, background: '#0D1713', transformOrigin: 'right center' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: handoff ? 1 : 0 }}
        transition={{ duration: 0.62, ease: EASE }}
      />
      <div className="film-safe">
        <motion.div className="film-mono" style={{ position: 'absolute', top: '9%', left: 0, color: '#8A6030', fontSize: '1.8vmin' }}
          initial={{ opacity: 0 }} animate={{ opacity: handoff ? 0 : 1 }} transition={{ duration: 0.2 }}>
          THE ROOM KEY
        </motion.div>
        <div style={{ position: 'absolute', left: 0, top: '22%', width: '42%', zIndex: 4 }}>
          <AnimatePresence mode="sync">
            <motion.h2
              key={copy}
              className="film-display"
              style={{ margin: 0, color: '#14221B', fontSize: copy === 0 ? '9.5vmin' : '7.2vmin', lineHeight: 0.99, fontWeight: 600 }}
              initial={{ opacity: 0, y: 12, letterSpacing: '.02em' }}
              animate={{ opacity: handoff ? 0 : 1, y: 0, letterSpacing: '-.045em' }}
              exit={{ opacity: 0, y: -9, transition: { duration: 0.15, ease: 'easeInOut' } }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {copy === 0 ? 'NO PROFILE.' : copy === 1 ? 'No account to make.' : 'A temporary name is enough.'}
            </motion.h2>
          </AnimatePresence>
          <motion.div style={{ marginTop: '2.7vmin', height: '1px', width: '32%', background: '#D9A15A', transformOrigin: 'left' }}
            initial={{ scaleX: 0 }} animate={{ scaleX: handoff ? 0 : 1 }} transition={{ delay: 0.6, duration: 0.5, ease: EASE }} />
        </div>

        <motion.div
          style={{ position: 'absolute', right: '4%', top: '14%', width: '47%', height: '70%', zIndex: 3, transformOrigin: 'center' }}
          initial={{ scale: 0.92, rotate: -3, opacity: 0 }}
          animate={{ scale: handoff ? 0.72 : 1, rotate: handoff ? 0 : 0, opacity: handoff ? 0 : 1 }}
          transition={{ duration: 0.72, ease: EASE }}
        >
          <motion.div
            style={{ position: 'absolute', inset: '5% 8%', border: '1px solid rgba(20,34,27,.25)', borderRadius: '2vmin' }}
            initial={{ rotateY: 0, opacity: 0.92 }}
            animate={{ rotateY: keyBuilt ? -90 : 0, opacity: keyBuilt ? 0.16 : 0.9 }}
            transition={{ duration: 0.65, ease: EASE }}
          />
          <motion.div
            style={{ position: 'absolute', left: '21%', top: '21%', width: '13vmin', height: '13vmin', border: '1.4vmin solid #73C98F', borderRadius: '50%', zIndex: 2 }}
            initial={{ scale: 0.82, opacity: 0.92 }}
            animate={{ scale: keyBuilt ? 1 : 0.82, opacity: keyBuilt ? 1 : 0.88 }}
            transition={{ duration: 0.72, ease: EASE }}
          />
          <motion.svg
            viewBox="0 0 540 350"
            style={{ position: 'absolute', inset: '7% 0 0', width: '100%', height: '100%', overflow: 'visible' }}
            animate={{ rotate: handoff ? -7 : 0, scale: handoff ? 1.12 : 1, x: handoff ? '8%' : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <motion.path
              d="M185 99 H440 V136 H370 V161 H425 V198 H370 V224 H440 V261 H185"
              fill="none" stroke="#14221B" strokeWidth="22" strokeLinecap="square" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: keyBuilt ? 1 : 0, opacity: keyBuilt ? 1 : 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            />
            <motion.circle cx="135" cy="180" r="65" fill="none" stroke="#14221B" strokeWidth="22"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: keyBuilt ? 1 : 0.88, opacity: keyBuilt ? 1 : 0 }}
              transition={{ duration: 0.65, ease: EASE }} />
          </motion.svg>
          <motion.div className="film-mono" style={{ position: 'absolute', right: '0%', bottom: '4%', fontSize: '1.65vmin', color: '#8A6030' }}
            initial={{ opacity: 0 }} animate={{ opacity: keyBuilt && !handoff ? 1 : 0 }} transition={{ duration: 0.35 }}>
            ROOM KEY / SHARE DIRECTLY
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
