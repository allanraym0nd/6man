// src/components/dashboard/StandingsPerformanceCard.jsx
import React, { useState } from 'react';
import { TrendingUp, Award, Target, Users } from 'lucide-react';

const StandingsCard = ({ standings }) => {
  const [selectedConference, setSelectedConference] = useState('East');

  const getCurrentStandings = () => {
    return standings[selectedConference.toLowerCase()] || [];
  };

  const formatRecord = (team) => {
    return `${team.record?.wins || 0}-${team.record?.losses || 0}`;
  };

  const getWinPercentage = (team) => {
    const wins = team.record?.wins || 0;
    const losses = team.record?.losses || 0;
    const total = wins + losses;
    if (total === 0) return '0.000';
    return ((wins / total) * 1000).toFixed(0).padStart(3, '0');
  };

  const currentStandings = getCurrentStandings();

  return (
    <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">🏆 League Standings</h2>
            <p className="card-subtitle">Current NBA standings</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['East', 'West'].map((conference) => (
              <button
                key={conference}
                onClick={() => setSelectedConference(conference)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: selectedConference === conference 
                    ? 'linear-gradient(135deg, #00d4aa, #0099ff)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: selectedConference === conference ? 'white' : '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {conference}ern
              </button>
            ))}
          </div>
        </div>
        
        <div className="league-standings">
          <div className="standings-column">
            <div className="standings-header">
              {selectedConference}ern Conference
            </div>
            
            {currentStandings.length > 0 ? (
              currentStandings.slice(0, 8).map((team, index) => (
                <div key={team.team.id} className="team-row">
                  <div className="team-info">
                    <div className="team-rank">
                      {team.rank || index + 1}
                    </div>
                    <span className="team-name">
                      {team.team.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="team-record">
                      {formatRecord(team)}
                    </span>
                    <span style={{ 
                      color: '#94a3b8', 
                      fontSize: '12px',
                      minWidth: '35px',
                      textAlign: 'right'
                    }}>
                      .{getWinPercentage(team)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <div style={{ marginBottom: '8px' }}>No standings data available</div>
                <div style={{ fontSize: '14px' }}>
                  Standings will update with latest NBA data
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
      
 )
  
}

export default StandingsCard;