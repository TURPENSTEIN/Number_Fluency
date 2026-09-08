import { Problem, Operation, MentalModelType, TrainingMode } from '../types';
import { Rational, intToWords, rationalToWords } from './rational';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BENCHMARKS = [
  { r: new Rational(1, 2), dec: 0.5, pct: '50%' },
  { r: new Rational(1, 4), dec: 0.25, pct: '25%' },
  { r: new Rational(3, 4), dec: 0.75, pct: '75%' },
  { r: new Rational(1, 5), dec: 0.2, pct: '20%' },
  { r: new Rational(2, 5), dec: 0.4, pct: '40%' },
  { r: new Rational(3, 5), dec: 0.6, pct: '60%' },
  { r: new Rational(4, 5), dec: 0.8, pct: '80%' },
  { r: new Rational(1, 8), dec: 0.125, pct: '12.5%' },
  { r: new Rational(3, 8), dec: 0.375, pct: '37.5%' },
  { r: new Rational(5, 8), dec: 0.625, pct: '62.5%' },
  { r: new Rational(7, 8), dec: 0.875, pct: '87.5%' },
  { r: new Rational(1, 10), dec: 0.1, pct: '10%' },
  { r: new Rational(3, 10), dec: 0.3, pct: '30%' },
  { r: new Rational(7, 10), dec: 0.7, pct: '70%' },
  { r: new Rational(9, 10), dec: 0.9, pct: '90%' },
];

