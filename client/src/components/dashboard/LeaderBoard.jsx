import React, {useState,useEffect} from 'react'
import { Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LeaderboardCard = ({leaderboard}) => {
    const [timeframe,setTimeframe] = useState("weekly")
    const {user} = useAuth()

    const getRankIcon = () => {
        switch (rank) {
            case 1: return <Trophy size={16} style={{color: '#ffd700'}} />
            case 2: return <Trophy size={16} style={{color: '#c0c0c0'}} />
            case 3: return <Trophy size={16} style={{color: '#cd7f32'}} />

            default: return null
        }
    }

       const getRankStyle = (rank) => {
        const baseStyle = {
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: '700' 
        }

        switch(rank) {
            case 1: 
                return {
                    ...baseStyle,
                    background: 'linear gradient(135deg, #ffd700, #ffed4e)',
                    color: '#000'
                };
            case 2: 
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #c0c0c0, #e5e5e5)',
                color: '#000'
            }
            case 3:
                return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #cd7f32, #daa520)',
                color: '#000'
                };

            default:
                return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
                color: '#fff'
             };
        }
    }

    const isCurrentUser = () => {
        return user && (username === user.username || username.includes(user.FirstName) )
    }

    const formatAccuracy = (accuracy) => {
        if(accuracy > 1) {
            return `${accuracy}%`
        }

        return `${accuracy * 100}.toFixed(1)`

    }

    return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">🏅 Top Predictors</h3>
          <p className="card-subtitle">Weekly leaderboard</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['weekly', 'monthly', 'all-time'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: timeframe === period 
                  ? 'rgba(0, 212, 170, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: timeframe === period ? '#00d4aa' : '#94a3b8',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize'
              }}
            >
              {period.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="leaderboard-list">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.slice(0, 10).map((leader, index) => (
            <div 
              key={leader.userId || index}
              className={`leaderboard-item ${isCurrentUser(leader.username) ? 'current-user' : ''}`}
              style={{
                background: isCurrentUser(leader.username) 
                  ? 'rgba(0, 212, 170, 0.1)' 
                  : 'transparent',
                border: isCurrentUser(leader.username)
                  ? '1px solid rgba(0, 212, 170, 0.2)'
                  : '1px solid transparent',
                borderRadius: '8px',
                padding: '12px 0',
                margin: '0 -12px',
                paddingLeft: '12px',
                paddingRight: '12px'
              }}
            >
              <div className="user-info">
                <div style={getRankStyle(leader.rank || index + 1)}>
                  {getRankIcon(leader.rank || index + 1) || (leader.rank || index + 1)}
                </div>
                <div>
                  <span className="username">
                    {leader.username || `User ${leader.userId?.slice(-4)}`}
                    {isCurrentUser(leader.username) && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        background: 'rgba(0, 212, 170, 0.2)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#00d4aa',
                        fontWeight: '500'
                      }}>
                        You
                      </span>
                    )}
                  </span>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '2px'
                  }}>
                    {leader.totalPredictions} predictions • {leader.correctPredictions} correct
                  </div>
                </div>
              </div>
              <div className="leaderboard-stats">
                <span className="user-accuracy">
                  {formatAccuracy(leader.averageAccuracy || leader.successRate || 0)}
                </span>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  textAlign: 'right',
                  marginTop: '2px'
                }}>
                  {leader.totalPoints ? `${Math.round(leader.totalPoints)} pts` : 'N/A'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
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
              🏅
            </div>
            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
              No leaderboard data available
            </div>
            <div style={{ fontSize: '14px' }}>
              Make some predictions to appear on the leaderboard
            </div>
          </div>
        )}
      </div>

      {leaderboard && leaderboard.length > 10 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(10, 14, 39, 0.4)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Showing top 10 of {leaderboard.length} predictors
        </div>
      )}
    </div>
  );
}

export default LeaderboardCard;