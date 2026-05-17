"use client";

import { useState, useEffect } from "react";
import { TCGGame, Deck } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { GameSelector } from "@/components/GameSelector";
import { DeckList } from "@/components/deck/DeckList";
import { DeckBuilder } from "@/components/deck/DeckBuilder";
import { MetaDashboard } from "@/components/MetaDashboard";
import { LayersIcon, TrendingUp, ChevronLeft } from "lucide-react";

type AppView = "home" | "builder" | "meta";

export default function App() {
  const { selectedGame, setSelectedGame, setActiveDeck, getActiveDeck, decks } = useDeckStore();
  const [view, setView] = useState<AppView>("home");
  const [activeDeck, setLocalActiveDeck] = useState<Deck | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setLocalActiveDeck(getActiveDeck());
    }
  }, [decks, mounted]);

  const handleSelectDeck = (deck: Deck) => {
    setActiveDeck(deck.id);
    setLocalActiveDeck(deck);
    setView("builder");
  };

  const handleGameSelect = (game: TCGGame) => {
    setSelectedGame(game);
    setView("home");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f1117]">
        <div className="text-center">
          <div className="text-4xl mb-3">🃏</div>
          <div className="animate-pulse text-gray-400 text-sm">Loading TCG Builder...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1117] max-w-md mx-auto relative">
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gray-900/95 border-b border-gray-700/50 backdrop-blur-sm z-10">
        {view === "builder" ? (
          <button
            onClick={() => setView("home")}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : null}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-base">🃏</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white tracking-tight leading-none">TCG Builder</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5 truncate">
              {view === "builder" && activeDeck ? activeDeck.name : "AI-Powered Deck Assistant"}
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center gap-1 bg-gray-800/80 rounded-xl p-1 border border-gray-700/30">
          <button
            onClick={() => setView("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === "home" || view === "builder"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            Decks
          </button>
          <button
            onClick={() => setView("meta")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === "meta"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Meta
          </button>
        </div>
      </header>

      {/* Game Selector — shown on home and meta views */}
      {view !== "builder" && (
        <GameSelector selected={selectedGame} onSelect={handleGameSelect} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === "home" && (
          <DeckList game={selectedGame} onSelectDeck={handleSelectDeck} />
        )}

        {view === "builder" && activeDeck && (
          <DeckBuilder deck={activeDeck} />
        )}

        {view === "builder" && !activeDeck && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <LayersIcon className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium">No deck selected</p>
            <button
              onClick={() => setView("home")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
            >
              Go to Decks
            </button>
          </div>
        )}

        {view === "meta" && (
          <MetaDashboard game={selectedGame} />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="flex-shrink-0 flex border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-sm pb-safe">
        <button
          onClick={() => setView("home")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            view === "home" || view === "builder" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <LayersIcon className="w-5 h-5" />
          <span>Decks</span>
        </button>

        <button
          onClick={() => setView("meta")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            view === "meta" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Meta</span>
        </button>
      </nav>
    </div>
  );
}
