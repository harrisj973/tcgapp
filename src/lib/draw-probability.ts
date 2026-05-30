// Hypergeometric distribution: P(drawing exactly k successes in n draws
// from a population of N cards containing K successes)
function hypergeometricPMF(N: number, K: number, n: number, k: number): number {
  if (k > K || k > n || n - k > N - K) return 0;
  return (comb(K, k) * comb(N - K, n - k)) / comb(N, n);
}

// P(drawing AT LEAST minK successes)
export function probAtLeast(N: number, K: number, n: number, minK: number): number {
  let p = 0;
  for (let k = minK; k <= Math.min(K, n); k++) {
    p += hypergeometricPMF(N, K, n, k);
  }
  return Math.min(1, p);
}

// Logarithmic combinations to avoid overflow
const logFactCache: number[] = [0];
function logFact(n: number): number {
  for (let i = logFactCache.length; i <= n; i++) {
    logFactCache.push(logFactCache[i - 1] + Math.log(i));
  }
  return logFactCache[n];
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  return Math.exp(logFact(n) - logFact(k) - logFact(n - k));
}

export interface DrawEntry {
  cardId: string;
  cardName: string;
  copiesInDeck: number;
  wantAtLeast: number;
}

export interface DrawResult extends DrawEntry {
  probOpeningHand: number;   // P(≥wantAtLeast in opening hand)
  probByTurn3: number;       // P(≥wantAtLeast after drawing 3 more cards)
}

export function calculateDrawOdds(
  entries: DrawEntry[],
  deckSize: number,
  openingHandSize: number
): DrawResult[] {
  return entries.map((e) => ({
    ...e,
    probOpeningHand: probAtLeast(deckSize, e.copiesInDeck, openingHandSize, e.wantAtLeast),
    probByTurn3: probAtLeast(deckSize, e.copiesInDeck, openingHandSize + 3, e.wantAtLeast),
  }));
}
