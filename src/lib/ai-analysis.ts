"use server";

import Anthropic from "@anthropic-ai/sdk";
import { Deck, DeckAnalysis } from "@/types";
import { analyzeDeck } from "./synergy-engine";

const client = new Anthropic();

export async function getAIAnalysis(deck: Deck): Promise<{
  analysis: DeckAnalysis;
  aiInsights: string;
  aiRecommendations: string[];
}> {
  const baseAnalysis = analyzeDeck(deck);

  const deckList = deck.cards
    .map((dc) => `${dc.quantity}x ${dc.card.name} (${dc.card.type}${dc.card.color ? ", " + dc.card.color : ""})`)
    .join("\n");

  const prompt = `You are an expert TCG deck analysis AI. Analyze this ${deck.game.toUpperCase()} deck:

DECK NAME: ${deck.name}
GAME: ${deck.game}
${deck.leader ? `LEADER: ${deck.leader.name}` : ""}
TOTAL CARDS: ${deck.cards.reduce((s, dc) => s + dc.quantity, 0)}

DECK LIST:
${deckList || "Empty deck"}

INITIAL ANALYSIS:
- Detected Archetype: ${baseAnalysis.archetype} (${baseAnalysis.archetypeConfidence}% confidence)
- Win Probability: ${baseAnalysis.winProbability}%
- Consistency: ${baseAnalysis.consistencyScore}%
- Speed: ${baseAnalysis.speedScore}%
- Power: ${baseAnalysis.powerScore}%

Please provide:
1. A brief 2-3 sentence insight about this deck's strategy and potential
2. 3-5 specific actionable recommendations to improve the deck
3. Key synergies and combos to exploit

Format your response as JSON with this exact structure:
{
  "insight": "...",
  "recommendations": ["...", "...", "..."],
  "combos": ["...", "..."]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: baseAnalysis,
        aiInsights: parsed.insight || "Analysis complete.",
        aiRecommendations: parsed.recommendations || [],
      };
    }
  } catch (error) {
    // Fall back to rule-based analysis if AI fails
    console.error("AI analysis failed, using rule-based:", error);
  }

  return {
    analysis: baseAnalysis,
    aiInsights: generateFallbackInsight(baseAnalysis, deck),
    aiRecommendations: baseAnalysis.recommendations.map((r) => r.reason),
  };
}

function generateFallbackInsight(analysis: DeckAnalysis, deck: Deck): string {
  const total = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  if (total === 0) return "Add cards to your deck to receive analysis and recommendations.";

  return `This ${analysis.archetype} deck shows ${analysis.winProbability >= 60 ? "strong" : "developing"} potential with ${analysis.consistencyScore}% consistency. ${
    analysis.strengths[0] || "Continue building your deck for better analysis."
  }`;
}
