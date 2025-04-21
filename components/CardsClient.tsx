'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import MainNavigation from './MainNavigation'
import { Card } from '../interfaces/Card'
import { getAllCards } from '../game/mockCards'
import CardGrid from './CardGrid'

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5;
  padding-top: 100px;
`

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const Header = styled.div`
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`

const CardsGridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`

const CardSection = styled.div`
  margin-bottom: 40px;
`

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ddd;
`

const PageHeader = styled.div`
  margin-bottom: 30px;
`

const Subtitle = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 20px;
`

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
`

const StatCard = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #7f8c8d;
  }

  p {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
  }
`

const DetailView = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  padding: 20px;
  z-index: 100;
  transform: translateX(${ props => props.isOpen ? '0' : '100%' });
  transition: transform 0.3s ease;
  overflow-y: auto;
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #7f8c8d;

  &:hover {
    color: #2c3e50;
  }
`

interface CardStats {
    total: number;
    byType: {
        [key: string]: number;
    };
}

const CardsClient = () => {
    const [cards, setCards] = useState<Card[]>([])
    const [deckCards, setDeckCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCard, setSelectedCard] = useState<Card | null>(null)
    const [showDetailView, setShowDetailView] = useState(false)
    const [cardStats, setCardStats] = useState<CardStats>({
        total: 0,
        byType: {}
    })

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            const allCards = getAllCards()
            setCards(allCards)

            // Calculate stats
            const stats: CardStats = {
                total: allCards.length,
                byType: {}
            }

            allCards.forEach(card => {
                if (stats.byType[card.type]) {
                    stats.byType[card.type]++
                } else {
                    stats.byType[card.type] = 1
                }
            })

            setCardStats(stats)
            setLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    const handleAddCard = (card: Card) => {
        setDeckCards(prev => [...prev, card])
        setSelectedCard(card)
        setShowDetailView(true)
    }

    const handleRemoveCard = (cardId: number) => {
        setDeckCards(prev => prev.filter(card => card.id !== cardId))
        if (selectedCard && selectedCard.id === cardId) {
            setShowDetailView(false)
        }
    }

    return (
        <PageContainer>
            <MainNavigation />
            <ContentContainer>
                <PageHeader>
                    <Title>Political Cards</Title>
                    <Subtitle>Discover the variety of political influences in the game</Subtitle>
                </PageHeader>

                <StatsContainer>
                    <StatCard>
                        <h3>Total</h3>
                        <p>{cardStats.total}</p>
                    </StatCard>
                    {Object.entries(cardStats.byType).map(([type, count]) => (
                        <StatCard key={type}>
                            <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                            <p>{count}</p>
                        </StatCard>
                    ))}
                </StatsContainer>

                <CardGrid
                    cards={cards}
                    deckCards={deckCards}
                    onAddCard={handleAddCard}
                    onRemoveCard={handleRemoveCard}
                    isLoading={loading}
                    maxDeckSize={20}
                />

                <DetailView isOpen={showDetailView}>
                    <CloseButton onClick={() => setShowDetailView(false)}>×</CloseButton>
                    {selectedCard && (
                        <div>
                            <h2>{selectedCard.name}</h2>
                            <p><strong>Type:</strong> {selectedCard.type}</p>
                            <p><strong>Influence:</strong> {selectedCard.influence || 'N/A'}</p>
                            <p><strong>Description:</strong> {selectedCard.description}</p>
                            <p><strong>Rarity:</strong> {selectedCard.rarity}</p>
                            {selectedCard.ability && (
                                <p><strong>Ability:</strong> {selectedCard.ability}</p>
                            )}
                        </div>
                    )}
                </DetailView>
            </ContentContainer>
        </PageContainer>
    )
}

export default CardsClient