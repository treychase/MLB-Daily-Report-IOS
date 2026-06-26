export function fmtRate(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return '.---';
  const s = v.toFixed(3);
  return v < 1 ? s.replace(/^0/, '') : s;
}

export function fmtRate2(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return '—';
  return v.toFixed(2);
}

export function fmtPct(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return '—';
  return `${Math.round(v * 100)}%`;
}

export function americanOdds(p: number): string {
  if (p <= 0 || p >= 1) return '—';
  if (p >= 0.5) return `${Math.round(-p / (1 - p) * 100)}`;
  return `+${Math.round((1 - p) / p * 100)}`;
}

export function fmtDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function fmtShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function fmtGameTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  } catch {
    return '';
  }
}

export function gameStatusLabel(state: string): { label: string; type: 'final' | 'live' | 'sched' } {
  const s = (state ?? '').toLowerCase();
  if (s.includes('final') || s.includes('game over')) return { label: 'FINAL', type: 'final' };
  if (s.includes('progress') || s.includes('live') || s.includes('inning')) return { label: 'LIVE', type: 'live' };
  return { label: 'SCHEDULED', type: 'sched' };
}

export function negBinomOverProb(line: number, alpha: number, beta: number): number {
  const p = beta / (1 + beta);
  const k = Math.floor(line);
  let prob = 0;
  for (let i = 0; i <= k; i++) {
    prob += negBinomPMF(i, alpha, p);
    if (prob >= 1) return 0;
  }
  return Math.max(0, Math.min(1, 1 - prob));
}

function negBinomPMF(k: number, r: number, p: number): number {
  return Math.exp(logGammaComb(k, r) + r * Math.log(p) + k * Math.log(1 - p));
}

function logGammaComb(k: number, r: number): number {
  return logGamma(k + r) - logGamma(r) - logGamma(k + 1);
}

function logGamma(x: number): number {
  if (x <= 0) return 0;
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = 0.99999999999980993;
  const c = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
             -176.61502916214059, 12.507343278686905, -0.13857109526572012,
             9.9843695780195716e-6, 1.5056327351493116e-7];
  for (let i = 0; i < 8; i++) a += c[i] / (x + i + 1);
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function studentTOverProb(line: number, mu: number, sigma: number, nu: number): number {
  const t = (line - mu) / sigma;
  return 1 - studentTCDF(t, nu);
}

function studentTCDF(t: number, nu: number): number {
  const x = nu / (nu + t * t);
  const ib = incompleteBeta(nu / 2, 0.5, x) / 2;
  return t >= 0 ? 1 - ib : ib;
}

function incompleteBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return 0;
  if (x === 0) return 0;
  if (x === 1) return 1;
  let sum = 0;
  const maxIter = 100;
  let term = 1;
  for (let m = 0; m < maxIter; m++) {
    if (m === 0) {
      term = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b)) / a;
    } else {
      term *= x * (a + b + m - 1) / (m * (a + m));
    }
    sum += term;
    if (Math.abs(term) < 1e-8 * Math.abs(sum)) break;
  }
  return Math.min(1, Math.max(0, sum));
}
