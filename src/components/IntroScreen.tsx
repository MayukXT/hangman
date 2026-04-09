import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onComplete: () => void;
}

export const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // A much more cinematic, epic timing sequence
    setTimeout(() => setPhase(1), 2400); // 2.4s: HANGMAN zooms past camera
    setTimeout(() => setPhase(2), 2600); // 2.6s: Giant A Drops into background
    setTimeout(() => setPhase(3), 3400); // 3.4s: "VISUAL" smashes the screen
    setTimeout(() => setPhase(4), 4200); // 4.2s: "MASTERPIECE" smashes below it
    setTimeout(() => setPhase(5), 5500); // 5.5s: "BY MAYUK" cuts across the center like an alarm
    setTimeout(() => setPhase(6), 8500); // 8.5s: Start fade out
    setTimeout(onComplete, 9500); // 9.5s: Done
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#000] overflow-hidden pointer-events-none select-none">
      
      {/* VCR / CRT Heavy Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%] opacity-50 mix-blend-overlay" />

      {/* PHASE 1: HANGMAN FLY-THROUGH */}
      <AnimatePresence>
        {phase < 1 && (
          <motion.div
            key="hangman-title"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ 
              scale: [0.1, 1, 35], // Fly all the way OUT past the camera
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2.4, 
              times: [0, 0.6, 1], // Pause slightly at 1, then rip forward
              ease: "easeIn" 
            }}
            className="absolute font-['Press_Start_2P'] text-[8vw] font-bold tracking-widest text-[#e2e8f0] whitespace-nowrap"
            style={{
              textShadow: '0 0 20px rgba(139,92,246,0.8), 0 0 60px rgba(34,211,238,0.9)',
              willChange: 'transform, opacity'
            }}
          >
            HANGMAN
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* PHASE 2-5: The Full-Screen Masterpiece sequence */}
        {(phase >= 2 && phase < 6) && (
          <motion.div 
            key="cinematic-container"
            className="absolute inset-0 flex flex-col items-center justify-center w-full h-full"
            exit={{ 
              opacity: 0, 
              scale: 1.1,
              filter: 'brightness(3) blur(20px)',
              transition: { duration: 0.8, ease: "easeIn" }
            }}
            style={{ willChange: 'transform, opacity, filter' }}
          >
            
            {/* The massive background 'A' */}
            <AnimatePresence>
              {phase >= 2 && phase < 5 && (
                <motion.div
                  key="giant-a"
                  initial={{ opacity: 0, scale: 3, rotate: -10 }}
                  animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
                  transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
                  className="absolute font-['Orbitron'] font-black italic text-white uppercase leading-none"
                  style={{ fontSize: '130vh', textShadow: '0 0 100px rgba(255,255,255,0.4)', willChange: 'transform, opacity' }}
                >
                  A
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase < 5 && (
                <motion.div 
                  key="words-container"
                  className="relative z-10 flex flex-col items-center justify-center w-full px-4 -mt-10"
                  exit={{ opacity: 0, scale: 1.2, filter: 'blur(15px)', transition: { duration: 0.4, ease: "easeIn" } }}
                >
                  
                  {/* VISUAL and MASTERPIECE mounted together so layout is locked, preventing jumping */}
                  {phase >= 3 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: -100, scale: 1.2, rotateX: 90 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        transition={{ type: "spring", bounce: 0.4, duration: 1 }}
                        className="font-['Orbitron'] font-black text-[22vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-rose-500 to-rose-900 uppercase tracking-tighter"
                        style={{ 
                          WebkitTextStroke: '2px rgba(225,29,72,0.8)',
                          textShadow: '0 30px 60px rgba(225,29,72,0.5)',
                          willChange: 'transform, opacity'
                        }}
                      >
                        VISUAL
                      </motion.div>

                      {/* MASTERPIECE - Triggers animation on phase 4, but reserves space instantly */}
                      <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={phase >= 4 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                        className="font-['Press_Start_2P'] text-[7vw] text-amber-400 mt-2 tracking-tight text-center whitespace-nowrap"
                        style={{
                          textShadow: '0 10px 40px rgba(251,191,36,0.6), 0 0 15px rgba(251,191,36,0.9)',
                          willChange: 'transform, opacity'
                        }}
                      >
                        MASTERPIECE
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* BY MAYUK - Cuts isolated across the screen */}
            {phase >= 5 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0, filter: 'brightness(5)' }}
                animate={{ opacity: 1, scaleX: 1, filter: 'brightness(1)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute flex justify-center z-20 items-center w-full"
              >
                <motion.div
                  animate={{ 
                    x: [0, -8, 8, -4, 0],
                    opacity: [1, 0.7, 1, 0.4, 1]
                  }}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  className="font-['VT323'] text-[12vw] sm:text-[10vw] text-cyan-300 tracking-[0.4em] bg-black/80 px-12 py-2 border-y-[6px] border-cyan-500/60 backdrop-blur-md w-full text-center"
                  style={{ 
                    boxShadow: '0 0 80px rgba(34,211,238,0.5), inset 0 0 30px rgba(34,211,238,0.2)',
                    textShadow: '-6px 0px 0px rgba(225,29,72,0.9), 6px 0px 0px rgba(59,130,246,0.9)',
                    willChange: 'transform, opacity, filter'
                  }}
                >
                  BY MAYUK
                </motion.div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
