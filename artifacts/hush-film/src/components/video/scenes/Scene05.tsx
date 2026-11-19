import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Scene05() {
  return (
    <motion.section className="film-stage" style={{ background: '#0D1713', color: '#E7F0E9' }}
      initial={{ opacity: 1 }} animate={{ opacity: 1 }}
      exit={{ opacity: 1, transition: { duration: .2, ease: 'easeInOut' } }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '2%' }}>
        <motion.div
          style={{ position: 'relative', width: '28vmin', height: '28vmin', overflow: 'hidden', borderRadius: '5vmin', boxShadow: '0 2.3vmin 8vmin rgba(0,0,0,.28)' }}
          initial={{ scale: 1.08, clipPath: 'inset(50% 0 50% 0)', opacity: 0 }}
          animate={{ scale: 1, clipPath: 'inset(0 0 0 0)', opacity: 1 }}
          transition={{ duration: .74, ease: EASE }}
        >
          <img src={`${import.meta.env.BASE_URL}images/hush-icon.png`} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>
        <motion.div className="film-body" style={{ marginTop: '2.4vmin', fontSize: '8vmin', fontWeight: 600, letterSpacing: '-.08em', lineHeight: .95 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .42, duration: .58, ease: EASE }}>
          hush
        </motion.div>
        <motion.div className="film-display" style={{ marginTop: '1.7vmin', fontSize: '3.35vmin', lineHeight: 1.2, color: '#C7E2CE', fontStyle: 'italic' }}
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
          transition={{ delay: 1.28, duration: .55, ease: EASE }}>
          Private rooms. On your terms.
        </motion.div>
        <motion.div className="film-mono" style={{ position: 'absolute', bottom: '9%', color: '#D9A15A', fontSize: '1.8vmin' }}
          initial={{ opacity: 0, scaleX: .7 }} animate={{ opacity: .9, scaleX: 1 }} transition={{ delay: 3.05, duration: .45, ease: EASE }}>
          NO ACCOUNTS &nbsp;·&nbsp; NO SAVED INBOX
        </motion.div>
      </div>
      <motion.div
        style={{ position: 'absolute', left: 'calc(50% - 2.1vmin)', top: 'calc(50% - 2.1vmin)', width: '1.2vmin', height: '1.2vmin', borderRadius: '50%', background: '#9DFF00', zIndex: 5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1], left: ['50%', '50%', '73%', '73%'], top: ['calc(50% - 9vmin)', 'calc(50% - 9vmin)', '47%', '47%'], scale: [1, 1, .95, 1] }}
        transition={{ times: [0, .83, .97, 1], duration: 4.8, ease: EASE }}
      />
      <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#0D1713' }}
        initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: .36, ease: EASE }} />
    </motion.section>
  );
}
