"use client";

import { Deck, TCGGame } from "@/types";
import { useDeckStore } from "@/lib/deck-store";
import { getGame } from "@/lib/games";
import { Plus, Trash2, ChevronRight, ChevronDown, FolderOpen, Tag } from "lucide-react";
import { useState } from "react";

interface DeckListProps {
  game: TCGGame;
  onSelectDeck: (deck: Deck) => void;
}

const COLOR_TAGS: { key: string; bg: string; ring: string }[] = [
  { key: "red",    bg: "bg-red-500",    ring: "ring-red-500" },
  { key: "orange", bg: "bg-orange-400", ring: "ring-orange-400" },
  { key: "yellow", bg: "bg-yellow-400", ring: "ring-yellow-400" },
  { key: "green",  bg: "bg-emerald-500",ring: "ring-emerald-500" },
  { key: "blue",   bg: "bg-blue-500",   ring: "ring-blue-500" },
  { key: "purple", bg: "bg-purple-500", ring: "ring-purple-500" },
  { key: "pink",   bg: "bg-pink-400",   ring: "ring-pink-400" },
  { key: "white",  bg: "bg-white/60",   ring: "ring-white/60" },
];

function colorTagBg(key: string): string {
  return COLOR_TAGS.find((c) => c.key === key)?.bg ?? "bg-white/20";
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

function DeckMetaPopover({
  deck,
  allFolders,
  onClose,
}: {
  deck: Deck;
  allFolders: string[];
  onClose: () => void;
}) {
  const { setDeckMeta } = useDeckStore();
  const [folderInput, setFolderInput] = useState(deck.folder ?? "");

  const saveFolder = () => {
    setDeckMeta(deck.id, { folder: folderInput.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-md rounded-t-2xl border-t border-white/[0.08] p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-white truncate">{deck.name}</p>

        {/* Color tag picker */}
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Color Tag
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDeckMeta(deck.id, { colorTag: undefined })}
              className={`w-6 h-6 rounded-full border-2 bg-white/10 ${!deck.colorTag ? "border-white/60" : "border-transparent"} transition-all`}
            />
            {COLOR_TAGS.map((c) => (
              <button
                key={c.key}
                onClick={() => setDeckMeta(deck.id, { colorTag: c.key })}
                className={`w-6 h-6 rounded-full ${c.bg} ${deck.colorTag === c.key ? `ring-2 ring-offset-1 ring-offset-black/80 ${c.ring}` : ""} transition-all`}
              />
            ))}
          </div>
        </div>

        {/* Folder */}
        <div>
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FolderOpen className="w-3 h-3" /> Folder
          </p>
          {allFolders.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allFolders.map((f) => (
                <button
                  key={f}
                  onClick={() => setFolderInput(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${folderInput === f ? "bg-white/20 text-white" : "glass text-white/40 hover:text-white/70"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveFolder()}
              placeholder="New folder name…"
              className="flex-1 px-2.5 py-1.5 glass rounded-xl text-xs text-white placeholder-white/20 focus:outline-none"
            />
            <button
              onClick={saveFolder}
              className="px-3 py-1.5 glass rounded-xl text-xs text-white/60 hover:text-white transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeckList({ game, onSelectDeck }: DeckListProps) {
  const { decks, createDeck, deleteDeck, activeDeckId, getDeckCardCount } = useDeckStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [metaDeck, setMetaDeck] = useState<Deck | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const gameDecks = decks.filter((d) => d.game === game);
  const gameConfig = getGame(game);

  const allFolders = Array.from(new Set(gameDecks.map((d) => d.folder).filter(Boolean))) as string[];

  const handleCreate = () => {
    if (newDeckName.trim()) {
      const deck = createDeck(newDeckName.trim(), game);
      setNewDeckName("");
      setShowCreateModal(false);
      onSelectDeck(deck);
    }
  };

  const toggleFolder = (folder: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      next.has(folder) ? next.delete(folder) : next.add(folder);
      return next;
    });
  };

  // Group decks: folders first, then unfiled
  const foldersMap = new Map<string, Deck[]>();
  const unfiled: Deck[] = [];
  for (const deck of gameDecks) {
    if (deck.folder) {
      if (!foldersMap.has(deck.folder)) foldersMap.set(deck.folder, []);
      foldersMap.get(deck.folder)!.push(deck);
    } else {
      unfiled.push(deck);
    }
  }

  function renderDeckCard(deck: Deck) {
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
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
              {cfg.icon}
            </div>
            {deck.colorTag && (
              <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${colorTagBg(deck.colorTag)} border border-black/40`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{deck.name}</p>
            <DeckProgressBar count={count} min={cfg.deckSize.min} max={cfg.deckSize.max} />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMetaDeck(deck); }}
              className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Game Banner */}
      <div className={`relative bg-gradient-to-br ${gameConfig.gradient} px-4 pt-5 pb-6 overflow-hidden flex-shrink-0`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
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
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-xl glass text-sm text-white/50 hover:text-white transition-colors">
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

      {/* Meta popover */}
      {metaDeck && (
        <DeckMetaPopover
          deck={metaDeck}
          allFolders={allFolders}
          onClose={() => setMetaDeck(null)}
        />
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
          <>
            {/* Folder groups */}
            {Array.from(foldersMap.entries()).map(([folder, fDecks]) => {
              const collapsed = collapsedFolders.has(folder);
              return (
                <div key={folder}>
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center gap-2 px-1 py-1.5 text-left"
                  >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
                    <FolderOpen className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs font-semibold text-white/50">{folder}</span>
                    <span className="text-[10px] text-white/25">({fDecks.length})</span>
                  </button>
                  {!collapsed && (
                    <div className="space-y-2 pl-5">
                      {fDecks.map(renderDeckCard)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unfiled decks */}
            {unfiled.length > 0 && (
              <div className="space-y-2">
                {foldersMap.size > 0 && (
                  <p className="px-1 text-[10px] text-white/25 uppercase tracking-wider pt-1">Unfiled</p>
                )}
                {unfiled.map(renderDeckCard)}
              </div>
            )}
          </>
        )}
      </div>

      {gameDecks.length > 0 && (
        <div className="px-4 py-2 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20 text-center">Tap a deck to open · Hover for folder/tag options</p>
        </div>
      )}
    </div>
  );
}
