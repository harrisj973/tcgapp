"use client";

import { TCGGame } from "@/types";
import { GAMES } from "@/lib/games";
import { useDeckStore } from "@/lib/deck-store";

interface GameSelectorProps {
  selected: TCGGame;
  onSelect: (game: TCGGame) => void;
}

export function GameSelector({ selected, onSelect }: GameSelectorProps) {
  const { decks } = useDeckStore();

  return (
    <div className="bg-gray-900 border-b border-gray-700/50">
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Select Game</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GAMES.map((game) => {
            const deckCount = decks.filter((d) => d.game === game.id).length;
            const isSelected = selected === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onSelect(game.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? `bg-gradient-to-b ${game.gradient} border-transparent shadow-lg scale-105`
                    : "bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750"
                }`}
              >
                <span className="text-xl leading-none">{game.icon}</span>
                <span className={`text-[10px] font-bold whitespace-nowrap ${isSelected ? "text-white" : "text-gray-400"}`}>
                  {game.shortName}
                </span>
                {deckCount > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? "bg-white/20 text-white" : "bg-gray-700 text-gray-400"}`}>
                    {deckCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
