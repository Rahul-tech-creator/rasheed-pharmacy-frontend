import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload, Clock, ShieldCheck, ArrowRight, Activity,
  Package, MapPin, Phone, Mail, Pill, Search,
  CheckCircle, Truck, ClipboardList, BarChart3, Users
} from 'lucide-react'
import { medicinesApi } from '../../api/pharmacyApi'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } })
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const LandingPage = () => {
  const [featuredMeds, setFeaturedMeds] = useState([])

  useEffect(() => {
    medicinesApi.getAll({ sort_by: 'created_at', order: 'desc' }).then(res => {
      setFeaturedMeds(res.data.slice(0, 6))
    }).catch(() => {})
  }, [])

  return (
    <div className="landing-page">
      {/* ===== HERO ===== */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(180deg, var(--primary-50) 0%, var(--background) 100%)',
      }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--primary-light)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary-dark)',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}>
            <ShieldCheck size={18} />
            Trusted Healthcare Partner in Vijayawada
          </div>
        </motion.div>

        <motion.h1
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            maxWidth: '800px',
            marginInline: 'auto',
          }}
        >
          Your Health, Our Priority.{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Reliable Pharmacy Services.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-muted)',
            maxWidth: '600px',
            marginInline: 'auto',
            marginBottom: '2.5rem',
          }}
        >
          Upload prescriptions, track preparation status, book pickup slots, and check medicine
          availability — all from your phone or computer.
        </motion.p>

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}
        >
          <Link to="/customer" className="btn btn-primary btn-lg">
            Upload Prescription <ArrowRight size={20} />
          </Link>
          <a href="#services" className="btn btn-outline btn-lg">
            Explore Services
          </a>
        </motion.div>
      </section>

      {/* ===== TRUST STATS ===== */}
      <section className="container" style={{ marginTop: '-2rem', marginBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            { icon: Activity, label: 'Real-time Status', desc: 'Track your prescription preparation live', color: 'var(--primary)' },
            { icon: Clock, label: 'No Waiting Lines', desc: 'Schedule pickup slots — collect in minutes', color: 'var(--accent)' },
            { icon: Package, label: 'Full Inventory', desc: 'Search medicines and check availability instantly', color: 'var(--secondary)' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="card"
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp} custom={i}
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{
                width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)',
                background: `${item.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', color: item.color,
              }}>
                <item.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.label}</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How It Works</h2>
          <p className="text-muted">Three simple steps to skip the queue</p>
        </motion.div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={staggerContainer}
          style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}>
          {[
            { step: '01', icon: Upload, title: 'Upload Prescription', desc: 'Take a photo or upload your prescription file securely.' },
            { step: '02', icon: ClipboardList, title: 'We Prepare It', desc: 'Our pharmacist reviews and prepares your medicines. Track status live.' },
            { step: '03', icon: Truck, title: 'Pick Up', desc: 'Book a time slot and collect your order — no waiting in line.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp} custom={i}
              style={{
                position: 'relative',
                padding: '2rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--primary-light)',
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
              }}>
                {item.step}
              </div>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <item.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="container" style={{ padding: '4rem 1.5rem' }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Our Services</h2>
          <p className="text-muted">Comprehensive pharmacy care for you and your family</p>
        </motion.div>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={staggerContainer}
          style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            { icon: Upload, title: 'Prescription Handling', desc: 'Secure digital prescription upload with real-time status tracking', color: 'var(--primary)' },
            { icon: Search, title: 'Medicine Availability', desc: 'Check if your medicine is in stock before visiting', color: 'var(--info)' },
            { icon: Clock, title: 'Pickup Scheduling', desc: 'Book convenient time slots — no more waiting in queues', color: 'var(--accent)' },
            { icon: Pill, title: 'OTC Sales', desc: 'Wide range of over-the-counter medicines and health products', color: 'var(--secondary)' },
            { icon: BarChart3, title: 'Smart Inventory', desc: 'Digital stock management with expiry tracking and alerts', color: 'var(--warning)' },
            { icon: Users, title: 'Health Advice', desc: 'Expert guidance from experienced pharmacists on site', color: '#8b5cf6' },
          ].map((service, i) => (
            <motion.div
              key={service.title}
              className="card"
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp} custom={i}
              style={{ padding: '1.5rem' }}
            >
              <div style={{
                width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
                background: `${service.color}15`, color: service.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <service.icon size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.375rem' }}>{service.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.8125rem' }}>{service.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== LIVE INVENTORY PREVIEW ===== */}
      {featuredMeds.length > 0 && (
        <section className="container" style={{ padding: '4rem 1.5rem' }}>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Medicine Availability</h2>
            <p className="text-muted">Live stock status from our inventory</p>
          </motion.div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={staggerContainer}
            style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {featuredMeds.map((med, i) => {
              const isLow = med.stock > 0 && med.stock <= 10
              const isOut = med.stock === 0
              return (
                <motion.div
                  key={med.id}
                  className="card"
                  initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }}
                  variants={fadeUp} custom={i * 0.5}
                  style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{med.name}</h4>
                    <p className="text-muted" style={{ fontSize: '0.8125rem' }}>₹{med.price} · {med.category}</p>
                  </div>
                  <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                    {isOut ? 'Out of Stock' : isLow ? `Low: ${med.stock}` : 'In Stock'}
                  </span>
                </motion.div>
              )
            })}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/customer" className="btn btn-outline">
              Search All Medicines <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ===== LOCATION & TRUST ===== */}
      <section className="container" style={{ padding: '4rem 1.5rem 5rem' }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeUp}
          className="card" style={{
          padding: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--surface) 100%)',
          border: '1px solid var(--primary-light)',
        }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>
              <MapPin size={14} /> Local Pharmacy
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Visit Us in Vijayawada</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Rasheed Pharmacy has been serving the Vijayawada community for years —
              providing personalized health advice, authentic medicines, and reliable service.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { icon: MapPin, text: 'GJC8+JM8, Islampet, Vijayawada, Andhra Pradesh 520001' },
                { icon: Phone, text: '+91 98765 43210' },
                { icon: Mail, text: 'care@rasheedpharmacy.com' },
                { icon: Clock, text: 'Mon–Sat: 9AM–10PM · Sun: 10AM–6PM' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  <item.icon size={18} className="text-primary" style={{ flexShrink: 0 }} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }} variants={fadeUp} custom={2}
            style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            minHeight: '300px',
            border: '1px solid var(--border)',
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.091543104471!2d80.61412837491433!3d16.521475484225526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35ef00191a3727%3A0x43b3002f46c32f1f!2sRasheed%20pharmacy!5e0!3m2!1sen!2sin!4v1773416545508!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '300px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Rasheed pharmacy, GJC8+JM8, Islampet, Vijayawada"
            />
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default LandingPage
