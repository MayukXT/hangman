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
              <strong className="text-rose-400">DEFAULT MODE (ENDLESS):</strong> Starts easy. Weirdly easy, actually. You'll sail through EASY, fight your way through NORMAL, sweat buckets on HARD, and then INSANE just stares at you and laughs. One wrong word? Score goes to zero and you're back to the menu. No saves, no mercy, no refunds, no do-overs.
            </li>
            <li>
              <strong className="text-emerald-400">CASUAL MODE:</strong> Pick a difficulty and stick with it. No stress, no big deal. Just you, a noose, and that nagging feeling you're probably wasting your time. Good for practice, or when you wanna pretend you're actually decent at this game.
            </li>
            <li>
              <strong className="text-yellow-400">SCORING:</strong> Easy gives +1 (meh), Normal +3 (okay), Hard +7 (getting somewhere), Insane +15 (either you're cheating or you're way better than me). 
              <br/><span className="text-cyan-300 text-lg mt-1 block">⚡ FLAWLESS BONUS: Nail a word with zero mistakes and your score doubles. The game loves violence and perfection equally. But mostly violence.</span>
            </li>
            <li>
              <strong className="text-purple-400">CLUES:</strong> Every word has a clue that rotates in the corner. Basically the game whispering hints in your ear. Go ahead, feel smug about it — you didn't earn shit.
            </li>
            <li>
              <strong className="text-amber-400">HINTS:</strong> Hit the lightbulb for a full hint. Costs 2 points — basically selling your soul to the devil. Less paperwork though, he takes IOUs.
            </li>
            <li>
              <strong className="text-rose-300">LIVES (DEFAULT only):</strong> You get 5 hearts. Screw up a word, lose a heart. Lose 'em all and it's over — for real this time. INSANE skips lives because you're already screwed. Or need therapy. Whatever hits first.
            </li>
          </ul>

          <p className="text-center w-full text-slate-500 animate-pulse text-lg">INSERT COIN TO CONTINUE</p>

        </div>
      </div>
    </div>
  );
};