export function generateProblem(level: number, mode: TrainingMode): Problem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Decide operations based on mode and level
  let allowedOps: Operation[] = ['+', '-'];
  if (mode === 'mult-div') {
    allowedOps = ['*', '/'];
  } else if (mode === 'signed-focus') {
    allowedOps = level >= 4 ? ['+', '-', '*', '/'] : ['+', '-'];
  } else if (mode === 'two-digit-agility') {
    allowedOps = level >= 4 ? ['+', '-', '*', '/'] : ['+', '-'];
  } else {
    // adaptive-all
    if (level >= 2.6) allowedOps.push('*');
    if (level >= 4.0) allowedOps.push('/');
  }

  // Decide if negatives are allowed
  let allowNegatives = false;
  if (mode === 'signed-focus') {
    allowNegatives = true;
  } else if (level >= 2.2) {
    allowNegatives = Math.random() < Math.min(0.7, (level - 1.8) * 0.15);
  }

  // Benchmark / Dual-gauge mapping problem check (~15% at higher level in all mode)
  if (mode === 'adaptive-all' && level >= 3.5 && Math.random() < 0.16) {
    const bench = randomPick(BENCHMARKS);
    const toDecimal = Math.random() < 0.5;
    const isVerbal = Math.random() < 0.3;

    if (toDecimal) {
      const display = isVerbal ? rationalToWords(bench.r) : bench.r.toFractionString();
      return {
        id,
        type: 'mapping',
        prompt: 'Convert Fraction to Decimal',
        op1: bench.r.n,
        op2: bench.r.d,
        op: '/',
        displayString: `${display} = ?`,
        answer: bench.dec,
        isVerbal,
        modelType: 'dual-gauge',
        modelExplanation: {
          headline: 'Continuous Measurement Coordinate',
          subtext: `${bench.r.toFractionString()} occupies the exact position ${bench.dec} (${bench.pct})`,
          steps: [
            `Recognize the base unit partition: 1/${bench.r.d} = ${(1 / bench.r.d).toFixed(3)}`,
            `Scale by numerator: ${bench.r.n} × ${(1 / bench.r.d).toFixed(3)} = ${bench.dec}`,
            `Percentage equivalent: ${bench.pct}`
          ],
          intuitionTip: `Anchor ${bench.r.toFractionString()} visually on the 0–1 coordinate line.`
        },
        timeLimitSec: Math.max(4.0, 9.0 - level * 0.35),
        difficultyTier: Math.min(4, Math.floor(level / 2.5) + 1),
        hasNegatives: false,
        hasTwoDigits: false
      };
    } else {
      const display = isVerbal ? `zero point ${bench.dec.toString().split('.')[1]}` : `${bench.dec}`;
      return {
        id,
        type: 'mapping',
        prompt: 'Convert Decimal to Fraction',
        op1: bench.r.n,
        op2: bench.r.d,
        op: '/',
        displayString: `${display} = ?`,
        answer: bench.r.valueOf(),
        fractionAnswer: bench.r.toFractionString(),
        isVerbal,
        modelType: 'dual-gauge',
        modelExplanation: {
          headline: 'Fraction-Decimal Gauge Mapping',
          subtext: `${bench.dec} is precisely ${bench.r.toFractionString()}`,
          steps: [
            `Anchor ${bench.dec} as ${bench.pct} of a whole`,
            `Reduce common factor to simplest fraction: ${bench.r.toFractionString()}`
          ],
          intuitionTip: `Memorize common halves, quarters, fifths, and eighths as reflexes.`
        },
        timeLimitSec: Math.max(4.0, 9.0 - level * 0.35),
        difficultyTier: Math.min(4, Math.floor(level / 2.5) + 1),
        hasNegatives: false,
        hasTwoDigits: false
      };
    }
  }

  const op = randomPick(allowedOps);
  const allowTwoDigit = mode === 'two-digit-agility' || level >= 2.8;

  let op1 = 0;
  let op2 = 0;

  // Generate numbers based on operation and level
  if (op === '+') {
    const isTwoDigit = allowTwoDigit && Math.random() < 0.7;
    const max = isTwoDigit ? (level > 6 ? 99 : 55) : 9;
    const min = isTwoDigit ? 11 : 2;

    op1 = getRandomInt(min, max);
    op2 = getRandomInt(min, max);

    if (allowNegatives) {
      if (Math.random() < 0.5) op1 = -op1;
      if (Math.random() < 0.4) op2 = -op2;
      // ensure not both zero
      if (op1 === 0 && op2 === 0) op1 = 5;
    }
  } else if (op === '-') {
    const isTwoDigit = allowTwoDigit && Math.random() < 0.7;
    const max = isTwoDigit ? (level > 6 ? 99 : 60) : 18;
    const min = isTwoDigit ? 12 : 2;

    op1 = getRandomInt(min, max);
    op2 = getRandomInt(min, max);

    // If strictly positive beginner tier, keep op1 >= op2 so answer is positive
    if (!allowNegatives && op1 < op2) {
      const temp = op1;
      op1 = op2;
      op2 = temp;
    } else if (allowNegatives) {
      if (Math.random() < 0.45) op1 = -op1;
      if (Math.random() < 0.45) op2 = -op2;
    }
  } else if (op === '*') {
    // Multiplication
    let max1 = 9;
    let max2 = 9;
    if (allowTwoDigit && level >= 4.5) {
      max1 = level >= 7 ? 25 : 19;
      max2 = getRandomInt(2, 9);
    } else if (level < 3.5) {
      max1 = 9;
      max2 = 5;
    }

    op1 = getRandomInt(2, max1);
    op2 = getRandomInt(2, max2);

    if (allowNegatives) {
      if (Math.random() < 0.4) op1 = -op1;
      if (Math.random() < 0.35) op2 = -op2;
    }
  } else {
    // Division: generate clean quotient first
    let divisor = getRandomInt(2, level >= 6 ? 12 : 9);
    let quotient = getRandomInt(2, allowTwoDigit ? (level >= 6 ? 25 : 14) : 9);

    op1 = divisor * quotient;
    op2 = divisor;

    if (allowNegatives) {
      if (Math.random() < 0.4) op1 = -op1;
      if (Math.random() < 0.35) op2 = -op2;
    }
  }

  // Calculate answer
  let answer = 0;
  switch (op) {
    case '+': answer = op1 + op2; break;
    case '-': answer = op1 - op2; break;
    case '*': answer = op1 * op2; break;
    case '/': answer = op1 / op2; break;
  }

  // Determine mental model type
  const hasNegatives = op1 < 0 || op2 < 0;
  const hasTwoDigits = Math.abs(op1) >= 10 || Math.abs(op2) >= 10;
  let modelType: MentalModelType = 'vector-neutralization';

  if (hasNegatives && (op === '+' || op === '-')) {
    modelType = 'vector-neutralization';
  } else if (op === '*') {
    modelType = 'area-decomposition';
  } else if (op === '/') {
    modelType = 'chunking-division';
  } else if (hasTwoDigits && (op === '-' || op === '+')) {
    modelType = 'number-line-bridge';
  } else if (hasNegatives) {
    modelType = 'vector-neutralization';
  } else {
    modelType = 'number-line-bridge';
  }

  // Verbal cognitive translation (15-20% chance if level > 2)
  const isVerbal = level >= 2.0 && Math.random() < 0.18;
  const opSymbols: Record<Operation, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const opWords: Record<Operation, string> = { '+': 'plus', '-': 'minus', '*': 'times', '/': 'divided by' };

  const formatOperand = (val: number, inParensIfNeg = true): string => {
    if (val < 0 && inParensIfNeg) return `(${val})`;
    return `${val}`;
  };

  let displayString = '';
  if (isVerbal) {
    const fullVerbal = Math.random() < 0.6;
    if (fullVerbal) {
      displayString = `${intToWords(op1)} ${opWords[op]} ${intToWords(op2)}`;
    } else {
      displayString = `${formatOperand(op1)} ${opWords[op]} ${formatOperand(op2)}`;
    }
  } else {
    displayString = `${formatOperand(op1)} ${opSymbols[op]} ${formatOperand(op2, op !== '+' && op !== '-')}`;
    // If op2 is negative in + or -, format nicely: e.g. 14 + (-5) or -8 - (-12)
    if (op === '+' || op === '-') {
      displayString = `${op1} ${opSymbols[op]} ${op2 < 0 ? `(${op2})` : op2}`;
    }
  }

  // Construct intuitive mental model explanation
  const modelExplanation = generateExplanation(op1, op2, op, answer, modelType);

  // Adaptive time limit: shorter as level rises, generous at tier 1
  let timeLimitSec = 9.0 - level * 0.45;
  if (hasTwoDigits && hasNegatives) timeLimitSec += 2.0;
  else if (hasTwoDigits || hasNegatives) timeLimitSec += 1.0;
  timeLimitSec = Math.max(3.2, Math.min(14.0, timeLimitSec));

  return {
    id,
    type: isVerbal ? 'verbal' : 'arithmetic',
    prompt: isVerbal ? 'Cognitive Verbal Translation' : 'Evaluate Automatically',
    op1,
    op2,
    op,
    displayString,
    answer,
    isVerbal,
    verbalMode: isVerbal ? 'full' : 'none',
    modelType,
    modelExplanation,
    timeLimitSec,
    difficultyTier: Math.min(4, Math.max(1, Math.floor(level / 2.5) + 1)),
    hasNegatives,
    hasTwoDigits
  };
}

