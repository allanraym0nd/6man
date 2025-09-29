// src/components/dashboard/AIPredictionCard.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { apiService } from '../../services/api';

const AIPredictionCard = ({ games  = [], onRefresh }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPredictionEligiblePlayers();
  }, []);

  const loadPredictionEligiblePlayers = async () => {
    try {
      const response = await apiService.getPredictionEligiblePlayers();
      setPlayers(response.data.players);
    } catch (err) {
      console.error('Failed to load players:', err);
      setError('Failed to load players');
    }
  };

  const handlePredict = async () => {
    if (!selectedPlayer || !selectedGame) {
      setError('Please select both player and game');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedGameData = games.find(game => game.gameId === selectedGame);
      
      const response = await apiService.createAIPrediction({
        gameId: selectedGame,
        gameDate: selectedGameData?.gameDate || new Date().toISOString(),
        playerId: selectedPlayer,
        aiModel: 'random_forest'
      });

      setCurrentPrediction(response.data.prediction);
      onRefresh(); // Refresh dashboard data
    } catch (err) {
      console.error('Prediction failed:', err);
      setError(err.response?.data?.error || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(26, 31, 58, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '32px',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.2)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 170, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#ffffff',
          margin: 0,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🤖 AI Player Prediction
        </h3>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '16px', 
          margin: 0 
        }}>
          Get AI-powered predictions for tonight's games
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Form Selectors */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 2fr 1fr', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Player Selector */}
        <div>
          <label style={{ 
            display: 'block', 
            color: '#94a3b8', 
            fontSize: '14px', 
            fontWeight: '500',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            PLAYER
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(15, 20, 25, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '500',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Player...</option>
              {players.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {player.fullName} - {player.team?.abbreviation}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8',
                pointerEvents: 'none'
              }} 
            />
          </div>
        </div>

        {/* Game Selector */}
        <div>
          <label style={{ 
            display: 'block', 
            color: '#94a3b8', 
            fontSize: '14px', 
            fontWeight: '500',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            GAME
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(15, 20, 25, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '500',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Game...</option>
              {games.map((game) => (
                <option key={game.gameId} value={game.gameId}>
                  {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation} - {game.gameTime}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={20} 
              style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8',
                pointerEvents: 'none'
              }} 
            />
          </div>
        </div>

        {/* Predict Button */}
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button 
            onClick={handlePredict}
            disabled={loading || !selectedPlayer || !selectedGame}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || !selectedPlayer || !selectedGame) 
                ? 'rgba(100, 116, 139, 0.3)' 
                : 'linear-gradient(135deg, #00d4aa 0%, #0099ff 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || !selectedPlayer || !selectedGame) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: (loading || !selectedPlayer || !selectedGame) ? 0.7 : 1,
              boxShadow: (loading || !selectedPlayer || !selectedGame) 
                ? 'none' 
                : '0 4px 12px rgba(0, 212, 170, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!loading && selectedPlayer && selectedGame) {
                e.target.style.boxShadow = '0 8px 25px rgba(0, 212, 170, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && selectedPlayer && selectedGame) {
                e.target.style.boxShadow = '0 4px 12px rgba(0, 212, 170, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Predicting...' : (
              <>
                Predict <Zap size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      {currentPrediction ? (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Points */}
            <div style={{
              background: 'rgba(15, 20, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ 
                color: '#00d4aa', 
                fontSize: '48px', 
                fontWeight: '700',
                textShadow: '0 4px 8px rgba(0, 212, 170, 0.3)',
                marginBottom: '8px'
              }}>
                {currentPrediction.predictions?.points || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>
                Points
              </div>
            </div>

            {/* Assists */}
            <div style={{
              background: 'rgba(15, 20, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ 
                color: '#00d4aa', 
                fontSize: '48px', 
                fontWeight: '700',
                textShadow: '0 4px 8px rgba(0, 212, 170, 0.3)',
                marginBottom: '8px'
              }}>
                {currentPrediction.predictions?.assists || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>
                Assists
              </div>
            </div>

            {/* Rebounds */}
            <div style={{
              background: 'rgba(15, 20, 25, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ 
                color: '#00d4aa', 
                fontSize: '48px', 
                fontWeight: '700',
                textShadow: '0 4px 8px rgba(0, 212, 170, 0.3)',
                marginBottom: '8px'
              }}>
                {currentPrediction.predictions?.rebounds || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>
                Rebounds
              </div>
            </div>
          </div>

          {/* Confidence Level */}
          <div>
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '16px', 
              textAlign: 'center',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              AI Confidence Level
            </div>
            
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(15, 20, 25, 0.8)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <div style={{
                width: `${Math.round((currentPrediction.confidence || 0.85) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00d4aa 0%, #0099ff 100%)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            
            <div style={{ 
              color: '#00d4aa', 
              fontSize: '20px', 
              fontWeight: '700',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 212, 170, 0.3)'
            }}>
              {Math.round((currentPrediction.confidence || 0.85) * 100)}% Confident
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{
            fontSize: '18px',
            marginBottom: '8px'
          }}>
            Select a player and game to generate AI predictions
          </div>
          <div style={{ fontSize: '14px' }}>
            AI will analyze recent performance and matchup data
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionCard;