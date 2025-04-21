/**
 * gameService.ts
 * Service for managing game state and interactions using the socket connection
 */

import socketService from './socketService';
import { GameState, Card, Player, GameAction, GameActionType } from '../types/gameTypes';

class GameService {
    private currentGame: GameState | null = null;
    private gameStateListeners: ((gameState: GameState) => void)[] = [];

    /**
     * Initialize the game service and set up event listeners
     */
    init() {
        // Listen for game updates from the server
        socketService.on('game-updated', this.handleGameUpdated.bind(this));
        return this;
    }

    /**
     * Handle updates to the game state
     */
    private handleGameUpdated(gameState: GameState) {
        console.log('[GameService] Game updated', gameState);
        this.currentGame = gameState;
        this.notifyListeners();
    }

    /**
     * Notify all listeners about the game state change
     */
    private notifyListeners() {
        if (!this.currentGame) return;

        this.gameStateListeners.forEach(listener => {
            listener(this.currentGame!);
        });
    }

    /**
     * Register a listener for game state changes
     */
    onGameStateChanged(callback: (gameState: GameState) => void) {
        this.gameStateListeners.push(callback);

        // If we already have a game state, call the callback immediately
        if (this.currentGame) {
            callback(this.currentGame);
        }

        // Return an unsubscribe function
        return () => {
            this.gameStateListeners = this.gameStateListeners.filter(
                listener => listener !== callback
            );
        };
    }

    /**
     * Create a new game
     */
    createGame(options: {
        name: string;
        maxPlayers: number;
        maxRounds: number;
        deckId: string;
    }): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('create-game-response', (response: { success: boolean; game?: GameState; error?: string }) => {
                socketService.off('create-game-response');

                if (response.success && response.game) {
                    this.currentGame = response.game;
                    socketService.joinGame(response.game.gameId);
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to create game'));
                }
            });

            socketService.emit('create-game', options);
        });
    }

    /**
     * Join an existing game
     */
    joinGame(gameId: string, deckId: string): Promise<GameState> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('join-game-response', (response: { success: boolean; game?: GameState; error?: string }) => {
                socketService.off('join-game-response');

                if (response.success && response.game) {
                    this.currentGame = response.game;
                    socketService.joinGame(gameId);
                    this.notifyListeners();
                    resolve(response.game);
                } else {
                    reject(new Error(response.error || 'Failed to join game'));
                }
            });

            socketService.emit('join-game', { gameId, deckId });
        });
    }

    /**
     * Leave the current game
     */
    leaveGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            const gameId = this.currentGame.gameId;

            socketService.on('leave-game-response', (response: { success: boolean; error?: string }) => {
                socketService.off('leave-game-response');

                if (response.success) {
                    socketService.leaveGame(gameId);
                    this.currentGame = null;
                    this.notifyListeners();
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to leave game'));
                }
            });

            socketService.emit('leave-game', { gameId });
        });
    }

    /**
     * Start the current game (host only)
     */
    startGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            if (!this.isHost()) {
                reject(new Error('Only the host can start the game'));
                return;
            }

            socketService.on('start-game-response', (response: { success: boolean; error?: string }) => {
                socketService.off('start-game-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to start game'));
                }
            });

            socketService.emit('start-game', { gameId: this.currentGame.gameId });
        });
    }

    /**
     * Play a card in the current game
     */
    playCard(cardId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            socketService.on('play-card-response', (response: { success: boolean; error?: string }) => {
                socketService.off('play-card-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to play card'));
                }
            });

            socketService.emit('play-card', {
                gameId: this.currentGame.gameId,
                cardId
            });
        });
    }

    /**
     * Perform a game action
     */
    performAction(actionType: GameActionType, actionPayload: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected() || !this.currentGame) {
                reject(new Error('Socket not connected or no active game'));
                return;
            }

            socketService.on('game-action-response', (response: { success: boolean; error?: string }) => {
                socketService.off('game-action-response');

                if (response.success) {
                    resolve(true);
                } else {
                    reject(new Error(response.error || 'Failed to perform action'));
                }
            });

            const action: GameAction = {
                type: actionType,
                payload: actionPayload,
                gameId: this.currentGame.gameId,
                playerId: '', // Will be set by the server
                timestamp: new Date().toISOString()
            };

            socketService.emit('game-action', action);
        });
    }

    /**
     * Get all available games to join
     */
    getAvailableGames(): Promise<GameState[]> {
        return new Promise((resolve, reject) => {
            if (!socketService.isConnected()) {
                reject(new Error('Socket not connected'));
                return;
            }

            socketService.on('available-games-response', (response: { success: boolean; games?: GameState[]; error?: string }) => {
                socketService.off('available-games-response');

                if (response.success && response.games) {
                    resolve(response.games);
                } else {
                    reject(new Error(response.error || 'Failed to get available games'));
                }
            });

            socketService.emit('get-available-games', {});
        });
    }

    /**
     * Get the current game state
     */
    getCurrentGame(): GameState | null {
        return this.currentGame;
    }

    /**
     * Check if the current player is the host
     */
    isHost(): boolean {
        if (!this.currentGame) return false;

        // We need a user service to get the current user ID
        // For now, assume we have a userId in localStorage
        const userId = localStorage.getItem('userId');
        return userId === this.currentGame.hostId;
    }

    /**
     * Clean up resources before component unmounting
     */
    destroy() {
        socketService.off('game-updated');
        this.gameStateListeners = [];
        this.currentGame = null;
    }
}

// Create a singleton instance
const gameService = new GameService().init();

export default gameService;