import { Card, DeckCard, Deck, CardColor, DeckAnalysis, SynergyGroup, CardRecommendation } from "@/types";

interface SynergyScore {
  score: number;
  color: CardColor;
  reason: string;
}

export function calculateCardSynergy(card: Card, deck: Deck): SynergyScore {
  const deckCards = deck.cards;
  let score = 50;
  const reasons: string[] = [];

  if (deckCards.length === 0) {
    return { score: 50, color: "neutral", reason: "No cards in deck yet" };
  }

  // Check archetype compatibility
  const archetypeMatches = deckCards.filter((dc) =>
    dc.card.archetype?.some((a) => card.archetype?.includes(a))
  ).length;

  if (archetypeMatches > 0) {
    score += Math.min(archetypeMatches * 10, 30);
    reasons.push(`${archetypeMatches} archetype synergies`);
  }

  // Check color/attribute compatibility
  const dominantColor = getDominantColor(deckCards);
  if (dominantColor && card.color) {
    if (card.color.toLowerCase().includes(dominantColor.toLowerCase()) ||
        dominantColor.toLowerCase().includes(card.color.toLowerCase())) {
      score += 15;
      reasons.push("Color match");
    } else if (isOffColor(card.color, dominantColor)) {
      score -= 20;
      reasons.push("Off-color penalty");
    }
  }

  // Check tag synergies
  const allTags = deckCards.flatMap((dc) => dc.card.tags || []);
  const tagMatches = (card.tags || []).filter((t) => allTags.includes(t)).length;
  if (tagMatches > 0) {
    score += Math.min(tagMatches * 8, 20);
    reasons.push(`${tagMatches} shared tags`);
  }

  // Check for hand traps / staples
  if (card.tags?.includes("staple") || card.tags?.includes("handtrap")) {
    score += 10;
    reasons.push("Staple card");
  }

  // Check if card is banned
  if (card.banned) {
    score = 0;
    return { score: 0, color: "red", reason: "BANNED - Cannot be used" };
  }

  // Normalize score 0-100
  score = Math.max(0, Math.min(100, score));

  let color: CardColor;
  let reason: string;
  if (score >= 70) {
    color = "green";
    reason = reasons.length > 0 ? `Excellent: ${reasons.join(", ")}` : "High synergy";
  } else if (score >= 40) {
    color = "yellow";
    reason = reasons.length > 0 ? `Situational: ${reasons.join(", ")}` : "Average synergy";
  } else {
    color = "red";
    reason = reasons.length > 0 ? `Low synergy: ${reasons.join(", ")}` : "Poor fit for this deck";
  }

  return { score, color, reason };
}

function getDominantColor(cards: DeckCard[]): string | null {
  const colorCount: Record<string, number> = {};
  cards.forEach((dc) => {
    if (dc.card.color) {
      colorCount[dc.card.color] = (colorCount[dc.card.color] || 0) + dc.quantity;
    }
  });
  const sorted = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

function isOffColor(cardColor: string, deckColor: string): boolean {
  const colorMap: Record<string, string[]> = {
    "Red": ["Blue", "Black", "Purple"],
    "Blue": ["Red", "Green"],
    "Green": ["Black"],
  };
  return colorMap[deckColor]?.includes(cardColor) || false;
}

export function detectArchetype(deck: Deck): { name: string; confidence: number } {
  const cards = deck.cards;
  if (cards.length === 0) return { name: "Unknown", confidence: 0 };

  const archetypeCounts: Record<string, number> = {};
  cards.forEach((dc) => {
    (dc.card.archetype || []).forEach((a) => {
      archetypeCounts[a] = (archetypeCounts[a] || 0) + dc.quantity;
    });
  });

  const topArchetype = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0];
  if (!topArchetype) {
    return detectByTags(deck);
  }

  const totalCards = cards.reduce((s, dc) => s + dc.quantity, 0);
  const confidence = Math.min(100, Math.round((topArchetype[1] / totalCards) * 150));

  return { name: topArchetype[0], confidence };
}

