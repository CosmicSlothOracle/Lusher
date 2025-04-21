/**
 * DeckManager.ts
 * Provides functions for deck management, card drawing and shuffling
 */

import { Card, Deck } from '../types/gameTypes';

export class DeckManager {
    /**
     * Creates a new shuffled deck from a list of cards
     */
    static createDeck(cards: Card[]): Deck {
        const shuffled = [...cards].sort(() => 0.5 - Math.random());

        return {
            id: `deck-${ Date.now() }`,
            name: "New Deck",
            cards: shuffled,
            drawPile: shuffled.map(card => card.id),
            discardPile: []
        };
    }

    /**
     * Shuffles a deck's draw pile
     */
    static shuffleDeck(deck: Deck): Deck {
        const shuffled = [...deck.drawPile].sort(() => 0.5 - Math.random());

        return {
            ...deck,
            drawPile: shuffled
        };
    }

    /**
     * Reshuffles the discard pile into the draw pile
     */
    static reshuffleDiscardPile(deck: Deck): Deck {
        const allCards = [...deck.drawPile, ...deck.discardPile];
        const shuffled = allCards.sort(() => 0.5 - Math.random());

        return {
            ...deck,
            drawPile: shuffled,
            discardPile: []
        };
    }

    /**
     * Draws a specified number of cards from the deck
     * Returns the drawn card IDs and the updated deck
     */
    static drawCards(deck: Deck, count: number): { drawnCardIds: string[], updatedDeck: Deck } {
        let currentDeck = { ...deck };
        const drawnCardIds: string[] = [];

        for (let i = 0; i < count; i++) {
            // If draw pile is empty, reshuffle discard pile
            if (currentDeck.drawPile.length === 0) {
                if (currentDeck.discardPile.length === 0) {
                    // No more cards available
                    break;
                }
                currentDeck = this.reshuffleDiscardPile(currentDeck);
            }

            // Draw from the top of the deck
            const drawnCardId = currentDeck.drawPile[0];
            drawnCardIds.push(drawnCardId);

            // Update the deck
            currentDeck = {
                ...currentDeck,
                drawPile: currentDeck.drawPile.slice(1)
            };
        }

        return { drawnCardIds, updatedDeck: currentDeck };
    }

    /**
     * Discards specified cards from a player's hand
     */
    static discardCards(deck: Deck, cardIds: string[]): Deck {
        return {
            ...deck,
            discardPile: [...deck.discardPile, ...cardIds]
        };
    }

    /**
     * Looks at the top X cards of a deck without drawing them
     */
    static peekTopCards(deck: Deck, count: number): { cards: string[], remainingDeck: Deck } {
        if (deck.drawPile.length === 0) {
            if (deck.discardPile.length === 0) {
                return { cards: [], remainingDeck: deck };
            }
            deck = this.reshuffleDiscardPile(deck);
        }

        const actualCount = Math.min(count, deck.drawPile.length);
        const topCards = deck.drawPile.slice(0, actualCount);

        return {
            cards: topCards,
            remainingDeck: deck
        };
    }

    /**
     * Puts specific cards back on top of the deck in a specified order
     */
    static putCardsOnTop(deck: Deck, cardIds: string[]): Deck {
        return {
            ...deck,
            drawPile: [...cardIds, ...deck.drawPile]
        };
    }

    /**
     * Gets a card by ID from the deck's card pool
     */
    static getCardById(deck: Deck, cardId: string): Card | undefined {
        return deck.cards.find(card => card.id === cardId);
    }

    /**
     * Calculate total campaign value of a deck
     */
    static calculateDeckValue(deck: Deck): number {
        return deck.cards.reduce((sum, card) => sum + (card.campaignValue || 0), 0);
    }

    /**
     * Validates a deck against the game rules
     * - Must have exactly 20 cards
     * - Total campaign value must not exceed €250,000
     */
    static validateDeck(deck: Deck): { valid: boolean, errors: string[] } {
        const errors: string[] = [];

        if (deck.cards.length !== 20) {
            errors.push(`Deck must contain exactly 20 cards. Current count: ${ deck.cards.length }`);
        }

        const totalValue = this.calculateDeckValue(deck);
        if (totalValue > 250000) {
            errors.push(`Deck exceeds the campaign budget of €250,000. Current value: €${ totalValue }`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}