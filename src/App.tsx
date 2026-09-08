/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Problem, SessionStats, TrainingMode, Operation } from './types';
import { generateProblem } from './lib/generator';
import { parseUserInput, evaluateAccuracy } from './lib/rational';
import { sounds } from './lib/audio';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { Arena } from './components/Arena';
import { MentalModelModal } from './components/MentalModelModal';
import { FluencyMatrix } from './components/FluencyMatrix';
import { StartOverlay, PauseOverlay, SummaryOverlay } from './components/SessionOverlays';
import { Brain, ChevronDown } from 'lucide-react';

const INITIAL_STATS: SessionStats = {
  level: 1.0,
  streak: 0,
  bestStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  latencies: [],
  byOperation: {
    '+': { answered: 0, correct: 0, totalMs: 0 },
    '-': { answered: 0, correct: 0, totalMs: 0 },
    '*': { answered: 0, correct: 0, totalMs: 0 },
    '/': { answered: 0, correct: 0, totalMs: 0 },
  },
  signedStats: { answered: 0, correct: 0, totalMs: 0 },
  twoDigitStats: { answered: 0, correct: 0, totalMs: 0 },
};

export default function App() {
  // Session Configuration State
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [selectedMode, setSelectedMode] = useState<TrainingMode>('adaptive-all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showNumpad, setShowNumpad] = useState<boolean>(false);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Session Flow State
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [sessionRemainingMs, setSessionRemainingMs] = useState<number>(10 * 60 * 1000);

  // Statistics State
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);

  // Active Problem & Trial State
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | '' } | null>(null);

  // Mental Model Modal State
  const [showMentalModal, setShowMentalModal] = useState<boolean>(false);
  const [modalReason, setModalReason] = useState<'incorrect' | 'timeout' | 'inspect'>('incorrect');
  const [lastUserVal, setLastUserVal] = useState<number | null>(null);
  const modalOpenedStamp = useRef<number>(0);

  // Timing Refs
  const trialStartTimeRef = useRef<number>(0);
  const accumulatedActiveMsRef = useRef<number>(0);
  const trialDurationMsRef = useRef<number>(8000);
  const trialTimerRafRef = useRef<number | null>(null);
  const trialEndStampRef = useRef<number>(0);
  const [timeRemainingFrac, setTimeRemainingFrac] = useState<number>(1);

  // Sound ref to prevent stale closures
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const cancelTrialTimer = useCallback(() => {
    if (trialTimerRafRef.current) {
      cancelAnimationFrame(trialTimerRafRef.current);
      trialTimerRafRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    cancelTrialTimer();
    if (soundEnabledRef.current) sounds.playIncorrect();

    const latency = trialDurationMsRef.current;
    
    // Update stats for timeout
    setStats((prev) => {
      const curProb = currentProblem;
      const byOp = { ...prev.byOperation };
      const signed = { ...prev.signedStats };
      const twoD = { ...prev.twoDigitStats };

      if (curProb) {
        if (byOp[curProb.op]) {
          byOp[curProb.op] = {
            answered: byOp[curProb.op].answered + 1,
            correct: byOp[curProb.op].correct,
            totalMs: byOp[curProb.op].totalMs + latency,
          };
        }
        if (curProb.hasNegatives) {
          signed.answered += 1;
          signed.totalMs += latency;
        }
        if (curProb.hasTwoDigits) {
          twoD.answered += 1;
          twoD.totalMs += latency;
        }
      }

      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        streak: 0,
        level: Math.max(1.0, prev.level - 0.25),
        latencies: [...prev.latencies, latency].slice(-25),
        byOperation: byOp,
        signedStats: signed,
        twoDigitStats: twoD,
      };
    });

    setFeedback({ message: "Time Expired", type: 'error' });
    setLastUserVal(null);
    setModalReason('timeout');
    modalOpenedStamp.current = performance.now();
    setShowMentalModal(true);
  }, [cancelTrialTimer, currentProblem]);

  const startTrialTimer = useCallback((durationMs: number) => {
    cancelTrialTimer();
    trialDurationMsRef.current = durationMs;
    trialEndStampRef.current = performance.now() + durationMs;
    setTimeRemainingFrac(1);

    const tick = (now: number) => {
      const rem = Math.max(0, trialEndStampRef.current - now);
      const frac = rem / trialDurationMsRef.current;
      setTimeRemainingFrac(frac);

      if (rem <= 0) {
        handleTimeout();
      } else {
        trialTimerRafRef.current = requestAnimationFrame(tick);
      }
    };
    trialTimerRafRef.current = requestAnimationFrame(tick);
  }, [cancelTrialTimer, handleTimeout]);

  // Next Trial
  const nextTrial = useCallback((overrideLevel?: number) => {
    setFeedback(null);
    setUserAnswer('');
    setShowMentalModal(false);

    const effectiveLevel = overrideLevel !== undefined ? overrideLevel : stats.level;
    const problem = generateProblem(effectiveLevel, selectedMode);
    setCurrentProblem(problem);

    accumulatedActiveMsRef.current = 0;
    trialStartTimeRef.current = performance.now();

    startTrialTimer(problem.timeLimitSec * 1000);
  }, [stats.level, selectedMode, startTrialTimer]);

  // Session Clock Tick
  useEffect(() => {
    if (!hasStarted || isPaused || isFinished || selectedDuration === 0) return;

    const interval = setInterval(() => {
      setSessionRemainingMs((prev) => {
        const next = prev - 500;
        if (next <= 0) {
          clearInterval(interval);
          cancelTrialTimer();
          setIsFinished(true);
          if (soundEnabledRef.current) sounds.playMilestone();
          return 0;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [hasStarted, isPaused, isFinished, selectedDuration, cancelTrialTimer]);

  // Start Session
  const handleStartSession = () => {
    const totalMs = selectedDuration * 60 * 1000;
    setSessionRemainingMs(totalMs);
    setHasStarted(true);
    setIsPaused(false);
    setIsFinished(false);
    setStats(INITIAL_STATS);

    const initialProb = generateProblem(1.0, selectedMode);
    setCurrentProblem(initialProb);
    accumulatedActiveMsRef.current = 0;
    trialStartTimeRef.current = performance.now();
    startTrialTimer(initialProb.timeLimitSec * 1000);
  };

  // Pause / Resume
  const handleTogglePause = useCallback(() => {
    if (!hasStarted || isFinished || showMentalModal) return;

    if (isPaused) {
      // Resume
      setIsPaused(false);
      trialStartTimeRef.current = performance.now();
      const remMs = timeRemainingFrac * trialDurationMsRef.current;
      startTrialTimer(Math.max(1000, remMs));
    } else {
      // Pause
      setIsPaused(true);
      cancelTrialTimer();
      accumulatedActiveMsRef.current += performance.now() - trialStartTimeRef.current;
    }
  }, [hasStarted, isFinished, showMentalModal, isPaused, timeRemainingFrac, cancelTrialTimer, startTrialTimer]);

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!currentProblem || isPaused || isFinished) return;

    // If modal is open, submitting key dismisses modal
    if (showMentalModal) {
      if (performance.now() - modalOpenedStamp.current > 220) {
        setShowMentalModal(false);
        nextTrial();
      }
      return;
    }

    cancelTrialTimer();
    const trialLatency = accumulatedActiveMsRef.current + (performance.now() - trialStartTimeRef.current);
    const parsedVal = parseUserInput(userAnswer);
    const isCorrect = evaluateAccuracy(parsedVal, currentProblem.answer);

    // Update stats
    let newLevel = stats.level;
    setStats((prev) => {
      const byOp = { ...prev.byOperation };
      const signed = { ...prev.signedStats };
      const twoD = { ...prev.twoDigitStats };

      if (byOp[currentProblem.op]) {
        byOp[currentProblem.op] = {
          answered: byOp[currentProblem.op].answered + 1,
          correct: byOp[currentProblem.op].correct + (isCorrect ? 1 : 0),
          totalMs: byOp[currentProblem.op].totalMs + trialLatency,
        };
      }
      if (currentProblem.hasNegatives) {
        signed.answered += 1;
        if (isCorrect) signed.correct += 1;
        signed.totalMs += trialLatency;
      }
      if (currentProblem.hasTwoDigits) {
        twoD.answered += 1;
        if (isCorrect) twoD.correct += 1;
        twoD.totalMs += trialLatency;
      }

      if (isCorrect) {
        const nextStreak = prev.streak + 1;
        let delta = 0.15;
        if (trialLatency < 2000) delta = 0.35;
        else if (trialLatency < 3500) delta = 0.22;
        else if (trialLatency > 5000) delta = 0.08;

        newLevel = Math.min(10.0, prev.level + delta);

        return {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + 1,
          streak: nextStreak,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          level: newLevel,
          latencies: [...prev.latencies, trialLatency].slice(-25),
          byOperation: byOp,
          signedStats: signed,
          twoDigitStats: twoD,
        };
      } else {
        newLevel = Math.max(1.0, prev.level - 0.25);
        return {
          ...prev,
          totalAnswered: prev.totalAnswered + 1,
          streak: 0,
          level: newLevel,
          latencies: [...prev.latencies, trialLatency].slice(-25),
          byOperation: byOp,
          signedStats: signed,
          twoDigitStats: twoD,
        };
      }
    });

    if (isCorrect) {
      if (soundEnabledRef.current) {
        sounds.playCorrect(stats.streak + 1);
        if ((stats.streak + 1) % 10 === 0) {
          sounds.playMilestone();
        }
      }
      setFeedback({
        message: `✓ Automatic! (${(trialLatency / 1000).toFixed(2)}s)`,
        type: 'success',
      });
      setTimeout(() => {
        nextTrial(newLevel);
      }, 420);
    } else {
      if (soundEnabledRef.current) sounds.playIncorrect();
      setFeedback({ message: 'Recalibrating Intuition', type: 'error' });
      setLastUserVal(parsedVal);
      setModalReason('incorrect');
      modalOpenedStamp.current = performance.now();
      setShowMentalModal(true);
    }
  };

  const handleInspectMentalModel = () => {
    if (!currentProblem) return;
    cancelTrialTimer();
    setLastUserVal(null);
    setModalReason('inspect');
    modalOpenedStamp.current = performance.now();
    setShowMentalModal(true);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. If start overlay is shown, Space/Enter starts
      if (!hasStarted && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleStartSession();
        return;
      }

      // 2. If summary overlay is shown, Space/Enter restarts
      if (isFinished && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleStartSession();
        return;
      }

      // 3. Pause shortcut (Esc or KeyP)
      if (hasStarted && !isFinished && !showMentalModal && (e.code === 'KeyP' || e.code === 'Escape')) {
        e.preventDefault();
        handleTogglePause();
        return;
      }

      // 4. Inspect Mental Model shortcut ('M' key) when not focused in input
      if (
        hasStarted &&
        !isFinished &&
        !showMentalModal &&
        !isPaused &&
        (e.code === 'KeyM') &&
        (document.activeElement?.tagName !== 'INPUT')
      ) {
        e.preventDefault();
        handleInspectMentalModel();
        return;
      }

      // 5. Mental Model Modal dismissal with Space or Enter or Esc
      if (showMentalModal) {
        if (e.code === 'Escape') {
          e.preventDefault();
          setShowMentalModal(false);
          nextTrial();
          return;
        }
        if (e.code === 'Space' || e.code === 'Enter') {
          if (performance.now() - modalOpenedStamp.current < 220) return;
          e.preventDefault();
          setShowMentalModal(false);
          nextTrial();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [hasStarted, isFinished, showMentalModal, isPaused, handleTogglePause, nextTrial]);

  // Format session time remaining (mm:ss)
  const formatSessionTime = (ms: number): string => {
    if (selectedDuration === 0) return 'Practice';
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans select-none">
      <div className="w-full max-w-2xl flex flex-col gap-3.5 relative">
        {/* Top Header */}
        <Header
          sessionTimeLeftFormatted={formatSessionTime(sessionRemainingMs)}
          hasStarted={hasStarted}
          isPaused={isPaused}
          soundEnabled={soundEnabled}
          showNumpad={showNumpad}
          currentMode={selectedMode}
          onTogglePause={handleTogglePause}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onToggleNumpad={() => setShowNumpad(!showNumpad)}
        />

        {/* Real-time Stats Header */}
        <StatsBar stats={stats} />

        {/* Exercise Arena with Overlays */}
        <div className="relative min-h-[360px] flex items-center justify-center">
          <Arena
            currentProblem={currentProblem}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onInspectMentalModel={handleInspectMentalModel}
            isPaused={isPaused}
            isFinished={isFinished}
            timeRemainingFrac={timeRemainingFrac}
            feedback={feedback}
            showNumpad={showNumpad}
          />

          {/* Overlays */}
          {!hasStarted && (
            <StartOverlay
              selectedDuration={selectedDuration}
              onSelectDuration={setSelectedDuration}
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              onStart={handleStartSession}
            />
          )}

          {isPaused && (
            <PauseOverlay onResume={handleTogglePause} />
          )}

          {isFinished && (
            <SummaryOverlay
              stats={stats}
              selectedDuration={selectedDuration}
              onRestart={handleStartSession}
            />
          )}
        </div>

        {/* Working Memory Fluency Matrix (Collapsible for Clean, Focused Workout) */}
        {hasStarted && (
          <div className="w-full flex flex-col items-center gap-2">
            <button
              type="button"
              id="toggle-fluency-matrix-btn"
              onClick={() => setShowMatrix((prev) => !prev)}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-blue-400" />
              <span>{showMatrix ? 'Hide Fluency Analytics' : 'Show Fluency Matrix & Breakdown'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMatrix ? 'rotate-180 text-blue-400' : ''}`} />
            </button>

            {showMatrix && (
              <div className="w-full">
                <FluencyMatrix stats={stats} />
              </div>
            )}
          </div>
        )}

        {/* Mental Model Modal */}
        {showMentalModal && currentProblem && (
          <MentalModelModal
            problem={currentProblem}
            userVal={lastUserVal}
            onClose={() => {
              setShowMentalModal(false);
              nextTrial();
            }}
            onRetrySimilar={() => {
              setShowMentalModal(false);
              nextTrial(stats.level);
            }}
            reason={modalReason}
          />
        )}
      </div>
    </div>
  );
}
