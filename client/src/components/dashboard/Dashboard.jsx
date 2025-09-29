import React, {useState,useEffect} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
// import Header from '../common/Header';
import AIPredictionCard from './AIPredictionCard';
import UserPredictionCard from './UserPredictionCard';
import StatsLeadersCard from './StatsLeadersCard';
import LeaderboardCard from "./LeaderBoard";
import RecentPredictionsCard from "./RecentPredictions";
import StandingsCard from "./StandingsPerformanceCard";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    aiPredictions: [],
    todaysGames: [],
    statLeaders: {},
    leaderboard: [],
    recentPredictions: [],
    standings: { east: [], west: [] },
    userStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        aiPredictionsRes,
        todaysGamesRes,
        pointsLeadersRes,
        reboundsLeadersRes,
        assistsLeadersRes,
        // leaderboardRes,
        eastStandingsRes,
        westStandingsRes
      ] = await Promise.all([
        apiService.getAIPredictions(5),
        apiService.getTodaysGames(),
        apiService.getStatLeaders('points', 5),
        apiService.getStatLeaders('rebounds', 5),
        apiService.getStatLeaders('assists', 5),
        // apiService.getLeaderboard('weekly', 10),
        apiService.getStandings('East'),
        apiService.getStandings('West')
      ]);

      setDashboardData({
        aiPredictions: aiPredictionsRes.data.predictions || [],
        todaysGames: todaysGamesRes.data.games || [],
        statLeaders: {
          points: pointsLeadersRes.data.leaders || [],
          rebounds: reboundsLeadersRes.data.leaders || [],
          assists: assistsLeadersRes.data.leaders || []
        },
        // leaderboard: leaderboardRes.data.leaderboard || [],
        standings: {
          east: eastStandingsRes.data.standings || [],
          west: westStandingsRes.data.standings || []
        },
        userStats: {
          totalPredictions: 47,
          accuracy: 73.2,
          weeklyPoints: 280,
          streak: 5,
          rank: 126
        }
      });
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)'
      }}>
        <div style={{ color: '#ef4444', fontSize: '20px', marginBottom: '16px' }}>{error}</div>
        <button 
          onClick={loadDashboardData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)' }}>
      
      
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <div className="dashboard-grid">
          {/* Left Column - Predictions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AIPredictionCard 
              predictions={dashboardData.aiPredictions}
              onRefresh={loadDashboardData}
            />
            <UserPredictionCard 
              games={dashboardData.todaysGames}
              onSubmitPrediction={loadDashboardData}
            />
          </div>

          {/* Middle Column - Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <StatsLeadersCard statLeaders={dashboardData.statLeaders} />
            <LeaderboardCard leaderboard={dashboardData.leaderboard} />
          </div>

          {/* Right Column - Sidebar */}
          <div>
            <RecentPredictionsCard 
              predictions={dashboardData.recentPredictions}
              userStats={dashboardData.userStats}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          <StandingsCard 
            standings={dashboardData.standings}
            userStats={dashboardData.userStats}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;