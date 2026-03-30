import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, ArrowRight, User, Briefcase, FileUp } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', aadhar: '' });
  const [files, setFiles] = useState({ aadharPhoto: null, passportPhoto: null, citizenshipProof: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerType, setRegisterType] = useState('citizen');

  const handleFileUpload = async (file, bucket, prefix) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}_${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (registerType === 'field_staff' && (!files.aadharPhoto || !files.passportPhoto || !files.citizenshipProof)) {
         throw new Error("All verification documents are required for Staff Applications.");
      }

      const role = registerType === 'field_staff' ? 'pending_staff' : 'citizen';
      const { user, session } = await register({ ...formData, role });
      
      // If Email Confirmations are enabled in Supabase, session will be null
      if (!session) {
         alert("Registration successful! Please check your email inbox for a confirmation link to activate your account. You will not be able to log in until you verify your email address.");
         navigate('/login');
         return;
      }
      
      if (registerType === 'field_staff' && user) {
         // Upload files
         const aadharUrl = await handleFileUpload(files.aadharPhoto, 'staff_applications', `aadhar_${user.id}`);
         const passportUrl = await handleFileUpload(files.passportPhoto, 'staff_applications', `passport_${user.id}`);
         const citUrl = await handleFileUpload(files.citizenshipProof, 'staff_applications', `citizenship_${user.id}`);

         await supabase.from('profiles').update({
            phone_number: formData.phone,
            aadhar_number: formData.aadhar,
            aadhar_photo_url: aadharUrl,
            passport_photo_url: passportUrl,
            citizenship_proof_url: citUrl
         }).eq('id', user.id);

         alert("Application submitted! An Administrator must review your KYC documents before you can access the Staff Dashboard. Our team will notify you via email.");
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
     setFiles({ ...files, [fieldName]: e.target.files[0] });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-inter selection:bg-indigo-500 selection:text-white px-4 py-12">
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none"></div>
      
      <div className="w-full max-w-[540px] relative z-10 animate-fade-in">
        
        <div className="text-center mb-8">
           <Link to="/public" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all mb-6">
              <Hexagon size={36} />
           </Link>
           <h1 className="text-4xl font-extrabold text-slate-900 font-outfit tracking-tight mb-3">Join CitySphere</h1>
           <p className="text-slate-500 font-medium">{registerType === 'citizen' ? 'Create your citizen account' : 'Apply for a verified field staff position'}</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500"></div>
          
          <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200 shadow-inner">
            <button type="button" onClick={() => setRegisterType('citizen')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${registerType === 'citizen' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
               <User size={16} /> <span>Citizen</span>
            </button>
            <button type="button" onClick={() => setRegisterType('field_staff')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${registerType === 'field_staff' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
               <Briefcase size={16} /> <span>Apply as Staff</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium p-4 rounded-xl mb-6 border border-red-100 shadow-sm flex items-center">
               <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                <input type="text" required className="w-full p-3.5 bg-white/70 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe"/>
              </div>
              <div>
                <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                <input type="email" required className="w-full p-3.5 bg-white/70 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com"/>
              </div>
            </div>

            {registerType === 'field_staff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div>
                  <label className="block tracking-wide text-xs font-bold text-purple-700 uppercase mb-2">Phone Number</label>
                  <input type="tel" required className="w-full p-3.5 bg-white border border-purple-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-medium text-slate-800" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210"/>
                </div>
                <div>
                  <label className="block tracking-wide text-xs font-bold text-purple-700 uppercase mb-2">Aadhar Number</label>
                  <input type="text" required className="w-full p-3.5 bg-white border border-purple-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 font-medium text-slate-800" value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} placeholder="XXXX XXXX XXXX"/>
                </div>
                <div className="md:col-span-2 space-y-4 pt-2">
                   <label className="block tracking-wide text-xs font-bold text-purple-700 uppercase border-b border-purple-200 pb-2">KYC Document Uploads</label>
                   <div className="flex items-center space-x-3">
                      <FileUp size={20} className="text-purple-500" />
                      <input type="file" required accept="image/*,.pdf" className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition-colors w-full" onChange={(e) => handleFileChange(e, 'aadharPhoto')}/>
                      <span className="text-xs text-slate-400 w-32">Aadhar Card</span>
                   </div>
                   <div className="flex items-center space-x-3">
                      <FileUp size={20} className="text-purple-500" />
                      <input type="file" required accept="image/*" className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition-colors w-full" onChange={(e) => handleFileChange(e, 'passportPhoto')}/>
                      <span className="text-xs text-slate-400 w-32">Passport Photo</span>
                   </div>
                   <div className="flex items-center space-x-3">
                      <FileUp size={20} className="text-purple-500" />
                      <input type="file" required accept="image/*,.pdf" className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition-colors w-full" onChange={(e) => handleFileChange(e, 'citizenshipProof')}/>
                      <span className="text-xs text-slate-400 w-32">Citizenship Proof</span>
                   </div>
                </div>
              </div>
            )}

            <div>
              <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
              <input type="password" required className="w-full p-3.5 bg-white/70 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••"/>
            </div>
            
            <button type="submit" disabled={loading} className={`group w-full text-white font-bold p-4 mt-6 rounded-xl transition-all shadow-lg flex justify-center items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed ${registerType === 'field_staff' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-emerald-500/30' : 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-500/30'}`}>
              <span>{loading ? 'Processing...' : registerType === 'field_staff' ? 'Submit Staff Application' : 'Register as Citizen'}</span>
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already a member? <Link to="/login" className="text-emerald-600 font-bold hover:underline ml-1">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
