import React from 'react';
import { X } from 'lucide-react';
import { RetroPopupItem } from '../types';

interface RetroDialogProps {
  dialog: RetroPopupItem;
  onClose: (id: string) => void;
}

export const RetroDialog: React.FC<RetroDialogProps> = ({ dialog, onClose }) => {
  return (
    <div
      id={`retro-dialog-${dialog.id}`}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border-2 border-amber-500 bg-neutral-900 rounded-xl p-1.5 w-80 max-w-[90vw] text-white animate-bounce select-none pointer-events-auto"
      style={{
        left: `${Math.min(Math.max(dialog.x - 160, 16), typeof window !== 'undefined' ? window.innerWidth - 330 : 50)}px`,
        top: `${Math.min(Math.max(dialog.y - 80, 80), typeof window !== 'undefined' ? window.innerHeight - 220 : 100)}px`,
        animationDuration: '1.4s',
      }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-neutral-950 font-black px-2.5 py-1 rounded-lg text-xs tracking-wider">
        <div className="flex items-center gap-1.5">
          <span>{dialog.icon || '🪳'}</span>
          <span className="truncate">{dialog.title}</span>
        </div>
        <button
          onClick={() => onClose(dialog.id)}
          className="hover:bg-red-600 hover:text-white rounded p-0.5 transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 bg-neutral-950 rounded-b-lg mt-1 flex items-start gap-3 border border-neutral-800">
        <div className="text-3xl flex-shrink-0 animate-bounce" style={{ animationDuration: '0.8s' }}>
          {dialog.icon || '🪳'}
        </div>
        <div className="flex-1">
          <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
            {dialog.message}
          </p>
          <div className="mt-2.5 flex justify-end gap-2">
            <button
              onClick={() => onClose(dialog.id)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-md"
            >
              Kabul Et (Kaçış Yok) 🪳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
