export type TCGGame =
  | "yugioh"
  | "onepiece"
  | "digimon"
  | "gundam"
  | "dbs"
  | "dbsfusion"
  | "pokemon"
  | "unionarena"
  | "mtg"
  | "lorcana"
  | "swu"
  | "riftbound";

export interface GameConfig {
  id: TCGGame;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  gradient: string;
  deckSize: { min: number; max: number };
  extraDeckSize?: number;
  openingHandSize: number;
  description: string;
}

export type CardColor = "green" | "yellow" | "red" | "neutral";

export interface Card {
  id: string;
  name: string;
  game: TCGGame;
  type: string;
  subtype?: string;
  cost?: number | string;
  power?: number;
  attribute?: string;
  color?: string;
  rarity?: string;
  set?: string;
  setCode?: string;
  image?: string;
  description?: string;
  effect?: string;
  banned?: boolean;
  limited?: boolean;
  semiLimited?: boolean;
  archetype?: string[];
  tags?: string[];
  // Yu-Gi-Oh specific
  atk?: number;
  def?: number;
  level?: number;
  // One Piece specific
  life?: number;
  // Pokemon specific
  hp?: number;
  stage?: string;
  // MTG specific
  manaCost?: string;
  cmc?: number;
  colors?: string[];
}

export interface DeckCard {
  card: Card;
  quantity: number;
  synergy?: CardColor;
  synergyScore?: number;
  synergyReason?: string;
}

export interface Deck {
  id: string;
  name: string;
  game: TCGGame;
  cards: DeckCard[];
  extraDeck?: DeckCard[];
  sideDeck?: DeckCard[];
  leader?: Card;
  archetype?: string;
  winRate?: number;
  metaTier?: "S" | "A" | "B" | "C" | "D";
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckAnalysis {
  archetype: string;
  archetypeConfidence: number;
  synergies: SynergyGroup[];
  weaknesses: string[];
  strengths: string[];
  recommendations: CardRecommendation[];
  winProbability: number;
  metaScore: number;
  consistencyScore: number;
  speedScore: number;
  powerScore: number;
  cardRatioAnalysis: CardRatioAnalysis;
  missingComboPieces: string[];
  tierRating: "S" | "A" | "B" | "C" | "D";
}

export interface SynergyGroup {
  cards: string[];
  description: string;
  strength: "high" | "medium" | "low";
  type: "combo" | "engine" | "support" | "recovery";
}

export interface CardRecommendation {
  cardName: string;
  reason: string;
  priority: "high" | "medium" | "low";
  action: "add" | "remove" | "replace";
  replaceWith?: string;
  expectedImpact: string;
}

export interface CardRatioAnalysis {
  monsters?: { current: number; optimal: string; rating: CardColor };
  spells?: { current: number; optimal: string; rating: CardColor };
  traps?: { current: number; optimal: string; rating: CardColor };
  characters?: { current: number; optimal: string; rating: CardColor };
  events?: { current: number; optimal: string; rating: CardColor };
  staples?: { current: number; optimal: string; rating: CardColor };
}

export interface MetaSnapshot {
  game: TCGGame;
  topDecks: MetaDeck[];
  updatedAt: Date;
}

export interface MetaDeck {
  archetype: string;
  tier: "S" | "A" | "B" | "C";
  winRate: number;
  popularity: number;
  keyCards: string[];
}

export interface SearchFilters {
  query: string;
  type?: string;
  color?: string;
  cost?: number;
  rarity?: string;
  set?: string;
  banned?: boolean;
}
