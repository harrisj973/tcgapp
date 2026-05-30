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

// ── Public entry point ─────────────────────────────────────────────────────

export const PRICING_SUPPORTED_GAMES: TCGGame[] = ["yugioh", "mtg"];

export async function fetchDeckPrices(deck: Deck): Promise<Map<string, number>> {
  if (deck.game === "yugioh") return fetchYGOPrices(deck);
  if (deck.game === "mtg") return fetchMTGPrices(deck);
  return new Map();
}

export function getDeckTotalPrice(priceMap: Map<string, number>, deck: Deck): number {
  let total = 0;
  for (const { card, quantity } of deck.cards) {
    total += (priceMap.get(card.id) ?? 0) * quantity;
  }
  return total;
}
