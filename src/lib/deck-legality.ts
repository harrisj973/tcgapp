import { Deck } from "@/types";
import { getGame } from "./games";

export interface LegalityIssue {
  severity: "error" | "warning";
  message: string;
  cardId?: string;
  cardName?: string;
}

export function checkDeckLegality(deck: Deck): LegalityIssue[] {
  const issues: LegalityIssue[] = [];
  const game = getGame(deck.game);
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  // Deck size
  if (total < game.deckSize.min) {
    issues.push({
      severity: "warning",
      message: `Deck needs ${game.deckSize.min - total} more card${game.deckSize.min - total !== 1 ? "s" : ""} (min ${game.deckSize.min})`,
    });
  } else if (total > game.deckSize.max) {
    issues.push({
      severity: "error",
      message: `Deck is ${total - game.deckSize.max} card${total - game.deckSize.max !== 1 ? "s" : ""} over the limit (max ${game.deckSize.max})`,
    });
  }

  for (const { card, quantity } of deck.cards) {
    // Banned card — single consolidated message
    if (card.banned) {
      issues.push({
        severity: "error",
        message: card.game === "yugioh" && quantity > 0
          ? `${card.name} is banned (remove all copies)`
          : `${card.name} is banned`,
        cardId: card.id,
        cardName: card.name,
      });
      continue; // skip copy-limit checks — banned cards can't legally be present at all
    }

    // Copy-limit violations (non-banned cards only)
    const max =
      deck.game === "yugioh"
        ? card.limited ? 1 : card.semiLimited ? 2 : 3
        : deck.game === "pokemon" || deck.game === "mtg" || deck.game === "lorcana" ||
          deck.game === "digimon" || deck.game === "unionarena"
        ? 4
        : 3;

    if (card.limited && quantity > 1) {
      issues.push({
        severity: "error",
        message: `${card.name} is limited to 1 copy (has ${quantity})`,
        cardId: card.id,
        cardName: card.name,
      });
    } else if (card.semiLimited && quantity > 2) {
      issues.push({
        severity: "error",
        message: `${card.name} is semi-limited to 2 copies (has ${quantity})`,
        cardId: card.id,
        cardName: card.name,
      });
    } else if (quantity > max) {
      issues.push({
        severity: "error",
        message: `${card.name}: ${quantity} copies (max ${max})`,
        cardId: card.id,
        cardName: card.name,
      });
    }
  }

  return issues;
}
