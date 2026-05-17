"use client";

import { useState, useMemo } from "react";
import { Card, Deck, TCGGame, SearchFilters } from "@/types";
import { searchCards, getCardTypes, getCardColors } from "@/lib/card-database";
import { CardItem } from "./CardItem";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface CardSearchProps {
  game: TCGGame;
  deck?: Deck;
  onAddCard: (card: Card) => void;
}

export function CardSearch({ game, deck, onAddCard }: CardSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({ query: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const types = useMemo(() => getCardTypes(game), [game]);
  const colors = useMemo(() => getCardColors(game), [game]);

  const cards = useMemo(() => {
    return searchCards(game, filters);
  }, [game, filters]);

  const updateFilter = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            placeholder="Search cards by name, effect, tag..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter("query", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFilters ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <span className="text-xs text-gray-500 ml-auto">{cards.length} cards</span>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={filters.type || ""}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Types</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <select
                value={filters.color || ""}
                onChange={(e) => updateFilter("color", e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Colors</option>
                {colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="hideBanned"
                checked={filters.banned === false}
                onChange={(e) => updateFilter("banned", e.target.checked ? false : undefined)}
                className="rounded"
              />
              <label htmlFor="hideBanned" className="text-xs text-gray-400 cursor-pointer">Hide Banned Cards</label>
            </div>
          </div>
        )}
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No cards found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              deck={deck}
              onAdd={onAddCard}
              compact={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
