// Card Types
export type CardType = 'politician' | 'event' | 'special';
export type CardRarity = 'common' | 'rare' | 'legendary';

export interface Card {
    id: string;
    name: string;
    type: CardType;
    country?: string; // Country association (cosmetic)
    influence: number; // Numeric influence value
    effect: string; // Description of the card's effect
    campaignValue: number; // Cost in € for deck building budget
    era?: string; // Optional era designation (cosmetic)
    description?: string; // Flavor text
    imagePath?: string; // Path to card image
    rarity?: CardRarity;
    tags?: string[]; // Additional metadata tags
}

// Player Types
export interface Player {
    id: string; // Changed from userId to id for consistency
    name: string; // Changed from username to name for consistency
    deckId: string;
    hand: string[]; // Changed to array of card IDs instead of Card objects
    played: string[]; // Array of card IDs that have been played
    influence: number;
    isReady: boolean;
    isConnected: boolean;
    coalition: string | null; // userId of coalition partner
    lastRoll: number | null;
    deck: Deck; // Player's deck
    mandates: number; // Number of mandates the player has accumulated
    isSkippingRound: boolean; // Whether player is skipping the current round
    playedCard: Card | null; // The character card played this round
    specialCard: Card | null; // The special/bonus card played this round
    specialCardOpen: boolean; // Whether the special card was played face up
    skippedSpecialPhase: boolean; // Whether player skipped playing a special card
    wonLastRound: boolean; // Whether the player won the last round

    // Card effect properties
    influenceModifier: number; // Temporary modifier to influence
    protectedMandates: boolean; // Whether player's mandates are protected this round
    canPlaySpecial: boolean; // Whether player can play special cards
    discardNext: boolean; // Whether player must discard next drawn card
}

// Game Types
export type GameStatus = 'lobby' | 'starting' | 'active' | 'completed';
export type GamePhase = 'momentum' | 'coalition' | 'character' | 'special' | 'resolution' | 'backfire' | 'setup' | 'play' | 'effect' | 'final' | 'finished';

export interface GameState {
    gameId: string;
    name: string;
    status: GameStatus;
    phase: GamePhase;
    players: Player[];
    currentTurn: number;
    round: number;
    maxRounds: number;
    mandateThreshold: number; // Influence needed to win
    activePlayerId: string | null;
    log: GameLogEntry[];
    winner?: string; // ID of winning player if game is finished
    momentumLevel: number; // Current momentum level (1-6)
}

// Deck Types
export interface Deck {
    id?: string;
    name: string;
    cards: Card[];
    drawPile: string[]; // Array of card IDs in the draw pile
    discardPile: string[]; // Array of card IDs in the discard pile
    userId?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    totalCampaignValue?: number; // Total campaign budget used (max €250,000)
    isValid?: boolean; // Whether deck meets all requirements
}

export interface GameLogEntry {
    timestamp: number;
    message: string;
    type?: 'info' | 'action' | 'system' | 'error';
    playerId?: string;
    cardId?: string;
}

// Game Action Types
export enum ActionType {
    PLAY_CARD = 'PLAY_CARD',
    DRAW_CARD = 'DRAW_CARD',
    END_TURN = 'END_TURN',
    CHAT = 'CHAT',
    JOIN_GAME = 'JOIN_GAME',
    LEAVE_GAME = 'LEAVE_GAME',
    CREATE_GAME = 'CREATE_GAME',
    START_GAME = 'START_GAME',
    SKIP_ROUND = 'SKIP_ROUND',
    PROPOSE_COALITION = 'PROPOSE_COALITION',
    ACCEPT_COALITION = 'ACCEPT_COALITION',
    DECLINE_COALITION = 'DECLINE_COALITION',
    ROLL_MOMENTUM = 'ROLL_MOMENTUM'
}

export interface GameAction {
    type: ActionType;
    playerId: string;
    cardId: string;
    timestamp: number;
    message: string;
    targetPlayerId?: string; // Used for coalition actions
}

// Dice roll result
export interface DiceRoll {
    playerId: string;
    value: number;
    purpose: 'momentum' | 'effect' | 'backfire'; // What the roll is for
    timestamp: number;
}

// Interface for temporary game effects
export interface GameEffect {
    id: string;
    type: string;
    sourceCardId: string;
    sourcePlayerId: string;
    targetPlayerId?: string;
    duration: number; // How many rounds/phases the effect lasts
    startRound: number;
    value?: number; // Optional numeric value for the effect
    description: string;
}

export interface CenterCard {
    playerId: string;
    card: Card | null; // null if not revealed yet
    revealed: boolean;
    position: number; // Position in play order
}

export interface Coalition {
    player1Id: string;
    player2Id: string;
    roundFormed: number;
    active: boolean;
    stability: number; // Coalition stability score
}

// Statistics for deck analysis
export interface DeckStats {
    totalCards: number;
    totalCampaignValue: number;
    averageInfluence: number;
    typeDistribution: {
        [key: string]: number;
    };
    countryDistribution: {
        [key: string]: number;
    };
    budgetRemaining: number; // Based on €250,000 max
    isValid: boolean;
}

/**
 * Game settings for configuring AI and gameplay options
 */
export interface GameSettings {
    // AI settings
    enableAI: boolean;
    aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    aiPlayerCount: number;

    // Game rules
    mandateThreshold: number; // Default: 12 (MANDAT MACHT MOMENTUM rules)
    alternateWinThreshold: number; // Default: 40 influence for alternate win condition
    maxRounds: number;
    turnTimeLimit?: number; // Optional time limit for turns in seconds
    minPlayers: number; // Minimum number of players (3 for MANDAT MACHT MOMENTUM)

    // Special rules
    allowCoalitions: boolean;
    shufflePlayerOrder: boolean;
    dealInitialCards: number; // Number of cards to deal at start (6 for MANDAT MACHT MOMENTUM)

    // Deck building rules
    deckSize: number; // Total cards in deck (20 for MANDAT MACHT MOMENTUM)
    requiredCharacterCards: number; // Required character cards in deck (10 for MANDAT MACHT MOMENTUM)
    requiredSpecialCards: number; // Required special cards in deck (5 for MANDAT MACHT MOMENTUM)
    requiredBonusCards: number; // Required bonus cards in deck (5 for MANDAT MACHT MOMENTUM)

    // Momentum rules
    initialMomentumLevel: number; // Starting momentum level (1 for first round in MANDAT MACHT MOMENTUM)
    useMomentumRules: boolean; // Whether to use momentum mechanics
}

/**
 * Default game settings based on MANDAT MACHT MOMENTUM rules
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
    enableAI: false,
    aiDifficulty: 'MEDIUM',
    aiPlayerCount: 0,

    mandateThreshold: 12, // Win condition: 12 mandates
    alternateWinThreshold: 40, // Alternate win: 40+ influence
    maxRounds: 20,
    turnTimeLimit: undefined,
    minPlayers: 3,

    allowCoalitions: true,
    shufflePlayerOrder: true,
    dealInitialCards: 6,

    deckSize: 20,
    requiredCharacterCards: 10,
    requiredSpecialCards: 5,
    requiredBonusCards: 5,

    initialMomentumLevel: 1,
    useMomentumRules: true
};