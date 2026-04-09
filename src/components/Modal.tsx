import { AlertTriangle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

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
