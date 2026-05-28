import { Card, TCGGame, SearchFilters } from "@/types";
import { ONEPIECE_CARDS } from "./opcg-cards";
import { GUNDAM_CARDS } from "./gundam-cards";
import { POKEMON_CARDS } from "./pokemon-cards";
import { LORCANA_CARDS } from "./lorcana-cards";
import { SWU_CARDS } from "./swu-cards";
import { DIGIMON_CARDS } from "./digimon-cards";
import { UA_CARDS } from "./ua-cards";

// Real ban list card numbers (from official OPTCG ban list, effective 2026-04-10)
const OPCG_BANNED_IDS = new Set([
  "op-op03_040", "op-op06_116", "op-op06_086", "op-op06_047", "op-st10_001",
]);

// Apply ban flags to One Piece cards
const ONEPIECE_CARDS_WITH_BANS: Card[] = ONEPIECE_CARDS.map((c) =>
  OPCG_BANNED_IDS.has(c.id) ? { ...c, banned: true } : c
);

// Comprehensive card databases with representative cards for each game
const YGO_CARDS: Card[] = [
  { id: "ygo-1", name: "Blue-Eyes White Dragon", game: "yugioh", type: "Monster", subtype: "Normal", level: 8, atk: 3000, def: 2500, attribute: "LIGHT", rarity: "Ultra Rare", archetype: ["Blue-Eyes"], description: "This legendary dragon is a powerful engine of destruction.", tags: ["boss", "dragon", "normal"] },
  { id: "ygo-2", name: "Dark Magician", game: "yugioh", type: "Monster", subtype: "Normal", level: 7, atk: 2500, def: 2100, attribute: "DARK", rarity: "Ultra Rare", archetype: ["Dark Magician"], description: "The ultimate wizard in terms of attack and defense.", tags: ["boss", "spellcaster", "normal"] },
  { id: "ygo-3", name: "Pot of Greed", game: "yugioh", type: "Spell", subtype: "Normal", rarity: "Super Rare", banned: true, description: "Draw 2 cards.", tags: ["draw", "banned"] },
  { id: "ygo-4", name: "Monster Reborn", game: "yugioh", type: "Spell", subtype: "Normal", rarity: "Ultra Rare", limited: true, description: "Target 1 monster in either GY; Special Summon it.", tags: ["revival", "limited"] },
  { id: "ygo-5", name: "Ash Blossom & Joyous Spring", game: "yugioh", type: "Monster", subtype: "Tuner/Effect", level: 3, atk: 0, def: 1800, attribute: "FIRE", rarity: "Secret Rare", archetype: ["Hand Trap"], description: "Hand trap that negates searches, mill, and special summons from deck.", tags: ["handtrap", "staple"] },
  { id: "ygo-6", name: "Nibiru, the Primal Being", game: "yugioh", type: "Monster", subtype: "Effect", level: 11, atk: 3000, def: 600, attribute: "LIGHT", rarity: "Secret Rare", archetype: ["Hand Trap"], description: "If your opponent Normal or Special Summoned 5+ times this turn, you can Special Summon this.", tags: ["handtrap", "staple"] },
  { id: "ygo-7", name: "Infinite Impermanence", game: "yugioh", type: "Trap", subtype: "Normal", rarity: "Secret Rare", description: "Target 1 face-up monster your opponent controls; negate its effects until end of turn.", tags: ["negate", "handtrap", "staple"] },
  { id: "ygo-8", name: "Called by the Grave", game: "yugioh", type: "Spell", subtype: "Quick-Play", rarity: "Rare", description: "Target 1 monster in your opponent's GY; banish it, and if you do, until the end of the next turn, negate the effects of monsters with the same name.", tags: ["handtrap-counter", "staple"] },
  { id: "ygo-9", name: "Pot of Prosperity", game: "yugioh", type: "Spell", subtype: "Normal", rarity: "Secret Rare", description: "Banish 3 or 6 cards face-down from your Extra Deck; look at that many cards from the top of your Deck, add 1 to your hand, place the rest on the bottom.", tags: ["draw", "staple"] },
  { id: "ygo-10", name: "Solemn Judgment", game: "yugioh", type: "Trap", subtype: "Counter", rarity: "Ultra Rare", description: "When a monster would be Summoned, OR a Spell/Trap Card is activated: Pay half your LP; negate the Summon or activation, and if you do, destroy that card.", tags: ["negate", "counter-trap"] },
  { id: "ygo-11", name: "Terraforming", game: "yugioh", type: "Spell", subtype: "Normal", rarity: "Super Rare", limited: true, description: "Add 1 Field Spell Card from your Deck to your hand.", tags: ["search", "field-spell"] },
  { id: "ygo-12", name: "Dark Ruler No More", game: "yugioh", type: "Spell", subtype: "Normal", rarity: "Super Rare", description: "Negate the effects of all face-up monsters your opponent currently controls, until the end of this turn.", tags: ["board-break", "staple"] },
  { id: "ygo-13", name: "Crossout Designator", game: "yugioh", type: "Spell", subtype: "Quick-Play", rarity: "Super Rare", description: "Banish 1 card from your Deck; until the end of this turn, negate the effects of all cards with that name.", tags: ["handtrap-counter"] },
  { id: "ygo-14", name: "Effect Veiler", game: "yugioh", type: "Monster", subtype: "Tuner/Effect", level: 1, atk: 0, def: 0, attribute: "LIGHT", rarity: "Ultra Rare", archetype: ["Hand Trap"], description: "During your opponent's Main Phase: You can send this card from your hand to the GY; negate the effects of 1 face-up monster your opponent controls, until the end of this turn.", tags: ["handtrap"] },
  { id: "ygo-15", name: "Mystical Space Typhoon", game: "yugioh", type: "Spell", subtype: "Quick-Play", rarity: "Common", description: "Target 1 Spell/Trap on the field; destroy it.", tags: ["removal"] },
];




