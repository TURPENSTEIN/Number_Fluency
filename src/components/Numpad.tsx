import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface NumpadProps {
  onAppend: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  onAppend,
  onDelete,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const handleKey = (char: string) => {
    if (disabled) return;
    onAppend(char);
  };

  return (
    <div id="touch-numpad" className="w-full max-w-sm mx-auto grid grid-cols-4 gap-2 pt-2 select-none">
      {/* Row 1 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('7')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        7
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('8')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        8
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('9')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        9
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        className="h-12 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold font-mono text-neutral-400 active:scale-95 transition-all hover:bg-neutral-800 hover:text-white"
      >
        CLR
      </button>

      {/* Row 2 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('4')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        4
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('5')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        5
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('6')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        6
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('-')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-amber-400 active:scale-95 transition-all hover:bg-neutral-700"
      >
        ± / -
      </button>

      {/* Row 3 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('1')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        1
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('2')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        2
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('3')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        3
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 active:scale-95 transition-all hover:bg-neutral-800 hover:text-white"
      >
        <Delete className="w-5 h-5" />
      </button>

      {/* Row 4 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('0')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        0
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('.')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-white active:scale-95 transition-all hover:bg-neutral-700"
      >
        .
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleKey('/')}
        className="h-12 rounded-xl bg-neutral-800/90 border border-neutral-700/80 text-lg font-bold font-mono text-blue-400 active:scale-95 transition-all hover:bg-neutral-700"
      >
        /
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="h-12 rounded-xl bg-blue-600 border border-blue-500 flex items-center justify-center text-white active:scale-95 transition-all hover:bg-blue-500 shadow-md shadow-blue-500/20"
      >
        <CornerDownLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
