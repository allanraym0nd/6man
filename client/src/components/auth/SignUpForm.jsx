import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const SignupForm = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false)
  const [validationErrors,setValidationErrors] = useState({})

    
  const { signup, loading, error, clearError } = useAuth();

  const validateForm = () => {
    const errors = {}

    if(!formData.firstName.trim()) errors.firstName = 'First name is required'
    if(!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if(!formData.email.trim()) errors.email = 'Email is required';
    if(!formData.password) errors.password = 'Password is required';
    if(formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if(formData.password !== formData.confirmPassword) { 
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors; 

  }

  const handleChange = () => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))

    if(validationErrors[name]) {
        setValidationErrors(prev => ({...prev, [name]: ''}))
    }
      if (error) clearError();
  }

  const handleSubmit = async(e) => {
    e.preventDefault()

    const errors = validateForm()
    if(Object.keys(errors).length > 0){
        setValidationErrors(errors)
        return;
    }

    const signUpData = {
      username: `${formData.firstName} ${formData.lastName}`, 
      email: formData.email,
      password: formData.password

    }

    const result = await signup(signUpData)
    if(resultSuccess && onClose)
        onClose()

  }

  return (
    <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #00d4aa 0%, #0099ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Join StatCast AI
        </h2>
        <p style={{ color: '#a0aec0', fontSize: '16px' }}>
          Create your account to start predicting
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#e2e8f0', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              First Name
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280' 
                }} 
              />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                required
              />
            </div>
            {validationErrors.firstName && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.firstName}
              </div>
            )}
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#e2e8f0', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="form-input"
              style={{ width: '100%' }}
              required
            />
            {validationErrors.lastName && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.lastName}
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#e2e8f0', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#6b7280' 
              }} 
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-input"
              style={{ paddingLeft: '40px', width: '100%' }}
              required
            />
          </div>
          {validationErrors.email && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {validationErrors.email}
            </div>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#e2e8f0', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#6b7280' 
              }} 
            />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.password && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {validationErrors.password}
            </div>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#e2e8f0', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#6b7280' 
              }} 
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {validationErrors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ 
            width: '100%', 
            padding: '14px',
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '8px'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ color: '#a0aec0', fontSize: '14px' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4aa',
              cursor: 'pointer',
              fontWeight: '500',
              textDecoration: 'underline'
            }}
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;