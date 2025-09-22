// src/components/dashboard/StatsLeadersCard.jsx
import React, { useState } from 'react';
import { apiService } from '../../services/api';

const StatsLeadersCard = ({ statLeaders }) => {
  const [selectedStat, setSelectedStat] = useState('points');

  const getStatLeaders = () => {
    return statLeaders[selectedStat] || [];
  };

  const getStatLabel = (stat) => {
    const labels = {
      points: 'PPG',
      rebounds: 'RPG', 
      assists: 'APG'
    };
    return labels[stat] || 'PPG';
  };

  const getStatTitle = (stat) => {
    const titles = {
      points: 'Points Leader',
      rebounds: 'Rebounds Leader',
      assists: 'Assists Leader'
    };
    return titles[stat] || 'Points Leader';
  };

  const getPlayerInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentLeaders = getStatLeaders();

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">⭐ Player Stats Leaders</h2>
          <p className="card-subtitle">Current season leaders</p>
        </div>
      </div>

      {/* Stat Selection Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        background: 'rgba(10, 14, 39, 0.4)',
        padding: '4px',
        borderRadius: '12px'
      }}>
        {['points', 'rebounds', 'assists'].map((stat) => (
          <button
            key={stat}
            onClick={() => setSelectedStat(stat)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '8px',
              background: selectedStat === stat 
                ? 'linear-gradient(135deg, #00d4aa, #0099ff)'
                : 'transparent',
              color: selectedStat === stat ? 'white' : '#94a3b8',
              fontWeight: selectedStat === stat ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              textTransform: 'capitalize'
            }}
          >
            {stat}
          </button>
        ))}
      </div>
      
      <div className="top-players">
        {currentLeaders.length > 0 ? (
          currentLeaders.map((leader, index) => (
            <div key={leader.player.id} className="player-item">
              <div className="player-details">
                <div className="player-avatar">
                  {getPlayerInitials(leader.player.name)}
                </div>
                <div>
                  <div className="player-name">{leader.player.name}</div>
                  <div className="game-info">{leader.player.team.name}</div>
                </div>
              </div>
              <div className="player-stats">
                <div className="primary-stat">
                  {leader.average} {getStatLabel(selectedStat)}
                </div>
                <div className="secondary-stat">
                  #{leader.rank} {getStatTitle(selectedStat)}
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
              ⭐
            </div>
            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
              No stat leaders available
            </div>
            <div style={{ fontSize: '14px' }}>
              Stats will update with the latest NBA data
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsLeadersCard;