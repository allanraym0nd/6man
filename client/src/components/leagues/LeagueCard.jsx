// src/components/leagues/LeagueCard.jsx
import React from 'react';
import { Users, Lock, Globe } from 'lucide-react';

const LeagueCard = ({ league, onView, isMember = false }) => {
  return (
    <div className="league-card" onClick={() => onView(league._id)}>
      <div className="league-card-header">
        <div style={{ flex: 1 }}>
          <h3 className="league-card-title">
            {league.name}
            {league.type === 'private' ? (
              <Lock size={16} style={{ color: '#fbbf24' }} />
            ) : (
              <Globe size={16} style={{ color: '#00d4aa' }} />
            )}
          </h3>
          {isMember && <span className="league-badge">Member</span>}
        </div>
      </div>

      <p className="league-description">
        {league.description || 'No description provided'}
      </p>

      <div className="league-stats-row">
        <div className="league-member-count">
          <Users size={16} />
          <span>
            {league.memberCount || 0} {league.maxMembers ? `/ ${league.maxMembers}` : ''} members
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(league._id);
          }}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          {isMember ? 'View' : 'Join'}
        </button>
      </div>
    </div>
  );
};

export default LeagueCard;