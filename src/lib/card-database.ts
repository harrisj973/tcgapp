import { Card, TCGGame, SearchFilters } from "@/types";
import { ONEPIECE_CARDS } from "./opcg-cards";
import { GUNDAM_CARDS } from "./gundam-cards";
import { POKEMON_CARDS } from "./pokemon-cards";
import { LORCANA_CARDS } from "./lorcana-cards";
import { SWU_CARDS } from "./swu-cards";
import { DIGIMON_CARDS } from "./digimon-cards";
import { UA_CARDS } from "./ua-cards";
import { YUGIOH_CARDS } from "./yugioh-cards";
import { MTG_CARDS } from "./mtg-cards";
import { RIFTBOUND_CARDS } from "./riftbound-cards";

// Real ban list card numbers (from official OPTCG ban list, effective 2026-04-10)
const OPCG_BANNED_IDS = new Set([
  "op-op03_040", "op-op06_116", "op-op06_086", "op-op06_047", "op-st10_001",
]);

// Apply ban flags to One Piece cards
const ONEPIECE_CARDS_WITH_BANS: Card[] = ONEPIECE_CARDS.map((c) =>
  OPCG_BANNED_IDS.has(c.id) ? { ...c, banned: true } : c
);





const DBS_CARDS: Card[] = [
  { id: "dbs-1", name: "Son Goku, The Awakened Power", game: "dbs", type: "Leader", color: "Red/Yellow", power: 15000, rarity: "Leader", description: "Awaken: When you have 4 or less life, flip this card over. Skills: [Sparking] your Red/Yellow cards are [Permanent].", tags: ["leader", "red", "yellow", "awakened"] },
  { id: "dbs-2", name: "Super Saiyan Son Goku", game: "dbs", type: "Battle", color: "Red", cost: 4, power: 20000, rarity: "Super Rare", description: "Critical. Auto: When this card attacks, if your Leader Card is a [Saiyan] card, draw 1 card.", tags: ["saiyan", "red", "critical"] },
  { id: "dbs-3", name: "Vegeta, Saiyan Prince", game: "dbs", type: "Battle", color: "Blue", cost: 3, power: 15000, rarity: "Rare", description: "Blocker. Auto: When you use this card's Blocker, draw 1 card.", tags: ["blocker", "blue", "saiyan"] },
  { id: "dbs-4", name: "Frieza, Cruel Tyrant", game: "dbs", type: "Battle", color: "Black", cost: 5, power: 25000, rarity: "Ultra Rare", description: "When you play this card, your opponent must choose and send 2 cards from their hand to their Drop Area.", tags: ["hand-disruption", "black"] },
];



const DBSFUSION_CARDS: Card[] = [
  { id: "fw-1", name: "Son Goku FW01-001", game: "dbsfusion", type: "Leader", color: "Red", power: 10000, rarity: "Leader", description: "Once per turn, your Red Battle cards get [Sparking 1] when they attack.", tags: ["leader", "red", "goku"] },
  { id: "fw-2", name: "Broly, Legendary Super Saiyan", game: "dbsfusion", type: "Battle", color: "Green", cost: 5, power: 25000, rarity: "Ultra Rare", description: "Permanent: This card's Power increases by 5000 for each card in your Drop Area.", tags: ["green", "boss", "broly"] },
];

const ALL_CARDS: Card[] = [
  ...YUGIOH_CARDS,
  ...ONEPIECE_CARDS_WITH_BANS,
  ...DIGIMON_CARDS,
  ...POKEMON_CARDS,
  ...MTG_CARDS,
  ...DBS_CARDS,
  ...UA_CARDS,
  ...GUNDAM_CARDS,
  ...DBSFUSION_CARDS,
  ...LORCANA_CARDS,
  ...SWU_CARDS,
  ...RIFTBOUND_CARDS,
];

export function getCardsForGame(game: TCGGame): Card[] {
  return ALL_CARDS.filter((c) => c.game === game);
}

export function searchCards(game: TCGGame, filters: SearchFilters): Card[] {
  let cards = getCardsForGame(game);

  if (filters.query) {
    const q = filters.query.toLowerCase();
    cards = cards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.effect?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.includes(q))
    );
  }

  if (filters.type) {
    cards = cards.filter((c) =>
      c.type.toLowerCase().includes(filters.type!.toLowerCase())
    );
  }

  if (filters.color) {
    cards = cards.filter((c) =>
      c.color?.toLowerCase().includes(filters.color!.toLowerCase())
    );
  }

  if (filters.rarity) {
    cards = cards.filter((c) =>
      c.rarity?.toLowerCase().includes(filters.rarity!.toLowerCase())
    );
  }

  if (filters.maxCost !== undefined) {
    cards = cards.filter((c) => {
      const cost = typeof c.cost === "number" ? c.cost : (c.cmc ?? c.level);
      // Cards with no cost/level field (e.g. YGO Spells/Traps) are not excluded by this filter
      return cost === undefined || cost <= filters.maxCost!;
    });
  }

  if (filters.banned === false) {
    cards = cards.filter((c) => !c.banned);
  }

  return cards;
}

export function getCardById(id: string): Card | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getCardTypes(game: TCGGame): string[] {
  const cards = getCardsForGame(game);
  return [...new Set(cards.map((c) => c.type))];
}

export function getCardColors(game: TCGGame): string[] {
  const cards = getCardsForGame(game);
  return [...new Set(cards.map((c) => c.color).filter(Boolean) as string[])];
}

export function getCardRarities(game: TCGGame): string[] {
  const cards = getCardsForGame(game);
  const rarities = [...new Set(cards.map((c) => c.rarity).filter(Boolean) as string[])];
  // Sort from most to least rare so the dropdown reads naturally
  const order = ["Secret Rare", "Mega Hyper Rare", "Hyper Rare", "Special Illustration Rare",
    "Ultra Rare", "Super Rare", "Mythic Rare", "Rare", "Illustration Rare", "Uncommon", "Common",
    "Leader", "Legendary", "Legend Rare", "Promo"];
  return rarities.sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

// Whether this game uses a numeric cost/level field worth filtering
export function getGameCostLabel(game: TCGGame): string | null {
  if (game === "yugioh") return "Level";
  if (game === "pokemon") return null;
  if (game === "mtg") return "CMC";
  return "Cost";
}
