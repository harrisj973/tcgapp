import { Deck, TCGGame } from "@/types";

// In-memory price cache keyed by card ID
const cache = new Map<string, number>();

// ── Yu-Gi-Oh (YGOPRODeck API — free, open CORS) ──────────────────────────

async function fetchYGOPrices(deck: Deck): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const cards = deck.cards.filter((dc) => !cache.has(dc.card.id));

  // Parallel fetches — YGOPRODeck is fast and has no rate limit for normal usage
  await Promise.allSettled(
    cards.map(async ({ card }) => {
      try {
        const res = await fetch(
          `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(card.name)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return;
        const json = await res.json();
        const raw = json.data?.[0]?.card_prices?.[0]?.tcgplayer_price;
        const price = raw !== undefined ? parseFloat(raw) : NaN;
        if (!isNaN(price)) {
          cache.set(card.id, price);
          results.set(card.id, price);
        }
      } catch { /* network or parse error — silently skip */ }
    })
  );

  // Merge cached values
  for (const { card } of deck.cards) {
    const p = cache.get(card.id);
    if (p !== undefined) results.set(card.id, p);
  }
  return results;
}

// ── Magic: The Gathering (Scryfall collection API — free, open CORS) ─────

async function fetchMTGPrices(deck: Deck): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const toFetch = deck.cards.filter((dc) => !cache.has(dc.card.id));

  // Scryfall collection endpoint: up to 75 cards per request
  const chunks: typeof toFetch[] = [];
  for (let i = 0; i < toFetch.length; i += 75) {
    chunks.push(toFetch.slice(i, i + 75));
  }

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const identifiers = chunk.map((dc) => ({
          oracle_id: dc.card.id.slice(4), // strip "mtg-" prefix
        }));
        const res = await fetch("https://api.scryfall.com/cards/collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifiers }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return;
        const json = await res.json();
        for (const card of json.data ?? []) {
          const price = parseFloat(card.prices?.usd ?? "0");
          const cardId = `mtg-${card.oracle_id}`;
          if (price > 0) {
            cache.set(cardId, price);
            results.set(cardId, price);
          }
        }
      } catch { /* silently skip */ }
    })
  );

  for (const { card } of deck.cards) {
    const p = cache.get(card.id);
    if (p !== undefined) results.set(card.id, p);
  }
  return results;
}

// ── Pokémon TCG (pokemontcg.io — free, open CORS, no key required) ───────

// Convert our card ID to pokemontcg.io format: "poke-sv5_001" → "sv5-1"
function pokeCardToApiId(cardId: string): string {
  const code = cardId.slice(5); // strip "poke-"
  const ul = code.lastIndexOf("_");
  if (ul === -1) return code;
  const setId = code.slice(0, ul);
  const num = parseInt(code.slice(ul + 1), 10);
  return `${setId}-${num}`;
}

function pickPokePrice(prices: Record<string, { market?: number | null }>): number {
  const priority = ["normal", "holofoil", "reverseHolofoil", "1stEditionHolofoil", "1stEditionNormal"];
  for (const key of priority) {
    const market = prices[key]?.market;
    if (typeof market === "number" && !isNaN(market)) return market;
  }
  return NaN;
}

async function fetchPokemonPrices(deck: Deck): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const toFetch = deck.cards.filter((dc) => !cache.has(dc.card.id));

  // Build a lookup from pokemontcg.io ID → our card ID
  const apiIdToCardId = new Map<string, string>();
  for (const { card } of toFetch) {
    apiIdToCardId.set(pokeCardToApiId(card.id), card.id);
  }

  // Batch 20 cards per request (safe URL length)
  const apiIds = Array.from(apiIdToCardId.keys());
  const chunks: string[][] = [];
  for (let i = 0; i < apiIds.length; i += 20) {
    chunks.push(apiIds.slice(i, i + 20));
  }

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const q = chunk.map((id) => `id:${id}`).join(" OR ");
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=20&select=id,tcgplayer`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return;
        const json = await res.json();
        for (const card of json.data ?? []) {
          const cardId = apiIdToCardId.get(card.id);
          if (!cardId) continue;
          const price = pickPokePrice(card.tcgplayer?.prices ?? {});
          if (!isNaN(price)) {
            cache.set(cardId, price);
            results.set(cardId, price);
          }
        }
      } catch { /* silently skip */ }
    })
  );

  for (const { card } of deck.cards) {
    const p = cache.get(card.id);
    if (p !== undefined) results.set(card.id, p);
  }
  return results;
}

// ── Public entry point ─────────────────────────────────────────────────────

export const PRICING_SUPPORTED_GAMES: TCGGame[] = ["yugioh", "mtg", "pokemon"];

export async function fetchDeckPrices(deck: Deck): Promise<Map<string, number>> {
  if (deck.game === "yugioh") return fetchYGOPrices(deck);
  if (deck.game === "mtg") return fetchMTGPrices(deck);
  if (deck.game === "pokemon") return fetchPokemonPrices(deck);
  return new Map();
}

export function getDeckTotalPrice(priceMap: Map<string, number>, deck: Deck): number {
  let total = 0;
  for (const { card, quantity } of deck.cards) {
    total += (priceMap.get(card.id) ?? 0) * quantity;
  }
  return total;
}
