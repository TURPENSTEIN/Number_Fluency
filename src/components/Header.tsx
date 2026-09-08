import React from 'react';
import { Volume2, VolumeX, Pause, Play, Smartphone, BrainCircuit, ExternalLink } from 'lucide-react';
import { TrainingMode } from '../types';

interface HeaderProps {
  sessionTimeLeftFormatted: string;
  hasStarted: boolean;
  isPaused: boolean;
  soundEnabled: boolean;
  showNumpad: boolean;
  currentMode: TrainingMode;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleNumpad: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionTimeLeftFormatted,
  hasStarted,
  isPaused,
  soundEnabled,
  showNumpad,
  currentMode,
  onTogglePause,
  onToggleSound,
  onToggleNumpad,
}) => {
  const modeLabels: Record<TrainingMode, string> = {
    'adaptive-all': 'Adaptive',
    'signed-focus': 'Signed ±',
    'two-digit-agility': '2-Digit',
    'mult-div': 'Mult & Div'
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Discord Link Banner */}
      <div 
        id="top-discord-banner"
        className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-neutral-300 transition-colors hover:bg-indigo-950/40"
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#5865F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="text-neutral-400">Join our Discord:</span>
          <a
            href="https://discord.gg/brain"
            target="_blank"
            rel="noopener noreferrer"
            id="discord-mindbuilding-link"
            className="font-bold text-[#7983f5] hover:text-[#a5adff] underline underline-offset-2 decoration-[#5865F2]/50 hover:decoration-[#5865F2] transition-colors"
          >
            MINDBUILDING
          </a>
        </div>
        <a
          href="https://discord.gg/brain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          <span>discord.gg/brain</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Header Bar */}
      <header className="w-full flex items-center justify-between py-1.5 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
                Number Fluency
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                {modeLabels[currentMode]}
              </span>
            </div>
          </div>

          {hasStarted && (
            <span 
              id="session-time-pill"
              className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30"
            >
              {sessionTimeLeftFormatted}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-neutral-800/80 border-neutral-700 text-neutral-200 hover:text-white'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-400'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Numpad Toggle */}
          <button
            id="numpad-toggle-btn"
            onClick={onToggleNumpad}
            className={`p-1.5 rounded-lg border transition-colors ${
              showNumpad
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title={showNumpad ? 'Hide On-Screen Numpad' : 'Show On-Screen Numpad'}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Pause Button */}
          {hasStarted && (
            <button
              id="pause-session-btn"
              onClick={onTogglePause}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-850 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}
        </div>
      </header>
    </div>
  );
};
