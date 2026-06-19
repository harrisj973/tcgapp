"use client";

import { useState, useMemo } from "react";
import { Card, Deck, TCGGame, SearchFilters } from "@/types";
import { searchCards, getCardTypes, getCardColors, getCardRarities, getGameCostLabel } from "@/lib/card-database";
import { CardItem } from "./CardItem";
import { CardDetailModal } from "./CardDetailModal";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface CardSearchProps {
  game: TCGGame;
  deck?: Deck;
  onAddCard: (card: Card) => void;
}

export function CardSearch({ game, deck, onAddCard }: CardSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({ query: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [detailCard, setDetailCard] = useState<Card | null>(null);

  const types = useMemo(() => getCardTypes(game), [game]);
  const colors = useMemo(() => getCardColors(game), [game]);
  const rarities = useMemo(() => getCardRarities(game), [game]);
  const costLabel = getGameCostLabel(game);

  const cards = useMemo(() => {
    return searchCards(game, filters);
  }, [game, filters]);

  const updateFilter = (key: keyof SearchFilters, value: string | number | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value === "" ? undefined : value }));
  };

  const hasActiveFilters = filters.type || filters.color || filters.rarity || filters.maxCost !== undefined || filters.banned === false;

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-white/[0.05] space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            placeholder="Search by name, effect, keyword..."
            className="w-full pl-9 pr-9 py-2.5 glass rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showFilters || hasActiveFilters
                ? "bg-white/15 text-white border-white/20"
                : "glass text-white/40 hover:text-white/70 border-white/[0.07]"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <span className="text-[11px] text-white/25 ml-auto tabular-nums">{cards.length.toLocaleString()} cards</span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass rounded-xl p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-white/35 mb-1 uppercase tracking-wider">Type</label>
                <select
                  value={filters.type || ""}
                  onChange={(e) => updateFilter("type", e.target.value)}
                  className="w-full px-2.5 py-1.5 glass rounded-lg text-xs text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/35 mb-1 uppercase tracking-wider">Color</label>
                <select
                  value={filters.color || ""}
                  onChange={(e) => updateFilter("color", e.target.value)}
                  className="w-full px-2.5 py-1.5 glass rounded-lg text-xs text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Colors</option>
                  {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/35 mb-1 uppercase tracking-wider">Rarity</label>
                <select
                  value={filters.rarity || ""}
                  onChange={(e) => updateFilter("rarity", e.target.value)}
                  className="w-full px-2.5 py-1.5 glass rounded-lg text-xs text-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Rarities</option>
                  {rarities.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {costLabel && (
                <div>
                  <label className="block text-[10px] text-white/35 mb-1 uppercase tracking-wider">Max {costLabel}</label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Any"
                    value={filters.maxCost ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateFilter("maxCost", v === "" ? undefined : Number(v));
                    }}
                    className="w-full px-2.5 py-1.5 glass rounded-lg text-xs text-white focus:outline-none appearance-none"
                  />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.banned === false}
                onChange={(e) => updateFilter("banned", e.target.checked ? false : undefined)}
                className="rounded"
              />
              <span className="text-xs text-white/40">Hide Banned Cards</span>
            </label>
          </div>
        )}
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {cards.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-8 h-8 mx-auto mb-3 text-white/15" />
            <p className="text-sm text-white/40 font-medium">No cards found</p>
            <p className="text-xs text-white/20 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              deck={deck}
              onAdd={onAddCard}
              onDetail={setDetailCard}
              compact={true}
              showImage={cards.length <= 200}
            />
          ))
        )}
      </div>

      {detailCard && (
        <CardDetailModal
          card={detailCard}
          quantity={deck?.cards.find((dc) => dc.card.id === detailCard.id)?.quantity}
          onAdd={(c) => { onAddCard(c); }}
          onClose={() => setDetailCard(null)}
        />
      )}
    </div>
  );
}
