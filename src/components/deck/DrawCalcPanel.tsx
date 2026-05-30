"use client";

import { useState, useMemo } from "react";
import { Deck } from "@/types";
import { getGame } from "@/lib/games";
import { calculateDrawOdds, DrawEntry } from "@/lib/draw-probability";
import { Plus, Trash2, TrendingUp } from "lucide-react";

interface DrawCalcPanelProps {
  deck: Deck;
}

function ProbBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/35 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right tabular-nums ${pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-yellow-400" : "text-red-400"}`}>
        {pct}%
      </span>
    </div>
  );
}

export function DrawCalcPanel({ deck }: DrawCalcPanelProps) {
  const game = getGame(deck.game);
  const deckSize = deck.cards.reduce((s, dc) => s + dc.quantity, 0);
  const handSize = game.openingHandSize;

  const [entries, setEntries] = useState<DrawEntry[]>(() =>
    deck.cards.slice(0, 3).map((dc) => ({
      cardId: dc.card.id,
      cardName: dc.card.name,
      copiesInDeck: dc.quantity,
      wantAtLeast: 1,
    }))
  );
  const [selectedCardId, setSelectedCardId] = useState("");

  const results = useMemo(
    () => calculateDrawOdds(entries, deckSize, handSize),
    [entries, deckSize, handSize]
  );

  const addCard = () => {
    const dc = deck.cards.find((d) => d.card.id === selectedCardId);
    if (!dc || entries.some((e) => e.cardId === dc.card.id)) return;
    setEntries((prev) => [
      ...prev,
      { cardId: dc.card.id, cardName: dc.card.name, copiesInDeck: dc.quantity, wantAtLeast: 1 },
    ]);
    setSelectedCardId("");
  };

  const remove = (id: string) => setEntries((prev) => prev.filter((e) => e.cardId !== id));

  const setWant = (id: string, want: number) =>
    setEntries((prev) =>
      prev.map((e) => (e.cardId === id ? { ...e, wantAtLeast: Math.max(1, Math.min(e.copiesInDeck, want)) } : e))
    );

  if (deckSize === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <TrendingUp className="w-10 h-10 text-white/10 mb-3" />
        <p className="text-white/40 text-sm font-medium">Add cards to your deck first</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header info */}
      <div className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-white">{deckSize}-card deck</p>
          <p className="text-[10px] text-white/35">{handSize}-card opening hand</p>
        </div>
        <TrendingUp className="w-5 h-5 text-white/20" />
      </div>

      {/* Add card picker */}
      <div className="flex gap-2">
        <select
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
          className="flex-1 px-2.5 py-2 glass rounded-xl text-xs text-white focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">Pick a card to track…</option>
          {deck.cards
            .filter((dc) => !entries.some((e) => e.cardId === dc.card.id))
            .map((dc) => (
              <option key={dc.card.id} value={dc.card.id}>
                {dc.quantity}x {dc.card.name}
              </option>
            ))}
        </select>
        <button
          onClick={addCard}
          disabled={!selectedCardId}
          className="px-3 py-2 glass rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      {results.length === 0 && (
        <p className="text-xs text-white/25 text-center py-4">
          Select cards above to see draw probabilities.
        </p>
      )}
      {results.map((r) => (
        <div key={r.cardId} className="glass rounded-xl p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{r.cardName}</p>
              <p className="text-[10px] text-white/30">{r.copiesInDeck} copies in deck</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-white/35">want ≥</span>
              <button
                onClick={() => setWant(r.cardId, r.wantAtLeast - 1)}
                className="w-5 h-5 rounded glass hover:bg-white/10 text-white/50 flex items-center justify-center text-xs"
              >−</button>
              <span className="w-4 text-center text-xs font-bold text-white">{r.wantAtLeast}</span>
              <button
                onClick={() => setWant(r.cardId, r.wantAtLeast + 1)}
                className="w-5 h-5 rounded glass hover:bg-white/10 text-white/50 flex items-center justify-center text-xs"
              >+</button>
              <button onClick={() => remove(r.cardId)} className="w-5 h-5 rounded glass hover:bg-red-500/20 text-white/25 hover:text-red-400 flex items-center justify-center transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <ProbBar value={r.probOpeningHand} label={`Opening ${handSize}`} />
            <ProbBar value={r.probByTurn3} label="By turn 3" />
          </div>
        </div>
      ))}

      <p className="text-[10px] text-white/20 text-center pb-1">
        Hypergeometric distribution · assumes no search or draw effects
      </p>
    </div>
  );
}
