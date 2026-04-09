import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../utils/audio';
import HangmanIntroURL from '../data/Sound Effects/HangmanIntro.mp3';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDead, setIsDead] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [showRope, setShowRope] = useState(false);
  const [phase, setPhase] = useState<'body' | 'text' | 'byMayuk' | 'done'>('body');

  const accent = isDead ? '#ef4444' : '#22d3ee';
  const glow = isDead ? 'rgba(239,68,68,0.6)' : 'rgba(34,211,238,0.6)';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {});
    }
    sfx.playIntro();

    // timeline of the intro animation (its like a little movie lol):
    //  0.0s  head appears
    //  0.3s  body slides up
    //  0.6s  left leg flies in
    //  0.8s  right leg flies in
    //  1.0s  left arm flies in
    //  1.2s  right arm flies in
    //  1.2s  everything starts swinging
    //  3.0s  rope drops down
    //  4.0s  SNAP - turns red, eyes go X_X
    //  4.3s  rope pulls body up + "HANGMAN" text appears
    //  8.6s  "by mayuk" screen
    // 11.8s  fade to black
    // 12.5s  done, go to menu

    setTimeout(() => setShowRope(true), 3000);
    setTimeout(() => setIsDead(true), 4000);
    setTimeout(() => { setPulling(true); setPhase('text'); }, 4300);
    setTimeout(() => setPhase('byMayuk'), 8600);
    setTimeout(() => setPhase('done'), 11800);
    setTimeout(() => {
      sfx.stopCurrent();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      onComplete();
    }, 12500);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black overflow-hidden pointer-events-none select-none">
      <audio ref={audioRef} src={HangmanIntroURL} preload="auto" />

      {/* those retro TV line effects */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%] opacity-50 mix-blend-overlay" />

      {/* ============ the hangman figure ============ */}
      {(phase === 'body' || phase === 'text') && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: pulling ? -1200 : 0 }}
          transition={{ duration: 0.7, ease: [0.55, 0, 1, 0.45] }}
        >
          <svg
            viewBox="0 0 200 280"
            className="w-[35vh] h-[52vh]"
            style={{ overflow: 'visible', filter: `drop-shadow(0 0 15px ${glow})` }}
          >
            {/* ---- HEAD ---- */}
            {/* bounces in with a springy effect, wobbles when other parts appear */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1, opacity: 1,
                y: [0, 0, -5, 0, 3, 0, -2, 0, 1, 0]
              }}
              transition={{
                scale: { type: 'spring', stiffness: 500, damping: 8 },
                opacity: { duration: 0.05 },
                y: { duration: 3, delay: 0.35, ease: 'easeOut' }
              }}
            >
              {/* little spark lines when the head pops in */}
              <motion.g
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
              >
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
                  <line key={a} x1="100" y1="6" x2="100" y2="-4" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 100 40)`} />
                ))}
              </motion.g>

              <circle cx="100" cy="40" r="24" fill="none" stroke={accent} strokeWidth="8" />

              {/* X_X eyes when it dies */}
              {isDead && (
                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 800, damping: 15 }}>
                  <g stroke={accent} strokeWidth="3.5" strokeLinecap="round">
                    <line x1="87" y1="32" x2="95" y2="40" /><line x1="95" y1="32" x2="87" y2="40" />
                    <line x1="105" y1="32" x2="113" y2="40" /><line x1="113" y1="32" x2="105" y2="40" />
                  </g>
                </motion.g>
              )}
            </motion.g>

            {/* ---- TORSO ---- */}
            {/* lines up perfectly with the bottom of the head (math checks out trust me) */}
            <motion.line
              x1="100" y1="72" x2="100" y2="150"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                y: { type: 'spring', stiffness: 220, damping: 16, delay: 0.3 },
                opacity: { duration: 0.05, delay: 0.3 }
              }}
            />

            {/* ---- LEFT LEG ---- */}
            <motion.line
              x1="96" y1="146" x2="52" y2="226"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              style={{ transformOrigin: '96px 146px' }}
              initial={{ x: -280, y: 280, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: [0, -20, 14, -8, 3, -1, 0] }}
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 14, delay: 0.6 },
                y: { type: 'spring', stiffness: 200, damping: 14, delay: 0.6 },
                opacity: { duration: 0.05, delay: 0.6 },
                rotate: { duration: 2.2, delay: 1.1, ease: 'easeOut' }
              }}
            />

            {/* ---- RIGHT LEG ---- */}
            <motion.line
              x1="104" y1="146" x2="148" y2="226"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              style={{ transformOrigin: '104px 146px' }}
              initial={{ x: 280, y: 280, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: [0, 20, -14, 8, -3, 1, 0] }}
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 14, delay: 0.8 },
                y: { type: 'spring', stiffness: 200, damping: 14, delay: 0.8 },
                opacity: { duration: 0.05, delay: 0.8 },
                rotate: { duration: 2.2, delay: 1.3, ease: 'easeOut' }
              }}
            />

            {/* ---- LEFT ARM ---- */}
            <motion.line
              x1="96" y1="90" x2="42" y2="135"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              style={{ transformOrigin: '96px 90px' }}
              initial={{ x: -280, y: -280, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: [0, 16, -11, 6, -2, 0] }}
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 14, delay: 1.0 },
                y: { type: 'spring', stiffness: 200, damping: 14, delay: 1.0 },
                opacity: { duration: 0.05, delay: 1.0 },
                rotate: { duration: 2, delay: 1.5, ease: 'easeOut' }
              }}
            />

            {/* ---- RIGHT ARM ---- */}
            <motion.line
              x1="104" y1="90" x2="158" y2="135"
              stroke={accent} strokeWidth="8" strokeLinecap="round"
              style={{ transformOrigin: '104px 90px' }}
              initial={{ x: 280, y: -280, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: [0, -16, 11, -6, 2, 0] }}
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 14, delay: 1.2 },
                y: { type: 'spring', stiffness: 200, damping: 14, delay: 1.2 },
                opacity: { duration: 0.05, delay: 1.2 },
                rotate: { duration: 2, delay: 1.7, ease: 'easeOut' }
              }}
            />

            {/* ---- ROPE + NOOSE ---- */}
            {/* swings in and snaps tight */}
            {showRope && (
              <motion.g
                style={{ transformOrigin: '0px -200px' }}
                initial={{ rotate: -40, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{
                  rotate: { type: 'spring', stiffness: 100, damping: 12 },
                  opacity: { duration: 0.15 }
                }}
              >
                {/* the rope */}
                <motion.line 
                  x1="100" y1="-200" x2="100" 
                  initial={{ y2: 44 }}
                  animate={{ y2: isDead ? 58 : 44 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  stroke="#a1a1aa" strokeWidth="5" strokeLinecap="round" 
                />
                {/* noose tightens when the snap happens */}
                <motion.circle 
                  cx="100" cy="68" 
                  initial={{ r: 24 }}
                  animate={{ 
                    r: isDead ? 10 : 24,
                    strokeWidth: isDead ? 6 : 4
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  fill="none" stroke="#a1a1aa" 
                />
              </motion.g>
            )}
          </svg>
        </motion.div>
      )}

      {/* ============ HANGMAN TEXT ============ */}
      {/* zooms in towards you like its flying at your face */}
      <AnimatePresence>
        {phase === 'text' && (
          <motion.div
            key="hangman-text"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.1, 15], opacity: [0, 1, 0] }}
            transition={{
              duration: 4.3,
              times: [0, 0.15, 1],
              ease: ['easeOut', 'easeIn']
            }}
            className="absolute font-['Press_Start_2P'] text-[8vw] font-bold tracking-widest text-[#e2e8f0] whitespace-nowrap"
            style={{ textShadow: '0 0 20px rgba(139,92,246,0.8), 0 0 60px rgba(34,211,238,0.9)', willChange: 'transform, opacity' }}
          >
            HANGMAN
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ BY MAYUK ============ */}
      <AnimatePresence>
        {phase === 'byMayuk' && (
          <motion.div
            key="by-mayuk"
            initial={{ opacity: 0, scaleX: 0, filter: 'brightness(5)' }}
            animate={{ opacity: 1, scaleX: 1, filter: 'brightness(1)' }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute flex justify-center z-20 items-center w-full h-full"
          >
            <motion.div
              animate={{ x: [0, -8, 8, -4, 0], opacity: [1, 0.7, 1, 0.4, 1] }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="font-['VT323'] text-[12vw] sm:text-[10vw] text-cyan-300 tracking-[0.4em] bg-black/80 px-12 py-2 border-y-[6px] border-cyan-500/60 backdrop-blur-md w-full text-center"
              style={{ boxShadow: '0 0 80px rgba(34,211,238,0.5), inset 0 0 30px rgba(34,211,238,0.2)', textShadow: '-6px 0px 0px rgba(225,29,72,0.9), 6px 0px 0px rgba(59,130,246,0.9)' }}
            >
              BY MAYUK
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

