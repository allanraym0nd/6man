// src/components/dashboard/RecentPredictionsCard.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RecentPredictionsCard = ({ predictions, userStats }) => {
  const { user } = useAuth();

  const getStatusStyle = (prediction) => {
    if (!prediction.actualStats) {
      return 'status-pending';
    }
    
    // Check if prediction was accurate based on your backend logic
    const accuracy = prediction.accuracy?.overallAccuracy || 0;
    if (accuracy > 0.7) {
      return 'status-correct';
    }
    return 'status-incorrect';
  };

  const getStatusText = (prediction) => {
    if (!prediction.actualStats) {
      return prediction.status === 'live' ? '⏳ Live' : '⏳ Pending';
    }
    
    const accuracy = prediction.accuracy?.overallAccuracy || 0;
    if (accuracy > 0.7) {
      return '✓ Hit';
    }
    return '✗ Miss';
  };

  const formatGameInfo = (prediction) => {
    if (prediction.gameDate) {
      const date = new Date(prediction.gameDate);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    }
    return 'Today';
  };

  const formatStats = (predictions) => {
    return `${predictions.points || 0} PTS • ${predictions.rebounds || 0} REB • ${predictions.assists || 0} AST`;
  };

  const getPredictionSource = (prediction) => {
    return prediction.type === 'ai' ? 'AI Prediction' : 'Your Prediction';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">📊 Recent Predictions</h3>
          <p className="card-subtitle">Your latest predictions</p>
        </div>
      </div>
      
      <div className="recent-predictions custom-scrollbar">
        {predictions && predictions.length > 0 ? (
          predictions.slice(0, 15).map((prediction, index) => (
            <div key={prediction._id || index} className="prediction-item">
              <div className="prediction-info">
                <div className="player-name">
                  {prediction.player?.name || 'Unknown Player'}
                </div>
                <div className="game-info">
                  vs {prediction.homeTeam?.abbreviation || prediction.awayTeam?.abbreviation || 'TBD'} - {formatGameInfo(prediction)}
                </div>
                <div className="prediction-stats-mini">
                  {formatStats(prediction.predictions)}
                </div>
                <div className="prediction-source">
                  {getPredictionSource(prediction)}
                </div>
              </div>
              <div className={`prediction-status ${getStatusStyle(prediction)}`}>
                {getStatusText(prediction)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              background: 'rgba(100, 116, 139, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              📊
            </div>
            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
              No predictions yet
            </div>
            <div style={{ fontSize: '14px' }}>
              Start making predictions to see your history here
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      {userStats && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(10, 14, 39, 0.4)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '14px', 
            fontWeight: '500',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Quick Stats
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#00d4aa', 
                fontSize: '20px', 
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {userStats.totalPredictions || 0}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                Total
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#00d4aa', 
                fontSize: '20px', 
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {userStats.averageAccuracy 
                  ? `${Math.round(userStats.averageAccuracy * 100)}%`
                  : `${userStats.successRate || 0}%`
                }
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                Accuracy
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Summary */}
      {predictions && predictions.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0, 153, 255, 0.05))',
          borderRadius: '12px',
          border: '1px solid rgba(0, 212, 170, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '8px' 
          }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Points this week</span>
            <span style={{ fontWeight: '700', color: '#00d4aa' }}>
              +{(() => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                
                return predictions
                  .filter(p => p.pointsEarned && new Date(p.gameDate) >= oneWeekAgo)
                  .reduce((sum, p) => sum + p.pointsEarned, 0)
                  .toFixed(0);
              })()}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total points</span>
            <span style={{ fontWeight: '700', color: '#00d4aa' }}>
              {predictions
                .filter(p => p.pointsEarned)
                .reduce((sum, p) => sum + p.pointsEarned, 0)
                .toFixed(0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentPredictionsCard;