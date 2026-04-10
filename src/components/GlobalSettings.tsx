import { useState, useRef, useEffect } from 'react';
import { Settings, Volume2, VolumeX, User, Trash2, Palette, ChevronDown, Monitor, Info, ExternalLink, RefreshCw } from 'lucide-react';

const GithubIcon = ({ size, className, style }: { size: number, className?: string, style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { sfx } from '../utils/audio';
import { DangerModal, UpdateWarningModal } from './Modal';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useAccent, AccentColorId } from '../hooks/useWaveAccent';
import { getAccentTokens, APP_VERSION } from '../utils/gameConstants';
import { useGraphics } from '../hooks/useGraphics';
import { type UpdateInfo, checkForUpdate } from '../utils/updater';

interface GlobalSettingsProps {
  isNameEntryActive: boolean;
  onChangeNameClick: () => void;
  onClearData: () => void;
  updateInfo: UpdateInfo | null;
}

const AboutModal = ({ isOpen, onClose, accentColor, updateInfo, onUpdateFound }: { isOpen: boolean; onClose: () => void; accentColor: string; updateInfo: UpdateInfo | null; onUpdateFound: (info: UpdateInfo) => void }) => {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [showUpdateWarning, setShowUpdateWarning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [localUpdateInfo, setLocalUpdateInfo] = useState<UpdateInfo | null>(updateInfo);

  // Reset warning state when modal closes
  useEffect(() => { if (!isOpen) setShowUpdateWarning(false); }, [isOpen]);
  useEffect(() => { setLocalUpdateInfo(updateInfo); }, [updateInfo]);

  const handleManualCheck = async () => {
    setChecking(true);
    const result = await checkForUpdate();
    setChecking(false);
    if (result) {
      setLocalUpdateInfo(result);
      onUpdateFound(result);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      // Fetch GitHub profile picture
      fetch('https://api.github.com/users/MayukXT')
        .then(res => res.json())
        .then(data => {
          if (data.avatar_url) setProfileUrl(data.avatar_url);
        })
        .catch(err => console.error('Failed to fetch github profile:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
    <UpdateWarningModal
      isOpen={showUpdateWarning}
      onClose={() => setShowUpdateWarning(false)}
      onContinue={() => setShowUpdateWarning(false)}
      version={localUpdateInfo?.version || ''}
    />
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative max-w-lg w-full bg-slate-900 border-2 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: accentColor, boxShadow: `0 0 40px ${accentColor}40` }}
      >
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8 border-b border-slate-700 pb-8">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden border-4 bg-slate-800 shadow-lg flex-shrink-0"
              style={{ borderColor: accentColor, boxShadow: `0 0 20px ${accentColor}80` }}
            >
              {profileUrl ? (
                <img src={profileUrl} alt="MayukXT GitHub" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <User size={32} />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="font-['Press_Start_2P'] text-xs text-slate-400 mb-2">DEVELOPED BY</h3>
                <h2 className="font-['Orbitron'] text-3xl font-black tracking-widest text-slate-100">MAYUK</h2>
              </div>
              
              <a 
                href="https://github.com/MayukXT" 
                target="_blank" 
                rel="noreopener noreferrer"
                onClick={(e) => handleExternalLink(e, "https://github.com/MayukXT")}
                className="flex items-center gap-2 font-['VT323'] text-2xl tracking-wider transition-all hover:-translate-y-0.5 group w-fit"
                style={{ 
                  color: accentColor, 
                  textShadow: `0 0 10px ${accentColor}80, 0 0 20px ${accentColor}40` 
                }}
              >
                <GithubIcon 
                  size={20} 
                  className="group-hover:scale-110 transition-transform" 
                  style={{ filter: `drop-shadow(0 0 8px ${accentColor}80)` }} 
                />
                @MayukXT
              </a>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 mb-10">
            <a 
              href="https://github.com/MayukXT/hangman" 
              target="_blank" 
              rel="noreopener noreferrer"
              onClick={(e) => handleExternalLink(e, "https://github.com/MayukXT/hangman")}
              className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 transition-all font-['Orbitron'] group"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="font-bold tracking-wider text-slate-300 group-hover:text-white transition-colors">Open Source Repository</span>
              </div>
              <span className="text-xs text-slate-500 font-bold group-hover:text-slate-400">View Code</span>
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <span className="font-['Press_Start_2P'] text-[10px] text-slate-500">VERSION</span>
                <span className="font-['Orbitron'] font-bold text-slate-300 tracking-wider font-bold">{APP_VERSION}</span>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <span className="font-['Press_Start_2P'] text-[10px] text-slate-500">BUILD DATE</span>
                <span className="font-['Orbitron'] font-bold text-slate-300 tracking-wider">2026-04-10</span>
              </div>
              <div className={`col-span-2 p-4 bg-slate-800/30 rounded-xl border ${localUpdateInfo ? 'border-emerald-500/50' : 'border-slate-700/50'} flex flex-col gap-1`}>
                <span className="font-['Press_Start_2P'] text-[10px] text-slate-500">STATUS</span>
                {localUpdateInfo ? (
                  <div className="flex items-center justify-between">
                    <span className="font-['Orbitron'] font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] tracking-wider text-sm">
                      Update Available — {localUpdateInfo.version}
                    </span>
                    <button
                      onClick={() => setShowUpdateWarning(true)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-['Orbitron'] text-[10px] font-bold rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    >
                      UPDATE
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-['Orbitron'] font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] tracking-wider">Up to Date</span>
                    <button
                      onClick={handleManualCheck}
                      disabled={checking}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-['Orbitron'] text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={10} className={checking ? 'animate-spin' : ''} />
                      {checking ? 'CHECKING...' : 'CHECK'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-4 text-slate-900 font-black font-['Orbitron'] text-xl tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}60` }}
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export const GlobalSettings = ({ isNameEntryActive, onChangeNameClick, onClearData, updateInfo }: GlobalSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [manualUpdateInfo, setManualUpdateInfo] = useState<UpdateInfo | null>(null);
  const effectiveUpdateInfo = manualUpdateInfo ?? updateInfo;

  const settingsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(settingsRef, () => { setIsOpen(false); setIsAccordionOpen(false); });

  const { wave, triggerWave, waveSpeed, setWaveSpeed } = useAccent();
  const { setGraphics, isFancy } = useGraphics();
  const themeTokens = getAccentTokens(wave.color);

  const toggleAudio = () => {
    sfx.toggle(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="absolute top-6 left-6 z-[200]">
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        accentColor={wave.color === 'RED' ? '#ef4444' : wave.color === 'YELLOW' ? '#eab308' : wave.color === 'CYAN' ? '#06b6d4' : wave.color === 'PURPLE' ? '#a855f7' : '#22c55e'}
        updateInfo={effectiveUpdateInfo}
        onUpdateFound={(info) => setManualUpdateInfo(info)}
      />

      <DangerModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          setIsResetModalOpen(false);
          onClearData();
        }}
        title="SYSTEM WIPE"
        description="Last chance, pal. This wipes your name, score, dignity, and all that saved crap. The machine forgets you ever existed. No backup, no recovery, just emptiness."
        requireTyping="reset"
        confirmText="ERASE ME"
      />

      <div className="relative" ref={settingsRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-[52px] h-[52px] bg-slate-900 border-2 border-slate-700 hover:${themeTokens.border} hover:${themeTokens.text} rounded-xl text-gray-400 transition-all shadow-lg active:scale-95 z-50 relative`}
        >
          <Settings size={28} className={`transition-transform duration-500 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        </button>
        
        <div className={`absolute top-full left-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden transition-all duration-300 origin-top-left ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
          <button 
            onClick={toggleAudio}
            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              {isAudioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              SFX
            </div>
            <span className={`font-bold tracking-widest ${isAudioEnabled ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]'}`}>
              {isAudioEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* GRAPHICS MODE TOGGLE */}
          <button
            onClick={() => setGraphics(isFancy ? 'LIGHT' : 'FANCY')}
            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Monitor size={18} />
              Graphics
            </div>
            <span className={`font-bold tracking-widest ${isFancy ? 'text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'text-slate-400'}`}>
              {isFancy ? 'FANCY' : 'LIGHT'}
            </span>
          </button>

          {!isNameEntryActive && (
            <button 
              onClick={() => {
                setIsOpen(false);
                onChangeNameClick();
              }}
              className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center gap-3 text-sm"
            >
              <User size={18} />
              Change Username
            </button>
          )}

          {/* ACCORDION PALETTE */}
          <div className="border-t border-slate-800">
            <button 
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] flex items-center justify-between gap-3 text-sm font-bold group"
            >
              <div className="flex items-center gap-2">
                <Palette size={18} className={`transition-colors group-hover:${themeTokens.text}`} />
                <span className={`group-hover:${themeTokens.text} transition-colors`}>Change Accent</span>
              </div>
              <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${isAccordionOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccordionOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`flex gap-3 justify-center px-5 pt-4 ${!isFancy ? 'pb-4' : ''}`}>
                {(['RED', 'YELLOW', 'CYAN', 'PURPLE', 'GREEN'] as AccentColorId[]).map(color => (
                  <button 
                    key={color}
                    onClick={(e) => triggerWave(color, e.clientX, e.clientY)}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-125 ${getAccentTokens(color).bg} ${wave.color === color ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_currentColor]' : 'opacity-40 hover:opacity-100'}`}
                  />
                ))}
              </div>
              
              {isFancy && (
              <div className="px-5 pb-6 pt-6">
                <div className="flex justify-between items-center mb-3 font-['Orbitron'] text-xs text-slate-400">
                  <span>Wave Speed</span>
                  <span className={`${themeTokens.text} font-bold`}>{waveSpeed}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={waveSpeed}
                  onChange={(e) => setWaveSpeed(Number(e.target.value))}
                  className={`w-full h-2 rounded-lg bg-slate-800 outline-none hover:bg-slate-700 transition-colors accent-current sm:cursor-pointer ${themeTokens.text}`}
                />
              </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => { setIsOpen(false); setIsAboutModalOpen(true); }}
            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-slate-300 transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center gap-3 text-sm"
          >
            <Info size={18} className={themeTokens.text} />
            <span className="font-bold tracking-wider">ABOUT OPTIONS</span>
          </button>

          {!isNameEntryActive && (
            <button 
              onClick={() => { setIsOpen(false); setIsResetModalOpen(true); }}
              className="w-full text-left px-5 py-4 hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 font-bold tracking-wider transition-colors font-['Orbitron'] border-t border-slate-800 flex items-center gap-3 text-sm"
            >
              <Trash2 size={18} />
              RESET APPLICATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
