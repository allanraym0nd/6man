// src/components/leagues/LeagueDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserMinus, LogOut } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LeagueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [league, setLeague] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeagueData();
  }, [id]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      const [leagueRes, leaderboardRes] = await Promise.all([
        apiService.getCompetitionById(id),
        apiService.getLeagueLeaderboard(id)
      ]);



      setLeague(leagueRes.data.league);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load league:', err);
      setError('Failed to load league details');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!window.confirm('Are you sure you want to leave this league?')) return;

    try {
      await apiService.leaveCompetition(id);
      navigate('/leagues');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave league');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the league?')) return;

    try {
      await apiService.removeCompetitionMember(id, userId);
      loadLeagueData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading league...
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          gap: '16px'
        }}>
          <div style={{ color: '#ef4444', fontSize: '18px' }}>{error || 'League not found'}</div>
          <button onClick={() => navigate('/leagues')} className="btn-primary">
            Back to Leagues
          </button>
        </div>
      </div>
    );
  }

  const isCreator = league.creator === user?.id || league.creator?._id === user?.id;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' }}>
      
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/leagues')}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            padding: '10px 16px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Leagues
        </button>

        {/* League Header */}
        <div className="league-detail-header">
          <h1 className="league-detail-title">{league.name}</h1>
          
          <div className="league-detail-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} />
              <span>{league.memberCount || 0} members</span>
            </div>
            <div>Type: {league.type === 'private' ? '🔒 Private' : '🌐 Public'}</div>
            {league.maxMembers && <div>Max: {league.maxMembers} members</div>}
          </div>

          {league.description && (
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
              {league.description}
            </p>
          )}

          <div className="league-detail-actions">
            <button
              onClick={handleLeaveLeague}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} />
              Leave League
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '24px'
          }}>
            League Leaderboard
          </h2>

          {leaderboard.length > 0 ? (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Predictions</th>
                  <th>Accuracy</th>
                  <th>Points</th>
                  {isCreator && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.user?.id || entry.user?._id}>
                    <td>
                      <span className={`leaderboard-rank ${entry.rank <= 3 ? 'top-3' : ''}`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td>
                      <div className="leaderboard-player-info">
                        <div className="leaderboard-avatar">
                          {entry.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span>{entry.user?.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>{entry.stats?.predictions || 0}</td>
                    <td>{((entry.stats?.accuracy || 0) * 100).toFixed(1)}%</td>
                    <td style={{ color: '#00d4aa', fontWeight: '600' }}>
                      {entry.stats?.points || 0}
                    </td>
                    {isCreator && (
                      <td>
                        {entry.user?.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(entry.user?.id || entry.user?._id)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              color: '#ef4444',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <UserMinus size={12} />
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p className="empty-state-title">No members yet</p>
              <p className="empty-state-description">
                Be the first to make predictions and climb the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetail;