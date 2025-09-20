import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useAuth()

    if(!isAuthenticated) {
        return <AuthModal isOpen={true} onClose={() => {}}/>
    }

    return children 

}

export default ProtectedRoute;