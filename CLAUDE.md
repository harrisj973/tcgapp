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
| `src/lib/opcg-cards.ts` | **~34k-line** array `ONEPIECE_CARDS: Card[]` — One Piece card database (~2,313 cards) |
| `src/lib/gundam-cards.ts` | **~7.6k-line** array `GUNDAM_CARDS: Card[]` — Gundam Card Game database (487 cards) |
| `src/lib/pokemon-cards.ts` | **~29k-line** array `POKEMON_CARDS: Card[]` — Pokémon TCG standard-legal cards (2,079 cards) |
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

### Card databases

Three games have full real card databases in dedicated files; the rest (Yu-Gi-Oh, Digimon, MTG, DBS, Union Arena) have small representative stubs inline in `card-database.ts`.

#### One Piece (`opcg-cards.ts`)

Data source: [punk-records](https://github.com/buhbbl/punk-records) — `english/data/{packId}.json`. Pack IDs: OP01=569101…OP15=569115; ST01=569001…ST29=569029; EB01=569201…EB03=569203. Currently **OP01–OP15 + ST01–ST29 + EB01–EB03 (~2,313 cards)**.

**Card ID format:** `"op-{setCode}_{num}"` e.g. `"op-op08_042"` (lowercase, underscore, 3-digit zero-padded).

**Card shape rules:**
- Leaders: `life: 5` (mono-color) or `life: 4` (dual-color); no `cost` field
- Omit `power` entirely for Events, Stages, and Characters with no printed power stat
- `rarity`: `"Common"` | `"Uncommon"` | `"Rare"` | `"Super Rare"` | `"Secret Rare"` | `"Leader"`
- Skip `TreasureRare` cards (alternate art) and reprints from other sets
- No `trigger` field on `Card` type — merge trigger text into `description` (append `" [Trigger] ..."`)

**Ban list** applied in `card-database.ts` via `OPCG_BANNED_IDS`. Currently banned: `op-op03_040`, `op-op06_116`, `op-op06_086`, `op-op06_047`, `op-st10_001`.

#### Gundam Card Game (`gundam-cards.ts`)

Data source: [apitcg/gundam-tcg-data](https://github.com/apitcg/gundam-tcg-data) — `cards/en/{set}.json`. Currently **GD01, GD02, ST01–ST06 (487 cards)**.

**Card ID format:** `"gundam-{setCode}_{num}"` e.g. `"gundam-gd01_001"`.

**Card types:** `UNIT`, `PILOT`, `COMMAND`, `BASE` only — skip `UNIT TOKEN`, `RESOURCE`, `EX BASE`, `EX RESOURCE`. Deck size: 50 cards. Colors: Blue, Green, Red, White, Purple.

#### Pokémon TCG (`pokemon-cards.ts`)

Data source: [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data) — `cards/en/{setId}.json`. Currently **H-on standard rotation: TEF, TWM, SFA, SCR, SSP, PRE, JTG, DRI, BLK, WHF, MEV, PFL, ASH, POR, CHA (2,079 cards)**.

**Card ID format:** `"poke-{setId}_{num}"` e.g. `"poke-sv5_001"`.

**Filtering rules:** Only cards with `legalities.standard === "Legal"`. Exclude alt-art duplicates: `Illustration Rare`, `Special Illustration Rare`, `Hyper Rare`, `Mega Hyper Rare`. Set IDs follow `sv5`…`sv10`, `zsv10pt5` (Black Bolt), `rsv10pt5` (White Flare), `me1`…`me4` (Mega Evolution era).

### State management

Zustand store (`useDeckStore`) is persisted via `localStorage`. It holds the full deck list, the active deck ID, and the selected game. The `addCard` action enforces a max of 4 copies per card for Pokémon/MTG and 3 for all other games. One Piece decks use a `leader` field on `Deck` (separate from `cards`).

### AI analysis

`getAIAnalysis` in `ai-analysis.ts` is a Next.js Server Action. It runs `analyzeDeck` (local synergy engine) first, then sends results to Claude for enhanced insights. The Anthropic API key must be available as `ANTHROPIC_API_KEY` in the environment.
