"use client";

import { useState, useEffect, useMemo } from "react";
import { TCGGame, Deck } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { GameSelector } from "@/components/GameSelector";
import { DeckList } from "@/components/deck/DeckList";
import { DeckBuilder } from "@/components/deck/DeckBuilder";
import { MetaDashboard } from "@/components/MetaDashboard";
import { LayersIcon, TrendingUp, ChevronLeft, Sparkles } from "lucide-react";

type AppView = "home" | "builder" | "meta";

export default function App() {
  const { selectedGame, setSelectedGame, setActiveDeck, activeDeckId, decks } = useDeckStore();
  const [view, setView] = useState<AppView>("home");
  const [mounted, setMounted] = useState(false);

  // SSR hydration guard — Zustand reads from localStorage on client only
  useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  // Derive activeDeck from store state; updates whenever decks or activeDeckId change
  const activeDeck: Deck | undefined = useMemo(
    () => decks.find((d) => d.id === activeDeckId),
    [decks, activeDeckId]
  );

  const handleSelectDeck = (deck: Deck) => {
    setActiveDeck(deck.id);
    setView("builder");
  };

  const handleGameSelect = (game: TCGGame) => {
    setSelectedGame(game);
    setView("home");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">🃏</div>
          <div className="animate-pulse text-white/40 text-sm tracking-widest uppercase">Loading</div>
        </div>
      </div>
    );
  }

  const isHome = view === "home" || view === "builder";

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative">
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 glass-nav border-b z-10">
        {view === "builder" ? (
          <button
            onClick={() => setView("home")}
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : null}

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white tracking-tight leading-none">TCG Builder</h1>
            <p className="text-[10px] text-white/35 leading-none mt-0.5 truncate">
              {view === "builder" && activeDeck ? activeDeck.name : "AI-Powered Deck Assistant"}
            </p>
          </div>
        </div>

        {/* Nav pill */}
        <div className="flex items-center gap-0.5 glass rounded-xl p-1">
          <button
            onClick={() => setView("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isHome
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            Decks
          </button>
          <button
            onClick={() => setView("meta")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === "meta"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Meta
          </button>
        </div>
      </header>

      {/* Game Selector */}
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
            <LayersIcon className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/50 font-medium">No deck selected</p>
            <button
              onClick={() => setView("home")}
              className="mt-4 px-4 py-2 glass-md rounded-xl text-sm text-white/70 hover:text-white transition-colors"
            >
              Go to Decks
            </button>
          </div>
        )}
        {view === "meta" && <MetaDashboard game={selectedGame} />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="flex-shrink-0 flex glass-nav border-t pb-safe">
        <button
          onClick={() => setView("home")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all ${
            isHome ? "text-blue-400" : "text-white/30 hover:text-white/50"
          }`}
        >
          <div className="relative">
            <LayersIcon className="w-5 h-5" />
            {isHome && (
              <span className="glow-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </div>
          <span>Decks</span>
        </button>
        <button
          onClick={() => setView("meta")}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all ${
            view === "meta" ? "text-violet-400" : "text-white/30 hover:text-white/50"
          }`}
        >
          <div className="relative">
            <TrendingUp className="w-5 h-5" />
            {view === "meta" && (
              <span className="glow-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
            )}
          </div>
          <span>Meta</span>
        </button>
      </nav>
    </div>
  );
}