function detectByTags(deck: Deck): { name: string; confidence: number } {
  const cards = deck.cards;
  const allTags = cards.flatMap((dc) => Array(dc.quantity).fill(dc.card.tags || []).flat());
  const hasAggro = allTags.filter((t) => ["rush", "aggro", "speed"].includes(t)).length;
  const hasControl = allTags.filter((t) => ["negate", "counter", "blocker"].includes(t)).length;
  const hasCombo = allTags.filter((t) => ["draw", "search", "combo"].includes(t)).length;

  if (hasAggro > hasControl && hasAggro > hasCombo)
    return { name: "Aggro", confidence: 60 };
  if (hasControl > hasCombo)
    return { name: "Control", confidence: 55 };
  if (hasCombo > 0)
    return { name: "Combo", confidence: 50 };
  return { name: "Midrange", confidence: 40 };
}

export function analyzeDeck(deck: Deck): DeckAnalysis {
  const { name: archetype, confidence } = detectArchetype(deck);
  const totalCards = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  const game = deck.game;

  // Calculate synergy groups
  const synergies: SynergyGroup[] = buildSynergyGroups(deck);

  // Calculate scores
  const consistencyScore = calculateConsistency(deck);
  const speedScore = calculateSpeed(deck);
  const powerScore = calculatePower(deck);
  const metaScore = Math.round((consistencyScore + speedScore + powerScore) / 3);
  const winProbability = Math.round((metaScore * 0.6 + consistencyScore * 0.4));

  // Determine tier
  let tierRating: "S" | "A" | "B" | "C" | "D";
  if (winProbability >= 80) tierRating = "S";
  else if (winProbability >= 65) tierRating = "A";
  else if (winProbability >= 50) tierRating = "B";
  else if (winProbability >= 35) tierRating = "C";
  else tierRating = "D";

  const recommendations = generateRecommendations(deck, archetype);
  const strengths = generateStrengths(deck);
  const weaknesses = generateWeaknesses(deck);

  // Card ratio analysis
  const cardRatioAnalysis = analyzeCardRatios(deck);

  return {
    archetype,
    archetypeConfidence: confidence,
    synergies,
    weaknesses,
    strengths,
    recommendations,
    winProbability,
    metaScore,
    consistencyScore,
    speedScore,
    powerScore,
    cardRatioAnalysis,
    missingComboPieces: findMissingPieces(deck, archetype),
    tierRating,
  };
}

function buildSynergyGroups(deck: Deck): SynergyGroup[] {
  const groups: SynergyGroup[] = [];
  const archetypeGroups: Record<string, string[]> = {};

  deck.cards.forEach((dc) => {
    (dc.card.archetype || []).forEach((a) => {
      if (!archetypeGroups[a]) archetypeGroups[a] = [];
      archetypeGroups[a].push(dc.card.name);
    });
  });

  Object.entries(archetypeGroups).forEach(([arch, cardNames]) => {
    if (cardNames.length >= 2) {
      groups.push({
        cards: cardNames.slice(0, 4),
        description: `${arch} package synergy`,
        strength: cardNames.length >= 4 ? "high" : cardNames.length >= 3 ? "medium" : "low",
        type: "engine",
      });
    }
  });

  // Check for hand trap packages
  const handTraps = deck.cards.filter((dc) => dc.card.tags?.includes("handtrap")).map((dc) => dc.card.name);
  if (handTraps.length >= 2) {
    groups.push({
      cards: handTraps,
      description: "Hand Trap disruption package",
      strength: handTraps.length >= 3 ? "high" : "medium",
      type: "support",
    });
  }

  // Check for draw/search engines
  const drawCards = deck.cards.filter((dc) => dc.card.tags?.includes("draw") || dc.card.tags?.includes("search")).map((dc) => dc.card.name);
  if (drawCards.length >= 2) {
    groups.push({
      cards: drawCards,
      description: "Draw/Search consistency engine",
      strength: drawCards.length >= 4 ? "high" : "medium",
      type: "engine",
    });
  }

  return groups;
}

