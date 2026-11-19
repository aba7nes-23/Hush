import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene01() {
  const [line, setLine] = useState(0);
  const [push, setPush] = useState(false);
  useSceneTimer([
    { time: 2480, callback: () => setLine(1) },
    { time: 3950, callback: () => setPush(true) },
  ]);

  return (
    <motion.section
      className="film-stage"
      style={{ background: '#0D1713', color: '#E7F0E9' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.035, transition: { duration: 0.42, ease: 'easeInOut' } }}
      transition={{ duration: 0.3 }}
    >
      <div className="film-safe">
        <motion.div
          className="film-mono"
          style={{ position: 'absolute', top: '8%', left: 0, color: '#D9A15A', fontSize: '1.7vmin' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          HUSH / PRIVATE ROOMS
        </motion.div>

        <div style={{ position: 'absolute', left: '0%', top: '27%', width: '53%', zIndex: 3 }}>
          <motion.div
            className="hairline"
            style={{ position: 'absolute', top: '-8%', left: 0, width: '36%', color: '#73C98F' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.58, ease: EASE }}
          />
          <motion.h1
            className="film-display"
            style={{ margin: 0, fontSize: '10.7vmin', lineHeight: 0.98, color: '#E7F0E9', fontWeight: 400 }}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', skewX: push ? -2 : 0 }}
            transition={{ delay: 0.42, duration: push ? 0.45 : 0.68, ease: EASE }}
          >
            A little
            <br />
            <span style={{ color: '#83D99B', fontStyle: 'italic' }}>space.</span>
          </motion.h1>
          <AnimatePresence mode="sync">
            <motion.p
              key={line}
              className="film-body"
              style={{ margin: '3.2vmin 0 0', maxWidth: '42vmin', fontSize: '3.1vmin', lineHeight: 1.25, color: '#9BAEA0' }}
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              exit={{ opacity: 0, y: -7, transition: { duration: 0.16, ease: 'easeInOut' } }}
              transition={{ delay: line === 0 ? 1.62 : 0, duration: 0.5, ease: EASE }}
            >
              {line === 0 ? 'For the things you mean to say.' : 'No audience. Just your people.'}
            </motion.p>
          </AnimatePresence>
        </div>

        <div style={{ position: 'absolute', left: '73%', top: '47%', width: '1.35vmin', height: '1.35vmin', zIndex: 4 }}>
          <motion.div
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#83D99B' }}
            animate={{ scale: [1, 1.45, 1], opacity: [1, 0.72, 1] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        {[13, 28, 43].map((size, index) => (
          <motion.div
            key={size}
            style={{
              position: 'absolute', left: '73%', top: '47%', width: `${size}vmin`, height: `${size}vmin`,
              border: `1px solid ${index === 0 ? 'rgba(131,217,155,.45)' : 'rgba(131,217,155,.14)'}`,
              borderRadius: '50%', translateX: '-50%', translateY: '-50%', zIndex: 1,
            }}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: push ? 2.4 : [0.9, 1.04, 0.9], opacity: push ? 0.64 : [0.34, 0.6, 0.34] }}
            transition={{ duration: push ? 0.82 : 3.1 + index * 0.35, repeat: push ? 0 : Infinity, ease: EASE, delay: index * 0.12 }}
          />
        ))}
        <motion.div
          className="film-mono"
          style={{ position: 'absolute', bottom: '9%', right: '1%', color: '#687B6D', fontSize: '1.5vmin' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          KEEP THE ROOM SMALL
        </motion.div>
      </div>
    </motion.section>
  );
}
