import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignUpForm';

const AuthModal = () => {
    const [currentForm,setCurrentForm] = useState('login')

    if(!isOpen) return null

    return (
         <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={16} />
        </button>


        {currentForm === 'login' ? (
            <LoginForm 
            onSwitchToSignUp ={() => setCurrentForm('signup')}
            onClose={onClose}
            />

        ) : (
            <SignupForm 
            onSwitchToLogin={() => setCurrentForm('login')}
            onClose={onClose}
            />
        )}
    </div>
    </div>
    )
}

export default AuthModal;