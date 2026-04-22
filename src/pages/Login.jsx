import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const ERROR_MAP = {
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/invalid-phone-number': 'Invalid phone number. Use international format e.g. +91 98765 43210.',
  'auth/missing-phone-number': 'Please enter your phone number.',
  'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
  'auth/invalid-verification-code': 'Incorrect OTP. Please try again.',
  'auth/code-expired': 'OTP has expired. Please request a new one.',
  'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please retry.',
};

const friendlyError = (code) => ERROR_MAP[code] || 'Something went wrong. Please try again.';

function LoginPage() {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const navigate = useNavigate();

  // ── Email state ────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // ── Phone state ────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const verifierRef = useRef(null);
  const timerRef = useRef(null);

  // ── Shared state ───────────────────────────────────────────────
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (verifierRef.current) verifierRef.current.clear();
      clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const resetPhone = () => {
    setOtpSent(false);
    setOtp('');
    setConfirmationResult(null);
    setResendTimer(0);
    clearInterval(timerRef.current);
    if (verifierRef.current) { verifierRef.current.clear(); verifierRef.current = null; }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    resetPhone();
  };

  // ── Handlers ───────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    }
  };

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setError('Please enter your phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, trimmed, verifierRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      startResendTimer();
    } catch (err) {
      setError(friendlyError(err.code));
      if (verifierRef.current) { verifierRef.current.clear(); verifierRef.current = null; }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) { setError('Enter the 6-digit OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-primary-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-emerald-400/20 blur-[100px] pointer-events-none" />

      {/* invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-glow mb-6">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-900 to-brand-600 font-heading tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-brand-500 font-medium tracking-wide">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10">
          {/* Mode toggle */}
          <div className="flex bg-brand-100/60 rounded-2xl p-1 mb-8">
            <button
              onClick={() => switchMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === 'email'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-brand-500 hover:text-brand-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => switchMode('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === 'phone'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-brand-500 hover:text-brand-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              Mobile
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* ── Email form ── */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
                    onClick={() => setShowPw(v => !v)}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center group disabled:opacity-70"
              >
                <span className="text-[15px]">{loading ? 'Signing In…' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-all" />}
              </button>
            </form>
          )}

          {/* ── Phone form ── */}
          {mode === 'phone' && (
            <div className="space-y-5">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        className="input pl-10"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      />
                    </div>
                    <p className="text-[11px] text-brand-400 mt-1.5 ml-1">Include country code — e.g. +91 for India, +1 for US</p>
                  </div>
                  <button
                    disabled={loading || !phone}
                    onClick={handleSendOtp}
                    className="w-full btn-primary py-3.5 flex items-center justify-center group disabled:opacity-70"
                  >
                    <span className="text-[15px]">{loading ? 'Sending OTP…' : 'Send OTP'}</span>
                    {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-all" />}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm">
                    <div>
                      <p className="font-bold text-emerald-700">OTP sent to</p>
                      <p className="text-emerald-600">{phone}</p>
                    </div>
                    <button
                      onClick={resetPhone}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="input text-center text-2xl font-bold tracking-[0.5em] font-heading"
                      placeholder="——————"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                      autoFocus
                    />
                  </div>

                  <button
                    disabled={loading || otp.length < 6}
                    onClick={handleVerifyOtp}
                    className="w-full btn-primary py-3.5 flex items-center justify-center group disabled:opacity-70"
                  >
                    <span className="text-[15px]">{loading ? 'Verifying…' : 'Verify & Sign In'}</span>
                    {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-all" />}
                  </button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-brand-400">Resend OTP in <span className="font-bold text-brand-600">{resendTimer}s</span></p>
                    ) : (
                      <button
                        onClick={() => { resetPhone(); }}
                        className="text-sm font-bold text-primary-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Google */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-200/60" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-brand-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-brand-200/80 rounded-xl shadow-sm bg-white/60 hover:bg-white text-[15px] font-semibold text-brand-700 hover:shadow-soft transition-all group"
          >
            <img className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-[15px] text-brand-500 font-medium">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
