import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

class SportsDataService {

    constructor(){
        this.baseURL = 'https://api.balldontlie.io/v1'
        this.headers = {
            'Authorization' : process.env.BALLDONTLIE_API_KEY || ''
        } 
        this.timeout = 10000
    }


    async getTeams() {
        try {
            const response = await axios.get(`${this.baseURL}/teams`, {
                headers : this.headers,
                timeout: this.timeout
            })

            return response.data.data.map(team => ({
                id: team.id,
                name: team.full_name,
                abbreviation: team.abbreviation,
                city: team.city,
                conference: team.conference,
                division: team.division
            
            }))

        }catch(error){
             console.error('Error fetching teams:', error.message);
             throw new Error('Failed to fetch NBA teams');

        }
    }

    async getPlayers(page =1, perPage=100) {
        try{
            const response = await axios.get(`${this.baseURL}/players`, {
                headers: this.headers,
                params: {page, perPage},
                timeout: this.timeout
            });

            return {
                players: response.data.data.map(player => ({
                    id: player.id,
                    firstName: player.first_name,
                    lastName: player.last_name,
                    position: player.position,
                    height: player.height_feet && player.height_inches
                    ? `${player.height_feet}'${player.height_inches}`
                    : null,
                    weight: player.weight_pounds,
                    team: {
                        id: player.team.id,
                        name: player.team.full_name,
                        abbreviation: player.team.abbreviation
                    }
                })),
                meta: response.data.meta
            }

        }catch(error){
            console.error('Error fetching players:', error.message);
            throw new Error('Failed to fetch NBA players');

        }
    }

    async getGamesByDate(date) {
        try {
        const response = await axios.get(`${this.baseURL}/games`, {
        headers: this.headers,
        params: {
          dates: [date],
          per_page: 100
        },
        timeout: this.timeout
      });

      return response.data.data.map(game => ({
        id: game.id,
        date: game.date,
        homeTeam: {
          id: game.home_team.id,
          name: game.home_team.full_name,
          abbreviation: game.home_team.abbreviation,
          score: game.home_team_score
        },
        visitorTeam: {
          id: game.visitor_team.id,
          name: game.visitor_team.full_name,
          abbreviation: game.visitor_team.abbreviation,
          score: game.visitor_team_score
        },
        season: game.season,
        status: game.status,
        period: game.period,
        time: game.time,
        postseason: game.postseason
      }))
    } catch(error){
        console.error("Error fetching games:", error.message)
        throw new Error("Failed to fetch nba games")

    }
    }

    async getPlayerStats(gameId, playerId=null) {
        try {
        const params = {game_ids: [gameId]} 
        if(playerId) params.player_ids = [playerId]

        const response = await axios.get(`${this.baseURL}/stats`, {
        headers: this.headers,
        params,
        timeout: this.timeout
      });

      return response.data.data.map(stat => ({
        id: stat.id,
        player: {
          id: stat.player.id,
          firstName: stat.player.first_name,
          lastName: stat.player.last_name,
          position: stat.player.position
        },
        team: {
          id: stat.team.id,
          abbreviation: stat.team.abbreviation
        },
        game: {
          id: stat.game.id,
          date: stat.game.date
        },
        stats: {
          points: stat.pts,
          rebounds: stat.reb,
          assists: stat.ast,
          steals: stat.stl,
          blocks: stat.blk,
          turnovers: stat.turnover,
          fieldGoalsMade: stat.fgm,
          fieldGoalsAttempted: stat.fga,
          fieldGoalPercentage: stat.fg_pct,
          threePointersMade: stat.fg3m,
          threePointersAttempted: stat.fg3a,
          threePointPercentage: stat.fg3_pct,
          freeThrowsMade: stat.ftm,
          freeThrowsAttempted: stat.fta,
          freeThrowPercentage: stat.ft_pct,
          minutesPlayed: stat.min
        }

      }))
    }catch(error){
        console.error('Error fetching player stats:', error.message);
        throw new Error('Failed to fetch player statistics');
    }

    }

    async searchPlayer(firstName,lastName) {
        try{
           const response = await axios.get(`${this.baseURL}/players`, {
            headers: this.headers,
            params: {
                search: `${firstName,lastName}`,
                perPage: 25
            },
            timeout: this.timeout
        });

        return response.data.data.map(player => ({
            id: player.id,
            firstName: player.first_name,
            lastName: player.last_name,
            position: player.position,
            team: {
                id: player.team.id,
                name: player.team.full_name,
                abbreviation: player.team.abbreviation
            }
        }))

        }catch(error){
            console.error('Error searching player:', error.message);
            throw new Error('Failed to search for player');

        }

    }

    async getTodaysGames() {
        const today = new Date().toISOString().split('T')[0]
        return await this.getGamesByDate(today); // When you write this.getGamesByDate(today), you are calling the getGamesByDate method that belongs to the SportsDataService object.
    }

    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseURL}/teams`, {
                headers: this.headers,
                params: { per_page: 1 },
                timeout: 5000
            });
            return {status: 'healthy', statusCode: response.status}
        }catch(error){
            return {
                status: 'unhealthy',
                error: error.message,
                statusCode: error.response?.status || 500
            }
        }
    }



}

export default new SportsDataService()
