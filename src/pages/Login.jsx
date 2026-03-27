import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(`Firebase: Error (${err.code || err.message}).`);
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
      setError(`Firebase: Error (${err.code || err.message}).`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-primary-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-emerald-400/20 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 transition-all duration-500 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-glow mb-6">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-900 to-brand-600 font-heading tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-brand-500 font-medium tracking-wide">Enter your details to access your dashboard</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-100 text-red-600 rounded-2xl text-sm font-medium shadow-sm flex items-start animate-fade-in">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end mt-1">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors mr-1"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center group disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
              <span className="text-[15px]">{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-200/60"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-brand-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center px-4 py-3.5 border border-brand-200/80 rounded-xl shadow-sm bg-white/60 hover:bg-white text-[15px] font-semibold text-brand-700 hover:shadow-soft transition-all duration-300 group"
          >
            <img className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-[15px] text-brand-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
