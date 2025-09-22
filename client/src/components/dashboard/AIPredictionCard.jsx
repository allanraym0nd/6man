// src/components/dashboard/AIPredictionCard.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { apiService } from '../../services/api';

const AIPredictionCard = ({ games, onRefresh }) => {
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
      setPlayers(response.data.players || []);
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
      onRefresh();
    } catch (err) {
      console.error('Prediction failed:', err);
      setError(err.response?.data?.error || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card prediction-panel">
      <div className="card-header">
        <div>
          <h2 className="card-title">🤖 AI Player Prediction</h2>
          <p className="card-subtitle">Get AI-powered predictions for tonight's games</p>
        </div>
      </div>

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

      <div className="predict-form">
        <div className="form-group">
          <label className="form-label">Player</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="form-select"
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
        
        <div className="form-group">
          <label className="form-label">Game</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="form-select"
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
        
        <button 
          onClick={handlePredict}
          disabled={loading || !selectedPlayer || !selectedGame}
          className="predict-btn"
          style={{
            opacity: (loading || !selectedPlayer || !selectedGame) ? 0.5 : 1,
            cursor: (loading || !selectedPlayer || !selectedGame) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Predicting...' : 'Predict ⚡'}
        </button>
      </div>

      {currentPrediction ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{currentPrediction.predictions?.points || 0}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{currentPrediction.predictions?.assists || 0}</div>
              <div className="stat-label">Assists</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{currentPrediction.predictions?.rebounds || 0}</div>
              <div className="stat-label">Rebounds</div>
            </div>
          </div>

          <div className="prediction-confidence">
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>AI Confidence Level</p>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${Math.round((currentPrediction.confidence || 0.85) * 100)}%` }}
              />
            </div>
            <p style={{ color: '#00d4aa', fontWeight: '600' }}>
              {Math.round((currentPrediction.confidence || 0.85) * 100)}% Confident
            </p>
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
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