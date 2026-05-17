"use client";

import { Deck, TCGGame } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { Plus, Trash2, ChevronRight, Calendar, Layers } from "lucide-react";
import { useState } from "react";
import { GAMES } from "@/lib/games";

interface DeckListProps {
  game: TCGGame;
  onSelectDeck: (deck: Deck) => void;
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
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-white">My Decks</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deck
          </button>
        </div>
        <p className="text-xs text-gray-500">{gameConfig.name} • {gameDecks.length} deck{gameDecks.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Deck</h3>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1.5">Deck Name</label>
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
          <div className="text-center py-12">
            <Layers className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No decks yet</p>
            <p className="text-gray-600 text-xs mt-1">Create your first {gameConfig.shortName} deck</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
            >
              Create Deck
            </button>
          </div>
        ) : (
          gameDecks.map((deck) => {
            const count = getDeckCardCount(deck);
            const isActive = deck.id === activeDeckId;
            const gameConfig = getGame(deck.game);

            return (
              <div
                key={deck.id}
                className={`rounded-xl border transition-all cursor-pointer group ${
                  isActive
                    ? "bg-blue-600/20 border-blue-500/50"
                    : "bg-gray-800/60 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3 p-3" onClick={() => onSelectDeck(deck)}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gameConfig.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                    {gameConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{deck.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{count} cards</span>
                      {count >= gameConfig.deckSize.min && count <= gameConfig.deckSize.max && (
                        <span className="text-xs text-green-400">✓ Legal</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? "text-blue-400" : "text-gray-600"}`} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
