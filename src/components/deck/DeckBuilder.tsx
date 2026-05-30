"use client";

import { useState, useMemo } from "react";
import { Deck, Card, TCGGame, DeckCard } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { CardSearch } from "@/components/cards/CardSearch";
import { CardItem } from "@/components/cards/CardItem";
import { DeckAnalysisPanel } from "@/components/analysis/DeckAnalysisPanel";
import { LayersIcon, Search, BarChart3, Edit3, Check, X } from "lucide-react";

interface DeckBuilderProps {
  deck: Deck;
}

type ActiveTab = "cards" | "search" | "analysis";

// Buckets: 0,1,2,3,4,5,6+
function buildCostCurve(cards: DeckCard[]): number[] {
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  for (const { card, quantity } of cards) {
    const cost = typeof card.cost === "number" ? card.cost : (card.cmc ?? 0);
    const idx = Math.min(6, Math.max(0, Math.floor(cost)));
    buckets[idx] += quantity;
  }
  return buckets;
}

function CostCurve({ cards }: { cards: DeckCard[] }) {
  const buckets = buildCostCurve(cards);
  const max = Math.max(1, ...buckets);
  const labels = ["0", "1", "2", "3", "4", "5", "6+"];

  return (
    <div className="px-3 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Cost Curve</p>
      <div className="flex items-end gap-1 h-12">
        {buckets.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-gray-500 tabular-nums">{count > 0 ? count : ""}</span>
            <div
              className="w-full rounded-t bg-blue-500 transition-all"
              style={{ height: `${Math.max(2, (count / max) * 32)}px`, opacity: count > 0 ? 1 : 0.15 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-gray-600">{l}</div>
        ))}
      </div>
    </div>
  );
}

function TypeBreakdown({ cards, game }: { cards: DeckCard[]; game: TCGGame }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const { card, quantity } of cards) {
      const key = card.type;
      map[key] = (map[key] ?? 0) + quantity;
    }
    return map;
  }, [cards]);

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {entries.map(([type, count]) => (
        <span key={type} className="text-[10px] text-gray-400">
          <span className="text-white font-semibold">{count}</span> {type}
        </span>
      ))}
    </div>
  );
}

// Groups deck cards by their type field
function groupByType(cards: DeckCard[]): Array<{ label: string; cards: DeckCard[] }> {
  const map = new Map<string, DeckCard[]>();
  for (const dc of cards) {
    const key = dc.card.type;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(dc);
  }
  // Sort groups by total quantity descending
  return Array.from(map.entries())
    .map(([label, cards]) => ({ label, cards }))
    .sort((a, b) => {
      const totA = a.cards.reduce((s, c) => s + c.quantity, 0);
      const totB = b.cards.reduce((s, c) => s + c.quantity, 0);
      return totB - totA;
    });
}

interface DeckBuilderProps {
  deck: Deck;
}

export function DeckBuilder({ deck }: DeckBuilderProps) {
  const { addCard, removeCard, renameDeck, getDeckCardCount } = useDeckStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(deck.name);

  const game = getGame(deck.game);
  const totalCards = getDeckCardCount(deck);
  const isLegal = totalCards >= game.deckSize.min && totalCards <= game.deckSize.max;
  const isOver = totalCards > game.deckSize.max;
  const progressPct = Math.min(100, (totalCards / game.deckSize.max) * 100);
  const barColor = isOver ? "bg-red-500" : isLegal ? "bg-green-500" : "bg-blue-500";

  const handleAddCard = (card: Card) => addCard(deck.id, card);
  const handleRemoveCard = (card: Card) => removeCard(deck.id, card.id);

  const handleSaveName = () => {
    if (nameInput.trim()) renameDeck(deck.id, nameInput.trim());
    setIsEditingName(false);
  };

  const grouped = useMemo(() => groupByType(deck.cards), [deck.cards]);

  const tabs = [
    { id: "search" as ActiveTab, label: "Search", icon: Search },
    { id: "cards" as ActiveTab, label: `Deck (${totalCards})`, icon: LayersIcon },
    { id: "analysis" as ActiveTab, label: "Analysis", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Deck Header */}
      <div className="px-4 pt-3 pb-3 border-b border-gray-700/50">
        {/* Name row */}
        <div className="flex items-center gap-2 mb-2.5">
          {isEditingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="flex-1 px-2 py-1 bg-gray-700 border border-blue-500 rounded text-white text-sm focus:outline-none"
                autoFocus
              />
              <button onClick={handleSaveName} className="p-1 text-green-400 hover:text-green-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-1 text-gray-400 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white truncate">{deck.name}</h2>
                  <button onClick={() => { setNameInput(deck.name); setIsEditingName(true); }} className="text-gray-600 hover:text-gray-300 flex-shrink-0">
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">{game.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <TypeBreakdown cards={deck.cards} game={deck.game} />
            <span className={`text-[10px] font-semibold shrink-0 ml-2 ${isOver ? "text-red-400" : isLegal ? "text-green-400" : "text-gray-500"}`}>
              {totalCards}/{game.deckSize.max}
              {isLegal && " ✓"}
              {isOver && " ↑"}
            </span>
          </div>
        </div>

        {/* Leader display */}
        {deck.leader && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-[10px] text-yellow-400 font-semibold">LEADER</span>
            <span className="text-xs text-yellow-300">{deck.leader.name}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/5"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "search" && (
          <CardSearch game={deck.game} deck={deck} onAddCard={handleAddCard} />
        )}

        {activeTab === "cards" && (
          <div className="h-full overflow-y-auto">
            {deck.cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <LayersIcon className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium">Deck is empty</p>
                <p className="text-gray-600 text-sm mt-1">Search for cards and tap + to add them</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* Cost curve */}
                <CostCurve cards={deck.cards} />

                {/* Grouped card list */}
                {grouped.map(({ label, cards }) => {
                  const groupTotal = cards.reduce((s, c) => s + c.quantity, 0);
                  return (
                    <div key={label}>
                      <div className="flex items-center gap-2 px-1 mb-1.5">
                        <span className="text-xs font-semibold text-gray-400">{label}</span>
                        <span className="text-xs text-gray-600">({groupTotal})</span>
                        <div className="flex-1 h-px bg-gray-700/50" />
                      </div>
                      <div className="space-y-1.5">
                        {cards.map((dc) => (
                          <CardItem
                            key={dc.card.id}
                            card={dc.card}
                            deck={deck}
                            quantity={dc.quantity}
                            onAdd={handleAddCard}
                            onRemove={handleRemoveCard}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <DeckAnalysisPanel deck={deck} />
        )}
      </div>
    </div>
  );
}
