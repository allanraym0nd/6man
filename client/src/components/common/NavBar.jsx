// src/components/common/Navbar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            background: 'rgba(26, 31, 58, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '16px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo/Brand */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}
                    onClick={() => navigate('/')}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        🏀
                    </div>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#ffffff'
                    }}>
                        StatCast AI
                    </span>
                </div>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: isActive('/') && !isActive('/leagues')
                                ? 'rgba(0, 212, 170, 0.2)'
                                : 'transparent',
                            border: isActive('/') && !isActive('/leagues')
                                ? '1px solid rgba(0, 212, 170, 0.4)'
                                : '1px solid transparent',
                            borderRadius: '10px',
                            color: isActive('/') && !isActive('/leagues') ? '#00d4aa' : '#94a3b8',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive('/') || isActive('/leagues')) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.color = '#e2e8f0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive('/') || isActive('/leagues')) {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#94a3b8';
                            }
                        }}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/leagues')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: isActive('/leagues')
                                ? 'rgba(0, 212, 170, 0.2)'
                                : 'transparent',
                            border: isActive('/leagues')
                                ? '1px solid rgba(0, 212, 170, 0.4)'
                                : '1px solid transparent',
                            borderRadius: '10px',
                            color: isActive('/leagues') ? '#00d4aa' : '#94a3b8',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive('/leagues')) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.color = '#e2e8f0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive('/leagues')) {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#94a3b8';
                            }
                        }}
                    >
                        <Trophy size={18} />
                        Leagues
                    </button>
                </div>

                {/* User Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #00d4aa, #0099ff)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            color: '#ffffff',
                            fontSize: '14px'
                        }}>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span style={{
                            color: '#e2e8f0',
                            fontSize: '15px',
                            fontWeight: '600'
                        }}>
                            {user?.username || 'User'}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;