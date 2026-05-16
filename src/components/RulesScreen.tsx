import { ArrowLeft } from 'lucide-react';

interface RulesScreenProps {
  onBack: () => void;
}

export const RulesScreen = ({ onBack }: RulesScreenProps) => {
  return (
    <div className="w-full flex justify-center min-h-screen items-center bg-[#050508] p-4 font-['VT323']">
      <div className="max-w-3xl w-full bg-slate-900 border-2 border-slate-700 p-8 rounded-xl relative shadow-[0_0_40px_rgba(34,211,238,0.1)]">
        
        {/* Scanlines inside card */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-30 mix-blend-overlay pointer-events-none rounded-xl" />

        <div className="relative z-10 flex flex-col items-start text-slate-300 text-xl md:text-2xl leading-relaxed">
          
          <button 
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="tracking-widest">RETURN</span>
          </button>

          <h2 className="text-4xl text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">HOW NOT TO DIE</h2>
          
          <ul className="list-disc pl-8 space-y-4 mb-8">
            <li>
              <strong className="text-rose-400">DEFAULT MODE:</strong> Endless run. Start on EASY, climb to INSANE, and keep your score alive. Lose the run and the streak is gone.
            </li>
            <li>
              <strong className="text-emerald-400">CASUAL MODE:</strong> Pick a difficulty and stay there. Good for practice, warmups, and quick rounds.
            </li>
            <li>
              <strong className="text-yellow-400">SCORING:</strong> Easy +1, Normal +3, Hard +7, Insane +15.
              <br/><span className="text-cyan-300 text-lg mt-1 block">FLAWLESS BONUS: Solve with zero mistakes and the round score doubles.</span>
            </li>
            <li>
              <strong className="text-purple-400">CLUES:</strong> Clues rotate during the round. Read fast, guess smarter.
            </li>
            <li>
              <strong className="text-amber-400">HINTS:</strong> The lightbulb gives a direct hint. Cost: 2 points.
            </li>
            <li>
              <strong className="text-rose-300">LIVES:</strong> Default mode gives 5 hearts. A failed word costs one. INSANE skips hearts.
            </li>
          </ul>

          <p className="text-center w-full text-slate-500 animate-pulse text-lg">INSERT COIN TO CONTINUE</p>

        </div>
      </div>
    </div>
  );
};
