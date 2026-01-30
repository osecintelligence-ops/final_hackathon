import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { getUserByEmail } from '../services/firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate Network
    await new Promise(r => setTimeout(r, 800));
    
    try {
        // Attempt to find user by email in our DB (Mock or Firebase)
        const user = await getUserByEmail(email);

        if (user) {
            localStorage.setItem('optima_user_id', user.id);
            navigate('/dashboard');
        } else {
            setError("No account found with this email. Please Sign Up.");
        }
    } catch (err) {
        console.error(err);
        setError("Login failed due to technical error.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-teal-600 p-2 rounded-xl mb-4 shadow-lg shadow-teal-600/20">
                <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500">Login to your HealthIQure account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 transition-all"
                        placeholder="name@example.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                        type="password" 
                        defaultValue=""
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900 transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
                {loading ? 'Verifying...' : 'Sign In'} <ArrowRight size={18} />
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
            Don't have a policy? <a href="#/signup" className="text-teal-600 font-bold hover:underline">Get a Quote</a>
        </div>
      </div>
    </div>
  );
};

export default Login;