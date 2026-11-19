import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSceneTimer } from '@/lib/video';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene04() {
  const [caveat, setCaveat] = useState(false);
  const [close, setClose] = useState(false);
  useSceneTimer([
    { time: 1900, callback: () => setCaveat(true) },
    { time: 3500, callback: () => setClose(true) },
  ]);
  return (
    <motion.section className="film-stage" style={{ background: '#F2EBDC', color: '#14221B' }}
      initial={{ opacity: 1 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.4, ease: 'easeInOut' } }}>
      <motion.div style={{ position: 'absolute', inset: 0, background: '#0D1713', clipPath: 'inset(0 0 0 59%)' }}
        animate={{ clipPath: close ? 'inset(0 50% 0 50%)' : 'inset(0 0 0 59%)' }}
        transition={{ duration: 0.6, ease: EASE }} />
      <div className="film-safe">
        <motion.div style={{ position: 'absolute', inset: '0 41% 0 0', overflow: 'hidden' }}
          animate={{ scale: close ? 0.94 : 1, x: close ? '-4%' : 0 }} transition={{ duration: 0.65, ease: EASE }}>
          <motion.h2 className="film-display" style={{ position: 'absolute', top: '19%', left: 0, maxWidth: '52vmin', margin: 0, color: '#14221B', fontSize: '10.2vmin', lineHeight: .96 }}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: close ? -8 : 0 }}
            transition={{ delay: .18, duration: .62, ease: EASE }}>
            {caveat ? 'Not every copy.' : 'Here, for now.'}
          </motion.h2>
          <motion.p className="film-body" style={{ position: 'absolute', left: 0, bottom: '18%', maxWidth: '47vmin', margin: 0, color: '#314438', fontSize: '3vmin', lineHeight: 1.28 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: close ? 0 : 1, y: 0 }}
            transition={{ delay: .9, duration: .48, ease: EASE }}>
            {caveat ? 'Other people can save, copy, or capture what they receive.' : 'Your copy clears when you leave.'}
          </motion.p>
          <motion.div className="film-mono" style={{ position: 'absolute', left: 0, top: '10%', color: '#9B6A36', fontSize: '1.7vmin' }}
            initial={{ opacity: 0 }} animate={{ opacity: close ? 0 : 1 }} transition={{ delay: .28, duration: .35 }}>
            THE HONEST VERSION
          </motion.div>
        </motion.div>

        <motion.div style={{ position: 'absolute', left: '25%', top: '51%', width: '34%', height: '1px', background: '#83D99B', transformOrigin: 'left', zIndex: 2 }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: close ? 0 : 1, opacity: close ? 0 : 0.9 }}
          transition={{ delay: .68, duration: .8, ease: EASE }} />
        <motion.div style={{ position: 'absolute', left: '59%', top: '51%', width: '33%', height: '1px', background: '#83D99B', transformOrigin: 'left', zIndex: 2 }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: close ? 0.18 : 1, opacity: close ? 0.85 : 0.9, x: close ? '-8%' : 0 }}
          transition={{ delay: .82, duration: .8, ease: EASE }} />
        <motion.div style={{ position: 'absolute', left: '90%', top: '50%', width: '2vmin', height: '2vmin', border: '1px solid #83D99B', background: '#0D1713', transformOrigin: 'center', zIndex: 3 }}
          animate={{ scale: close ? 14 : 1, rotate: close ? 45 : 0, x: close ? '-65vmin' : 0, y: close ? '-10vmin' : 0 }}
          transition={{ duration: .8, ease: EASE }} />
        <motion.div className="film-mono" style={{ position: 'absolute', right: '1%', bottom: '8%', color: '#83D99B', fontSize: '1.55vmin' }}
          animate={{ opacity: close ? 0 : .8 }} transition={{ duration: .25 }}>
          YOUR COPY / THE WORLD OUTSIDE
        </motion.div>
      </div>
    </motion.section>
  );
}
