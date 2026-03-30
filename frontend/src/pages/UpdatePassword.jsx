import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const UpdatePassword = () => {
  const { updatePassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      alert('Password has been successfully updated! You can now access your dashboard.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-inter p-4">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-xl mb-6">
              <ShieldCheck size={36} />
           </div>
           <h1 className="text-3xl font-extrabold text-slate-900 font-outfit mb-2">Create New Password</h1>
           <p className="text-slate-500">Your identity has been verified. Please choose a strong, new password below.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl mb-6 border border-red-100 flex items-center">
               <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
              <input type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-800" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <div>
              <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Confirm Password</label>
              <input type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium text-slate-800" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            
            <button type="submit" disabled={loading} className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 flex justify-center items-center space-x-2 mt-4 disabled:opacity-70">
              <span>{loading ? 'Updating...' : 'Secure & Update Password'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
