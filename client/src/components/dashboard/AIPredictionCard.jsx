import React, { useState } from 'react';
import { Target, RefreshCw, TrendingUp } from 'lucide-react';

const AIPredictionCard = ({predictions, onRefresh}) => {
    const[refreshing, setRefreshing] = useState(false)

    const handleRefresh = async() => {
        setRefreshing(true)
        await onRefresh()
        setTimeout(() => setRefreshing(false),1000)

    }

    return (
        <>
        </>
    )
}