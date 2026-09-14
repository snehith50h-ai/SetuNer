import React from 'react';
import { MatrixLoader } from '@/components/ui/MatrixLoader';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="p-8 rounded-3xl bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl flex flex-col items-center gap-5">
        <MatrixLoader variant="orbit" className="scale-150" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Initializing
        </span>
      </div>
    </div>
  );
}
