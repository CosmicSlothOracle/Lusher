/**
 * CardEffects.ts
 * Handles the processing and resolution of card effects for the Political Card Game
 */

import { Card, GameState, Player, GameEffect } from '../types/gameTypes';

/**
 * CardEffects class provides methods to process and apply card effects
 */
class CardEffects {
    /**
     * Process effects for the cards played in the current round
     * @param gameState Current game state
     * @returns Updated game state with effects applied
     */
    static processEffects(gameState: GameState): GameState {
        // Copy the game state to avoid mutations
        let updatedGameState = { ...gameState };

        // Get all revealed center cards
        const revealedCards = gameState.centerCards
            .filter(cc => cc.revealed && cc.card)
            .map(cc => ({
                card: cc.card!,
                playerId: cc.playerId,
                position: cc.position
            }));

        // Sort cards by effect priority
        // 1. Politicians process first (influence-based)
        // 2. Events process second (global effects)
        // 3. Special cards process last (targeted effects)
        const sortedCards = revealedCards.sort((a, b) => {
            // Sort by type first
            const typeOrder: Record<string, number> = {
                'politician': 1,
                'event': 2,
                'special': 3
            };

            const aOrder = typeOrder[a.card.type] || 99;
            const bOrder = typeOrder[b.card.type] || 99;

            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            // Then by position (order played)
            return a.position - b.position;
        });

        // Process each card's effect
        for (const { card, playerId } of sortedCards) {
            updatedGameState = this.applyCardEffect(updatedGameState, card, playerId);
        }

        return updatedGameState;
    }

    /**
     * Apply a single card's effect to the game state
     * @param gameState Current game state
     * @param card Card to apply effect from
     * @param playerId ID of the player who played the card
     * @returns Updated game state
     */
    static applyCardEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Skip cards without effects
        if (!card.effect) {
            return gameState;
        }

        // Find the player
        const player = gameState.players.find(p => p.userId === playerId);
        if (!player) {
            console.error(`Player ${ playerId } not found for card effect`);
            return gameState;
        }

        // Create a log entry for the effect
        const logEntry = {
            text: `${ player.username }'s ${ card.name } effect: ${ card.effect }`,
            timestamp: new Date().toISOString(),
            type: 'system' as const,
            playerId: player.userId,
            cardId: card.id,
            round: gameState.round
        };

        // Apply effect based on card type and content
        // In a real implementation, this would parse the effect text or use an effect registry
        // For now, we'll use a switch case based on card name as a demonstration

        // Copy game state to avoid mutations
        let updatedGameState = {
            ...gameState,
            log: [...gameState.log, logEntry]
        };

        // Apply effect based on card type
        switch (card.type) {
            case 'politician':
                updatedGameState = this.applyPoliticianEffect(updatedGameState, card, playerId);
                break;

            case 'event':
                updatedGameState = this.applyEventEffect(updatedGameState, card, playerId);
                break;

            case 'special':
                updatedGameState = this.applySpecialEffect(updatedGameState, card, playerId);
                break;
        }

