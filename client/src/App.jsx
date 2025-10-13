import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './styles/globals.css';
import Dashboard from './components/dashboard/Dashboard';
import LeaguesDashboard from './components/leagues/LeagueDashboard';
import LeagueDetail from './components/leagues/LeagueDetails';

function App() {
    console.log('App component rendering');
  return (
    
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
            path="/"
            element={
              <ProtectedRoute>
              <Dashboard/>
              </ProtectedRoute>  
            }
            />
              
            <Route 
              path="/leagues" 
              element={
                <ProtectedRoute>
                  <LeaguesDashboard />
                </ProtectedRoute>
              } 
            /> 

            <Route 
              path="/leagues/:id" 
              element={
                <ProtectedRoute>
                  <LeagueDetail />
                </ProtectedRoute>
              } 
            />
           
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  
    
  )
}

export default App
