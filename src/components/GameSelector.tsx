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
    <div className="glass-nav border-b flex-shrink-0">
      <div className="px-3 py-2">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {GAMES.map((game) => {
            const deckCount = decks.filter((d) => d.game === game.id).length;
            const isSelected = selected === game.id;
            return (
              <button
                key={game.id}
                onClick={() => onSelect(game.id)}
                style={isSelected ? { boxShadow: `0 0 16px ${game.color}50, 0 0 32px ${game.color}20` } : undefined}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-b ${game.gradient} border-white/20 scale-105`
                    : "glass border-white/[0.07] hover:border-white/15 hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-lg leading-none">{game.icon}</span>
                <span className={`text-[9px] font-bold tracking-wide whitespace-nowrap ${isSelected ? "text-white" : "text-white/40"}`}>
                  {game.shortName}
                </span>
                {deckCount > 0 && (
                  <span className={`text-[8px] px-1 py-0.5 rounded-full font-semibold leading-none ${
                    isSelected ? "bg-white/25 text-white" : "bg-white/10 text-white/40"
                  }`}>
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
