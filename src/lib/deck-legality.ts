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
    // Banned card in deck
    if (card.banned) {
      issues.push({
        severity: "error",
        message: `${card.name} is banned`,
        cardId: card.id,
        cardName: card.name,
      });
    }

    // Copy-limit violations
    const max =
      deck.game === "yugioh"
        ? card.banned ? 0 : card.limited ? 1 : card.semiLimited ? 2 : 3
        : deck.game === "pokemon" || deck.game === "mtg" || deck.game === "lorcana" ||
          deck.game === "digimon" || deck.game === "unionarena"
        ? 4
        : 3;

    if (quantity > max && max > 0) {
      issues.push({
        severity: "error",
        message: `${card.name}: ${quantity} copies (max ${max})`,
        cardId: card.id,
        cardName: card.name,
      });
    }

    if (card.limited && quantity > 1) {
      issues.push({
        severity: "error",
        message: `${card.name} is limited to 1 copy`,
        cardId: card.id,
        cardName: card.name,
      });
    }

    if (card.semiLimited && quantity > 2) {
      issues.push({
        severity: "error",
        message: `${card.name} is semi-limited to 2 copies`,
        cardId: card.id,
        cardName: card.name,
      });
    }
  }

  return issues;
}
