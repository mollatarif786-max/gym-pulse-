import React, { useEffect } from 'react';
import { Timer, Plus, Minus, Play, Pause, X } from 'lucide-react';

interface RestTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  onAdjustSeconds: (delta: number) => void;
  onToggleTimer: () => void;
  onClose: () => void;
  onReset: (seconds: number) => void;
}

export const RestTimerFloating: React.FC<RestTimerProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  onAdjustSeconds,
  onToggleTimer,
  onClose,
  onReset,
}) => {
  // Beep sound simulation / Web Audio API on finish
  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {
        // AudioContext not available or blocked
      }
    }
  }, [secondsLeft, isRunning]);

  const progressPercent = totalSeconds > 0 ? Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100) : 0;
  const isFinished = secondsLeft === 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="floating_rest_timer"
      className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ${
        isFinished ? 'animate-bounce' : ''
      }`}
    >
      <div className="bg-[#171717]/95 border border-orange-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2 min-w-[220px] text-[#EDEDED]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <Timer className="w-4 h-4 text-orange-400" />
            <span>Rest Timer</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-white p-1 rounded-lg hover:bg-[#202020]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress line */}
        <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden border border-[#262626]">
          <div
            className={`h-full transition-all duration-1000 ${
              isFinished ? 'bg-amber-400' : 'bg-orange-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time display & Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onAdjustSeconds(-15)}
            className="p-1.5 rounded-lg bg-[#121212] text-[#A1A1AA] hover:text-white hover:bg-[#202020] border border-[#262626]"
            title="Minus 15s"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className={`text-2xl font-black font-mono tracking-tight ${
            isFinished ? 'text-amber-400' : 'text-[#EDEDED]'
          }`}>
            {formatTime(secondsLeft)}
          </span>

          <button
            onClick={() => onAdjustSeconds(15)}
            className="p-1.5 rounded-lg bg-[#121212] text-[#A1A1AA] hover:text-white hover:bg-[#202020] border border-[#262626]"
            title="Plus 15s"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleTimer}
            className={`p-2 rounded-xl text-black font-bold transition-all ${
              isRunning ? 'bg-amber-400 hover:bg-amber-300' : 'bg-orange-500 hover:bg-orange-400'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex justify-between gap-1 pt-1 border-t border-[#262626] text-[10px] font-mono">
          {[30, 60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              onClick={() => onReset(sec)}
              className={`px-1.5 py-0.5 rounded bg-[#121212] hover:bg-[#202020] text-[#A1A1AA] hover:text-white font-medium border border-[#262626] ${
                totalSeconds === sec ? 'border-orange-500/50 text-orange-400' : ''
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
