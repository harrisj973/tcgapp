"use client";

import { Deck, TCGGame } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { Plus, Trash2, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";

interface DeckListProps {
  game: TCGGame;
  onSelectDeck: (deck: Deck) => void;
}

function DeckProgressBar({ count, min, max }: { count: number; min: number; max: number }) {
  const pct = Math.min(100, Math.round((count / max) * 100));
  const isLegal = count >= min && count <= max;
  const isOver = count > max;
  const barColor = isOver ? "bg-red-500" : isLegal ? "bg-green-500" : count > 0 ? "bg-yellow-500" : "bg-gray-600";

  return (
    <div className="mt-1.5">
      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[10px] text-gray-500">{count}/{max} cards</span>
        {isLegal && <span className="text-[10px] text-green-400 font-medium">✓ Legal</span>}
        {isOver && <span className="text-[10px] text-red-400 font-medium">Over limit</span>}
        {!isLegal && !isOver && count > 0 && <span className="text-[10px] text-yellow-400">Need {min - count} more</span>}
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
      <div className={`relative bg-gradient-to-r ${gameConfig.gradient} px-4 pt-4 pb-5 overflow-hidden`}>
        {/* Decorative large icon */}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-10 select-none pointer-events-none">
          {gameConfig.icon}
        </span>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-0.5">Now Playing</p>
        <h2 className="text-lg font-extrabold text-white leading-tight">{gameConfig.name}</h2>
        <p className="text-xs text-white/60 mt-0.5">{gameConfig.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-white/70">{gameDecks.length} deck{gameDecks.length !== 1 ? "s" : ""}</span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/70">{gameConfig.deckSize.min === gameConfig.deckSize.max ? `${gameConfig.deckSize.min} cards` : `${gameConfig.deckSize.min}–${gameConfig.deckSize.max} cards`}</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-semibold text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deck
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center text-2xl mb-4`}>
              {gameConfig.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">New {gameConfig.shortName} Deck</h3>
            <p className="text-xs text-gray-500 mb-4">{gameConfig.deckSize.min}–{gameConfig.deckSize.max} cards required</p>

            <div className="mb-4">
              <input
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="My Awesome Deck"
                className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDeckName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50"
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
          <div className="mt-4 rounded-2xl overflow-hidden border border-gray-700/50">
            {/* Gradient top stripe */}
            <div className={`h-2 bg-gradient-to-r ${gameConfig.gradient}`} />
            <div className="p-8 text-center bg-gray-800/40">
              <span className="text-5xl">{gameConfig.icon}</span>
              <p className="text-white font-semibold mt-4 mb-1">No {gameConfig.shortName} decks yet</p>
              <p className="text-gray-500 text-xs mb-5">Build your first deck and start testing strategies</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${gameConfig.gradient} text-white text-sm font-semibold shadow-lg transition-opacity hover:opacity-90`}
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
                className={`rounded-xl border transition-all cursor-pointer group overflow-hidden ${
                  isActive
                    ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                    : "bg-gray-800/60 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800"
                }`}
              >
                {/* Gradient top accent */}
                <div className={`h-0.5 bg-gradient-to-r ${cfg.gradient}`} />

                <div className="flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{deck.name}</p>
                    <DeckProgressBar count={count} min={cfg.deckSize.min} max={cfg.deckSize.max} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-600"}`} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint when decks exist */}
      {gameDecks.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700/30">
          <p className="text-[10px] text-gray-600 text-center">Tap a deck to open it in the builder</p>
        </div>
      )}
    </div>
  );
}