function calculateConsistency(deck: Deck): number {
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  if (total === 0) return 0;

  const game = deck.game;
  let optimal = 50;
  if (game === "pokemon") optimal = 60;
  else if (game === "yugioh") optimal = 40;
  else if (game === "mtg") optimal = 60;

  const sizePenalty = Math.abs(total - optimal) * 0.5;
  const drawCards = deck.cards.filter((dc) => dc.card.tags?.includes("draw") || dc.card.tags?.includes("search")).reduce((s, dc) => s + dc.quantity, 0);
  const drawBonus = Math.min(drawCards * 3, 20);
  const threeOf = deck.cards.filter((dc) => dc.quantity === 3).length;
  const consistency = Math.max(20, Math.min(95, 65 + drawBonus - sizePenalty + threeOf));

  return Math.round(consistency);
}

function calculateSpeed(deck: Deck): number {
  const rushCards = deck.cards.filter((dc) => dc.card.tags?.some((t) => ["rush", "aggro", "speed", "quick-play"].includes(t))).reduce((s, dc) => s + dc.quantity, 0);
  const lowCost = deck.cards.filter((dc) => (dc.card.cost as number) <= 2).reduce((s, dc) => s + dc.quantity, 0);
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  if (total === 0) return 0;
  const speedRatio = (rushCards + lowCost) / total;
  return Math.round(Math.min(95, 30 + speedRatio * 70));
}

function calculatePower(deck: Deck): number {
  const bossCards = deck.cards.filter((dc) => dc.card.tags?.includes("boss")).length;
  const highPower = deck.cards.filter((dc) => (dc.card.power || dc.card.atk || 0) >= 6000).length;
  const ultraRares = deck.cards.filter((dc) => dc.card.rarity?.includes("Ultra") || dc.card.rarity?.includes("Secret")).length;

  return Math.round(Math.min(95, 40 + bossCards * 8 + highPower * 4 + ultraRares * 3));
}

function analyzeCardRatios(deck: Deck) {
  const types: Record<string, number> = {};
  deck.cards.forEach((dc) => {
    types[dc.card.type] = (types[dc.card.type] || 0) + dc.quantity;
  });

  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  if (total === 0) return {};

  const result: Record<string, { current: number; optimal: string; rating: CardColor }> = {};

  if (deck.game === "yugioh") {
    const monsters = types["Monster"] || 0;
    const spells = types["Spell"] || 0;
    const traps = types["Trap"] || 0;

    result.monsters = { current: monsters, optimal: "16-22", rating: monsters >= 16 && monsters <= 22 ? "green" : monsters >= 12 ? "yellow" : "red" };
    result.spells = { current: spells, optimal: "12-18", rating: spells >= 12 && spells <= 18 ? "green" : spells >= 8 ? "yellow" : "red" };
    result.traps = { current: traps, optimal: "3-8", rating: traps <= 8 && traps >= 3 ? "green" : traps >= 1 ? "yellow" : "red" };
  } else if (deck.game === "onepiece") {
    const characters = types["Character"] || 0;
    const events = types["Event"] || 0;
    const stages = types["Stage"] || 0;

    result.characters = { current: characters, optimal: "35-42", rating: characters >= 35 && characters <= 42 ? "green" : characters >= 25 ? "yellow" : "red" };
    result.events = { current: events, optimal: "8-15", rating: events >= 8 && events <= 15 ? "green" : events >= 4 ? "yellow" : "red" };
  } else if (deck.game === "pokemon") {
    const pokemon = deck.cards.filter((dc) => dc.card.type === "Pokémon").reduce((s, dc) => s + dc.quantity, 0);
    const trainers = deck.cards.filter((dc) => dc.card.type === "Trainer").reduce((s, dc) => s + dc.quantity, 0);
    const energy = deck.cards.filter((dc) => dc.card.type === "Energy").reduce((s, dc) => s + dc.quantity, 0);

    result.characters = { current: pokemon, optimal: "12-18", rating: pokemon >= 12 && pokemon <= 18 ? "green" : pokemon >= 8 ? "yellow" : "red" };
    result.staples = { current: trainers, optimal: "30-38", rating: trainers >= 30 && trainers <= 38 ? "green" : trainers >= 20 ? "yellow" : "red" };
    result.events = { current: energy, optimal: "10-14", rating: energy >= 10 && energy <= 14 ? "green" : energy >= 6 ? "yellow" : "red" };
  }

  return result;
}

