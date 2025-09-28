import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './styles/globals.css';
import Dashboard from './components/dashboard/Dashboard';

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
              {/* 
            <Route 
              path="/leagues" 
              element={
                <ProtectedRoute>
                  <LeaguesDashboard />
                </ProtectedRoute>
              } 
            /> 
            */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  
    
  )
}

export default App
