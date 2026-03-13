import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Pill, Menu, X, LogOut, User, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, isOwner, user, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

    const handleLogout = async () => {
        await logout()
        navigate('/')
        setMenuOpen(false)
    }

    const navLinks = [
        { path: '/', label: 'Home' },
    ]

    if (isAuthenticated) {
        navLinks.push({ path: '/customer', label: 'My Dashboard' })
        if (isOwner) {
            navLinks.push({ path: '/owner', label: 'Owner Panel' })
        }
    }

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'var(--transition-slow)',
            padding: '0 1.5rem',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '70px',
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--primary)',
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    <div style={{
                        background: 'var(--primary)',
                        color: 'white',
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Pill size={20} />
                    </div>
                    Rasheed Pharmacy
                </Link>

                {/* Desktop Nav */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                }} className="desktop-nav">
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 500,
                                    fontSize: '0.9375rem',
                                    color: isActive(link.path) ? 'var(--primary-dark)' : 'var(--text-muted)',
                                    background: isActive(link.path) ? 'var(--primary-light)' : 'transparent',
                                    transition: 'var(--transition)',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                background: isOwner ? 'var(--accent-light)' : 'var(--primary-light)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: isOwner ? 'var(--warning)' : 'var(--primary-dark)',
                            }}>
                                {isOwner ? <Shield size={14} /> : <User size={14} />}
                                {user?.name || user?.phone}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-ghost btn-sm"
                                style={{ gap: '0.375rem' }}
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'none',
                        padding: '0.5rem',
                        background: 'transparent',
                        color: 'var(--text-main)',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    className="mobile-menu-btn"
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    background: 'var(--surface)',
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }} className="mobile-menu">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 500,
                                color: isActive(link.path) ? 'var(--primary-dark)' : 'var(--text-secondary)',
                                background: isActive(link.path) ? 'var(--primary-light)' : 'transparent',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <>
                            <div style={{
                                padding: '0.75rem 1rem',
                                fontSize: '0.8125rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}>
                                {isOwner ? <Shield size={14} /> : <User size={14} />}
                                {user?.name || user?.phone}
                                <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                                    {isOwner ? 'Owner' : 'Customer'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 500,
                                    color: 'var(--danger)',
                                    background: 'var(--danger-light)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem' }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: block !important; }
                }
                @media (min-width: 769px) {
                    .mobile-menu { display: none !important; }
                }
            `}</style>
        </nav>
    )
}

export default Navbar
