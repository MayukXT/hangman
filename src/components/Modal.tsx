import { AlertTriangle, X, Download, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { downloadAndInstallUpdate, isTauriApp, getInstallType, type UpdateProgress, type InstallType } from '../utils/updater';

import type { ReactNode } from 'react';

interface DangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  requireTyping?: string;
  confirmText: string;
  variant?: 'danger' | 'warning';
}

export const DangerModal = ({ isOpen, onClose, onConfirm, title, description, requireTyping, confirmText, variant = 'danger' }: DangerModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose);

  if (!isOpen) return null;

  const isLocked = requireTyping ? inputValue.trim().toLowerCase() !== requireTyping.toLowerCase() : false;

  const isWarning = variant === 'warning';
  
  const borderClass = isWarning ? 'border-amber-900 shadow-[0_0_20px_rgba(180,83,9,0.3)]' : 'border-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.4)]';
  const titleClass = isWarning ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div ref={modalRef} className={`max-w-md w-full bg-slate-900 border-2 ${borderClass} rounded-2xl p-6 animate-in zoom-in-95 duration-200`}>
        
        <div className="flex justify-between items-start mb-4">
          <div className={`flex items-center gap-3 ${titleClass}`}>
            <AlertTriangle size={32} className="animate-pulse" />
            <h2 className="font-['Orbitron'] font-black text-xl tracking-widest">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="text-slate-300 font-['JetBrains_Mono'] mb-6 text-sm">
          {description}
        </div>

        {requireTyping && (
          <div className="mb-6">
            <label className="block text-sm font-['Orbitron'] text-amber-400 font-bold mb-3 tracking-wide">
              Type <span className="text-white px-2 py-0.5 bg-rose-950/80 rounded border border-rose-800">'{requireTyping}'</span> to confirm:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="..."
              className="w-full bg-slate-800 border border-rose-900 focus:border-rose-500 rounded-lg px-4 py-2 text-white font-['JetBrains_Mono'] outline-none"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-['Orbitron'] text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            CANCEL
          </button>
          <button
            disabled={isLocked}
            onClick={() => {
              setInputValue('');
              onConfirm();
            }}
            className={`px-4 py-2 rounded-lg font-['Orbitron'] font-bold transition-all ${
              isLocked 
                ? 'bg-rose-950/50 text-rose-800 border border-rose-900/50 cursor-not-allowed'
                : isWarning
                  ? 'bg-amber-700/80 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(180,83,9,0.6)] border border-amber-500 cursor-pointer'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] border border-rose-400 cursor-pointer'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface UpdateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  version: string;
}

// GitHub releases page — always points to the latest release
const RELEASES_URL = 'https://github.com/MayukXT/hangman/releases/latest';

export const UpdateWarningModal = ({ isOpen, onClose, onContinue, version }: UpdateWarningModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<'info' | 'downloading' | 'done' | 'error'>('info');
  const [progress, setProgress] = useState<UpdateProgress>({ downloaded: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [installType, setInstallType] = useState<InstallType>('unknown');

  useOnClickOutside(modalRef, () => { if (stage === 'info' || stage === 'error') onClose(); });

  useEffect(() => {
    if (isOpen) {
      setStage('info');
      setProgress({ downloaded: 0, total: 0 });
      setErrorMsg('');
      getInstallType().then(setInstallType);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canAutoUpdate = isTauriApp();
  const isPortable = installType === 'portable';
  const progressPercent = progress.total > 0 ? Math.round((progress.downloaded / progress.total) * 100) : 0;

  const handleInstall = async () => {
    if (!canAutoUpdate) {
      onContinue();
      return;
    }
    setStage('downloading');
    try {
      await downloadAndInstallUpdate((p) => setProgress(p));
      setStage('done');
    } catch (e) {
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : JSON.stringify(e, null, 2);
      setErrorMsg(raw || 'Unknown error — check the console for details.');
      setStage('error');
    }
  };

  const handlePortableDownload = async () => {
    try {
      if (isTauriApp()) {
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(RELEASES_URL);
      } else {
        window.open(RELEASES_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(RELEASES_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
      <div ref={modalRef} className="max-w-lg w-full bg-slate-900 border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] rounded-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 text-amber-500">
            {stage === 'downloading' ? <Download size={28} className="animate-bounce" /> : 
             stage === 'done' ? <CheckCircle size={28} className="text-emerald-400" /> : 
             stage === 'error' ? <XCircle size={28} className="text-rose-500" /> :
             <AlertTriangle size={28} />}
            <h2 className="font-['Orbitron'] font-black text-lg tracking-widest">
              {stage === 'info' ? (isPortable ? 'PORTABLE VERSION' : 'BEFORE YOU UPDATE') : 
               stage === 'downloading' ? 'UPDATING...' : 
               stage === 'done' ? 'UPDATE COMPLETE' : 
               'UPDATE FAILED'}
            </h2>
          </div>
          {(stage === 'info' || stage === 'error') && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        {stage === 'info' && isPortable && (
          <>
            <div className="space-y-4 text-sm font-['JetBrains_Mono'] mb-6">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-600/60">
                <p className="text-amber-400 font-bold mb-2 text-base">Portable EXE detected</p>
                <p className="text-slate-300 leading-relaxed">
                  Auto-update needs the <span className="text-white font-bold">installer</span> build. Portable users download the new EXE manually.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-cyan-400 font-bold mb-1">Update path</p>
                <p className="text-slate-300 leading-relaxed">
                  Open Releases, download the latest <span className="text-white font-bold">portable EXE</span>, and replace the old file.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">Save data</p>
                <p className="text-slate-300 leading-relaxed">
                  Scores, username, and settings stay intact.
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-xs font-['JetBrains_Mono'] mb-6">
              New version available: <span className="text-slate-300">{version}</span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-['Orbitron'] text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handlePortableDownload}
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-['Orbitron'] font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400 transition-all"
              >
                <ExternalLink size={16} />
                DOWNLOAD {version}
              </button>
            </div>
          </>
        )}

        {stage === 'info' && !isPortable && (
          <>
            <div className="space-y-4 text-sm font-['JetBrains_Mono'] mb-6">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-amber-400 font-bold mb-1">SmartScreen</p>
                <p className="text-slate-300 leading-relaxed">Windows may warn because this indie build is not code-signed. Choose <span className="text-white font-bold">More info</span>, then <span className="text-white font-bold">Run anyway</span>.</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-cyan-400 font-bold mb-1">Admin prompt</p>
                <p className="text-slate-300 leading-relaxed">The installer needs permission to replace app files. A Windows UAC prompt will appear.</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">Save data</p>
                <p className="text-slate-300 leading-relaxed">Scores, username, and settings stay intact.</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <p className="text-violet-400 font-bold mb-1">Verified update</p>
                <p className="text-slate-300 leading-relaxed">The app checks the update signature before installing.</p>
              </div>
            </div>

            <p className="text-slate-500 text-xs font-['JetBrains_Mono'] mb-6">
              Updating to <span className="text-slate-300">{version}</span>. The app will restart when ready.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-['Orbitron'] text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleInstall}
                className="px-5 py-2 rounded-lg font-['Orbitron'] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-400 transition-all"
              >
                UPDATE NOW
              </button>
            </div>
          </>
        )}

        {stage === 'downloading' && (
          <div className="space-y-4">
            <p className="text-slate-300 font-['JetBrains_Mono'] text-sm">
              Installing {version}. Keep the app open.
            </p>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-['JetBrains_Mono'] text-slate-500">
              <span>{progressPercent}%</span>
              <span>
                {progress.total > 0 
                  ? `${(progress.downloaded / 1024 / 1024).toFixed(1)} / ${(progress.total / 1024 / 1024).toFixed(1)} MB`
                  : 'Preparing...'}
              </span>
            </div>
          </div>
        )}

        {stage === 'done' && (
          <p className="text-emerald-400 font-['JetBrains_Mono'] text-sm">
            Update installed. Restarting now.
          </p>
        )}

        {stage === 'error' && (
          <div className="space-y-4">
            <p className="text-rose-400 font-['JetBrains_Mono'] text-sm">{errorMsg}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-['Orbitron'] text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                CLOSE
              </button>
              <button
                onClick={() => { setStage('info'); setErrorMsg(''); }}
                className="px-5 py-2 rounded-lg font-['Orbitron'] font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 transition-all"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
