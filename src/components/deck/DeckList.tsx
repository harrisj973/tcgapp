"use client";

import { Deck, TCGGame } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DeckListProps {
  game: TCGGame;
  onSelectDeck: (deck: Deck) => void;
}

function DeckProgressBar({ count, min, max }: { count: number; min: number; max: number }) {
  const pct = Math.min(100, (count / max) * 100);
  const isLegal = count >= min && count <= max;
  const isOver = count > max;
  const barColor = isOver ? "bg-red-500" : isLegal ? "bg-emerald-400" : count > 0 ? "bg-amber-400" : "bg-white/10";
  return (
    <div className="mt-1.5">
      <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-white/25">{count}/{max} cards</span>
        {isLegal && <span className="text-[10px] text-emerald-400 font-semibold">✓ Legal</span>}
        {isOver && <span className="text-[10px] text-red-400 font-semibold">Over limit</span>}
        {!isLegal && !isOver && count > 0 && <span className="text-[10px] text-amber-400">{min - count} more needed</span>}
      </div>
    </div>
  );
}

export function DeckList({ game, onSelectDeck }: DeckListProps) {
  const { decks, createDeck, deleteDeck, activeDeckId, getDeckCardCount } = useDeckStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const gameDecks = decks.filter((d) => d.game === game);
  const gameConfig = getGame(game);

  const handleCreate = () => {
    if (newDeckName.trim()) {
      const deck = createDeck(newDeckName.trim(), game);
      setNewDeckName("");
      setShowCreateModal(false);
      onSelectDeck(deck);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Game Banner */}
      <div className={`relative bg-gradient-to-br ${gameConfig.gradient} px-4 pt-5 pb-6 overflow-hidden flex-shrink-0`}>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        {/* Ghost icon */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-8xl opacity-[0.08] select-none pointer-events-none">
          {gameConfig.icon}
        </span>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em] mb-0.5">Now Playing</p>
          <h2 className="text-xl font-black text-white leading-tight">{gameConfig.name}</h2>
          <p className="text-xs text-white/50 mt-0.5">{gameConfig.description}</p>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-white/50">{gameDecks.length} deck{gameDecks.length !== 1 ? "s" : ""}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/50">
              {gameConfig.deckSize.min === gameConfig.deckSize.max
                ? `${gameConfig.deckSize.min} cards`
                : `${gameConfig.deckSize.min}–${gameConfig.deckSize.max} cards`}
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-xs font-bold text-white border border-white/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Deck
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm glass-md rounded-2xl p-6 shadow-2xl shadow-black/50">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
              {gameConfig.icon}
            </div>
            <h3 className="text-lg font-black text-white mb-0.5">New {gameConfig.shortName} Deck</h3>
            <p className="text-xs text-white/35 mb-5">{gameConfig.deckSize.min}–{gameConfig.deckSize.max} cards required</p>
            <input
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="My Awesome Deck"
              className="w-full px-3 py-2.5 glass rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 mb-4 transition-colors"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl glass text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDeckName.trim()}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${gameConfig.gradient} transition-opacity disabled:opacity-30`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {gameDecks.length === 0 ? (
          <div className="mt-4 glass rounded-2xl overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${gameConfig.gradient}`} />
            <div className="p-8 text-center">
              <span className="text-5xl">{gameConfig.icon}</span>
              <p className="text-white font-bold mt-4 mb-1">No {gameConfig.shortName} decks yet</p>
              <p className="text-white/30 text-xs mb-6">Build your first deck and start testing strategies</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${gameConfig.gradient} text-white text-sm font-bold shadow-lg transition-opacity hover:opacity-90`}
              >
                <Plus className="w-4 h-4" />
                Create First Deck
              </button>
            </div>
          </div>
        ) : (
          gameDecks.map((deck) => {
            const count = getDeckCardCount(deck);
            const isActive = deck.id === activeDeckId;
            const cfg = getGame(deck.game);
            return (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                style={isActive ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.4)" } : undefined}
                className={`rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
                  isActive ? "bg-white/[0.07] border-white/15" : "glass border-white/[0.07] hover:bg-white/[0.06] hover:border-white/12"
                }`}
              >
                <div className={`h-0.5 bg-gradient-to-r ${cfg.gradient} opacity-80`} />
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{deck.name}</p>
                    <DeckProgressBar count={count} min={cfg.deckSize.min} max={cfg.deckSize.max} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? "text-white/50" : "text-white/20"}`} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {gameDecks.length > 0 && (
        <div className="px-4 py-2 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20 text-center">Tap a deck to open the builder</p>
        </div>
      )}
    </div>
  );
}
