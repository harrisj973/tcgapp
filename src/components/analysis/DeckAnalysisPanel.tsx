"use client";

import { useState, useEffect } from "react";
import { Deck, DeckAnalysis } from "@/types";
import { analyzeDeck } from "@/lib/synergy-engine";
import { StatBar } from "@/components/ui/StatBar";
import { SynergyBadge } from "@/components/ui/SynergyBadge";
import { CardColor } from "@/types";
import {
  BarChart3, Zap, Target, TrendingUp, AlertTriangle,
  CheckCircle, Lightbulb, Puzzle, Brain, RefreshCw, Layers
} from "lucide-react";

interface DeckAnalysisPanelProps {
  deck: Deck;
}

const tierColors: Record<string, string> = {
  S: "text-yellow-300 bg-yellow-500/20 border-yellow-500/50",
  A: "text-green-300 bg-green-500/20 border-green-500/50",
  B: "text-blue-300 bg-blue-500/20 border-blue-500/50",
  C: "text-orange-300 bg-orange-500/20 border-orange-500/50",
  D: "text-red-300 bg-red-500/20 border-red-500/50",
};

const synergyCfg: Record<string, string> = {
  high: "bg-green-500/20 border-green-500/30 text-green-400",
  medium: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
  low: "bg-gray-500/20 border-gray-500/30 text-gray-400",
};

export function DeckAnalysisPanel({ deck }: DeckAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<DeckAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "synergies" | "recommendations">("overview");

  const totalCards = deck.cards.reduce((s, dc) => s + dc.quantity, 0);

  useEffect(() => {
    if (totalCards > 0) {
      const result = analyzeDeck(deck);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [deck.cards, deck.id]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck }),
      });
      const data = await res.json();
      setAiInsights(data.aiInsights || "");
      setAiRecs(data.aiRecommendations || []);
      if (data.analysis) setAnalysis(data.analysis);
    } catch (e) {
      setAiInsights("AI analysis temporarily unavailable. Using local analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (totalCards === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BarChart3 className="w-12 h-12 text-gray-600 mb-4" />
        <p className="text-gray-400 font-medium">No cards to analyze</p>
        <p className="text-gray-600 text-sm mt-2">Add cards to your deck to see detailed analysis</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const sections = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "synergies" as const, label: "Synergies", icon: Puzzle },
    { id: "recommendations" as const, label: "Tips", icon: Lightbulb },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Section Tabs */}
      <div className="flex border-b border-gray-700/50 bg-gray-850">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              activeSection === s.id ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === "overview" && (
          <>
            {/* Win Rate & Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4 text-center">
                <div className="text-3xl font-black text-white mb-1">{analysis.winProbability}%</div>
                <div className="text-xs text-gray-400">Win Probability</div>
                <div className="mt-2 text-xs text-gray-500">vs Meta</div>
              </div>
              <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border text-2xl font-black mb-1 ${tierColors[analysis.tierRating]}`}>
                  {analysis.tierRating}
                </div>
                <div className="text-xs text-gray-400">Tier Rating</div>
              </div>
            </div>

            {/* Archetype */}
            <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Deck Archetype</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-purple-300">{analysis.archetype}</span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${analysis.archetypeConfidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{analysis.archetypeConfidence}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Performance Stats</span>
              </div>
              <StatBar label="Consistency" value={analysis.consistencyScore} />
              <StatBar label="Speed" value={analysis.speedScore} />
              <StatBar label="Power" value={analysis.powerScore} />
              <StatBar label="Meta Score" value={analysis.metaScore} />
            </div>

            {/* Card Ratios */}
            {Object.keys(analysis.cardRatioAnalysis).length > 0 && (
              <div className="rounded-xl bg-gray-800/60 border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Card Ratios</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(analysis.cardRatioAnalysis).map(([type, data]) => (
                    <div key={type} className="flex items-center gap-3">
                      <SynergyBadge color={data.rating as CardColor} size="sm" />
                      <span className="text-xs text-gray-400 capitalize w-20">{type}</span>
                      <span className="text-xs text-white font-medium">{data.current}</span>
                      <span className="text-xs text-gray-500">/ {data.optimal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 gap-3">
              {analysis.strengths.length > 0 && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Strengths</span>
                  </div>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-green-200 flex items-start gap-1.5">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.weaknesses.length > 0 && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Weaknesses</span>
                  </div>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-red-200 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI Analysis Button */}
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing...</>
              ) : (
                <><Brain className="w-4 h-4" />Get AI Analysis</>
              )}
            </button>

            {/* AI Insights */}
            {aiInsights && (
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">AI Insights</span>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">{aiInsights}</p>
                {aiRecs.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {aiRecs.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-purple-200">
                        <span className="text-purple-400 flex-shrink-0">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {activeSection === "synergies" && (
          <>
            {analysis.synergies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Puzzle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No synergy groups detected yet</p>
                <p className="text-xs mt-1">Add more cards from the same archetype</p>
              </div>
            ) : (
              analysis.synergies.map((group, i) => (
                <div key={i} className={`rounded-xl border p-4 ${synergyCfg[group.strength]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{group.description}</p>
                      <p className="text-xs opacity-70 mt-0.5 capitalize">{group.type} • {group.strength} synergy</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${synergyCfg[group.strength]} font-medium capitalize`}>{group.strength}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {group.cards.map((c, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-black/20 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              ))
            )}

            {analysis.missingComboPieces.length > 0 && (
              <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Puzzle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">Missing Combo Pieces</span>
                </div>
                <ul className="space-y-1.5">
                  {analysis.missingComboPieces.map((piece, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-orange-200">
                      <span className="text-orange-400 flex-shrink-0">→</span>
                      {piece}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeSection === "recommendations" && (
          <>
            {analysis.recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Deck looks good!</p>
                <p className="text-xs mt-1">No critical improvements needed</p>
              </div>
            ) : (
              analysis.recommendations.map((rec, i) => {
                const priorityColors: Record<string, string> = {
                  high: "bg-red-500/20 border-red-500/30",
                  medium: "bg-yellow-500/20 border-yellow-500/30",
                  low: "bg-blue-500/20 border-blue-500/30",
                };
                const priorityText: Record<string, string> = {
                  high: "text-red-400",
                  medium: "text-yellow-400",
                  low: "text-blue-400",
                };
                const actionIcons: Record<string, string> = {
                  add: "➕",
                  remove: "➖",
                  replace: "🔄",
                };
                return (
                  <div key={i} className={`rounded-xl border p-4 ${priorityColors[rec.priority]}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-base">{actionIcons[rec.action]}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold uppercase ${priorityText[rec.priority]}`}>{rec.priority} priority • {rec.action}</p>
                        <p className="text-sm font-medium text-white mt-0.5">{rec.cardName}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 ml-7">{rec.reason}</p>
                    {rec.expectedImpact && (
                      <p className="text-xs text-gray-500 ml-7 mt-1">Impact: {rec.expectedImpact}</p>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
