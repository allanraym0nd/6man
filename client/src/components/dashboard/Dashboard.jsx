import React, {useState} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import Header from '../common/Header';
import AIPredictionCard from './AIPredictionCard';
import UserPredictionCard from './UserPredictionCard';
import StatsLeadersCard from './StatsLeadersCard';
import LeaderboardCard from './LeaderboardCard';
import RecentPredictionsCard from './RecentPredictionsCard';
import StandingsCard from './StandingsCard';


const Dashboard = () => {
    const {user} = useAuth() 

    const [dashboardData, setDashboardData] = useState({
        aiPredictions: [],
        todaysGames: [],
        userPredictions: [],
        statLeaders: [],
        leaderboard: [],
        recentPredictions: [],
        standings: {east: [],west: []},
        userStats: {}
    })
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     const getCurrentUserId = () => {
        return user?._id || user?.id
     }

     useEffect(() => {
        if(user){
            loadDashboardData()
        }
     }, [user])

     const loadDashboardData = async() => { 
        try {

            setLoading(true)

            const userId = getCurrentUserId()

            const [
                aiPredictionRes,
                todaysGamesRes,
                userPredictionsRes,
                pointsLeadersRes,
                reboundsLeadersRes,
                assistsLeadersRes,
                leaderboardRes,
                recentPredictionsRes,
                eastStandingsRes,
                westStandingsRes,
                userStatsRes

            ] = await Promise.all([
                apiService.getAIPredictions(5),
                apiService.getUserPredictions(userId),
                apiService.getTodaysGames(),
                apiService.getStatLeaders('points', 5),
                apiService.getStatLeaders('rebounds', 5),
                apiService.getStatLeaders('assists', 5),
                apiService.getLeaderboard('weekly', 10),
                apiService.getRecentPredictions(10),
                apiService.getStandings('East'),
                apiService.getStandings('West'),
                apiService.getUserStats(userId)

            ])

            setDashboardData({
                aiPrediction: aiPredictionRes.data.predictions || [],
                todaysGames: todaysGamesRes.data.games || [],
                statLeaders:{
                    points: pointsLeadersRes.data.leaders || [],
                    rebounds: reboundsLeadersRes.data.leaders || [],
                    assists: assistsLeadersRes.data.leaders || []
                    
                },
                leaderboard: leaderboardRes.data.leaderboard || [],
                recentPredictions: recentPredictionsRes.data.predictions || [],
                standings: {
                east: eastStandingsRes.data.standings || [],
                west: westStandingsRes.data.standings || []
                },
                userStats: userStatsRes.data.stats || {
                    totalPredictions: 0,
                    completedPredictions: 0,
                    correctPredictions: 0,
                    averageAccuracy: 0,
                    successRate: 0
                },




            })

        } catch(err) {
            console.error('Failed to load dashboard data:', err)

        }finally {
            setLoading(false)
        }
     }

     if(loading) {
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
        )
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
      <Header />
      
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <div className="dashboard-grid">
          {/* Left Column - Predictions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AIPredictionCard 
              predictions={dashboardData.aiPredictions}
              onRefresh={loadDashboardData}
              games={dashboardData.todaysGames}
            />
            <UserPredictionCard 
              games={dashboardData.todaysGames}
              userPredictions={dashboardData.userPredictions}
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
           />
        </div>
      </div>
    </div>
  );

}