import React from 'react';
import { Flame, Zap, Gauge, Target } from 'lucide-react';
import { SessionStats } from '../types';

interface StatsBarProps {
  stats: SessionStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const { level, streak, totalAnswered, totalCorrect, latencies } = stats;

  const avgLatencySec = latencies.length > 0
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000).toFixed(1)
    : '0.0';

  const accuracyPct = totalAnswered > 0
    ? Math.round((totalCorrect / totalAnswered) * 100)
    : 100;

  return (
    <div 
      id="stats-header-card"
      className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 shadow-sm text-xs"
    >
      {/* Level */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Gauge className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-neutral-400 font-medium hidden sm:inline">Level:</span>
        <span className="font-mono font-bold text-blue-400 text-sm">
          {level.toFixed(1)}
        </span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <Flame className={`w-3.5 h-3.5 shrink-0 ${streak >= 3 ? 'text-amber-400' : 'text-neutral-400'}`} />
        <span className="text-neutral-400 font-medium hidden sm:inline">Streak:</span>
        <span className={`font-mono font-bold text-sm ${streak >= 5 ? 'text-emerald-400' : 'text-neutral-100'}`}>
          {streak}
        </span>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-neutral-400 font-medium hidden sm:inline">Speed:</span>
        <span className="font-mono font-bold text-neutral-200 text-sm">
          {avgLatencySec}s
        </span>
      </div>

      {/* Accuracy */}
      <div className="flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-neutral-400 font-medium hidden sm:inline">Accuracy:</span>
        <span className="font-mono font-bold text-emerald-400 text-sm">
          {accuracyPct}%
        </span>
        <span className="text-[10px] text-neutral-400 font-mono hidden md:inline">
          ({totalCorrect}/{totalAnswered})
        </span>
      </div>
    </div>
  );
};
