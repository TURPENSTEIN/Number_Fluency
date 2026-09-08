import React from 'react';
import { SessionStats, Operation } from '../types';
import { CheckCircle2, Zap, Brain, Activity } from 'lucide-react';

interface FluencyMatrixProps {
  stats: SessionStats;
}

export const FluencyMatrix: React.FC<FluencyMatrixProps> = ({ stats }) => {
  const operations: { op: Operation; name: string; symbol: string }[] = [
    { op: '+', name: 'Addition', symbol: '+' },
    { op: '-', name: 'Subtraction', symbol: '−' },
    { op: '*', name: 'Multiplication', symbol: '×' },
    { op: '/', name: 'Division', symbol: '÷' },
  ];

  const getAccuracy = (answered: number, correct: number) => {
    return answered > 0 ? Math.round((correct / answered) * 100) : 100;
  };

  const getAvgSpeed = (answered: number, totalMs: number) => {
    return answered > 0 ? (totalMs / answered / 1000).toFixed(1) : '—';
  };

  const getMasteryLevel = (answered: number, correct: number, totalMs: number) => {
    if (answered < 3) return { label: 'Calibrating', color: 'text-neutral-400 bg-neutral-800' };
    const acc = (correct / answered) * 100;
    const avgSec = totalMs / answered / 1000;

    if (acc >= 90 && avgSec <= 2.2) {
      return { label: 'Automatic (Freed)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (acc >= 80 && avgSec <= 4.0) {
      return { label: 'Fluent', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
    return { label: 'Consolidating', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  };

  return (
    <div id="fluency-matrix-card" className="w-full bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Working Memory Fluency Matrix
          </h4>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">
          4 Basic Operations • 1 & 2 Digits • ± Signs
        </span>
      </div>

      {/* Grid of 4 Operations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {operations.map(({ op, name, symbol }) => {
          const opData = stats.byOperation[op] || { answered: 0, correct: 0, totalMs: 0 };
          const acc = getAccuracy(opData.answered, opData.correct);
          const spd = getAvgSpeed(opData.answered, opData.totalMs);
          const status = getMasteryLevel(opData.answered, opData.correct, opData.totalMs);

          return (
            <div
              key={op}
              className="p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base font-bold font-mono text-white bg-neutral-800/60 w-7 h-7 rounded flex items-center justify-center">
                  {symbol}
                </span>
                <span className="text-xs text-neutral-400 font-medium">{name}</span>
              </div>

              <div className="space-y-1 my-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Accuracy:</span>
                  <span className={`font-mono font-bold ${acc >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {acc}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Avg Speed:</span>
                  <span className="font-mono text-neutral-200">{spd}{spd !== '—' ? 's' : ''}</span>
                </div>
              </div>

              <span className={`mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded border text-center font-semibold ${status.color}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cross-Cutting Pillars: Signed Numbers & 2-Digit Bridging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Signed Numbers */}
        <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">Negative / Signed Operations</div>
              <div className="text-[10px] text-neutral-400">Force flux & opposite signs intuition</div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold text-neutral-100">
              {stats.signedStats.answered > 0
                ? `${getAccuracy(stats.signedStats.answered, stats.signedStats.correct)}% acc`
                : '0 trials'}
            </div>
            <div className="text-[10px] text-neutral-400">
              {getAvgSpeed(stats.signedStats.answered, stats.signedStats.totalMs)}s avg
            </div>
          </div>
        </div>

        {/* 2-Digit Operations */}
        <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">2-Digit Bridging & Area</div>
              <div className="text-[10px] text-neutral-400">Decade jump & mental partitioning</div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs font-bold text-neutral-100">
              {stats.twoDigitStats.answered > 0
                ? `${getAccuracy(stats.twoDigitStats.answered, stats.twoDigitStats.correct)}% acc`
                : '0 trials'}
            </div>
            <div className="text-[10px] text-neutral-400">
              {getAvgSpeed(stats.twoDigitStats.answered, stats.twoDigitStats.totalMs)}s avg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
