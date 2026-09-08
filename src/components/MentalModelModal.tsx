import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Problem } from '../types';
import { Lightbulb, ArrowRight, Zap, RefreshCw, X, Compass, Layers, SplitSquareVertical, Sparkles, Check } from 'lucide-react';

interface MentalModelModalProps {
  problem: Problem;
  userVal: number | null;
  onClose: () => void;
  onRetrySimilar: () => void;
  reason: 'incorrect' | 'timeout' | 'inspect';
}

export const MentalModelModal: React.FC<MentalModelModalProps> = ({
  problem,
  userVal,
  onClose,
  onRetrySimilar,
  reason
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'compare' | 'steps'>('visual');
  const [interactiveStep, setInteractiveStep] = useState<number>(2); // 0: setup, 1: transformation, 2: solution
  const { modelType, modelExplanation, op1, op2, op, answer } = problem;

  return (
    <AnimatePresence>
      <div 
        id="mental-model-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="mental-model-card"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${
                reason === 'incorrect' ? 'bg-red-500/15 text-red-400' :
                reason === 'timeout' ? 'bg-amber-500/15 text-amber-400' :
                'bg-blue-500/15 text-blue-400'
              }`}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                  {modelExplanation.headline}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {reason === 'incorrect' ? 'Cognitive schema correction' :
                   reason === 'timeout' ? 'Working memory rapid shortcut' :
                   'Mental model inspection'}
                </p>
              </div>
            </div>

            <button
              id="close-mental-model-btn"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Close (Esc or Space)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Problem Banner & Target Answer */}
          <div className="px-5 sm:px-6 py-2.5 bg-neutral-950/40 border-b border-neutral-800/60 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Problem:</span>
              <span className="text-lg font-bold font-mono text-white tracking-wide">
                {problem.displayString}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
              <span className="text-neutral-400">Answer:</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                {problem.fractionAnswer || problem.answer}
              </span>
              {userVal !== null && (
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 font-bold border border-red-500/30 line-through text-xs">
                  Your: {userVal}
                </span>
              )}
            </div>
          </div>

          {/* Golden 1-Second Shortcut Equation Highlight */}
          {modelExplanation.shortcutEquation && (
            <div className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-neutral-900 border-b border-neutral-800/80 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="uppercase tracking-wider text-[10px] text-blue-300 font-mono">1-Second Mental Shortcut:</span>
                </div>
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 tracking-wide bg-neutral-950/60 px-2.5 py-1 rounded border border-amber-500/30 text-center sm:text-right">
                  {modelExplanation.shortcutEquation}
                </span>
              </div>
            </div>
          )}

          {/* Real World Metaphor Card */}
          {modelExplanation.realWorldAnalogy && (
            <div className="px-5 sm:px-6 py-2 bg-neutral-900/90 border-b border-neutral-800/60 flex items-start gap-2 text-xs text-neutral-300 shrink-0">
              <span className="text-neutral-400 font-medium shrink-0">💡 Intuitive Metaphor:</span>
              <span className="leading-snug text-neutral-200">{modelExplanation.realWorldAnalogy}</span>
            </div>
          )}

          {/* View Mode Navigation Tabs */}
          <div className="flex border-b border-neutral-800 px-5 sm:px-6 bg-neutral-950/40 shrink-0">
            <button
              id="tab-visual-model"
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === 'visual'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Visual Diagram
            </button>
            <button
              id="tab-compare-model"
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === 'compare'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              Old Way vs Mental Flow
            </button>
            <button
              id="tab-steps-model"
              onClick={() => setActiveTab('steps')}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === 'steps'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Numbered Steps
            </button>
          </div>

          {/* Scrollable Tab Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {activeTab === 'visual' && (
              <div className="space-y-3">
                {/* Interactive Step Scrubber */}
                <div className="flex items-center justify-between bg-neutral-950/60 p-1.5 rounded-lg border border-neutral-800 text-xs">
                  <span className="text-[11px] text-neutral-400 px-2 font-mono hidden sm:inline">Phases:</span>
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    {[
                      { step: 0, label: '1. Problem' },
                      { step: 1, label: '2. Mental Move' },
                      { step: 2, label: '3. Instant Result' }
                    ].map(({ step, label }) => (
                      <button
                        key={step}
                        onClick={() => setInteractiveStep(step)}
                        className={`flex-1 sm:flex-none px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                          interactiveStep === step
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Visual Canvas */}
                <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 sm:p-4 flex items-center justify-center min-h-[170px]">
                  {renderEnhancedDiagram(modelType, op1, op2, op, answer, interactiveStep, problem.fractionAnswer)}
                </div>

                {/* Intuition Tip */}
                <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl flex items-start gap-2.5 text-xs text-neutral-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Cognitive Reflex Rule:</strong>
                    {modelExplanation.intuitionTip}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Clunky Way */}
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider mb-2">
                        <X className="w-4 h-4" />
                        <span>The Clunky Way (Slow)</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">
                        {modelExplanation.clunkyWay || 'Rote memorization, carrying digits across columns, heavy cognitive load on working memory.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-red-500/10 text-[11px] text-red-400 font-mono">
                      ❌ Strains working memory & causes hesitation
                    </div>
                  </div>

                  {/* Mental Flow Way */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider mb-2">
                        <Check className="w-4 h-4" />
                        <span>The Mental Flow Way (Instant)</span>
                      </div>
                      <p className="text-neutral-200 leading-relaxed font-medium">
                        {modelExplanation.mentalFlowWay || modelExplanation.shortcutEquation || 'Decompose into friendly benchmark anchors and compute left-to-right.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-400 font-mono">
                      ✓ Instant & effortless automaticity
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl text-xs text-neutral-300">
                  <strong className="text-white block mb-1">Why this feels like magic:</strong>
                  Human working memory can only hold 4 chunks simultaneously. Carrying digits or borrowing requires juggling 6+ chunks. By using friendly 10s and area decomposition, you reduce the memory load to just 2 chunks!
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="space-y-2.5">
                {modelExplanation.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-neutral-800/40 border border-neutral-700/40 rounded-xl text-xs sm:text-sm text-neutral-200"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-mono">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Controls */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-300">
                Space
              </kbd>
              <span>or</span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-300">
                Enter
              </kbd>
              <span>to resume</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="retry-similar-btn"
                onClick={onRetrySimilar}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Practice Similar
              </button>
              <button
                id="continue-training-btn"
                onClick={onClose}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Enhanced Ultra-Intuitive SVG Visual Diagrams
function renderEnhancedDiagram(
  modelType: string,
  op1: number,
  op2: number,
  op: string,
  answer: number,
  phase: number, // 0: setup, 1: transformation, 2: solution
  fractionAnswer?: string
) {
  // 1. AREA DECOMPOSITION (Multiplication)
  if (modelType === 'area-decomposition') {
    const a = Math.abs(op1);
    const b = Math.abs(op2);
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const isNeg = answer < 0;

    let tens = Math.floor(big / 10) * 10;
    let ones = big - tens;
    if (tens === 0) {
      tens = Math.floor(big / 2);
      ones = big - tens;
    }

    const totalW = 340;
    const height = 80;
    const tRatio = tens / big;
    const wTens = Math.max(80, Math.min(260, totalW * tRatio));
    const wOnes = totalW - wTens;

    const areaTens = tens * small;
    const areaOnes = ones * small;

    return (
      <svg className="w-full max-w-[460px]" viewBox="0 0 460 140" fill="none">
        <text x="35" y={height / 2 + 25} fill="#94a3b8" fontSize="13" fontWeight="700" textAnchor="end" fontFamily="monospace">
          × {small}
        </text>

        {/* Tens Box */}
        <g>
          <rect x="45" y="20" width={wTens} height={height} rx="6" fill="#1e3a8a" fillOpacity={phase >= 1 ? "0.6" : "0.3"} stroke="#3b82f6" strokeWidth="2" />
          <text x={45 + wTens / 2} y="14" fill="#60a5fa" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {tens}
          </text>
          <text x={45 + wTens / 2} y={height / 2 + 25} fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase >= 1 ? `${tens} × ${small} = ${areaTens}` : `${tens}`}
          </text>
        </g>

        {/* Ones Box */}
        <g>
          <rect x={45 + wTens} y="20" width={wOnes} height={height} rx="6" fill="#065f46" fillOpacity={phase >= 1 ? "0.6" : "0.3"} stroke="#10b981" strokeWidth="2" />
          <text x={45 + wTens + wOnes / 2} y="14" fill="#34d399" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            +{ones}
          </text>
          <text x={45 + wTens + wOnes / 2} y={height / 2 + 25} fill="#ffffff" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase >= 1 ? `${ones} × ${small} = ${areaOnes}` : `${ones}`}
          </text>
        </g>

        {/* Bottom Sum Bracket */}
        {phase === 2 && (
          <g>
            <path d={`M 45 ${height + 26} L 45 ${height + 30} L ${45 + totalW} ${height + 30} L ${45 + totalW} ${height + 26}`} stroke="#94a3b8" strokeWidth="1.5" fill="none" />
            <text x={45 + totalW / 2} y={height + 46} fill={isNeg ? '#f87171' : '#38bdf8'} fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              Combined: {areaTens} + {areaOnes} = {Math.abs(answer)} {isNeg ? `➔ (Opposite Signs: ${answer})` : ''}
            </text>
          </g>
        )}
      </svg>
    );
  }

  // 2. CHUNKING DIVISION
  if (modelType === 'chunking-division') {
    const num = Math.abs(op1);
    const den = Math.abs(op2);
    const isNeg = answer < 0;

    const baseMult = den * 10;
    const part1 = baseMult <= num ? baseMult : den * Math.floor(num / den);
    const part2 = num - part1;

    const totalW = 340;
    const height = 75;
    const ratio1 = part1 / num;
    const w1 = Math.max(90, Math.min(260, totalW * ratio1));
    const w2 = totalW - w1;

    const q1 = part1 / den;
    const q2 = part2 / den;

    return (
      <svg className="w-full max-w-[460px]" viewBox="0 0 460 135" fill="none">
        <text x="35" y={height / 2 + 25} fill="#94a3b8" fontSize="13" fontWeight="700" textAnchor="end" fontFamily="monospace">
          ÷ {den}
        </text>

        {/* Chunk 1 (10x friendly chunk) */}
        <g>
          <rect x="45" y="20" width={w1} height={height} rx="6" fill="#1e3a8a" fillOpacity={phase >= 1 ? "0.6" : "0.3"} stroke="#3b82f6" strokeWidth="2" />
          <text x={45 + w1 / 2} y="14" fill="#60a5fa" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            Chunk 1: {part1}
          </text>
          <text x={45 + w1 / 2} y={height / 2 + 25} fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase >= 1 ? `${q1} groups` : `${part1}`}
          </text>
        </g>

        {/* Chunk 2 */}
        {part2 > 0 && (
          <g>
            <rect x={45 + w1} y="20" width={w2} height={height} rx="6" fill="#065f46" fillOpacity={phase >= 1 ? "0.6" : "0.3"} stroke="#10b981" strokeWidth="2" />
            <text x={45 + w1 + w2 / 2} y="14" fill="#34d399" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              Leftover: {part2}
            </text>
            <text x={45 + w1 + w2 / 2} y={height / 2 + 25} fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              {phase >= 1 ? `${q2} groups` : `${part2}`}
            </text>
          </g>
        )}

        {phase === 2 && (
          <text x={45 + totalW / 2} y={height + 44} fill={isNeg ? '#f87171' : '#38bdf8'} fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            Total Quotient: {q1} {part2 > 0 ? `+ ${q2}` : ''} = {Math.abs(answer)} {isNeg ? `➔ Opposite Signs = ${answer}` : ''}
          </text>
        )}
      </svg>
    );
  }

  // 3. NUMBER LINE BRIDGING & CASHIER'S CHANGE
  if (modelType === 'number-line-bridge') {
    const isSubtraction = op === '-';
    
    if (isSubtraction) {
      const low = Math.min(op1, op2);
      const high = Math.max(op1, op2);
      const roundOp2 = Math.ceil(op2 / 10) * 10;
      const change = roundOp2 - op2;
      const afterOverSub = op1 - roundOp2;

      return (
        <svg className="w-full max-w-[460px]" viewBox="0 0 460 135" fill="none">
          {/* Baseline */}
          <line x1="30" y1="65" x2="430" y2="65" stroke="#475569" strokeWidth="2" />

          {/* Start Point */}
          <circle cx="390" cy="65" r="5" fill="#3b82f6" />
          <text x="390" y="85" fill="#93c5fd" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">{op1}</text>

          {/* Big Jump Back (-roundOp2) */}
          {phase >= 1 && (
            <g>
              <path d={`M 390 57 Q 240 10 90 57`} stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" fill="none" />
              <text x="240" y="24" fill="#f87171" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                −{roundOp2} (Over-subtract friendly 10)
              </text>
              <circle cx="90" cy="65" r="4" fill="#ef4444" />
              <text x="90" y="85" fill="#f87171" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">{afterOverSub}</text>
            </g>
          )}

          {/* Small Jump Forward (+change) */}
          {phase === 2 && change > 0 && (
            <g>
              <path d={`M 90 57 Q 120 35 150 57`} stroke="#10b981" strokeWidth="2.5" fill="none" />
              <text x="120" y="38" fill="#34d399" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                +{change} change
              </text>
              <circle cx="150" cy="65" r="6" fill="#10b981" />
              <text x="150" y="85" fill="#34d399" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">{answer}</text>
            </g>
          )}

          <text x="230" y="118" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase === 2 
              ? `Instant Change Trick: (${op1} − ${roundOp2}) + ${change} = ${answer}` 
              : `Round ${op2} to friendly ${roundOp2}`}
          </text>
        </svg>
      );
    } else {
      // Addition: Friendly 10 Magnet (Transfer)
      const target = op1 >= op2 ? op1 : op2;
      const donor = op1 >= op2 ? op2 : op1;
      const nextTen = Math.ceil(target / 10) * 10;
      const needed = nextTen - target;
      const remainingDonor = donor - needed;

      return (
        <svg className="w-full max-w-[460px]" viewBox="0 0 460 135" fill="none">
          {/* Box 1 (Target) */}
          <rect x="50" y="25" width="160" height="55" rx="8" fill="#1e3a8a" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="2" />
          <text x="130" y="45" fill="#93c5fd" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">Target: {target}</text>
          <text x="130" y="65" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase >= 1 ? `+${needed} ➔ ${nextTen}` : `Needs ${needed} to make ${nextTen}`}
          </text>

          {/* Transfer Arrow */}
          <path d="M 230 45 L 215 45" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arrow)" />

          {/* Box 2 (Donor) */}
          <rect x="250" y="25" width="160" height="55" rx="8" fill="#065f46" fillOpacity="0.4" stroke="#10b981" strokeWidth="2" />
          <text x="330" y="45" fill="#6ee7b7" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">Donor: {donor}</text>
          <text x="330" y="65" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            {phase >= 1 ? `−${needed} leaves ${remainingDonor}` : `Gives ${needed} to target`}
          </text>

          {phase === 2 && (
            <text x="230" y="112" fill="#38bdf8" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              Friendly Sum: {nextTen} + {remainingDonor} = {answer}
            </text>
          )}
        </svg>
      );
    }
  }

  // 4. DUAL GAUGE (Fractions & Decimals)
  if (modelType === 'dual-gauge') {
    const val = typeof answer === 'number' ? Math.max(0, Math.min(1.0, answer)) : 0.5;
    const width = 380;
    const pad = 40;
    const usable = width - pad * 2;
    const targetX = pad + val * usable;

    return (
      <svg className="w-full max-w-[440px]" viewBox="0 0 420 135" fill="none">
        {/* Fraction Scale */}
        <rect x={pad} y="20" width={usable} height="12" rx="6" fill="#1e3a8a" fillOpacity="0.5" stroke="#3b82f6" strokeWidth="1" />
        <text x={pad} y="14" fill="#94a3b8" fontSize="11" fontFamily="monospace">0</text>
        <text x={pad + usable * 0.25} y="14" fill="#60a5fa" fontSize="11" fontFamily="monospace">1/4</text>
        <text x={pad + usable * 0.5} y="14" fill="#60a5fa" fontSize="11" fontFamily="monospace">1/2</text>
        <text x={pad + usable * 0.75} y="14" fill="#60a5fa" fontSize="11" fontFamily="monospace">3/4</text>
        <text x={pad + usable} y="14" fill="#94a3b8" fontSize="11" fontFamily="monospace">1</text>

        {/* Decimal Scale */}
        <rect x={pad} y="65" width={usable} height="12" rx="6" fill="#065f46" fillOpacity="0.5" stroke="#10b981" strokeWidth="1" />
        <text x={pad} y="92" fill="#94a3b8" fontSize="11" fontFamily="monospace">0.0</text>
        <text x={pad + usable * 0.25} y="92" fill="#34d399" fontSize="11" fontFamily="monospace">.25</text>
        <text x={pad + usable * 0.5} y="92" fill="#34d399" fontSize="11" fontFamily="monospace">.50</text>
        <text x={pad + usable * 0.75} y="92" fill="#34d399" fontSize="11" fontFamily="monospace">.75</text>
        <text x={pad + usable} y="92" fill="#94a3b8" fontSize="11" fontFamily="monospace">1.0</text>

        {/* Target Needle */}
        <line x1={targetX} y1="12" x2={targetX} y2="85" stroke="#f8fafc" strokeWidth="2.5" />
        <circle cx={targetX} cy="26" r="5" fill="#38bdf8" />
        <circle cx={targetX} cy="71" r="5" fill="#34d399" />

        <text x="210" y="118" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">
          {fractionAnswer || `${answer}`} ≡ {(val * 100).toFixed(0)}% (Coins: {(val * 100).toFixed(0)}¢)
        </text>
      </svg>
    );
  }

  // 5. VECTOR NEUTRALIZATION & TUG-OF-WAR (Signed Numbers)
  const v1 = op1;
  const v2 = op === '-' ? -op2 : op2;
  const ans = answer;
  const isDebtRemoval = op === '-' && op2 < 0;

  if (isDebtRemoval) {
    return (
      <svg className="w-full max-w-[460px]" viewBox="0 0 460 135" fill="none">
        <text x="60" y="45" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">{op1}</text>
        <text x="120" y="45" fill="#f87171" fontSize="16" fontWeight="700" fontFamily="monospace">− ({op2})</text>

        {phase >= 1 && (
          <g>
            <path d="M 175 42 L 225 42" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
            <text x="200" y="32" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">Cancels Debt</text>
            <text x="250" y="45" fill="#34d399" fontSize="16" fontWeight="700" fontFamily="monospace">+{Math.abs(op2)}</text>
          </g>
        )}

        {phase === 2 && (
          <g>
            <path d="M 305 42 L 340 42" stroke="#60a5fa" strokeWidth="2" />
            <text x="365" y="45" fill="#38bdf8" fontSize="18" fontWeight="700" fontFamily="monospace">= {ans}</text>
          </g>
        )}

        <text x="230" y="95" fill="#e2e8f0" fontSize="13" fontWeight="700" textAnchor="middle">
          Removing a negative is removing debt ➔ pushes you forward (+)!
        </text>
      </svg>
    );
  }

  // Tug-of-war visualization
  const signsOppose = (v1 > 0 && v2 < 0) || (v1 < 0 && v2 > 0);
  const overlap = signsOppose ? Math.min(Math.abs(v1), Math.abs(v2)) : 0;
  const winner = Math.abs(v1) >= Math.abs(v2) ? v1 : v2;

  return (
    <svg className="w-full max-w-[460px]" viewBox="0 0 460 140" fill="none">
      {/* Center 0 Line */}
      <line x1="230" y1="15" x2="230" y2="120" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />
      <text x="230" y="12" fill="#94a3b8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">0 Neutral Center</text>

      {/* Team Negative / Left */}
      <rect x="70" y="30" width="140" height="35" rx="6" fill="#ef4444" fillOpacity="0.25" stroke="#f87171" strokeWidth="1.5" />
      <text x="140" y="52" fill="#f87171" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
        Team Negative: {Math.abs(Math.min(0, v1, v2))}
      </text>

      {/* Team Positive / Right */}
      <rect x="250" y="30" width="140" height="35" rx="6" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1.5" />
      <text x="320" y="52" fill="#34d399" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">
        Team Positive: +{Math.max(0, v1, v2)}
      </text>

      {/* Clash / Cancel Zone */}
      {signsOppose && phase >= 1 && (
        <g>
          <rect x="180" y="25" width="100" height="45" rx="6" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
          <text x="230" y="80" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">
            💥 {overlap} points clash and neutralize
          </text>
        </g>
      )}

      {/* Standing Winner */}
      {phase === 2 && (
        <text x="230" y="112" fill={ans >= 0 ? '#34d399' : '#f87171'} fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
          Winner Left Standing: {ans >= 0 ? `+${ans}` : ans}
        </text>
      )}
    </svg>
  );
}
