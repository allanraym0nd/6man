import React, {useState, useEffect} from 'react'
import { X, Plus } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserPredictionCard = ({userPredictions, }) => {
    const {user} = useAuth()
    const [predictions, setPredictions] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,setError] = useState(null)

    useEffect(() => {
        loadPlayers()
        initializePredictions()
    },[userPredictions, games])

const loadPlayers = async() =>{ 
    try { 
    const response = await apiService.getPredictionEligiblePlayers()
    setPlayers(response.data.players || [])
     } catch(err) {
        console.log("Failed to load players", err)
    
     }
}

const initializePredictions = async() => {
    if(userPredictions && userPredictions > 0) {
        const formattedPredictions = userPredictions.map(pred => ({
            id: pred._id,
            playerId: pred.player.id,
            gameId: pred.gameId,
            points: pred.predictions.points || '',
            rebounds: pred.predictions.rebounds || '',
            assists: pred.predictions.assists || '',
            isExisting:true
        }))
        setPredictions(formattedPredictions)

    } else { 
        setPredictions([ {
        id: Date.now(),
        playerId: '',
        gameId: '',
        points: '',
        rebounds: '',
        assists: '',
       isExisting: false

        }])
   

    }
}







}