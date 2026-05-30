import { Deck, DeckCard, TCGGame, Card } from "@/types";
import { getCardsForGame } from "./card-database";
import { getGame } from "./games";

// ── Export ──────────────────────────────────────────────────────────────────

export function exportDeckText(deck: Deck): string {
  const game = getGame(deck.game);
  const lines: string[] = [
    `// ${deck.name}`,
    `// ${game.name} · ${deck.cards.reduce((s, dc) => s + dc.quantity, 0)} cards`,
    "",
  ];

  if (deck.leader) {
    lines.push("// Leader");
    lines.push(`1x ${deck.leader.name}`);
    lines.push("");
  }

  // Group by type
  const groups = new Map<string, DeckCard[]>();
  for (const dc of deck.cards) {
    if (!groups.has(dc.card.type)) groups.set(dc.card.type, []);
    groups.get(dc.card.type)!.push(dc);
  }

  for (const [type, cards] of groups) {
    lines.push(`// ${type}`);
    for (const dc of cards) {
      lines.push(`${dc.quantity}x ${dc.card.name}`);
    }
    lines.push("");
  }

  if (deck.extraDeck && deck.extraDeck.length > 0) {
    lines.push("// Extra Deck");
    for (const dc of deck.extraDeck) {
      lines.push(`${dc.quantity}x ${dc.card.name}`);
    }
    lines.push("");
  }

  if (deck.sideDeck && deck.sideDeck.length > 0) {
    lines.push("// Side Deck");
    for (const dc of deck.sideDeck) {
      lines.push(`${dc.quantity}x ${dc.card.name}`);
    }
  }

  return lines.join("\n").trim();
}

// ── Import ──────────────────────────────────────────────────────────────────

export interface ImportResult {
  cards: DeckCard[];
  matched: number;
  unmatched: string[];
}

export function importDeckText(text: string, game: TCGGame): ImportResult {
  const allCards = getCardsForGame(game);
  const byName = new Map(allCards.map((c) => [c.name.toLowerCase(), c]));

  const cardMap = new Map<string, DeckCard>();
  const unmatched: string[] = [];

  // Supported line formats:
  //   4x Card Name
  //   4 Card Name
  //   Card Name x4
  //   Card Name  (assumes 1)
  // Lines starting with // or # are comments and skipped
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    let qty = 1;
    let name = line;

    const prefixMatch = line.match(/^(\d+)[xX]?\s+(.+)$/);
    const suffixMatch = line.match(/^(.+?)\s+[xX](\d+)$/);

    if (prefixMatch) {
      qty = Math.min(parseInt(prefixMatch[1], 10), 99);
      name = prefixMatch[2].trim();
    } else if (suffixMatch) {
      name = suffixMatch[1].trim();
      qty = Math.min(parseInt(suffixMatch[2], 10), 99);
    }

    const card = byName.get(name.toLowerCase());
    if (!card) {
      if (!unmatched.includes(name)) unmatched.push(name);
      continue;
    }

    const existing = cardMap.get(card.id);
    if (existing) {
      cardMap.set(card.id, { ...existing, quantity: existing.quantity + qty });
    } else {
      cardMap.set(card.id, { card, quantity: qty });
    }
  }

  const cards = Array.from(cardMap.values());
  return { cards, matched: cards.length, unmatched };
}

// ── Share URL ────────────────────────────────────────────────────────────────

interface SharePayload {
  g: TCGGame;
  n: string;
  l?: string;   // leader card id
  c: Array<[string, number]>; // [cardId, qty]
}

export function encodeDeckToUrl(deck: Deck): string {
  const payload: SharePayload = {
    g: deck.game,
    n: deck.name,
    c: deck.cards.map((dc) => [dc.card.id, dc.quantity]),
  };
  if (deck.leader) payload.l = deck.leader.id;
  const encoded = btoa(JSON.stringify(payload));
  const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  return `${base}?share=${encodeURIComponent(encoded)}`;
}

export interface SharedDeckData {
  game: TCGGame;
  name: string;
  cards: DeckCard[];
  leader?: Card;
}

export function decodeDeckFromUrl(param: string): SharedDeckData | null {
  try {
    const payload: SharePayload = JSON.parse(atob(decodeURIComponent(param)));
    const allCards = getCardsForGame(payload.g);
    const byId = new Map(allCards.map((c) => [c.id, c]));

    const cards: DeckCard[] = [];
    for (const [id, qty] of payload.c) {
      const card = byId.get(id);
      if (card) cards.push({ card, quantity: qty });
    }

    const leader = payload.l ? byId.get(payload.l) : undefined;
    return { game: payload.g, name: payload.n, cards, leader };
  } catch {
    return null;
  }
}
