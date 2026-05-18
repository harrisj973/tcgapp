import { Card, TCGGame, SearchFilters } from "@/types";
import { ONEPIECE_CARDS } from "./opcg-cards";

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


const DIGIMON_CARDS: Card[] = [
  { id: "digi-1", name: "Agumon", game: "digimon", type: "Digimon", color: "Red", cost: 3, power: 3000, level: 3, rarity: "Common", archetype: ["Greymon"], description: "On play: You may place 1 card from your hand on the bottom of this Digimon's digivolution cards.", tags: ["rookie", "red"] },
  { id: "digi-2", name: "Greymon", game: "digimon", type: "Digimon", color: "Red", cost: 5, power: 5000, level: 4, rarity: "Uncommon", archetype: ["Greymon"], description: "Digivolve: 2 from Agumon. Security: Your opponent's Digimon gets -2000 DP for the turn.", tags: ["champion", "red"] },
  { id: "digi-3", name: "MetalGreymon", game: "digimon", type: "Digimon", color: "Red", cost: 7, power: 8000, level: 5, rarity: "Rare", archetype: ["Greymon"], description: "Digivolve: 3 from Greymon. When attacking, delete 1 opponent's Digimon with 5000 DP or less.", tags: ["ultimate", "red"] },
  { id: "digi-4", name: "WarGreymon", game: "digimon", type: "Digimon", color: "Red", cost: 12, power: 13000, level: 6, rarity: "Ultra Rare", archetype: ["Greymon"], description: "Digivolve: 4 from MetalGreymon. <Piercing> When this Digimon attacks, delete 1 security card.", tags: ["mega", "red", "piercing"] },
  { id: "digi-5", name: "Gabumon", game: "digimon", type: "Digimon", color: "Blue", cost: 3, power: 2000, level: 3, rarity: "Common", archetype: ["Garurumon"], description: "On play: Draw 1 card.", tags: ["rookie", "blue"] },
  { id: "digi-6", name: "Memory Boost!", game: "digimon", type: "Option", color: "None", cost: 1, rarity: "Common", description: "Gain 3 memory. Draw 1 card.", tags: ["memory", "draw", "staple"] },
  { id: "digi-7", name: "Tai Kamiya", game: "digimon", type: "Tamer", color: "Red", cost: 3, rarity: "Rare", archetype: ["Greymon"], description: "When you digivolve a Digimon, gain 1 memory. Your Digimon with [Greymon] in their name get +1000 DP.", tags: ["tamer", "red"] },
  { id: "digi-8", name: "Omegamon", game: "digimon", type: "Digimon", color: "White", cost: 14, power: 15000, level: 7, rarity: "Secret Rare", archetype: ["Royal Knights"], description: "Digivolve: 5 from Lv.6. <Rush> Delete 1 opponent's Digimon with 6000 DP or less.", tags: ["mega", "rush", "white"] },
];

