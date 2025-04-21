export type CardType = 'ally' | 'action' | 'plot' | 'Politician' | 'Event' | 'Special';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Card {
    id: number;
    name: string;
    type: CardType;
    influence: number | null;
    description: string;
    rarity?: CardRarity;
    ability?: string;
    imagePath: string;
    tags?: string[];
    country?: string;
    campaignValue?: number;
    effect?: string;
    era?: string;
}