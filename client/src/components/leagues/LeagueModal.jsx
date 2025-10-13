// src/components/leagues/CreateLeagueModal.jsx
import React, { useState } from 'react';
import { X, Lock, Globe } from 'lucide-react';
import { apiService } from '../../services/api';

const CreateLeagueModal = ({ isOpen, onClose, onLeagueCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    maxMembers: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('League name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const leagueData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        rules: {
          scoringSystem: 'standard',
          predictionDeadline: 30
        }
      };

      if (formData.maxMembers) {
        leagueData.maxMembers = parseInt(formData.maxMembers);
      }

      const response = await apiService.createCompetition(leagueData);
      console.log('API response:', response.data);
      onLeagueCreated(response.data.league);
      onClose();
      
      setFormData({ name: '', description: '', type: 'public', maxMembers: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          <X size={16} />
        </button>

        <h2 className="modal-title">Create New League</h2>
        <p className="modal-subtitle">
          Start your own prediction league and compete with friends
        </p>

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
          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              League Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter league name"
              className="form-input"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your league..."
              rows="3"
              className="form-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '12px'
            }}>
              League Type *
            </label>
            <div className="league-type-selector">
              <div
                className={`league-type-option ${formData.type === 'public' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'public' }))}
              >
                <div className="league-type-icon">
                  <Globe size={20} />
                </div>
                <div className="league-type-title">Public</div>
                <div className="league-type-description">Anyone can join</div>
              </div>

              <div
                className={`league-type-option ${formData.type === 'private' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'private' }))}
              >
                <div className="league-type-icon">
                  <Lock size={20} />
                </div>
                <div className="league-type-title">Private</div>
                <div className="league-type-description">Invite only</div>
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Max Members (Optional)
            </label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              placeholder="No limit"
              min="2"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating League...' : 'Create League'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueModal;