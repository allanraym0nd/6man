import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LeagueCard from './LeagueCard';
import CreateLeagueModal from './LeagueModal';
import Navbar from '../common/NavBar';

const LeaguesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [leagues, setLeagues] = useState({ all: [], my: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      console.log('Loading leagues...');

      const allLeaguesRes = await apiService.getCompetitions();
      console.log('API response:', allLeaguesRes.data);

      // The response is directly an array, not nested in .competitions or .leagues
      const leaguesArray = Array.isArray(allLeaguesRes.data)
        ? allLeaguesRes.data
        : (allLeaguesRes.data.competitions || allLeaguesRes.data.leagues || []);

      setLeagues({
        all: leaguesArray,
        my: [] // Will fix this later
      });

      console.log('Leagues set:', leaguesArray);
    } catch (err) {
      console.error('Failed to load leagues:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeague = (leagueId) => {
    navigate(`/leagues/${leagueId}`);
  };

  const handleLeagueCreated = (newLeague) => {


    if (!newLeague || !newLeague._id) {
      console.error('Invalid league data received');
      return;
    }

    setLeagues(prev => ({
      all: [newLeague, ...prev.all],
      my: [newLeague, ...prev.my]
    }));
  };

  const displayedLeagues = activeTab === 'all' ? leagues.all : leagues.my;
  const myLeagueIds = new Set(
    leagues.my.filter(l => l && l._id).map(l => l._id)
  );


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
          Loading leagues...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' }}>
      <Navbar />
      <div style={{ maxWidth: "100 %", margin: '0 auto', padding: '32px 40px' }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Trophy size={36} style={{ color: '#00d4aa' }} />
              Prediction Leagues
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
              Join or create competitive prediction leagues
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '16px'
            }}
          >
            <Plus size={20} />
            Create League
          </button>
        </div>


        <div className="league-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`league-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            All Leagues
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`league-tab ${activeTab === 'my' ? 'active' : ''}`}
          >
            My Leagues ({leagues.my.length})
          </button>
        </div>


        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            color: '#ef4444',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}


        {displayedLeagues.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {displayedLeagues.map(league => (
              <LeagueCard
                key={league._id}
                league={league}
                onView={handleViewLeague}
                isMember={myLeagueIds.has(league._id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Trophy className="empty-state-icon" size={64} />
            <h3 className="empty-state-title">
              {activeTab === 'all' ? 'No leagues available' : 'You haven\'t joined any leagues yet'}
            </h3>
            <p className="empty-state-description">
              {activeTab === 'all'
                ? 'Be the first to create a league!'
                : 'Browse available leagues or create your own'}
            </p>
          </div>
        )}
      </div>

      <CreateLeagueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeagueCreated={handleLeagueCreated}
      />
    </div>
  );
};

export default LeaguesDashboard;