const MTG_CARDS: Card[] = [
  { id: "mtg-1", name: "Lightning Bolt", game: "mtg", type: "Instant", manaCost: "R", cmc: 1, colors: ["Red"], rarity: "Common", description: "Lightning Bolt deals 3 damage to any target.", tags: ["removal", "burn", "staple"] },
  { id: "mtg-2", name: "Counterspell", game: "mtg", type: "Instant", manaCost: "UU", cmc: 2, colors: ["Blue"], rarity: "Common", description: "Counter target spell.", tags: ["counter", "staple"] },
  { id: "mtg-3", name: "Black Lotus", game: "mtg", type: "Artifact", manaCost: "0", cmc: 0, colors: [], rarity: "Mythic Rare", banned: true, description: "Tap, Sacrifice Black Lotus: Add three mana of any one color.", tags: ["power9", "banned"] },
  { id: "mtg-4", name: "Thoughtseize", game: "mtg", type: "Sorcery", manaCost: "B", cmc: 1, colors: ["Black"], rarity: "Rare", description: "Target player reveals their hand. You choose a nonland, nontoken card from it. That player discards that card. You lose 2 life.", tags: ["discard", "hand-disruption", "staple"] },
  { id: "mtg-5", name: "Snapcaster Mage", game: "mtg", type: "Creature", subtype: "Human Wizard", manaCost: "1U", cmc: 2, colors: ["Blue"], power: 2, rarity: "Mythic Rare", description: "Flash. When Snapcaster Mage enters, target instant or sorcery card in your graveyard gains flashback until end of turn.", tags: ["value", "flash", "staple"] },
  { id: "mtg-6", name: "Wrenn and Six", game: "mtg", type: "Planeswalker", manaCost: "RG", cmc: 2, colors: ["Red", "Green"], rarity: "Mythic Rare", description: "+1: Return target land card from your graveyard to your hand. -1: Wrenn and Six deals 1 damage to any target. -7: You get an emblem with 'Instant and sorcery cards in your graveyard have retrace.'", tags: ["planeswalker", "staple"] },
  { id: "mtg-7", name: "Ragavan, Nimble Pilferer", game: "mtg", type: "Creature", subtype: "Monkey Pirate", manaCost: "R", cmc: 1, colors: ["Red"], power: 2, rarity: "Mythic Rare", description: "Dash 1R. Whenever Ragavan, Nimble Pilferer deals combat damage to a player, create a Treasure token and exile the top card of that player's library. Until end of turn, you may cast that card.", tags: ["aggro", "tempo", "staple"] },
  { id: "mtg-8", name: "Force of Will", game: "mtg", type: "Instant", manaCost: "3UU", cmc: 5, colors: ["Blue"], rarity: "Uncommon", description: "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost. Counter target spell.", tags: ["counter", "staple", "free"] },
  { id: "mtg-9", name: "Tarmogoyf", game: "mtg", type: "Creature", subtype: "Lhurgoyf", manaCost: "1G", cmc: 2, colors: ["Green"], rarity: "Mythic Rare", description: "Tarmogoyf's power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.", tags: ["beater", "staple"] },
];

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
  ...YGO_CARDS,
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