const POKEMON_CARDS: Card[] = [
  { id: "poke-1", name: "Charizard ex", game: "pokemon", type: "Pokémon", subtype: "Stage 2", hp: 330, color: "Fire", rarity: "Special Rare", archetype: ["Charizard"], description: "Burning Darkness: 30+. This attack does 30 more damage for each Prize card your opponent has taken.", tags: ["boss", "fire", "stage2"] },
  { id: "poke-2", name: "Charmeleon", game: "pokemon", type: "Pokémon", subtype: "Stage 1", hp: 100, color: "Fire", rarity: "Common", archetype: ["Charizard"], description: "Evolves from Charmander. Evolves into Charizard.", tags: ["fire", "stage1"] },
  { id: "poke-3", name: "Charmander", game: "pokemon", type: "Pokémon", subtype: "Basic", hp: 60, color: "Fire", rarity: "Common", archetype: ["Charizard"], description: "Collect 1 Fire Energy from your deck.", tags: ["fire", "basic"] },
  { id: "poke-4", name: "Professor's Research", game: "pokemon", type: "Trainer", subtype: "Supporter", rarity: "Rare", description: "Discard your hand and draw 7 cards.", tags: ["draw", "supporter", "staple"] },
  { id: "poke-5", name: "Ultra Ball", game: "pokemon", type: "Trainer", subtype: "Item", rarity: "Common", description: "Discard 2 cards from your hand. Search your deck for a Pokémon, reveal it, and put it into your hand.", tags: ["search", "item", "staple"] },
  { id: "poke-6", name: "Boss's Orders", game: "pokemon", type: "Trainer", subtype: "Supporter", rarity: "Rare", description: "Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.", tags: ["gust", "supporter", "staple"] },
  { id: "poke-7", name: "Arcanine ex", game: "pokemon", type: "Pokémon", subtype: "Basic", hp: 220, color: "Fire", rarity: "Special Rare", description: "Primal Fangs: 120. Raging Claws: 200, discard 2 Energy.", tags: ["fire", "basic", "ex"] },
  { id: "poke-8", name: "Radiant Charizard", game: "pokemon", type: "Pokémon", subtype: "Basic", hp: 160, color: "Fire", rarity: "Radiant Rare", description: "Excited Heart: This Pokémon's attacks cost 1 less Energy for each Prize card your opponent has taken.", tags: ["fire", "basic", "radiant"] },
  { id: "poke-9", name: "Rare Candy", game: "pokemon", type: "Trainer", subtype: "Item", rarity: "Uncommon", description: "Choose 1 of your Basic Pokémon in play. If you have a Stage 2 card in your hand that evolves from that Pokémon, put that card onto the Basic Pokémon. (This counts as evolving that Pokémon.)", tags: ["evolution", "item", "staple"] },
  { id: "poke-10", name: "Iono", game: "pokemon", type: "Trainer", subtype: "Supporter", rarity: "Rare", description: "Each player shuffles their hand into their deck. Then, each player draws a card for each of their remaining Prize cards.", tags: ["hand-disruption", "supporter", "staple"] },
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

const UNIONARENA_CARDS: Card[] = [
  { id: "ua-1", name: "Naruto Uzumaki", game: "unionarena", type: "Character", color: "Red", cost: 2, power: 3000, rarity: "Rare", archetype: ["Naruto"], description: "On attack: Give all your Front Line characters +1000 Power.", tags: ["aggro", "red", "naruto"] },
  { id: "ua-2", name: "Ichigo Kurosaki", game: "unionarena", type: "Character", color: "Red", cost: 3, power: 5000, rarity: "Ultra Rare", archetype: ["Bleach"], description: "Strike: When this character attacks, draw 1 card.", tags: ["aggro", "red", "bleach"] },
  { id: "ua-3", name: "Goku", game: "unionarena", type: "Character", color: "Yellow", cost: 4, power: 6000, rarity: "Ultra Rare", archetype: ["Dragon Ball"], description: "Rush. Super: Add 1 card from your deck to your hand.", tags: ["rush", "yellow", "dragonball"] },
];

const GUNDAM_CARDS: Card[] = [
  { id: "gun-1", name: "RX-78-2 Gundam", game: "gundam", type: "Unit", color: "Blue", cost: 4, power: 6000, rarity: "Rare", description: "When deployed: Give 1 allied unit +2000 Power until end of turn.", tags: ["mobile-suit", "blue"] },
  { id: "gun-2", name: "Amuro Ray", game: "gundam", type: "Pilot", color: "Blue", cost: 2, rarity: "Rare", description: "When this pilot sorteys, draw 1 card. Piloting Bonus: +1000 Power.", tags: ["pilot", "blue"] },
  { id: "gun-3", name: "Char's Zaku II", game: "gundam", type: "Unit", color: "Red", cost: 3, power: 5000, rarity: "Uncommon", description: "Speed. When this unit attacks, give it +2000 Power.", tags: ["mobile-suit", "red", "speed"] },
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
  ...UNIONARENA_CARDS,
  ...GUNDAM_CARDS,
  ...DBSFUSION_CARDS,
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
