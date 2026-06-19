"use client";

import { useState, useMemo } from "react";
import NextImage from "next/image";
import { Card, TCGGame } from "@/types";
import { getCardsForGame } from "@/lib/card-database";
import { getCardImageUrl } from "@/lib/card-images";
import { Search, X, Check } from "lucide-react";

interface LeaderPickerModalProps {
  game: TCGGame;
  currentLeader?: Card;
  onSelect: (leader: Card | undefined) => void;
  onClose: () => void;
}

function LeaderCard({ card, selected, onSelect }: { card: Card; selected: boolean; onSelect: () => void }) {
  const imageUrl = getCardImageUrl(card);
  const colors = card.color?.split("/").map((c) => c.trim()) ?? [];

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
        selected
          ? "bg-amber-500/15 border border-amber-500/40"
          : "glass hover:bg-white/[0.06] border border-transparent"
      }`}
    >
      {/* Card thumbnail */}
      <div className="relative w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
        {imageUrl ? (
          <NextImage
            src={imageUrl}
            alt={card.name}
            fill
            sizes="40px"
            className="object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xl">👑</div>
        )}
      </div>

      {/* Card info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{card.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {colors.map((c) => (
            <span key={c} className="text-[10px] text-white/40">{c}</span>
          ))}
          {card.life !== undefined && (
            <span className="text-[10px] text-pink-400 font-semibold">♥ {card.life}</span>
          )}
          {card.power !== undefined && (
            <span className="text-[10px] text-orange-400">{card.power.toLocaleString()} PWR</span>
          )}
          {card.set && (
            <span className="text-[10px] text-white/25">{card.set}</span>
          )}
        </div>
      </div>

      {selected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
    </button>
  );
}

// Games that use a designated leader card outside the main deck
const LEADER_GAMES: TCGGame[] = ["onepiece", "swu"];

export function LeaderPickerModal({ game, currentLeader, onSelect, onClose }: LeaderPickerModalProps) {
  const [query, setQuery] = useState("");

  const leaders = useMemo(() => {
    const all = getCardsForGame(game);
    return all.filter((c) => c.type === "Leader");
  }, [game]);

  const filtered = useMemo(() => {
    if (!query.trim()) return leaders;
    const q = query.toLowerCase();
    return leaders.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.color ?? "").toLowerCase().includes(q) ||
      (c.set ?? "").toLowerCase().includes(q)
    );
  }, [leaders, query]);

  if (!LEADER_GAMES.includes(game)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-md rounded-t-2xl border-t border-white/[0.08] flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">Select Leader</h2>
            <p className="text-[11px] text-white/30 mt-0.5">{leaders.length} leaders available</p>
          </div>
          <div className="flex items-center gap-2">
            {currentLeader && (
              <button
                onClick={() => { onSelect(undefined); onClose(); }}
                className="px-3 py-1.5 glass hover:bg-red-500/20 rounded-xl text-xs text-red-400 font-semibold transition-all border border-white/[0.07] hover:border-red-500/30"
              >
                Clear
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, color, set…"
              className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm text-white placeholder-white/20 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Leader list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">No leaders found</div>
          ) : (
            filtered.map((card) => (
              <LeaderCard
                key={card.id}
                card={card}
                selected={currentLeader?.id === card.id}
                onSelect={() => { onSelect(card); onClose(); }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export { LEADER_GAMES };
