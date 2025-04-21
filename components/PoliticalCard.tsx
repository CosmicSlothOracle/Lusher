import React from 'react';
import styled from 'styled-components';
import { Card } from '../interfaces/Card';
import { FaCheckCircle, FaPlusCircle } from 'react-icons/fa';

interface PoliticalCardProps {
  card: Card;
  isInDeck?: boolean;
  onClick?: (card: Card) => void;
  disabled?: boolean;
}

const getCardTypeColor = (type: string | undefined): string => {
  if (!type) return '#6c757d'; // Default gray

  const normalizedType = type.toLowerCase();
  if (normalizedType === 'ally' || normalizedType === 'politician') {
    return '#3498db'; // Blue for allies/politicians
  } else if (normalizedType === 'action' || normalizedType === 'event') {
    return '#2ecc71'; // Green for actions/events
  } else if (normalizedType === 'plot' || normalizedType === 'special') {
    return '#e74c3c'; // Red for plots/special
  }
  return '#6c757d'; // Default gray
};

const getRarityColor = (rarity: string | undefined): string => {
  if (!rarity) return '#adb5bd'; // Default gray

  const normalizedRarity = rarity.toLowerCase();
  if (normalizedRarity === 'common') {
    return '#95a5a6'; // Gray
  } else if (normalizedRarity === 'uncommon') {
    return '#3498db'; // Blue
  } else if (normalizedRarity === 'rare') {
    return '#9b59b6'; // Purple
  } else if (normalizedRarity === 'legendary') {
    return '#f1c40f'; // Gold
  }
  return '#adb5bd'; // Default gray
};

const CardContainer = styled.div<{ typeColor: string; isInDeck?: boolean; disabled?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid ${ props => props.typeColor };
  cursor: ${ props => (props.disabled ? 'not-allowed' : 'pointer') };
  opacity: ${ props => (props.disabled ? 0.7 : 1) };
  transform: ${ props => (props.isInDeck ? 'scale(0.98)' : 'scale(1)') };

  &:hover {
    transform: ${ props => (props.disabled ? 'scale(1)' : props.isInDeck ? 'scale(0.99)' : 'scale(1.02)') };
    box-shadow: ${ props => (props.disabled ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' : '0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)') };
  }
`;

const CardHeader = styled.div<{ typeColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: ${ props => props.typeColor };
  color: white;
`;

const CardName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardInfluence = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: white;
  color: #2c3e50;
  font-weight: 700;
  margin-left: 8px;
`;

const CardImage = styled.div<{ imagePath?: string }>`
  height: 120px;
  background-image: url(${ props => props.imagePath || '/images/card-placeholder.jpg' });
  background-size: cover;
  background-position: center;
  background-color: #f8f9fa;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  flex: 1;
`;

const CardDescription = styled.div`
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 12px;
  flex: 1;
  overflow-y: auto;
  max-height: 80px;

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f8fafc;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 3px;
  }
`;

const CardAbility = styled.div`
  font-size: 13px;
  font-style: italic;
  color: #6c757d;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const CardType = styled.div<{ typeColor: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${ props => props.typeColor };
  text-transform: capitalize;
`;

const CardRarity = styled.div<{ rarityColor: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${ props => props.rarityColor };
  text-transform: capitalize;
`;

const DeckStatus = styled.div<{ isInDeck?: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${ props => (props.isInDeck ? '#2ecc71' : '#3498db') };
  color: white;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const PoliticalCard: React.FC<PoliticalCardProps> = ({
  card,
  isInDeck = false,
  onClick,
  disabled = false,
}) => {
  // Safety checks for undefined card
  if (!card) {
    console.error('Undefined card passed to PoliticalCard component');
    return null;
  }

  // Normalize card types to handle both naming conventions
  const normalizeType = (type: string | undefined): string => {
    if (!type) return 'Unknown';

    const normalizedType = type.toLowerCase();
    if (normalizedType === 'politician') return 'ally';
    if (normalizedType === 'event') return 'action';
    if (normalizedType === 'special') return 'plot';
    return normalizedType;
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(card);
    }
  };

  const typeColor = getCardTypeColor(card.type);
  const rarityColor = getRarityColor(card.rarity);
  const displayType = normalizeType(card.type);

  return (
    <CardContainer
      typeColor={typeColor}
      isInDeck={isInDeck}
      disabled={disabled}
      onClick={handleClick}
      data-testid={`political-card-${ card.id || 'unknown' }`}
    >
      {(isInDeck !== undefined) && (
        <DeckStatus isInDeck={isInDeck}>
          {isInDeck ? <FaCheckCircle size={16} /> : <FaPlusCircle size={16} />}
        </DeckStatus>
      )}

      <CardHeader typeColor={typeColor}>
        <CardName>{card.name || 'Unnamed Card'}</CardName>
        <CardInfluence>{card.influence || 0}</CardInfluence>
      </CardHeader>

      <CardImage imagePath={card.imagePath} />

      <CardContent>
        <CardDescription>
          {card.description || 'No description available.'}
        </CardDescription>
        {card.ability && (
          <CardAbility>
            <strong>Ability:</strong> {card.ability}
          </CardAbility>
        )}
      </CardContent>

      <CardFooter>
        <CardType typeColor={typeColor}>
          {displayType}
        </CardType>
        <CardRarity rarityColor={rarityColor}>
          {card.rarity || 'Unknown'}
        </CardRarity>
      </CardFooter>
    </CardContainer>
  );
};

export default PoliticalCard;