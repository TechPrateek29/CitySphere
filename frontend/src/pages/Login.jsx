import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Hexagon, ArrowRight, User, ShieldCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const { login, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginType, setLoginType] = useState('citizen'); // citizen, field_staff, admin
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { sendPasswordResetEmail } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, loginType);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
     e.preventDefault();
     setResetLoading(true);
     try {
        await sendPasswordResetEmail(resetEmail);
        alert('Password reset link sent! Please check your email inbox.');
        setShowForgotModal(false);
        setResetEmail('');
     } catch (err) {
        alert(err.message || 'Failed to send reset link.');
     } finally {
        setResetLoading(false);
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-inter selection:bg-indigo-500 selection:text-white px-4">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="w-full max-w-[480px] relative z-10 animate-fade-in">
        
        <div className="text-center mb-8">
           <Link to="/public" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all mb-6">
              <Hexagon size={36} />
           </Link>
           <h1 className="text-4xl font-extrabold text-slate-900 font-outfit tracking-tight mb-3">Welcome Back</h1>
           <p className="text-slate-500 font-medium tracking-wide">Select your portal and sign in to continue.</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500"></div>
          
          {/* Login Type Toggle */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200 shadow-inner">
            <button
               type="button"
               onClick={() => setLoginType('citizen')}
               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${loginType === 'citizen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <User size={16} /> <span>Citizen</span>
            </button>
            <button
               type="button"
               onClick={() => setLoginType('field_staff')}
               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${loginType === 'field_staff' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <Briefcase size={16} /> <span>Staff</span>
            </button>
            <button
               type="button"
               onClick={() => setLoginType('admin')}
               className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${loginType === 'admin' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <ShieldCheck size={16} /> <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium p-4 rounded-xl mb-6 border border-red-100 flex items-center shadow-sm">
               <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-white/70 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginType === 'citizen' ? 'citizen@citysphere.com' : loginType === 'field_staff' ? 'staff@region.gov' : 'admin@citysphere.gov'}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase">Password</label>
                 <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition">Forgot password?</button>
              </div>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-white/70 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <button 
               type="submit" 
               disabled={loading}
               className={`group w-full text-white font-bold p-4 mt-2 rounded-xl transition-all shadow-lg flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                 loginType === 'admin' ? 'bg-gradient-to-r from-pink-600 to-rose-500 hover:shadow-pink-500/30' :
                 loginType === 'field_staff' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/30' :
                 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-500/30'
               }`}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${loginType === 'field_staff' ? 'Staff' : loginType.charAt(0).toUpperCase() + loginType.slice(1)}`}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to CitySphere? <Link to="/register" className="text-emerald-600 font-bold hover:underline ml-1">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 border border-white/20 animate-slide-up relative">
               <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition">✕</button>
               <h3 className="text-2xl font-extrabold text-slate-800 font-outfit mb-2">Reset Password</h3>
               <p className="text-slate-500 text-sm mb-6">Enter your email address and we'll secretly route a recovery link directly to your inbox so you can securely regain access.</p>
               
               <form onSubmit={handleForgotSubmit}>
                  <input type="email" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-medium text-slate-800 mb-4 transition" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Enter your registered email" />
                  <button type="submit" disabled={resetLoading} className="group w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold p-4 mt-8 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed">
                     {resetLoading ? 'Authorizing Dispatch...' : 'Send Secure Reset Link'}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default Login;
