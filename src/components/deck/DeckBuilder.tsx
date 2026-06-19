"use client";

import { useState, useMemo } from "react";
import NextImage from "next/image";
import { Deck, Card, DeckCard } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { getCardImageUrl } from "@/lib/card-images";
import { CardSearch } from "@/components/cards/CardSearch";
import { CardItem } from "@/components/cards/CardItem";
import { DeckAnalysisPanel } from "@/components/analysis/DeckAnalysisPanel";
import { CardDetailModal } from "@/components/cards/CardDetailModal";
import { LayersIcon, Search, BarChart3, Edit3, Check, X, ArrowLeftRight, DollarSign, Loader2, TrendingUp, LayoutGrid, List, NotebookPen } from "lucide-react";
import { DeckIOModal } from "./DeckIOModal";
import { DrawCalcPanel } from "./DrawCalcPanel";
import { PlaytestPanel } from "./PlaytestPanel";
import { LeaderPickerModal, LEADER_GAMES } from "./LeaderPickerModal";
import { fetchDeckPrices, getDeckTotalPrice, PRICING_SUPPORTED_GAMES } from "@/lib/card-prices";
import { checkDeckLegality } from "@/lib/deck-legality";
import { AlertTriangle, AlertCircle, Swords } from "lucide-react";

interface DeckBuilderProps {
  deck: Deck;
}

type ActiveTab = "cards" | "search" | "analysis" | "calc" | "play";

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
    <div className="glass rounded-xl px-3 py-3">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Cost Curve</p>
      <div className="flex items-end gap-1 h-12">
        {buckets.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-white/30 tabular-nums">{count > 0 ? count : ""}</span>
            <div
              className="w-full rounded-t bg-blue-500/70 transition-all"
              style={{ height: `${Math.max(2, (count / max) * 32)}px`, opacity: count > 0 ? 1 : 0.15 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-white/20">{l}</div>
        ))}
      </div>
    </div>
  );
}

function TypeBreakdown({ cards }: { cards: DeckCard[] }) {
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
    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
      {entries.map(([type, count]) => (
        <span key={type} className="text-[10px] text-white/30">
          <span className="text-white/70 font-semibold">{count}</span> {type}
        </span>
      ))}
    </div>
  );
}

function groupByType(cards: DeckCard[]): Array<{ label: string; cards: DeckCard[] }> {
  const map = new Map<string, DeckCard[]>();
  for (const dc of cards) {
    const key = dc.card.type;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(dc);
  }
  return Array.from(map.entries())
    .map(([label, cards]) => ({ label, cards }))
    .sort((a, b) => {
      const totA = a.cards.reduce((s, c) => s + c.quantity, 0);
      const totB = b.cards.reduce((s, c) => s + c.quantity, 0);
      return totB - totA;
    });
}

