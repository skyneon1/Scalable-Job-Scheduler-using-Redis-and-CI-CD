import React from 'react';

interface Props {
    onNav: (page: 'dashboard' | 'docs') => void;
    currentPage: 'dashboard' | 'docs';
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Navbar: React.FC<Props> = ({ onNav, currentPage, theme, toggleTheme }) => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border)',
            marginBottom: '2rem',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.3s'
        }}>
            <div
                style={{ fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => onNav('dashboard')}
            >
                🚀 <span style={{ color: 'var(--text-primary)' }}>Redis Scheduler</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                    onClick={() => onNav('dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: currentPage === 'dashboard' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: currentPage === 'dashboard' ? 'bold' : 'normal',
                        fontSize: '1rem'
                    }}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => onNav('docs')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: currentPage === 'docs' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: currentPage === 'docs' ? 'bold' : 'normal',
                        fontSize: '1rem'
                    }}
                >
                    Docs 📚
                </button>

                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>

                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.4rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                        minWidth: '40px'
                    }}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