function generateExplanation(
  op1: number,
  op2: number,
  op: Operation,
  answer: number,
  modelType: MentalModelType
): {
  headline: string;
  subtext: string;
  shortcutEquation?: string;
  realWorldAnalogy?: string;
  clunkyWay?: string;
  mentalFlowWay?: string;
  steps: string[];
  intuitionTip: string;
} {
  if (modelType === 'vector-neutralization') {
    const v1 = op1;
    const v2 = op === '-' ? -op2 : op2;
    const signsOppose = (v1 > 0 && v2 < 0) || (v1 < 0 && v2 > 0);
    const overlap = signsOppose ? Math.min(Math.abs(v1), Math.abs(v2)) : 0;

    let headline = 'Opposite Vector Cancellation';
    let subtext = `${op1} ${op === '+' ? '+' : '−'} (${op2}) = ${answer}`;
    let shortcutEquation = '';
    let realWorldAnalogy = '';
    let clunkyWay = 'Memorizing abstract sign rules with pluses and minuses without spatial grounding.';
    let mentalFlowWay = '';
    let steps: string[] = [];
    let intuitionTip = '';

    if (op === '-' && op2 < 0) {
      headline = 'Erasing Debt (The Double Negative)';
      subtext = `Subtracting ${op2} cancels a negative deficit`;
      shortcutEquation = `${op1} - (${op2})  ➔  ${op1} + ${Math.abs(op2)} = ${answer}`;
      realWorldAnalogy = `Think of Bank Debt: If your bank cancels a $${Math.abs(op2)} loan you owed, you are $${Math.abs(op2)} richer! Taking away a debt always moves you upward/forward (+).`;
      clunkyWay = 'Wondering why minus minus turns to plus and second-guessing your sign.';
      mentalFlowWay = `Subtracting negative = debt relief = directly add +${Math.abs(op2)}. Instant!`;
      steps = [
        `Recognize double negative: subtracting a deficit removes debt`,
        `Rewrite cleanly: ${op1} + ${Math.abs(op2)}`,
        `Move forward to final answer: ${answer}`
      ];
      intuitionTip = 'Taking away cold makes a room warmer; erasing debt hands you cash!';
    } else if (signsOppose) {
      const posVal = Math.max(v1, v2);
      const negVal = Math.min(v1, v2);
      const winnerSign = Math.abs(v1) > Math.abs(v2) ? (v1 > 0 ? '+' : '−') : (v2 > 0 ? '+' : '−');
      headline = 'The Tug-of-War Battle';
      subtext = `Opposing forces collide and cancel out`;
      shortcutEquation = `${v1 > 0 ? `+${v1}` : v1} and ${v2 > 0 ? `+${v2}` : v2}  ➔  ${Math.abs(v1) > Math.abs(v2) ? Math.abs(v1) : Math.abs(v2)} wins by ${Math.abs(answer)}  ➔  ${answer}`;
      realWorldAnalogy = `Tug-of-War: Team Positive (+${posVal}) pulls right, Team Negative (${negVal}) pulls left. The team with higher absolute magnitude wins by the net difference!`;
      clunkyWay = 'Trying to perform column borrowing while juggling negative signs.';
      mentalFlowWay = `The larger team (${Math.max(Math.abs(v1), Math.abs(v2))}) wins the sign (${winnerSign}). Then subtract the smaller magnitude: ${Math.abs(answer)}.`;
      steps = [
        `Team 1 pulls to ${v1 > 0 ? `+${v1}` : v1}, Team 2 pulls to ${v2 > 0 ? `+${v2}` : v2}`,
        `Neutralization: ${overlap} positive and ${overlap} negative units collide and vanish into 0`,
        `Winning surplus left standing: ${answer}`
      ];
      intuitionTip = 'Whichever number is further from zero dictates the sign. Just subtract the absolute values!';
    } else {
      headline = 'Forces Pushing in the Same Direction';
      subtext = `Both numbers reinforce each other`;
      shortcutEquation = `${v1} and ${v2}  ➔  Combine magnitudes: ${v1 < 0 ? '−(' : ''}${Math.abs(v1)} + ${Math.abs(v2)}${v1 < 0 ? ')' : ''} = ${answer}`;
      realWorldAnalogy = v1 < 0 
        ? `Double Expense: You already owe $${Math.abs(v1)}, and spend $${Math.abs(v2)} more. You are now $${Math.abs(answer)} in debt.`
        : `Double Gain: Both values push upward together.`;
      clunkyWay = 'Getting tangled in minus signs instead of combining them.';
      mentalFlowWay = `Same direction = stack magnitudes (${Math.abs(v1)} + ${Math.abs(v2)} = ${Math.abs(answer)}) and keep the common ${v1 < 0 ? 'negative' : 'positive'} sign.`;
      steps = [
        `Start at displacement ${v1}`,
        `Continue in the identical direction by ${Math.abs(v2)} units`,
        `Combined total: ${answer}`
      ];
      intuitionTip = 'Same signs cooperate: add the sizes together and keep the shared sign.';
    }

    return { headline, subtext, shortcutEquation, realWorldAnalogy, clunkyWay, mentalFlowWay, steps, intuitionTip };
  }

  if (modelType === 'area-decomposition') {
    const a = Math.abs(op1);
    const b = Math.abs(op2);
    const isNeg = answer < 0;

    const big = Math.max(a, b);
    const small = Math.min(a, b);

    const tens = Math.floor(big / 10) * 10;
    const ones = big - tens;

    const area1 = tens * small;
    const area2 = ones * small;

    const shortcutEquation = `${big} × ${small}  ➔  (${tens} × ${small}) + (${ones} × ${small})  ➔  ${area1} + ${area2} = ${Math.abs(answer)}${isNeg ? ` (Opposite signs = ${answer})` : ''}`;
    const realWorldAnalogy = `Chocolate Bar Partition: Imagine a grid ${big} squares wide and ${small} squares high. Slice it vertically into a neat tens chunk (${tens} × ${small} = ${area1}) and a remaining units chunk (${ones} × ${small} = ${area2}). Add the two boxes!`;
    const clunkyWay = `Multiplying ${ones} × ${small}, writing down units, carrying tens in your head, then multiplying ${tens / 10} × ${small} and adding the carried number.`;
    const mentalFlowWay = `Left-to-right: Multiply the tens first (${tens} × ${small} = ${area1}), then the units (${ones} × ${small} = ${area2}). Sum: ${area1} + ${area2} = ${Math.abs(answer)}!`;

    return {
      headline: 'The Area Box (Split Tens & Ones)',
      subtext: `${big} × ${small} solved in two easy mental chunks`,
      shortcutEquation,
      realWorldAnalogy,
      clunkyWay,
      mentalFlowWay,
      steps: [
        `Split 2-digit number: ${big} = ${tens} (Tens) + ${ones} (Ones)`,
        `Multiply easy tens box: ${tens} × ${small} = ${area1}`,
        `Multiply units box: ${ones} × ${small} = ${area2}`,
        `Combine the two boxes: ${area1} + ${area2} = ${Math.abs(answer)}`,
        ...(isNeg ? [`Signs rule: opposite signs make the product negative = ${answer}`] : [])
      ],
      intuitionTip: 'Multiply from left to right (tens first, ones second). You will never need to carry a digit in your head again!'
    };
  }

  if (modelType === 'chunking-division') {
    const num = Math.abs(op1);
    const den = Math.abs(op2);
    const isNeg = answer < 0;

    const baseMult = den * 10;
    let part1 = baseMult <= num ? baseMult : (den * 5 <= num ? den * 5 : den * Math.floor(num / den));
    let part2 = num - part1;
    const q1 = part1 / den;
    const q2 = part2 / den;

    const shortcutEquation = `${num} ÷ ${den}  ➔  (${part1} ÷ ${den}) + (${part2} ÷ ${den})  ➔  ${q1} + ${q2} = ${Math.abs(answer)}${isNeg ? ` (Opposite signs = ${answer})` : ''}`;
    const realWorldAnalogy = `Package Sorting: You have ${num} items to distribute into packs of ${den}. Peel off ${part1} items first (that's an immediate ${q1} packs!). You only have ${part2} items left (${q2} packs). Total = ${q1 + q2} packs!`;
    const clunkyWay = `Long division algorithm: divide ${den} into the first digit, find remainder, bring down the next digit... (too slow for rapid mental agility).`;
    const mentalFlowWay = `Peel off the easiest 10× chunk first (${part1} = ${q1} groups), then divide the leftover (${part2} = ${q2} groups). Add them: ${q1} + ${q2} = ${Math.abs(answer)}.`;

    return {
      headline: 'The 10× Peel-Off (Friendly Chunking)',
      subtext: `${num} ÷ ${den} decomposed into benchmark multiples`,
      shortcutEquation,
      realWorldAnalogy,
      clunkyWay,
      mentalFlowWay,
      steps: [
        `Peel off the largest friendly multiple of ${den}: ${part1} = (${q1} × ${den})`,
        `Examine remaining portion: ${part2} = (${q2} × ${den})`,
        `Sum the quotient pieces: ${q1} + ${q2} = ${Math.abs(answer)}`,
        ...(isNeg ? [`Opposite signs create negative quotient = ${answer}`] : [])
      ],
      intuitionTip: 'Division is asking "how many chunks fit?" Peel off 10× chunks first.'
    };
  }

  if (modelType === 'number-line-bridge') {
    if (op === '-') {
      const low = Math.min(op1, op2);
      const high = Math.max(op1, op2);
      const nextTen = Math.ceil(low / 10) * 10;
      const jump1 = nextTen - low;
      const jump2 = high - nextTen;

      // Also compute the Round-and-Compensate method (Cashier's change)
      const roundOp2 = Math.ceil(op2 / 10) * 10;
      const overSubtract = roundOp2 - op2;
      const afterOverSub = op1 - roundOp2;

      const shortcutEquation = `${op1} - ${op2}  ➔  Over-subtract to ${roundOp2}: (${op1} - ${roundOp2}) + ${overSubtract}  ➔  ${afterOverSub} + ${overSubtract} = ${answer}`;
      const realWorldAnalogy = `The Cashier's Change: If something costs $${op2}, hand over $${roundOp2}. You immediately know you get $${overSubtract} change back! So subtract $${roundOp2} from ${op1} (= ${afterOverSub}), then add back your $${overSubtract} change = ${answer}!`;
      const clunkyWay = `Borrowing from tens column in your head (cross out tens digit, add 10 to units, subtract units, subtract tens). High memory strain!`;
      const mentalFlowWay = `Subtract the friendly 10 (${roundOp2}) in 0.2s, then give back the ${overSubtract} change = ${answer}.`;

      return {
        headline: "The Cashier's Change Trick (Over-Subtract & Adjust)",
        subtext: `Solve ${op1} − ${op2} without ever borrowing a digit`,
        shortcutEquation,
        realWorldAnalogy,
        clunkyWay,
        mentalFlowWay,
        steps: [
          `Round ${op2} up to friendly decade: ${roundOp2} (over-subtracted by ${overSubtract})`,
          `Fast subtraction: ${op1} − ${roundOp2} = ${afterOverSub}`,
          `Add back your change: ${afterOverSub} + ${overSubtract} = ${answer}`,
          `Alternative (Number line): jump from ${low} to ${nextTen} (+${jump1}), then to ${high} (+${jump2}) = ${jump1 + jump2}`
        ],
        intuitionTip: 'Never borrow! Round the second number up to the next 10, subtract fast, and give back the difference.'
      };
    } else {
      // Addition bridging: Give and take to make a friendly 10
      const target = op1 >= op2 ? op1 : op2;
      const donor = op1 >= op2 ? op2 : op1;
      const nextTen = Math.ceil(target / 10) * 10;
      const needed = nextTen - target;
      const donorRemaining = donor - needed;

      const shortcutEquation = `${target} (+${needed}) + ${donor} (−${needed})  ➔  ${nextTen} + ${donorRemaining} = ${answer}`;
      const realWorldAnalogy = `The Friendly 10 Magnet: ${target} is starving for ${needed} unit${needed > 1 ? 's' : ''} to reach ${nextTen}. It steals ${needed} from ${donor} (leaving ${donorRemaining}). Adding ${nextTen} + ${donorRemaining} is instantaneous!`;
      const clunkyWay = `Column addition: add units digits, carry 1, hold carried digit in working memory while adding tens.`;
      const mentalFlowWay = `Steal ${needed} from ${donor} to round ${target} up to ${nextTen}. Then ${nextTen} + ${donorRemaining} = ${answer}. Zero carrying!`;

      return {
        headline: 'The Friendly 10 Magnet (Give & Take)',
        subtext: `Transfer units to round to a friendly 10`,
        shortcutEquation,
        realWorldAnalogy,
        clunkyWay,
        mentalFlowWay,
        steps: [
          `Find how much ${target} needs to reach a round 10: needs ${needed} to reach ${nextTen}`,
          `Transfer ${needed} from ${donor} (leaving ${donorRemaining})`,
          `Instant combination: ${nextTen} + ${donorRemaining} = ${answer}`
        ],
        intuitionTip: 'Make a round 10 first by stealing from the other number. Friendly numbers require zero mental carryover.'
      };
    }
  }

  return {
    headline: 'Continuous Dimension Gauge',
    subtext: 'Direct coordinate equivalence',
    shortcutEquation: `${op1}/${op2}  ➔  ${(op1 / op2).toFixed(2)}  ➔  ${((op1 / op2) * 100).toFixed(0)}%`,
    realWorldAnalogy: 'Think of Coins & Quarters: 1/4 is 25 cents, 1/2 is 50 cents, 3/4 is 75 cents. Fractions, decimals, and percentages are the exact same point on a ruler.',
    clunkyWay: 'Carrying out long division for standard fractions.',
    mentalFlowWay: 'Anchor to coin benchmarks (quarters and tenths).',
    steps: [`Anchor fraction to nearest benchmark`, `Express as decimal or percent`],
    intuitionTip: 'Coins and percentages make fractions visual and tangible.'
  };
}
