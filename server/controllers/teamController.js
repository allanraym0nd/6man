import Team from "../models/Team.js";
import sportsDataService from "../services/sportsDataService.js";

const teamController = {
    // GET /api/teams
    getAllTeams: async (req, res) => {
        try {
            const { conference, division, active = true } = req.query;

            const filter = {};
            if (conference) filter.conference = conference;
            if (division) filter.division = division;
            if (active !== undefined) filter.isActive = active === 'true';

            const teams = await Team.find(filter).sort({ name: 1 });

            res.json({
                teams,
                count: teams.length
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/teams/:teamId
    getTeamById: async (req, res) => {
        try {
            const team = await Team.findOne({ teamId: req.params.teamId });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({ team });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/teams/standings/:conference
 getStandings: async (req, res) => {
    try {
        const { conference } = req.params;
        const { season = '2024-25' } = req.query;

        // Map API conference names to DB conference names
        const conferenceMap = {
            'East': 'Eastern',
            'West': 'Western'
        };
        const dbConference = conferenceMap[conference] || conference;

        console.log('Searching for conference:', dbConference); // Debug

        // Try to fetch from NBA API (will fail during off-season)
        try {
            const standingsData = await sportsDataService.getStandings(season);
            
            // Update local teams with fresh data
            for (const standingRow of standingsData) {
                const teamId = standingRow[0];
                const wins = standingRow[8];
                const losses = standingRow[9];
                const winPct = standingRow[10];

                await Team.findOneAndUpdate(
                    { teamId: teamId.toString() },
                    {
                        'currentSeason.record.wins': wins,
                        'currentSeason.record.losses': losses,
                        'currentSeason.record.winPercentage': winPct
                    }
                );
            }
        } catch (syncError) {
            console.log('NBA API sync failed (expected during off-season):', syncError.message);
        }

        // Get teams from local DB (works whether NBA API succeeded or not)
        const teams = await Team.find({
            isActive: true,
            conference: dbConference
        }).sort({
            'currentSeason.record.winPercentage': -1,
            'currentSeason.record.wins': -1
        });

        console.log('Found teams:', teams.length); // Debug

        res.json({
            conference,
            season,
            standings: teams.map((team, index) => ({
                rank: index + 1,
                team: {
                    id: team.teamId,
                    name: team.name,
                    abbreviation: team.abbreviation,
                    logo: team.logo
                },
                record: team.currentSeason?.record || { wins: 0, losses: 0, winPercentage: 0 },
                division: team.division
            })),
            source: 'cached'
        });

    } catch (error) {
        console.error('Standings error:', error);
        res.status(500).json({ error: error.message });
    }
},

    // GET /api/teams/divisions/:division/standings
    getDivisionStandings: async (req, res) => {
        try {
            const { division } = req.params;
            const { season = '2024-25' } = req.query;

            // Fetch and sync latest standings
            try {
                const standingsData = await sportsDataService.getStandings(season);
                
                for (const standingRow of standingsData) {
                    const teamId = standingRow[0];
                    const wins = standingRow[8];
                    const losses = standingRow[9];
                    const winPct = standingRow[10];

                    await Team.findOneAndUpdate(
                        { teamId: teamId.toString() },
                        {
                            'currentSeason.record.wins': wins,
                            'currentSeason.record.losses': losses,
                            'currentSeason.record.winPercentage': winPct
                        }
                    );
                }
            } catch (syncError) {
                console.log('Standings sync failed, using cached data');
            }

            const teams = await Team.find({
                isActive: true,
                division: division
            }).sort({ 'currentSeason.record.winPercentage': -1 });

            res.json({
                division,
                teams: teams.map((team, index) => ({
                    divisionRank: index + 1,
                    team: {
                        id: team.teamId,
                        name: team.name,
                        abbreviation: team.abbreviation
                    },
                    record: team.currentSeason.record
                }))
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/teams/:teamId/stats
    getTeamStats: async (req, res) => {
        try {
            const { teamId } = req.params;
            
       
            try {
                const teamStatsData = await sportsDataService.getTeams();
                const teamStats = teamStatsData.find(teamRow => teamRow[0].toString() === teamId);
                
                if (teamStats) {
                    // Update local team with fresh stats
                    await Team.findOneAndUpdate(
                        { teamId },
                        {
                            'currentSeason.record.wins': teamStats[3],
                            'currentSeason.record.losses': teamStats[4],
                            'currentSeason.record.winPercentage': teamStats[5]
                        }
                    );
                }
            } catch (statsError) {
                console.log('Team stats sync failed, using cached data');
            }

            const team = await Team.findOne({ teamId });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({
                team: {
                    name: team.name,
                    abbreviation: team.abbreviation
                },
                stats: team.stats,
                record: team.currentSeason.record
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createOrUpdateTeam: async (req, res) => {
        try {
            const teamData = req.body;

            const team = await Team.findOneAndUpdate(
                { teamId: teamData.teamId },
                teamData,
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );

            res.json({
                message: team.isNew ? 'Team Created' : 'Team Updated',
                team
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateTeamRecord: async (req, res) => {
        try {
            const { teamId } = req.params;
            const { wins, losses, season } = req.body;

            const winPercentage = wins / (wins + losses);

            const team = await Team.findOneAndUpdate(
                { teamId },
                {
                    'currentSeason.season': season,
                    'currentSeason.record.wins': wins,
                    'currentSeason.record.losses': losses,
                    'currentSeason.record.winPercentage': winPercentage
                },
                { new: true }
            );

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({
                message: 'Team record updated',
                team
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateTeamStats: async (req, res) => {
        try {
            const { teamId } = req.params;
            const { stats } = req.body;

            const team = await Team.findOneAndUpdate(
                { teamId },
                { stats },
                { new: true }
            );

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({
                message: 'Team stats updated',
                team
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default teamController;