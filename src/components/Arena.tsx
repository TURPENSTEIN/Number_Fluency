import React, { useRef, useEffect } from 'react';
import { Problem } from '../types';
import { Numpad } from './Numpad';
import { Lightbulb, ArrowRight, CornerDownLeft } from 'lucide-react';

interface ArenaProps {
  currentProblem: Problem | null;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  onSubmitAnswer: () => void;
  onInspectMentalModel: () => void;
  isPaused: boolean;
  isFinished: boolean;
  timeRemainingFrac: number; // 0 to 1
  feedback: { message: string; type: 'success' | 'error' | '' } | null;
  showNumpad: boolean;
}

export const Arena: React.FC<ArenaProps> = ({
  currentProblem,
  userAnswer,
  setUserAnswer,
  onSubmitAnswer,
  onInspectMentalModel,
  isPaused,
  isFinished,
  timeRemainingFrac,
  feedback,
  showNumpad,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when problem changes or after modal closes
  useEffect(() => {
    if (!isPaused && !isFinished) {
      inputRef.current?.focus();
    }
  }, [currentProblem?.id, isPaused, isFinished]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAnswer();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      onSubmitAnswer();
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1: return { text: 'Tier 1 • Foundations', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 2: return { text: 'Tier 2 • Signed & Decade Bridging', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 3: return { text: 'Tier 3 • Area & Chunking Mastery', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      default: return { text: 'Tier 4 • Automaticity Flow', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const tierBadge = currentProblem ? getTierBadge(currentProblem.difficultyTier) : null;
  const isUrgent = timeRemainingFrac < 0.28;

  return (
    <div
      id="exercise-arena"
      className="relative w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all"
    >
      {/* Top Countdown Speed Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-neutral-800/80 overflow-hidden">
        <div
          id="timer-progress-bar"
          className={`h-full transition-all duration-75 linear ${
            isUrgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, timeRemainingFrac * 100))}%` }}
        />
      </div>

      {/* Badges bar */}
      <div className="w-full flex items-center justify-between mb-4 mt-1">
        {tierBadge && (
          <span 
            id="tier-badge"
            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border ${tierBadge.color}`}
          >
            {tierBadge.text}
          </span>
        )}

        <div className="flex items-center gap-2">
          {currentProblem?.isVerbal && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Verbal Mental Math
            </span>
          )}
          {currentProblem?.hasNegatives && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Signed ±
            </span>
          )}
          <button
            type="button"
            id="inspect-model-btn"
            onClick={onInspectMentalModel}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-blue-400 bg-neutral-800/60 hover:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-700/60 transition-colors"
            title="Inspect Intuitive Mental Model (Hotkey: M)"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mental Model</span>
          </button>
        </div>
      </div>

      {/* Cognitive Prompt Label */}
      <div 
        id="problem-prompt-label"
        className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2"
      >
        {currentProblem ? currentProblem.prompt : 'Cognitive Operation'}
      </div>

      {/* Expression Display */}
      <div
        id="problem-expression-display"
        className={`min-h-[5rem] flex items-center justify-center text-center font-semibold text-white tracking-wide select-none ${
          currentProblem?.isVerbal 
            ? 'text-2xl sm:text-3xl font-sans text-neutral-100 max-w-lg leading-relaxed' 
            : 'text-4xl sm:text-5xl font-mono'
        }`}
      >
        {currentProblem ? currentProblem.displayString : 'Loading...'}
      </div>

      {/* Answer Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex items-center justify-center gap-2 mt-4">
        <input
          ref={inputRef}
          id="user-answer-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPaused || isFinished}
          placeholder="?"
          className="w-48 sm:w-56 h-13 px-4 text-center text-2xl sm:text-3xl font-bold font-mono text-white bg-neutral-950 border-2 border-neutral-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-neutral-600 shadow-inner"
        />

        <button
          type="submit"
          id="submit-answer-btn"
          disabled={isPaused || isFinished || !userAnswer.trim()}
          className="h-13 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Submit (Space or Enter)"
        >
          <span className="hidden sm:inline text-sm font-semibold">Enter</span>
          <CornerDownLeft className="w-5 h-5" />
        </button>
      </form>

      {/* Real-time Feedback Banner */}
      <div id="feedback-banner" className="min-h-[2rem] mt-3 flex items-center justify-center">
        {feedback && feedback.message && (
          <div
            className={`text-sm font-semibold font-mono tracking-wide px-3 py-1 rounded-full border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* On-Screen Touch Numpad */}
      {showNumpad && (
        <div className="w-full mt-2 pt-3 border-t border-neutral-800/80">
          <Numpad
            disabled={isPaused || isFinished}
            onAppend={(char) => {
              if (char === '± / -') {
                if (userAnswer.startsWith('-')) {
                  setUserAnswer(userAnswer.slice(1));
                } else {
                  setUserAnswer('-' + userAnswer);
                }
              } else {
                setUserAnswer(userAnswer + char);
              }
            }}
            onDelete={() => setUserAnswer(userAnswer.slice(0, -1))}
            onClear={() => setUserAnswer('')}
            onSubmit={onSubmitAnswer}
          />
        </div>
      )}

      {/* Helper text */}
      <div className="mt-3 text-[11px] text-neutral-400 text-center flex items-center justify-center gap-2 flex-wrap">
        <span>Submit: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-750 text-neutral-300 font-mono text-[10px]">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-750 text-neutral-300 font-mono text-[10px]">Enter</kbd></span>
        <span>•</span>
        <span>Mental Model: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-750 text-neutral-300 font-mono text-[10px]">M</kbd></span>
      </div>
    </div>
  );
};