function generateRecommendations(deck: Deck, archetype: string): CardRecommendation[] {
  const recs: CardRecommendation[] = [];
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  const game = deck.game;
  let optimalMin = 40, optimalMax = 60;
  if (game === "pokemon") { optimalMin = 60; optimalMax = 60; }
  else if (game === "onepiece" || game === "digimon" || game === "unionarena") { optimalMin = 50; optimalMax = 50; }

  if (total < optimalMin) {
    recs.push({
      cardName: "More cards needed",
      reason: `Deck has ${total} cards, needs at least ${optimalMin}`,
      priority: "high",
      action: "add",
      expectedImpact: "Improved consistency and legality",
    });
  }

  const bannedCards = deck.cards.filter((dc) => dc.card.banned);
  bannedCards.forEach((dc) => {
    recs.push({
      cardName: dc.card.name,
      reason: "This card is BANNED and cannot be used in tournament play",
      priority: "high",
      action: "remove",
      expectedImpact: "Deck becomes tournament legal",
    });
  });

  const limitedCards = deck.cards.filter((dc) => dc.card.limited && dc.quantity > 1);
  limitedCards.forEach((dc) => {
    recs.push({
      cardName: dc.card.name,
      reason: `Limited card - can only run 1 copy`,
      priority: "high",
      action: "remove",
      expectedImpact: "Deck becomes tournament legal",
    });
  });

  const drawCards = deck.cards.filter((dc) => dc.card.tags?.includes("draw")).reduce((s, dc) => s + dc.quantity, 0);
  if (drawCards < 4 && total > 10) {
    recs.push({
      cardName: "Draw/Search engine cards",
      reason: "Low draw power detected - adding consistency cards will improve performance",
      priority: "medium",
      action: "add",
      expectedImpact: "+10-15% win rate improvement",
    });
  }

  return recs;
}

function generateStrengths(deck: Deck): string[] {
  const strengths: string[] = [];
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  if (total >= 40) strengths.push("Complete deck size");

  const archGroups = detectArchetype(deck);
  if (archGroups.confidence > 60) strengths.push(`Strong ${archGroups.name} archetype focus`);

  const handTraps = deck.cards.filter((dc) => dc.card.tags?.includes("handtrap")).reduce((s, dc) => s + dc.quantity, 0);
  if (handTraps >= 6) strengths.push("Strong hand trap package for disruption");

  const bossCards = deck.cards.filter((dc) => dc.card.tags?.includes("boss")).length;
  if (bossCards >= 2) strengths.push("Multiple boss monsters for closing games");

  return strengths;
}

function generateWeaknesses(deck: Deck): string[] {
  const weaknesses: string[] = [];
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  if (total === 0) return ["Empty deck - add cards to begin analysis"];

  const bannedCount = deck.cards.filter((dc) => dc.card.banned).length;
  if (bannedCount > 0) weaknesses.push(`${bannedCount} banned card(s) present`);

  const drawCards = deck.cards.filter((dc) => dc.card.tags?.includes("draw") || dc.card.tags?.includes("search")).reduce((s, dc) => s + dc.quantity, 0);
  if (drawCards < 4) weaknesses.push("Limited draw/search power may cause inconsistency");

  const { confidence } = detectArchetype(deck);
  if (confidence < 40 && total > 15) weaknesses.push("Mixed archetypes reduce synergy efficiency");

  return weaknesses;
}

function findMissingPieces(deck: Deck, archetype: string): string[] {
  const missing: string[] = [];
  const tags = deck.cards.flatMap((dc) => dc.card.tags || []);

  if (!tags.includes("draw") && !tags.includes("search")) {
    missing.push("Draw/Search cards for consistency");
  }
  if (!tags.includes("removal") && !tags.includes("negate")) {
    missing.push("Removal/Disruption package");
  }
  if (!tags.includes("boss")) {
    missing.push("Boss card / win condition");
  }

  return missing;
}