function GridCardTile({ card, onRemove }: { card: Card; onAdd?: () => void; onRemove: () => void }) {
  const imageUrl = getCardImageUrl(card);
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 group cursor-pointer" onClick={onRemove}>
      {imageUrl ? (
        <NextImage
          src={imageUrl}
          alt={card.name}
          fill
          sizes="80px"
          className="object-cover object-top"
          onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-lg">
          {card.type.includes("Monster") || card.type.includes("Digimon") || card.type.includes("Character") || card.type.includes("Unit") ? "⚔️" : "🃏"}
        </div>
      )}
      {/* Tap-to-remove overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs font-bold">−1</span>
      </div>
    </div>
  );
}

export function DeckBuilder({ deck }: DeckBuilderProps) {
  const { addCard, removeCard, renameDeck, getDeckCardCount, setDeckLeader, setDeckNotes } = useDeckStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("search");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(deck.name);
  const [showIO, setShowIO] = useState(false);
  const [showLeaderPicker, setShowLeaderPicker] = useState(false);
  const [deckViewMode, setDeckViewMode] = useState<"list" | "grid">("list");
  const [priceMap, setPriceMap] = useState<Map<string, number>>(new Map());
  const [priceFetching, setPriceFetching] = useState(false);
  const [priceFetched, setPriceFetched] = useState(false);
  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(deck.notes ?? "");

  const priceSupported = PRICING_SUPPORTED_GAMES.includes(deck.game);
  const deckTotal = getDeckTotalPrice(priceMap, deck);

  const handleFetchPrices = async () => {
    if (priceFetching || deck.cards.length === 0) return;
    setPriceFetching(true);
    const map = await fetchDeckPrices(deck);
    setPriceMap(map);
    setPriceFetched(true);
    setPriceFetching(false);
  };

  const game = getGame(deck.game);
  const totalCards = getDeckCardCount(deck);
  const isLegal = totalCards >= game.deckSize.min && totalCards <= game.deckSize.max;
  const isOver = totalCards > game.deckSize.max;
  const progressPct = Math.min(100, (totalCards / game.deckSize.max) * 100);
  const barColor = isOver ? "bg-red-500" : isLegal ? "bg-emerald-400" : "bg-blue-500/70";

  const handleAddCard = (card: Card) => addCard(deck.id, card);
  const handleRemoveCard = (card: Card) => removeCard(deck.id, card.id);

  const legalityIssues = useMemo(() => checkDeckLegality(deck), [deck.cards, deck.game]); // eslint-disable-line react-hooks/exhaustive-deps
  const illegalCardIds = useMemo(
    () => new Set(legalityIssues.filter((i) => i.cardId).map((i) => i.cardId!)),
    [legalityIssues]
  );

  const handleSaveName = () => {
    if (nameInput.trim()) renameDeck(deck.id, nameInput.trim());
    setIsEditingName(false);
  };

  const grouped = useMemo(() => groupByType(deck.cards), [deck.cards]);

  const tabs = [
    { id: "search" as ActiveTab, label: "Search", icon: Search },
    { id: "cards" as ActiveTab, label: `Deck (${totalCards})`, icon: LayersIcon },
    { id: "analysis" as ActiveTab, label: "Analysis", icon: BarChart3 },
    { id: "calc" as ActiveTab, label: "Odds", icon: TrendingUp },
    { id: "play" as ActiveTab, label: "Play", icon: Swords },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Deck Header */}
      <div className="px-4 pt-3 pb-3 border-b border-white/[0.05]">
        {/* Name row */}
        <div className="flex items-center gap-2 mb-2.5">
          {isEditingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="flex-1 px-2.5 py-1.5 glass rounded-xl text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                autoFocus
              />
              <button onClick={handleSaveName} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-lg flex-shrink-0 shadow-lg`}>
                {game.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white truncate">{deck.name}</h2>
                  <button
                    onClick={() => { setNameInput(deck.name); setIsEditingName(true); }}
                    className="text-white/20 hover:text-white/50 flex-shrink-0 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-white/30">{game.name}</p>
              </div>
              {priceSupported && (
                <button
                  onClick={handleFetchPrices}
                  disabled={priceFetching}
                  className={`p-2 rounded-xl glass hover:bg-white/10 transition-all flex-shrink-0 ${priceFetched ? "text-emerald-400" : "text-white/30 hover:text-white/70"}`}
                  title="Fetch card prices"
                >
                  {priceFetching
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <DollarSign className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={() => setShowNotes((v) => !v)}
                className={`p-2 rounded-xl glass hover:bg-white/10 transition-all flex-shrink-0 ${showNotes || deck.notes ? "text-amber-400" : "text-white/30 hover:text-white/70"}`}
                title="Deck notes"
              >
                <NotebookPen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowIO(true)}
                className="p-2 rounded-xl glass hover:bg-white/10 text-white/30 hover:text-white/70 transition-all flex-shrink-0"
                title="Import / Export"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="w-full h-1 bg-white/[0.07] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <TypeBreakdown cards={deck.cards} />
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {priceFetched && deckTotal > 0 && (
                <span className="text-[10px] font-semibold text-emerald-400">${deckTotal.toFixed(2)}</span>
              )}
              <span className={`text-[10px] font-semibold ${isOver ? "text-red-400" : isLegal ? "text-emerald-400" : "text-white/30"}`}>
                {totalCards}/{game.deckSize.max}
                {isLegal && " ✓"}
                {isOver && " ↑"}
              </span>
            </div>
          </div>
        </div>

        {/* Inline notes editor */}
        {showNotes && (
          <div className="mt-2">
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              onBlur={() => setDeckNotes(deck.id, notesInput)}
              placeholder="Strategy notes, win conditions, card choices…"
              rows={3}
              className="w-full px-3 py-2 glass rounded-xl text-xs text-white/70 placeholder-white/20 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Leader slot — shown for games that require a leader */}
        {LEADER_GAMES.includes(deck.game) && (
          <button
            onClick={() => setShowLeaderPicker(true)}
            className={`mt-2 w-full flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left ${
              deck.leader
                ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                : "bg-white/[0.03] border-dashed border-white/20 hover:border-white/40"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">Leader</span>
            <span className={`text-xs truncate flex-1 ${deck.leader ? "text-amber-300/80" : "text-white/25"}`}>
              {deck.leader ? deck.leader.name : "Tap to select…"}
            </span>
            {deck.leader && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); setDeckLeader(deck.id, undefined); }}
                className="text-white/20 hover:text-white/50 transition-colors text-xs px-1"
              >
                ×
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "text-white border-b border-white/30 bg-white/[0.04]"
                : "text-white/30 hover:text-white/60"
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
                <LayersIcon className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/40 font-semibold">Deck is empty</p>
                <p className="text-white/20 text-sm mt-1">Search for cards and tap + to add them</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* Legality issues */}
                {legalityIssues.length > 0 && (
                  <div className="glass rounded-xl overflow-hidden">
                    {legalityIssues.map((issue, i) => (
                      <div key={i} className={`flex items-start gap-2 px-3 py-2 text-xs border-b last:border-b-0 ${
                        issue.severity === "error"
                          ? "border-red-500/10 bg-red-500/5 text-red-400"
                          : "border-amber-500/10 bg-amber-500/5 text-amber-400"
                      }`}>
                        {issue.severity === "error"
                          ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* View toggle */}
                <div className="flex items-center justify-between">
                  <CostCurve cards={deck.cards} />
                  <div className="flex items-center gap-0.5 glass rounded-lg p-0.5 ml-2 flex-shrink-0 self-end mb-0">
                    <button
                      onClick={() => setDeckViewMode("list")}
                      className={`p-1.5 rounded transition-all ${deckViewMode === "list" ? "bg-white/15 text-white" : "text-white/25 hover:text-white/50"}`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeckViewMode("grid")}
                      className={`p-1.5 rounded transition-all ${deckViewMode === "grid" ? "bg-white/15 text-white" : "text-white/25 hover:text-white/50"}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {deckViewMode === "grid" ? (
                  // Grid view: card images in a tight grid
                  <div className="grid grid-cols-4 gap-1.5">
                    {deck.cards.flatMap((dc) =>
                      Array.from({ length: dc.quantity }, (_, i) => (
                        <GridCardTile
                          key={`${dc.card.id}-${i}`}
                          card={dc.card}
                          onAdd={() => handleAddCard(dc.card)}
                          onRemove={() => handleRemoveCard(dc.card)}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  // List view (existing)
                  grouped.map(({ label, cards }) => {
                    const groupTotal = cards.reduce((s, c) => s + c.quantity, 0);
                    return (
                      <div key={label}>
                        <div className="flex items-center gap-2 px-1 mb-1.5">
                          <span className="text-xs font-semibold text-white/40">{label}</span>
                          <span className="text-xs text-white/20">({groupTotal})</span>
                          <div className="flex-1 h-px bg-white/[0.05]" />
                        </div>
                        <div className="space-y-1.5">
                          {cards.map((dc) => (
                            <div key={dc.card.id} className={illegalCardIds.has(dc.card.id) ? "ring-1 ring-red-500/50 rounded-xl" : ""}>
                              <CardItem
                                card={dc.card}
                                deck={deck}
                                quantity={dc.quantity}
                                showImage={true}
                                price={priceMap.get(dc.card.id)}
                                onAdd={handleAddCard}
                                onRemove={handleRemoveCard}
                                onDetail={setDetailCard}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <DeckAnalysisPanel deck={deck} />
        )}

        {activeTab === "calc" && (
          <div className="h-full overflow-y-auto">
            <DrawCalcPanel deck={deck} />
          </div>
        )}

        {activeTab === "play" && (
          <PlaytestPanel deck={deck} />
        )}
      </div>

      {showIO && <DeckIOModal deck={deck} onClose={() => setShowIO(false)} />}

      {showLeaderPicker && (
        <LeaderPickerModal
          game={deck.game}
          currentLeader={deck.leader}
          onSelect={(leader) => setDeckLeader(deck.id, leader)}
          onClose={() => setShowLeaderPicker(false)}
        />
      )}

      {detailCard && (
        <CardDetailModal
          card={detailCard}
          quantity={deck.cards.find((dc) => dc.card.id === detailCard.id)?.quantity}
          onAdd={handleAddCard}
          onRemove={handleRemoveCard}
          onClose={() => setDetailCard(null)}
        />
      )}
    </div>
  );
}
