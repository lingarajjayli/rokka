import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, ArrowRight, UserPlus } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(`Firebase: Error (${err.code || err.message}).`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-primary-400/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-400/20 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 transition-all duration-500 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-glow mb-6">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand-900 to-brand-600 font-heading tracking-tight mb-2">
            Create Account
          </h2>
          <p className="text-brand-500 font-medium tracking-wide">Join Rokka to simplify your finances</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-100 text-red-600 rounded-2xl text-sm font-medium shadow-sm flex items-start animate-fade-in">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center group disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
              <span className="text-[15px]">{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[15px] text-brand-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
