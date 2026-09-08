import React from 'react';
import { Play, RotateCcw, Brain, Clock, ShieldCheck, Flame, Zap, Award } from 'lucide-react';
import { TrainingMode, SessionStats } from '../types';

interface StartOverlayProps {
  selectedDuration: number;
  onSelectDuration: (mins: number) => void;
  selectedMode: TrainingMode;
  onSelectMode: (mode: TrainingMode) => void;
  onStart: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  selectedDuration,
  onSelectDuration,
  selectedMode,
  onSelectMode,
  onStart,
}) => {
  const durations = [
    { label: '5 Min Sprint', value: 5 },
    { label: '10 Min Focus', value: 10 },
    { label: '20 Min Endurance', value: 20 },
    { label: 'Endless Practice', value: 0 },
  ];

  const modes: { id: TrainingMode; title: string; desc: string }[] = [
    {
      id: 'adaptive-all',
      title: 'Full Adaptive Spectrum',
      desc: 'All 4 operations, 1 & 2 digits, and negative numbers scaling dynamically with your speed.'
    },
    {
      id: 'signed-focus',
      title: 'Signed Numbers Mastery (±)',
      desc: 'Conquer negative signs, opposite vector cancellations, and double-negative debt removal.'
    },
    {
      id: 'two-digit-agility',
      title: '2-Digit Mental Agility',
      desc: 'Decade bridging, compensation shortcuts, and proportional 2D area decomposition.'
    },
    {
      id: 'mult-div',
      title: 'Multiplication & Division Flow',
      desc: 'Fast mental partitioning, table automaticity, and chunking division reflexes.'
    }
  ];

  return (
    <div 
      id="start-session-overlay"
      className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-y-auto"
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
        <Brain className="w-6 h-6" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
        Cognitive Number Fluency
      </h2>
      <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mb-6 leading-relaxed">
        Automatize arithmetic operations with 1-digit, 2-digit, and signed numbers. Free up critical working memory resources so your mind can focus purely on higher-level reasoning.
      </p>

      {/* Mode Selection */}
      <div className="w-full max-w-lg mb-5 text-left">
        <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400 block mb-2">
          Select Training Focus
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedMode === m.id
                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="text-xs font-bold font-sans mb-0.5 text-inherit">{m.title}</div>
              <div className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="w-full max-w-lg mb-7 text-left">
        <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400 block mb-2">
          Workout Length
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onSelectDuration(d.value)}
              className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedDuration === d.value
                  ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        id="start-training-btn"
        onClick={onStart}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 transition-all cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Start Training</span>
        <span className="text-xs text-blue-200 font-mono ml-1 font-normal opacity-90">(Space / Enter)</span>
      </button>
    </div>
  );
};

interface PauseOverlayProps {
  onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => {
  return (
    <div 
      id="pause-session-overlay"
      className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-center text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
        <Clock className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Training Paused</h3>
      <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
        Both your trial timer and workout clock are frozen. Latency and adaptive ratings remain protected.
      </p>

      <button
        type="button"
        id="resume-training-btn"
        onClick={onResume}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Resume Training</span>
        <span className="text-xs text-blue-200 font-mono ml-1 font-normal">(Esc / P)</span>
      </button>
    </div>
  );
};

interface SummaryOverlayProps {
  stats: SessionStats;
  selectedDuration: number;
  onRestart: () => void;
}

export const SummaryOverlay: React.FC<SummaryOverlayProps> = ({
  stats,
  selectedDuration,
  onRestart,
}) => {
  const { totalAnswered, totalCorrect, bestStreak, level, latencies } = stats;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;
  const avgLatency = latencies.length > 0
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000).toFixed(2)
    : '0.00';

  return (
    <div 
      id="summary-session-overlay"
      className="absolute inset-0 z-40 bg-neutral-950/98 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-y-auto"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
        <Award className="w-6 h-6" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
        Workout Completed!
      </h2>
      <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
        {selectedDuration > 0
          ? `Finished your ${selectedDuration}-minute number fluency session. Your working memory bandwidth is conditioned!`
          : 'Great adaptive practice session completed.'}
      </p>

      {/* 4 Core Summary Cards */}
      <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-center">
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400 font-mono mb-1">Solved</div>
          <div className="text-xl font-bold font-mono text-blue-400">{totalAnswered}</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400 font-mono mb-1">Accuracy</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400 font-mono mb-1">Best Flow</div>
          <div className="text-xl font-bold font-mono text-amber-400">{bestStreak}</div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] uppercase font-bold text-neutral-400 font-mono mb-1">End Level</div>
          <div className="text-xl font-bold font-mono text-purple-400">{level.toFixed(1)}</div>
        </div>
      </div>

      {/* Cognitive Speed Takeaway */}
      <div className="w-full max-w-md p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-left mb-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Average Processing Latency:</span>
        </div>
        <span className="font-mono font-bold text-white text-sm">{avgLatency}s</span>
      </div>

      <button
        type="button"
        id="train-again-btn"
        onClick={onRestart}
        className="flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/20 transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Train Again</span>
        <span className="text-xs text-blue-200 font-mono ml-1 font-normal">(Space / Enter)</span>
      </button>
    </div>
  );
};
