import React, {useState} from 'react'
import { apiService } from '../../services/api'
import { ChevronDown, Zap } from 'lucide-react';


const AIPredictionCard = ({games, onRefresh}) => {
    const [players,setPlayers] = useState([])
    const [selectedPlayer, setSelectedPlayer] = useState('')
    const [selectedGame, setSelectedGame] = useState('');
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

   useEffect(() => {
    loadPredictionEligiblePlayers()

   }, [])

   const loadPredictionEligiblePlayers = async () => {
    try {
        const response = await apiService.getPredictionEligiblePlayers()
        setPlayers(response.data.players)
    }catch(err) {
      console.error('Failed to load players:', err);
      setError('Failed to load players');

    }
   }

   const handlepredict = async() => {
    if(!selectedPlayer || !selectedGame) {
        setError('Please select both player and game');
        return;
    }

    setLoading(true)
    setError(null)

    try {
        const selectedGameData = games.find(game => game.gameId === selectedGame)

        const response = await apiService.createAIPrediction({
            gameId: selectedGame,
            gameDate: selectedGameData?.gameDate || new Date().toISOString(),
            playerId: selectedPlayer,
            aiModel:'random_forest'
        })

        setCurrentPrediction(response.data.prediction)
        onRefresh() 

    }catch(err) {
        console.error('Prediction failed:', err);
        setError(err.response?.data?.error || 'Failed to generate prediction')

    }finally{
        setLoading(false) 
    }

   }
}