        return updatedGameState;
    }

    /**
     * Apply effects specific to Politician cards
     */
    private static applyPoliticianEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Example implementation for a few specific politician cards
        switch (card.name) {
            case 'Angela Merkel':
                // Example: Blocks event cards this round
                return {
                    ...gameState,
                    temporaryEffects: [
                        ...gameState.temporaryEffects,
                        {
                            id: `effect-${ Date.now() }`,
                            type: 'block-events',
                            sourceCardId: card.id,
                            sourcePlayerId: playerId,
                            duration: 1, // This round only
                            startRound: gameState.round,
                            description: 'Event cards are blocked this round'
                        }
                    ]
                };

            case 'Donald Trump':
                // Example: Reduce influence of other politicians by 2
                const updatedPlayers = gameState.players.map(player => {
                    // Skip the player who played this card
                    if (player.userId === playerId) {
                        return player;
                    }

                    // If the player played a politician, reduce its influence
                    if (player.playedCard?.type === 'politician') {
                        return {
                            ...player,
                            influenceModifier: player.influenceModifier - 2
                        };
                    }

                    return player;
                });

                return {
                    ...gameState,
                    players: updatedPlayers
                };

            case 'Annalena Baerbock':
                // Example: +2 influence if momentum >= 2
                if (gameState.momentumLevel >= 2) {
                    const updatedPlayers = gameState.players.map(player => {
                        if (player.userId === playerId) {
                            return {
                                ...player,
                                influenceModifier: player.influenceModifier + 2
                            };
                        }
                        return player;
                    });

                    return {
                        ...gameState,
                        players: updatedPlayers
                    };
                }
                break;

            case 'Selenskyj':
                // Example: +3 influence if momentum >= 4
                if (gameState.momentumLevel >= 4) {
                    const updatedPlayers = gameState.players.map(player => {
                        if (player.userId === playerId) {
                            return {
                                ...player,
                                influenceModifier: player.influenceModifier + 3
                            };
                        }
                        return player;
                    });

                    return {
                        ...gameState,
                        players: updatedPlayers
                    };
                }
                break;

            case 'Putin':
                // Example: All other players get -1 influence
                const putinUpdatedPlayers = gameState.players.map(player => {
                    if (player.userId !== playerId) {
                        return {
                            ...player,
                            influenceModifier: player.influenceModifier - 1
                        };
                    }
                    return player;
                });

                return {
                    ...gameState,
                    players: putinUpdatedPlayers
                };
        }

        // Default: no special effect
        return gameState;
    }

    /**
     * Apply effects specific to Event cards
     */
    private static applyEventEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Check if events are blocked
        const eventsBlocked = gameState.temporaryEffects.some(
            effect => effect.type === 'block-events' &&
                effect.startRound === gameState.round
        );

        if (eventsBlocked) {
            // Add a log entry about the blocked event
            const blockLogEntry = {
                text: `${ card.name } event was blocked.`,
                timestamp: new Date().toISOString(),
                type: 'system' as const,
                cardId: card.id,
                round: gameState.round
            };

            return {
                ...gameState,
                log: [...gameState.log, blockLogEntry]
            };
        }

        // Example implementation for a few specific event cards
        switch (card.name) {
            case 'Lobbyismus':
                // Example: Player draws 1 extra card
                // Note: In a real implementation, this would modify the deck and hand
                const lobbyLogEntry = {
                    text: `${ gameState.players.find(p => p.userId === playerId)?.username } will draw 1 extra card at the end of the round.`,
                    timestamp: new Date().toISOString(),
                    type: 'system' as const,
                    playerId,
                    cardId: card.id,
                    round: gameState.round
                };

                return {
                    ...gameState,
                    log: [...gameState.log, lobbyLogEntry],
                    temporaryEffects: [
                        ...gameState.temporaryEffects,
                        {
                            id: `effect-${ Date.now() }`,
                            type: 'extra-draw',
                            sourceCardId: card.id,
                            sourcePlayerId: playerId,
                            duration: 1,
                            startRound: gameState.round,
                            value: 1, // 1 extra card
                            description: 'Draw 1 extra card at end of round'
                        }
                    ]
                };

            case 'UN Resolution':
                // Example: Set momentum to 3 (neutral)
                const resolutionLogEntry = {
                    text: 'UN Resolution resets momentum to neutral (level 3).',
                    timestamp: new Date().toISOString(),
                    type: 'system' as const,
                    playerId,
                    cardId: card.id,
                    round: gameState.round
                };

                return {
                    ...gameState,
                    momentumLevel: 3,
                    log: [...gameState.log, resolutionLogEntry]
                };
        }

        // Default: no special effect
        return gameState;
    }

    /**
     * Apply effects specific to Special cards
     */
    private static applySpecialEffect(gameState: GameState, card: Card, playerId: string): GameState {
        // Example implementation for a few specific special cards
        switch (card.name) {
            case 'Shitstorm':
                // Example: Choose one player, they get -2 influence
                // For this example, we'll target a random opponent
                const opponents = gameState.players.filter(p => p.userId !== playerId);

                if (opponents.length > 0) {
                    // Choose the first opponent for simplicity
                    const targetPlayer = opponents[0];

                    const shitstormLogEntry = {
                        text: `Shitstorm targets ${ targetPlayer.username }, reducing their influence by 2.`,
                        timestamp: new Date().toISOString(),
                        type: 'system' as const,
                        playerId,
                        cardId: card.id,
                        round: gameState.round
                    };

                    const updatedPlayers = gameState.players.map(player => {
                        if (player.userId === targetPlayer.userId) {
                            return {
                                ...player,
                                influenceModifier: player.influenceModifier - 2
                            };
                        }
                        return player;
                    });

                    return {
                        ...gameState,
                        players: updatedPlayers,
                        log: [...gameState.log, shitstormLogEntry]
                    };
                }
                break;

            case 'Media Blackout':
                // Example: Block next special card
                const blackoutLogEntry = {
                    text: 'Media Blackout prevents the next special card from being played.',
                    timestamp: new Date().toISOString(),
                    type: 'system' as const,
                    playerId,
                    cardId: card.id,
                    round: gameState.round
                };

                return {
                    ...gameState,
                    log: [...gameState.log, blackoutLogEntry],
                    temporaryEffects: [
                        ...gameState.temporaryEffects,
                        {
                            id: `effect-${ Date.now() }`,
                            type: 'block-next-special',
                            sourceCardId: card.id,
                            sourcePlayerId: playerId,
                            duration: 1,
                            startRound: gameState.round,
                            description: 'Block the next special card played'
                        }
                    ]
                };
        }

        // Default: no special effect
        return gameState;
    }

    /**
     * Resolve dice roll for a card effect
     * @param gameState Current game state
     * @param playerId Player rolling the dice
     * @param cardId Card that triggered the dice roll
     * @returns Dice roll result (1-6)
     */
    static rollDice(gameState: GameState, playerId: string, cardId: string): number {
        // Generate random dice roll (1-6)
        const rollResult = Math.floor(Math.random() * 6) + 1;

        // In a real implementation, you would update the game state
        // with the dice roll result here

        return rollResult;
    }
}

export default CardEffects;