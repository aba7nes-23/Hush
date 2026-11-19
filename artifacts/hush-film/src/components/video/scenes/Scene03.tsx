import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene03() {
  const [explain, setExplain] = useState(false);
  const [memory, setMemory] = useState(false);
  const [caveat, setCaveat] = useState(false);
  const [push, setPush] = useState(false);
  useSceneTimer([
    { time: 1750, callback: () => setExplain(true) },
    { time: 2850, callback: () => setMemory(true) },
    { time: 3450, callback: () => setCaveat(true) },
    { time: 4500, callback: () => setPush(true) },
  ]);

  return (
    <motion.section
      className="film-stage"
      style={{ background: '#0D1713', color: '#E7F0E9' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.36, ease: 'easeInOut' } }}
    >
      <div className="film-safe">
        <motion.div
          style={{ position: 'absolute', inset: '13% 3% 12% 43%', border: '1px solid #2B4033', borderRadius: '1.1vmin', background: 'rgba(20,34,27,.85)', transformOrigin: 'center' }}
          initial={{ x: '5%', opacity: 0, scale: 0.97 }}
          animate={{ x: push ? '-2%' : 0, opacity: push ? 0 : 1, scale: push ? 1.65 : 1 }}
          transition={{ duration: push ? 0.78 : 0.62, ease: EASE }}
        >
          <div style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3%', borderBottom: '1px solid #2B4033' }}>
            <span className="film-mono" style={{ fontSize: '1.8vmin', color: '#E7F0E9' }}>hush://room</span>
            <span className="film-mono" style={{ fontSize: '1.5vmin', color: '#9BAEA0' }}>● &nbsp;2 here</span>
          </div>
          <div style={{ position: 'relative', height: '90%', padding: '5% 5%' }}>
            <motion.div
              style={{ position: 'absolute', left: '7%', top: '15%', maxWidth: '53%', padding: '2.1vmin 2.5vmin', borderRadius: '1.2vmin 1.2vmin 1.2vmin .3vmin', background: '#73C98F', color: '#08110D', fontSize: '2.7vmin', fontFamily: 'var(--font-body)' }}
              initial={{ scale: 0.72, opacity: 0, y: 14 }}
              animate={{ scale: push ? 0.9 : 1, opacity: push ? 0 : 1, y: 0 }}
              transition={{ delay: 0.33, duration: 0.5, ease: EASE }}
            >
              You made it.
            </motion.div>
            <motion.div
              style={{ position: 'absolute', right: '7%', top: '39%', maxWidth: '53%', padding: '2.1vmin 2.5vmin', borderRadius: '1.2vmin 1.2vmin .3vmin 1.2vmin', background: '#1C3025', border: '1px solid #385344', color: '#E7F0E9', fontSize: '2.7vmin', fontFamily: 'var(--font-body)' }}
              initial={{ rotateY: 12, scale: 0.86, opacity: 0, x: 18 }}
              animate={{ rotateY: 0, scale: push ? 0.9 : 1, opacity: push ? 0 : 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.55, ease: EASE }}
            >
              I’m here.
            </motion.div>
            <motion.div style={{ position: 'absolute', bottom: '13%', left: '7%', width: '22%', height: '1px', background: '#D9A15A', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }} animate={{ scaleX: memory ? 0.7 : 1 }} transition={{ delay: 1.15, duration: memory ? 0.35 : 0.7, ease: EASE }} />
            <motion.span className="film-mono" style={{ position: 'absolute', bottom: '8%', left: '7%', color: '#9BAEA0', fontSize: '1.4vmin' }}
              initial={{ opacity: 0 }} animate={{ opacity: memory ? 1 : 0.75, scale: memory ? 1.02 : 1 }} transition={{ delay: 1.35, duration: 0.35 }}>
              IN MEMORY / ON THIS DEVICE
            </motion.span>
          </div>
        </motion.div>

        <motion.div style={{ position: 'absolute', left: '0%', top: '25%', width: '34%', zIndex: 5 }}
          animate={{ opacity: explain || push ? 1 : 0, x: explain ? 0 : -16 }}>
          <motion.h2 className="film-display" style={{ margin: 0, fontSize: '7.4vmin', lineHeight: 1.02, color: '#E7F0E9' }}
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: explain && !push ? 1 : 0, clipPath: explain ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
            transition={{ duration: 0.56, ease: EASE }}>
            Messages live in memory.
          </motion.h2>
          <motion.p className="film-body" style={{ margin: '2vmin 0 0', color: '#D9A15A', fontSize: '2.1vmin', lineHeight: 1.35, maxWidth: '30vmin' }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: caveat && !push ? 1 : 0, y: caveat ? 0 : 8 }}
            transition={{ duration: 0.4, ease: EASE }}>
            Recipients can still keep what they receive.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}
