# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build (also used to type-check)
npm run lint       # run ESLint
npx tsc --noEmit   # type-check only (faster than build)
```

There are no tests. Use `npx tsc --noEmit && npm run build` to verify correctness before committing.

## Architecture

**Mobile-first PWA** built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Zustand. Targets a `max-w-md` phone viewport. The entire app is a single route (`src/app/page.tsx`) that renders one of three views: `home` (deck list), `builder` (deck editor), or `meta` (meta dashboard).

### Key files

| File | Purpose |
|---|---|
| `src/types/index.ts` | All shared types — `Card`, `Deck`, `DeckCard`, `TCGGame`, etc. |
| `src/lib/games.ts` | `GAMES` config array + `getGame(id)` — one entry per supported TCG |
| `src/lib/card-database.ts` | Aggregates all game card arrays into `ALL_CARDS`; exports `searchCards`, `getCardById`, `getCardsForGame` |
| `src/lib/opcg-cards.ts` | **~20k-line** array `ONEPIECE_CARDS: Card[]` — the only game with a real card database |
| `src/lib/deck-store.ts` | Zustand store (persisted to `localStorage` as `"tcg-deck-builder"`) — source of truth for all decks and selected game |
| `src/lib/synergy-engine.ts` | Pure functions: `calculateCardSynergy`, `analyzeDeck` — no I/O |
| `src/lib/ai-analysis.ts` | `"use server"` — calls Claude (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk` for AI deck insights |

### Component tree

```
page.tsx (view state machine)
├── GameSelector        — horizontal scroll of TCG icons
├── DeckList            — list of saved decks for current game
├── DeckBuilder         — 3-tab editor: Search | Cards | Analysis
│   ├── CardSearch      — calls searchCards(), renders CardItem list
│   ├── CardItem        — single card row/card with add/remove
│   └── DeckAnalysisPanel — calls getAIAnalysis() server action
└── MetaDashboard       — static meta tier list per game
```

### One Piece card data

`src/lib/opcg-cards.ts` is the canonical card database for OPCG. Cards are sourced from the [punk-records](https://github.com/buhbbl/punk-records) open-source repo (`english/data/5691NN.json` where NN = set number: OP01=569101, OP08=569108, etc.).

**Card ID format:** `"op-{setCode}_{num}"` e.g. `"op-op08_042"` (lowercase, underscore, 3-digit zero-padded number).

**Card shape rules:**
- Leaders: `life: 5` (mono-color) or `life: 4` (dual-color); no `cost` field
- Omit `power` entirely for Events, Stages, and Characters with no printed power stat
- `rarity`: `"Common"` | `"Uncommon"` | `"Rare"` | `"Super Rare"` | `"Secret Rare"` | `"Leader"`

**Ban list** is applied in `card-database.ts` via `OPCG_BANNED_IDS` (not in `opcg-cards.ts`). Currently banned: `op-op03_040`, `op-op06_116`, `op-op06_086`, `op-op06_047`, `op-st10_001`.

All other games (Yu-Gi-Oh, Digimon, Pokémon, MTG, etc.) have only a small representative sample of cards defined inline in `card-database.ts`.

### State management

Zustand store (`useDeckStore`) is persisted via `localStorage`. It holds the full deck list, the active deck ID, and the selected game. The `addCard` action enforces a max of 4 copies per card for Pokémon/MTG and 3 for all other games. One Piece decks use a `leader` field on `Deck` (separate from `cards`).

### AI analysis

`getAIAnalysis` in `ai-analysis.ts` is a Next.js Server Action. It runs `analyzeDeck` (local synergy engine) first, then sends results to Claude for enhanced insights. The Anthropic API key must be available as `ANTHROPIC_API_KEY` in the environment.
