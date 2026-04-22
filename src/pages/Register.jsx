import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const ERROR_MAP = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
};

const friendlyError = (code) => ERROR_MAP[code] || 'Something went wrong. Please try again.';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!phone.trim()) { setError('Please enter your mobile number.'); return; }
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      localStorage.setItem(`rokka_phone_${cred.user.uid}`, phone.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-primary-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-400/20 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-glow mb-6">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-900 to-brand-600 font-heading tracking-tight mb-2">
            Create Account
          </h2>
          <p className="text-brand-500 font-medium tracking-wide">Join Rokka to simplify your finances</p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
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
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                className="input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <p className="text-[11px] text-brand-400 mt-1.5 ml-1">Include country code — e.g. +91 for India, +1 for US</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  className="input pr-11"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center group disabled:opacity-70"
            >
              <span className="text-[15px]">{loading ? 'Creating Account…' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-all" />}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[15px] text-brand-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
