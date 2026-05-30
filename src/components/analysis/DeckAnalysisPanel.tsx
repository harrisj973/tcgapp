"use client";

import { useState, useMemo } from "react";
import { Deck } from "@/types";
import { analyzeDeck } from "@/lib/synergy-engine";
import { StatBar } from "@/components/ui/StatBar";
import { SynergyBadge } from "@/components/ui/SynergyBadge";
import { CardColor } from "@/types";
import {
  BarChart3, Target, TrendingUp, AlertTriangle,
  CheckCircle, Lightbulb, Puzzle, Brain, RefreshCw, Layers
} from "lucide-react";

interface DeckAnalysisPanelProps {
  deck: Deck;
}

const tierColors: Record<string, string> = {
  S: "text-yellow-300 bg-yellow-500/20 border-yellow-500/40",
  A: "text-green-300 bg-green-500/20 border-green-500/40",
  B: "text-blue-300 bg-blue-500/20 border-blue-500/40",
  C: "text-orange-300 bg-orange-500/20 border-orange-500/40",
  D: "text-red-300 bg-red-500/20 border-red-500/40",
};

const synergyCfg: Record<string, string> = {
  high:   "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  low:    "bg-white/[0.04] border-white/[0.08] text-white/40",
};

export function DeckAnalysisPanel({ deck }: DeckAnalysisPanelProps) {
  const [aiInsights, setAiInsights] = useState<string>("");
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "synergies" | "recommendations">("overview");

  const totalCards = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  const analysis = useMemo(
    () => (totalCards > 0 ? analyzeDeck(deck) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck.id, deck.cards]
  );

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
    } catch {
      setAiInsights("AI analysis temporarily unavailable. Using local analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (totalCards === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <BarChart3 className="w-12 h-12 text-white/10 mb-4" />
        <p className="text-white/40 font-semibold">No cards to analyze</p>
        <p className="text-white/20 text-sm mt-2">Add cards to your deck to see detailed analysis</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full" />
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
      <div className="flex border-b border-white/[0.05]">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-all ${
              activeSection === s.id
                ? "text-white border-b border-white/30 bg-white/[0.04]"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeSection === "overview" && (
          <>
            {/* Win Rate & Tier */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-white mb-1">{analysis.winProbability}%</div>
                <div className="text-[10px] text-white/35 uppercase tracking-wide">Win Probability</div>
                <div className="mt-1 text-[10px] text-white/20">vs Meta</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border text-2xl font-black mb-1 ${tierColors[analysis.tierRating]}`}>
                  {analysis.tierRating}
                </div>
                <div className="text-[10px] text-white/35 uppercase tracking-wide">Tier Rating</div>
              </div>
            </div>

            {/* Archetype */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Deck Archetype</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-purple-300">{analysis.archetype}</span>
                <div className="flex-1 h-0.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${analysis.archetypeConfidence}%` }}
                  />
                </div>
                <span className="text-xs text-white/35">{analysis.archetypeConfidence}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">Performance Stats</span>
              </div>
              <StatBar label="Consistency" value={analysis.consistencyScore} />
              <StatBar label="Speed" value={analysis.speedScore} />
              <StatBar label="Power" value={analysis.powerScore} />
              <StatBar label="Meta Score" value={analysis.metaScore} />
            </div>

            {/* Card Ratios */}
            {Object.keys(analysis.cardRatioAnalysis).length > 0 && (
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Card Ratios</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(analysis.cardRatioAnalysis).map(([type, data]) => (
                    <div key={type} className="flex items-center gap-3">
                      <SynergyBadge color={data.rating as CardColor} size="sm" />
                      <span className="text-xs text-white/35 capitalize w-20">{type}</span>
                      <span className="text-xs text-white font-medium">{data.current}</span>
                      <span className="text-xs text-white/25">/ {data.optimal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            {analysis.strengths.length > 0 && (
              <div className="glass rounded-xl p-4 border border-emerald-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-emerald-400/60 mt-0.5 flex-shrink-0">·</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.weaknesses.length > 0 && (
              <div className="glass rounded-xl p-4 border border-red-500/15">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Weaknesses</span>
                </div>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                      <span className="text-red-400/60 mt-0.5 flex-shrink-0">·</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Analysis Button */}
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
            >
              {isAnalyzing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing...</>
              ) : (
                <><Brain className="w-4 h-4" />Get AI Analysis</>
              )}
            </button>

            {/* AI Insights */}
            {aiInsights && (
              <div className="glass rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">AI Insights</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{aiInsights}</p>
                {aiRecs.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {aiRecs.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-white/50">
                        <span className="text-purple-400/60 flex-shrink-0">{i + 1}.</span>
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
              <div className="text-center py-12">
                <Puzzle className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p className="text-sm text-white/40 font-medium">No synergy groups detected yet</p>
                <p className="text-xs text-white/20 mt-1">Add more cards from the same archetype</p>
              </div>
            ) : (
              analysis.synergies.map((group, i) => (
                <div key={i} className={`rounded-xl border p-4 ${synergyCfg[group.strength]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{group.description}</p>
                      <p className="text-xs opacity-60 mt-0.5 capitalize">{group.type} · {group.strength} synergy</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${synergyCfg[group.strength]} font-semibold capitalize`}>{group.strength}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {group.cards.map((c, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-black/20 rounded-full text-white/60">{c}</span>
                    ))}
                  </div>
                </div>
              ))
            )}

            {analysis.missingComboPieces.length > 0 && (
              <div className="glass rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Puzzle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-300">Missing Combo Pieces</span>
                </div>
                <ul className="space-y-1.5">
                  {analysis.missingComboPieces.map((piece, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-white/50">
                      <span className="text-orange-400/60 flex-shrink-0">→</span>
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
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p className="text-sm text-white/40 font-medium">Deck looks good!</p>
                <p className="text-xs text-white/20 mt-1">No critical improvements needed</p>
              </div>
            ) : (
              analysis.recommendations.map((rec, i) => {
                const priorityColors: Record<string, string> = {
                  high:   "bg-red-500/10 border-red-500/20",
                  medium: "bg-amber-500/10 border-amber-500/20",
                  low:    "glass border-white/[0.07]",
                };
                const priorityText: Record<string, string> = {
                  high:   "text-red-400",
                  medium: "text-amber-400",
                  low:    "text-blue-400",
                };
                const actionIcons: Record<string, string> = {
                  add: "➕", remove: "➖", replace: "🔄",
                };
                return (
                  <div key={i} className={`rounded-xl border p-4 ${priorityColors[rec.priority]}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-base">{actionIcons[rec.action]}</span>
                      <div className="flex-1">
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${priorityText[rec.priority]}`}>{rec.priority} priority · {rec.action}</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{rec.cardName}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 ml-7">{rec.reason}</p>
                    {rec.expectedImpact && (
                      <p className="text-xs text-white/25 ml-7 mt-1">Impact: {rec.expectedImpact}</p>
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
