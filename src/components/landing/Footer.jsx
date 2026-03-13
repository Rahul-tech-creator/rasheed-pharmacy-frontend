import React from 'react'
import { Link } from 'react-router-dom'
import { Pill, MapPin, Phone, Mail, Clock } from 'lucide-react'

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '4rem 0 2rem',
      marginTop: '0',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--primary-light)',
          }}>
            <Pill size={24} />
            Rasheed Pharmacy
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Trusted local pharmacy in Vijayawada providing authentic medicines,
            digital prescription handling, and professional healthcare services.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.9375rem' }}>Quick Links</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { path: '/', label: 'Home' },
              { path: '/customer', label: 'Customer Portal' },
              { path: '/owner', label: 'Owner Dashboard' },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path} style={{ color: '#94a3b8', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.9375rem' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { icon: MapPin, text: 'GJC8+JM8, Islampet, Vijayawada, Andhra Pradesh 520001' },
              { icon: Phone, text: '+91 98765 43210' },
              { icon: Mail, text: 'care@rasheedpharmacy.com' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <item.icon size={14} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.9375rem' }}>Working Hours</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} style={{ color: 'var(--primary)' }} />
              Mon – Sat: 9:00 AM – 10:00 PM
            </div>
            <div style={{ paddingLeft: '1.375rem' }}>Sunday: 10:00 AM – 6:00 PM</div>
            <div style={{ paddingLeft: '1.375rem', color: 'var(--secondary)' }}>Emergency: 24/7</div>
          </div>
        </div>
      </div>

      <div className="container" style={{
        paddingTop: '1.5rem',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        color: '#475569',
        fontSize: '0.8125rem',
      }}>
        © {new Date().getFullYear()} Rasheed Pharmacy. All rights reserved. Locally operated in Vijayawada, Andhra Pradesh.
      </div>
    </footer>
  )
}

export default Footer
