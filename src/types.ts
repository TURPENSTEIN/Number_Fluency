export type Operation = '+' | '-' | '*' | '/';

export type ProblemType = 'arithmetic' | 'mapping' | 'bridging' | 'verbal';

export type MentalModelType = 
  | 'vector-neutralization' 
  | 'area-decomposition' 
  | 'number-line-bridge' 
  | 'chunking-division' 
  | 'dual-gauge';

export interface Problem {
  id: string;
  type: ProblemType;
  prompt: string;
  op1: number;
  op2: number;
  op: Operation;
  displayString: string;
  answer: number;
  fractionAnswer?: string;
  isVerbal: boolean;
  verbalMode?: 'full' | 'mixed' | 'none';
  modelType: MentalModelType;
  modelExplanation: {
    headline: string;
    subtext: string;
    shortcutEquation?: string;
    realWorldAnalogy?: string;
    clunkyWay?: string;
    mentalFlowWay?: string;
    steps: string[];
    intuitionTip: string;
  };
  timeLimitSec: number;
  difficultyTier: number; // 1 to 4
  hasNegatives: boolean;
  hasTwoDigits: boolean;
}

export interface SessionStats {
  level: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  latencies: number[]; // recent latencies in ms
  byOperation: Record<Operation, { answered: number; correct: number; totalMs: number }>;
  signedStats: { answered: number; correct: number; totalMs: number };
  twoDigitStats: { answered: number; correct: number; totalMs: number };
}

export type TrainingMode = 'adaptive-all' | 'signed-focus' | 'two-digit-agility' | 'mult-div';

export interface SessionConfig {
  durationMinutes: number; // 0 for infinite / practice
  mode: TrainingMode;
  soundEnabled: boolean;
  showNumpad: boolean;
}
