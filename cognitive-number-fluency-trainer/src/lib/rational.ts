/**
 * Rational and Verbal Number Utilities
 */

export class Rational {
  n: number;
  d: number;

  constructor(n: number, d = 1) {
    if (d === 0) throw new Error("Denominator cannot be zero");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = Rational.gcd(Math.abs(Math.round(n)), Math.abs(Math.round(d)));
    this.n = Math.round(n / g);
    this.d = Math.round(d / g);
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : Rational.gcd(b, a % b);
  }

  add(o: Rational): Rational {
    return new Rational(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  sub(o: Rational): Rational {
    return new Rational(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  mul(o: Rational): Rational {
    return new Rational(this.n * o.n, this.d * o.d);
  }

  div(o: Rational): Rational {
    if (o.n === 0) throw new Error("Division by zero");
    return new Rational(this.n * o.d, this.d * o.n);
  }

  valueOf(): number {
    return this.n / this.d;
  }

  isInteger(): boolean {
    return this.d === 1;
  }

  toFractionString(): string {
    return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`;
  }

  toDecimalString(maxDec = 2): string {
    const val = this.valueOf();
    return Number(val.toFixed(maxDec)).toString();
  }
}

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
];

export function intToWords(n: number): string {
  if (n < 0) return `negative ${intToWords(-n)}`;
  if (n < 20) return ONES[n];
  if (n < 100) {
    const u = n % 10;
    return TENS[Math.floor(n / 10)] + (u !== 0 ? `-${ONES[u]}` : "");
  }
  return `${n}`;
}

export function rationalToWords(r: Rational): string {
  const isNeg = r.n < 0;
  const absN = Math.abs(r.n);
  const absD = r.d;
  const prefix = isNeg ? "negative " : "";
  if (absD === 1) return prefix + intToWords(absN);

  const ORDINAL_DENOMS: Record<number, [string, string]> = {
    2: ["half", "halves"],
    3: ["third", "thirds"],
    4: ["quarter", "quarters"],
    5: ["fifth", "fifths"],
    6: ["sixth", "sixths"],
    8: ["eighth", "eighths"],
    10: ["tenth", "tenths"]
  };

  if (ORDINAL_DENOMS[absD]) {
    const name = absN === 1 ? ORDINAL_DENOMS[absD][0] : ORDINAL_DENOMS[absD][1];
    return `${prefix}${intToWords(absN)} ${name}`;
  }

  return `${prefix}${intToWords(absN)} over ${intToWords(absD)}`;
}

export function parseUserInput(inputStr: string): number | null {
  if (!inputStr) return null;
  const s = inputStr.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  if (s.endsWith("%")) {
    const val = parseFloat(s.slice(0, -1));
    return isNaN(val) ? null : val / 100;
  }

  if (s.includes("/")) {
    const parts = s.split("/");
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return null;
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

export function evaluateAccuracy(userVal: number | null, expectedVal: number): boolean {
  if (userVal === null) return false;
  return Math.abs(userVal - expectedVal) < 0.015;
}
