import { Card, DeckCard } from "@/types";

export type CardRole =
  | "Win Condition"
  | "Removal"
  | "Search"
  | "Draw"
  | "Ramp"
  | "Protection"
  | "Disruption"
  | "Combo Piece"
  | "Recovery"
  | "Board Wipe"
  | "Staple";

const ROLE_PATTERNS: Array<{ role: CardRole; keywords: string[] }> = [
  {
    role: "Board Wipe",
    keywords: ["destroy all", "nuke", "clear the field", "all creatures", "all units", "all characters", "all monsters", "all opponents", "wipe", "reset all"],
  },
  {
    role: "Win Condition",
    keywords: ["win the game", "you win", "direct attack", "lethal", "game win", "victory", "alternate win", "opponent loses", "take the prize"],
  },
  {
    role: "Removal",
    keywords: ["destroy", "banish", "trash", "knock out", "ko", "remove", "eliminate", "delete", "retire", "lose in battle", "send to", "return to hand", "bounce", "exile"],
  },
  {
    role: "Search",
    keywords: ["search your deck", "look at the top", "add from your deck", "tutor", "look for", "reveal the top", "add a card", "find a card", "search for"],
  },
  {
    role: "Draw",
    keywords: ["draw a card", "draw 2", "draw 3", "draw cards", "extra draw", "draw for each", "draw up to"],
  },
  {
    role: "Ramp",
    keywords: ["gain energy", "add mana", "generate resource", "produce mana", "place a land", "untap", "gain memory", "rest this", "energy attached", "gain a resource"],
  },
  {
    role: "Combo Piece",
    keywords: ["when you play", "when this attacks", "if you control", "in combination", "combo", "chain", "trigger", "when this card is played with"],
  },
  {
    role: "Protection",
    keywords: ["can't be destroyed", "indestructible", "protection from", "can't be targeted", "shield", "blocker", "security", "ward", "hexproof", "shroud", "can't be affected"],
  },
  {
    role: "Disruption",
    keywords: ["negate", "counter", "discard from hand", "opponent discards", "cannot play", "cancel", "null", "block activation"],
  },
  {
    role: "Recovery",
    keywords: ["return from trash", "revive", "recover", "from your drop area", "from your graveyard", "resurrection", "bring back", "retrieve from"],
  },
];

export function detectCardRole(card: Card): CardRole | null {
  const text = `${card.description ?? ""} ${card.effect ?? ""} ${(card.tags ?? []).join(" ")}`.toLowerCase();
  if (!text.trim()) return null;

  for (const { role, keywords } of ROLE_PATTERNS) {
    if (keywords.some((kw) => text.includes(kw))) return role;
  }
  return null;
}

export interface RoleGroup {
  role: CardRole;
  cards: Array<{ card: Card; quantity: number }>;
  total: number;
}

export function groupCardsByRole(deckCards: DeckCard[]): RoleGroup[] {
  const map = new Map<CardRole, Array<{ card: Card; quantity: number }>>();

  for (const { card, quantity } of deckCards) {
    const role = detectCardRole(card);
    if (!role) continue;
    if (!map.has(role)) map.set(role, []);
    map.get(role)!.push({ card, quantity });
  }

  return Array.from(map.entries())
    .map(([role, cards]) => ({
      role,
      cards,
      total: cards.reduce((s, c) => s + c.quantity, 0),
    }))
    .sort((a, b) => b.total - a.total);
}

const ROLE_COLORS: Record<CardRole, string> = {
  "Win Condition":  "text-yellow-300 bg-yellow-500/15 border-yellow-500/25",
  "Board Wipe":     "text-red-300   bg-red-500/15    border-red-500/25",
  "Removal":        "text-orange-300 bg-orange-500/15 border-orange-500/25",
  "Search":         "text-blue-300  bg-blue-500/15   border-blue-500/25",
  "Draw":           "text-cyan-300  bg-cyan-500/15   border-cyan-500/25",
  "Ramp":           "text-green-300 bg-green-500/15  border-green-500/25",
  "Combo Piece":    "text-purple-300 bg-purple-500/15 border-purple-500/25",
  "Protection":     "text-sky-300   bg-sky-500/15    border-sky-500/25",
  "Disruption":     "text-rose-300  bg-rose-500/15   border-rose-500/25",
  "Recovery":       "text-teal-300  bg-teal-500/15   border-teal-500/25",
  "Staple":         "text-white/50  bg-white/5       border-white/10",
};

export function getRoleColor(role: CardRole): string {
  return ROLE_COLORS[role] ?? ROLE_COLORS["Staple"];
}
