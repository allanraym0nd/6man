// src/components/dashboard/UserPredictionCard.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserPredictionCard = ({ games, userPredictions, onRefresh }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlayers();
    initializePredictions();
  }, [userPredictions, games]);

  const loadPlayers = async () => {
    try {
      const response = await apiService.getPredictionEligiblePlayers();
      setPlayers(response.data.players || []);
    } catch (err) {
      console.error('Failed to load players:', err);
    }
  };

  const initializePredictions = () => {
    if (userPredictions && userPredictions.length > 0) {
      const formattedPredictions = userPredictions.map(pred => ({
        id: pred._id,
        playerId: pred.player.id,
        gameId: pred.gameId,
        points: pred.predictions.points || '',
        rebounds: pred.predictions.rebounds || '',
        assists: pred.predictions.assists || '',
        isExisting: true
      }));
      setPredictions(formattedPredictions);
    } else {
      // Start with one empty prediction row
      setPredictions([{
        id: Date.now(),
        playerId: '',
        gameId: '',
        points: '',
        rebounds: '',
        assists: '',
        isExisting: false
      }]);
    }
  };

  const addPrediction = () => {
    setPredictions([...predictions, {
      id: Date.now(),
      playerId: '',
      gameId: '',
      points: '',
      rebounds: '',
      assists: '',
      isExisting: false
    }]);
  };

  const removePrediction = (id) => {
    if (predictions.length > 1) {
      setPredictions(predictions.filter(pred => pred.id !== id));
    }
  };

  const updatePrediction = (id, field, value) => {
    setPredictions(predictions.map(pred => 
      pred.id === id ? { ...pred, [field]: value } : pred
    ));
  };

  const getPlayerGameOptions = () => {
    const options = [];
    games.forEach(game => {
      players.forEach(player => {
        // Check if player's team is in this game
        if (player.team?.abbreviation === game.homeTeam.abbreviation || 
            player.team?.abbreviation === game.awayTeam.abbreviation) {
          options.push({
            value: `${player.playerId}-${game.gameId}`,
            label: `${player.fullName} - ${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`,
            playerId: player.playerId,
            gameId: game.gameId,
            gameDate: game.gameDate
          });
        }
      });
    });
    return options;
  };

  const handleSubmit = async () => {
    const validPredictions = predictions.filter(pred => 
      pred.playerId && pred.gameId && (pred.points || pred.rebounds || pred.assists)
    );

    if (validPredictions.length === 0) {
      setError('Please add at least one prediction with player and stats');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const playerGameOptions = getPlayerGameOptions();
      
      for (const pred of validPredictions) {
        if (!pred.isExisting) {
          const option = playerGameOptions.find(opt => 
            opt.value === `${pred.playerId}-${pred.gameId}`
          );
          
          const predictionData = {
            gameId: pred.gameId,
            gameDate: option?.gameDate || new Date().toISOString(),
            playerId: pred.playerId,
            predictions: {
              points: parseInt(pred.points) || 0,
              rebounds: parseInt(pred.rebounds) || 0,
              assists: parseInt(pred.assists) || 0
            }
          };

          await apiService.createUserPrediction(predictionData);
        }
      }

      onRefresh();
      setError(null);
    } catch (err) {
      console.error('Failed to submit predictions:', err);
      setError(err.response?.data?.error || 'Failed to submit predictions');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setPredictions([{
      id: Date.now(),
      playerId: '',
      gameId: '',
      points: '',
      rebounds: '',
      assists: '',
      isExisting: false
    }]);
  };

  const playerGameOptions = getPlayerGameOptions();

  return (
    <div className="card user-prediction-panel">
      <div className="card-header">
        <div>
          <h2 className="card-title">👤 Your Predictions</h2>
          <p className="card-subtitle">Add your own player stat predictions</p>
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

      {predictions.map((prediction, index) => (
        <div key={prediction.id} className="prediction-row">
          <div className="form-group">
            <label className="form-label">Player & Game</label>
            <select
              value={`${prediction.playerId}-${prediction.gameId}`}
              onChange={(e) => {
                const [playerId, gameId] = e.target.value.split('-');
                updatePrediction(prediction.id, 'playerId', playerId);
                updatePrediction(prediction.id, 'gameId', gameId);
              }}
              className="form-select"
            >
              <option value="-">Select Player & Game...</option>
              {playerGameOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Points</label>
            <input
              type="number"
              value={prediction.points}
              onChange={(e) => updatePrediction(prediction.id, 'points', e.target.value)}
              className="stat-input"
              placeholder="28"
              min="0"
              max="60"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rebounds</label>
            <input
              type="number"
              value={prediction.rebounds}
              onChange={(e) => updatePrediction(prediction.id, 'rebounds', e.target.value)}
              className="stat-input"
              placeholder="8"
              min="0"
              max="25"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assists</label>
            <input
              type="number"
              value={prediction.assists}
              onChange={(e) => updatePrediction(prediction.id, 'assists', e.target.value)}
              className="stat-input"
              placeholder="6"
              min="0"
              max="20"
            />
          </div>

          {predictions.length > 1 && (
            <button
              onClick={() => removePrediction(prediction.id)}
              className="remove-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      <button 
        onClick={addPrediction}
        className="add-prediction-btn"
        style={{
          background: 'rgba(251, 191, 36, 0.2)',
          border: '2px dashed rgba(251, 191, 36, 0.5)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          color: '#fbbf24',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Plus size={16} />
        Add Another Prediction
      </button>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="user-predict-btn"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit Predictions 🎯'}
        </button>
        
        <button
          onClick={clearAll}
          className="predict-btn"
          style={{
            background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default UserPredictionCard;