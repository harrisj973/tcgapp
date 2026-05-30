"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Deck, DeckCard, Card, TCGGame } from "@/types";

interface DeckStore {
  decks: Deck[];
  activeDeckId: string | null;
  selectedGame: TCGGame;
  createDeck: (name: string, game: TCGGame, leader?: Card) => Deck;
  deleteDeck: (id: string) => void;
  setActiveDeck: (id: string) => void;
  setSelectedGame: (game: TCGGame) => void;
  addCard: (deckId: string, card: Card, zone?: "main" | "extra" | "side") => void;
  removeCard: (deckId: string, cardId: string, zone?: "main" | "extra" | "side") => void;
  updateCardQuantity: (deckId: string, cardId: string, quantity: number, zone?: "main" | "extra" | "side") => void;
  renameDeck: (id: string, name: string) => void;
  setDeckCards: (id: string, cards: DeckCard[]) => void;
  setDeckMeta: (id: string, meta: { folder?: string; colorTag?: string }) => void;
  getActiveDeck: () => Deck | undefined;
  getDeckCardCount: (deck: Deck) => number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: null,
      selectedGame: "onepiece",

      createDeck: (name, game, leader) => {
        const deck: Deck = {
          id: generateId(),
          name,
          game,
          cards: [],
          extraDeck: [],
          sideDeck: [],
          leader,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          decks: [...state.decks, deck],
          activeDeckId: deck.id,
        }));
        return deck;
      },

      deleteDeck: (id) =>
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== id),
          activeDeckId: state.activeDeckId === id ? null : state.activeDeckId,
        })),

      setActiveDeck: (id) => set({ activeDeckId: id }),

      setSelectedGame: (game) => set({ selectedGame: game }),

      addCard: (deckId, card, zone = "main") => {
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id !== deckId) return deck;
            // For Yu-Gi-Oh, respect banlist flags on the card itself
            const maxCopies =
              deck.game === "yugioh"
                ? card.banned ? 0 : card.limited ? 1 : card.semiLimited ? 2 : 3
                : deck.game === "pokemon" || deck.game === "mtg" || deck.game === "lorcana" || deck.game === "digimon" || deck.game === "unionarena" ? 4 : 3;

            // Forbidden cards cannot be added at all
            if (maxCopies === 0) return deck;

            const targetCards =
              zone === "extra"
                ? deck.extraDeck || []
                : zone === "side"
                ? deck.sideDeck || []
                : deck.cards;

            const existing = targetCards.find((dc) => dc.card.id === card.id);
            let updatedCards: DeckCard[];

            if (existing) {
              updatedCards = targetCards.map((dc) =>
                dc.card.id === card.id
                  ? { ...dc, quantity: Math.min(dc.quantity + 1, maxCopies) }
                  : dc
              );
            } else {
              updatedCards = [...targetCards, { card, quantity: 1 }];
            }

            return {
              ...deck,
              ...(zone === "extra"
                ? { extraDeck: updatedCards }
                : zone === "side"
                ? { sideDeck: updatedCards }
                : { cards: updatedCards }),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeCard: (deckId, cardId, zone = "main") => {
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id !== deckId) return deck;
            const targetCards =
              zone === "extra"
                ? deck.extraDeck || []
                : zone === "side"
                ? deck.sideDeck || []
                : deck.cards;

            const updated = targetCards
              .map((dc) =>
                dc.card.id === cardId
                  ? { ...dc, quantity: dc.quantity - 1 }
                  : dc
              )
              .filter((dc) => dc.quantity > 0);

            return {
              ...deck,
              ...(zone === "extra"
                ? { extraDeck: updated }
                : zone === "side"
                ? { sideDeck: updated }
                : { cards: updated }),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      updateCardQuantity: (deckId, cardId, quantity, zone = "main") => {
        set((state) => ({
          decks: state.decks.map((deck) => {
            if (deck.id !== deckId) return deck;
            const targetCards =
              zone === "extra"
                ? deck.extraDeck || []
                : zone === "side"
                ? deck.sideDeck || []
                : deck.cards;

            const updated =
              quantity <= 0
                ? targetCards.filter((dc) => dc.card.id !== cardId)
                : targetCards.map((dc) =>
                    dc.card.id === cardId ? { ...dc, quantity } : dc
                  );

            return {
              ...deck,
              ...(zone === "extra"
                ? { extraDeck: updated }
                : zone === "side"
                ? { sideDeck: updated }
                : { cards: updated }),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      renameDeck: (id, name) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, name, updatedAt: new Date() } : d
          ),
        })),

      setDeckCards: (id, cards) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, cards, updatedAt: new Date() } : d
          ),
        })),

      setDeckMeta: (id, meta) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, ...meta, updatedAt: new Date() } : d
          ),
        })),

      getActiveDeck: () => {
        const state = get();
        return state.decks.find((d) => d.id === state.activeDeckId);
      },

      getDeckCardCount: (deck) => {
        return deck.cards.reduce((sum, dc) => sum + dc.quantity, 0);
      },
    }),
    {
      name: "tcg-deck-builder",
      partialize: (state) => ({
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        selectedGame: state.selectedGame,
      }),
    }
  )
);
