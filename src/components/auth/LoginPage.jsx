import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Pill, Phone, ShieldCheck, ArrowRight, ArrowLeft, User, Loader } from 'lucide-react';

const LoginPage = () => {
  const { sendOtp, verifyOtp, isAuthenticated, isOwner, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);
  const from = location.state?.from || null;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (isOwner) navigate('/owner', { replace: true });
      else navigate('/customer', { replace: true });
    }
  }, [isAuthenticated, isOwner, navigate]);

  // OTP countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setLocalError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendOtp(cleanPhone, name);
      if (result.dev_otp) {
        setDevOtp(result.dev_otp);
      }
      setStep('otp');
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit when all filled
    if (newOtp.every(d => d !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      const newOtp = text.split('');
      setOtp(newOtp);
      handleVerifyOtp(text);
    }
  };

  const handleVerifyOtp = async (otpString) => {
    setLocalError('');
    clearError();
    setSubmitting(true);
    const cleanPhone = phone.replace(/\D/g, '');
    try {
      const result = await verifyOtp(cleanPhone, otpString, name);
      // Redirect based on role
      if (result.user.role === 'owner') {
        navigate(from === '/owner' ? '/owner' : '/owner', { replace: true });
      } else {
        navigate(from || '/customer', { replace: true });
      }
    } catch (err) {
      setLocalError(err.message);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLocalError('');
    clearError();
    setSubmitting(true);
    const cleanPhone = phone.replace(/\D/g, '');
    try {
      const result = await sendOtp(cleanPhone, name);
      if (result.dev_otp) setDevOtp(result.dev_otp);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-container">
        <div className="login-card glass-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Pill size={28} />
            </div>
            <h1>Rasheed Pharmacy</h1>
            <p className="text-muted">Vijayawada's Trusted Pharmacy</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="login-form">
              <h2>Welcome Back</h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                Enter your phone number to continue
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="login-name">
                  <User size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  Your Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mohammed Rasheed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
                <span className="form-hint">Optional — shown on prescriptions</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-phone">
                  <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  Phone Number
                </label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+91</span>
                  <input
                    id="login-phone"
                    type="tel"
                    className="form-input phone-input"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    autoComplete="tel"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {displayError && (
                <div className="alert alert-error">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={submitting || phone.replace(/\D/g, '').length < 10}
              >
                {submitting ? (
                  <><Loader size={18} className="spin-icon" /> Sending OTP...</>
                ) : (
                  <>Send OTP <ArrowRight size={18} /></>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/" className="text-muted" style={{ fontSize: '0.875rem' }}>
                  <ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  Back to Home
                </Link>
              </div>
            </form>
          ) : (
            <div className="login-form">
              <h2>Verify OTP</h2>
              <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
                Enter the 6-digit code sent to
              </p>
              <p style={{ fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>
                +91 {phone}
              </p>

              {/* Dev OTP hint */}
              {devOtp && (
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  <ShieldCheck size={16} />
                  <span>Dev Mode — OTP: <strong>{devOtp}</strong></span>
                </div>
              )}

              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {displayError && (
                <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                  {displayError}
                </div>
              )}

              {submitting && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--primary)' }}>
                  <Loader size={16} className="spin-icon" /> Verifying...
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || submitting}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setDevOtp(''); setLocalError(''); clearError(); }}
                  style={{ fontSize: '0.875rem' }}
                >
                  <ArrowLeft size={14} /> Change Number
                </button>
              </div>
            </div>
          )}

          <div className="login-footer">
            <ShieldCheck size={14} />
            <span>Secured with OTP verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
