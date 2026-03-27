import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent! Please check your inbox.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
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
            Reset Password
          </h2>
          <p className="text-brand-500 font-medium tracking-wide">Enter your email and we'll send you a reset link</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-100 text-red-600 rounded-2xl text-sm font-medium shadow-sm animate-fade-in">
              {error}
            </div>
          )}

          {message ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="mb-6 p-4 bg-emerald-50/80 backdrop-blur border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium shadow-sm">
                {message}
              </div>
              <Link to="/login" className="btn-primary w-full py-3.5 flex items-center justify-center">
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
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
              
              <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center group disabled:opacity-70">
                <span className="text-[15px]">{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-[15px] text-brand-500 font-bold hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
            </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
