import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { PlusCircle, FileText, CreditCard, Upload, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '', department: 'General', file: null });

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Feedback states
  const [feedbackState, setFeedbackState] = useState({ complaintId: null, rating: 5, text: '' });

  // Payment states
  const [checkoutBill, setCheckoutBill] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    fetchData();

    // Load PayPal SDK for Dashboard quick payments
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=INR';
    script.addEventListener('load', () => setPaypalLoaded(true));
    document.body.appendChild(script);

    return () => {
       document.body.removeChild(script);
    };
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const compRes = await supabase.from('complaints').select('*').eq('citizen_id', user.id).order('created_at', { ascending: false });
      let billsRes = await supabase.from('bills').select('*').eq('citizen_id', user.id).order('created_at', { ascending: false });
      
      if (compRes.data) setComplaints(compRes.data);
      if (billsRes.data) {
         if (billsRes.data.length === 0) {
            // Auto-generate a test bill for the citizen to allow testing the PayPal Gateway!
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 14); // Due in 14 days
            await supabase.from('bills').insert([{
               citizen_id: user.id,
               title: 'Welcome Tax Assessment',
               type: 'Water',
               amount: 145.50,
               status: 'unpaid',
               due_date: futureDate.toISOString().split('T')[0]
            }]);
            billsRes = await supabase.from('bills').select('*').eq('citizen_id', user.id).order('created_at', { ascending: false });
         }
         setBills(billsRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let mediaUrl = null;
      if (newComplaint.file) {
        const fileExt = newComplaint.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('media').upload(`complaints/${fileName}`, newComplaint.file);
        if (!error && data) {
          mediaUrl = supabase.storage.from('media').getPublicUrl(`complaints/${fileName}`).data.publicUrl;
        }
      }

      // Smart Priority Algorithm
      const criticalKeywords = ['emergency', 'urgent', 'fire', 'leak', 'accident', 'dangerous', 'hazard', 'blood', 'explosion', 'wire', 'fatal', 'sewage', 'outage', 'collapse', 'death'];
      const textToAnalyze = `${newComplaint.title} ${newComplaint.description}`.toLowerCase();
      const isCritical = criticalKeywords.some(kw => textToAnalyze.includes(kw));
      const finalTitle = isCritical && !newComplaint.title.includes('[URGENT]') 
            ? `🚨 [URGENT] ${newComplaint.title}` 
            : newComplaint.title;

      await supabase.from('complaints').insert([{
        title: finalTitle,
        description: newComplaint.description,
        department: newComplaint.department,
        citizen_id: user.id,
        media_urls: mediaUrl ? [mediaUrl] : [],
        location_lat: 0.0,
        location_lng: 0.0
      }]);
      setNewComplaint({ title: '', description: '', department: 'General', file: null });
      fetchData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const submitFeedback = async (e, id) => {
    e.preventDefault();
    try {
      await supabase.from('complaints').update({ 
        rating: feedbackState.rating, 
        feedback: feedbackState.text 
      }).eq('id', id);
      setFeedbackState({ complaintId: null, rating: 5, text: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
     if (checkoutBill && paypalLoaded && window.paypal) {
        const container = document.getElementById('paypal-button-container-dashboard');
        if (container) container.innerHTML = '';

        window.paypal.Buttons({
           createOrder: (data, actions) => {
              return actions.order.create({
                 purchase_units: [{
                    description: `CitySphere: ${checkoutBill.type} Bill`,
                    amount: { value: checkoutBill.amount.toString() }
                 }]
              });
           },
           onApprove: async (data, actions) => {
              const order = await actions.order.capture();
              try {
                 const { error } = await supabase
                    .from('bills')
                    .update({ status: 'paid', transaction_id: order.id, payment_date: new Date().toISOString() })
                    .eq('id', checkoutBill.id);
                 if (error) throw error;
                 
                 setCheckoutBill(null);
                 alert('Payment successful! Your official receipt is available in the My Financials tab.');
                 fetchData();
              } catch (err) {
                 alert('Error processing transaction record.');
              }
           },
           onError: (err) => {
              alert('Payment gateway encountered an error. Please try again.');
           }
        }).render('#paypal-button-container-dashboard');
     }
  }, [checkoutBill, paypalLoaded]);

  const openDeleteModal = () => {
     setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (deleteEmail !== user.email) {
       alert("The email entered does not match your account.");
       return;
    }
    
    setLoading(true);
    try {
      // Verify password by attempting to sign in
      const { error: authError } = await supabase.auth.signInWithPassword({ email: deleteEmail, password: deletePassword });
      if (authError) throw new Error("Incorrect password.");

      const { error: rpcError } = await supabase.rpc('delete_my_account');
      if (rpcError) throw new Error(rpcError.message || "Sever failed to permanently erase data.");
      
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error("Error deleting account", err);
      alert(err.message || 'Failed to delete account securely.');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center border border-white">
          <div className="bg-indigo-100 p-4 rounded-2xl mr-5 shadow-inner">
            <FileText className="text-indigo-600" size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 font-outfit">{complaints.length}</h3>
            <p className="text-slate-500 font-medium text-sm tracking-wide uppercase">Active Complaints</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center border border-white">
          <div className="bg-emerald-100 p-4 rounded-2xl mr-5 shadow-inner">
            <CreditCard className="text-emerald-600" size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 font-outfit">{bills.filter(b => b.status === 'pending').length}</h3>
            <p className="text-slate-500 font-medium text-sm tracking-wide uppercase">Pending Bills</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-indigo-100 opacity-50 transform rotate-12 pointer-events-none">
           <PlusCircle size={200} />
        </div>
        <div className="flex items-center space-x-3 text-indigo-600 mb-6 relative z-10">
           <PlusCircle size={28} />
           <h2 className="text-2xl font-bold font-outfit">File a New Complaint</h2>
        </div>
        <form onSubmit={submitComplaint} className="space-y-5 relative z-10 max-w-2xl">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
             <input 
               type="text" 
               placeholder="Complaint Title (e.g., Pothole on Main St)" 
               className="w-full p-3.5 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
               required 
               value={newComplaint.title}
               onChange={e => setNewComplaint({...newComplaint, title: e.target.value})}
             />
             <select 
                className="w-full p-3.5 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-slate-700"
                value={newComplaint.department}
                onChange={e => setNewComplaint({...newComplaint, department: e.target.value})}
             >
                <option value="General">General Issue</option>
                <option value="Water">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads & Traffic</option>
                <option value="Sanitation">Sanitation</option>
             </select>
          </div>
          <textarea 
            placeholder="Describe the issue in detail..." 
            className="w-full p-4 bg-white/60 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium h-32 resize-none"
            required
            value={newComplaint.description}
            onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
          />
          <div className="flex items-center space-x-4">
             <label className="flex items-center space-x-2 bg-white/80 border border-slate-200 px-5 py-3 rounded-xl cursor-pointer hover:bg-white transition-colors flex-1 shadow-sm group">
                <Upload size={20} className="text-indigo-500 group-hover:-translate-y-1 transition-transform" />
                <span className="text-sm text-slate-600 font-medium truncate">{newComplaint.file ? newComplaint.file.name : 'Attach Photo/Video Proof'}</span>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={e => setNewComplaint({...newComplaint, file: e.target.files[0]})} />
             </label>
             <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all w-48 shadow-md">
                {loading ? 'Submitting...' : t('submit') || 'Submit Issue'}
             </button>
          </div>
        </form>
      </div>

      {/* Pending Bills Section */}
      <div className="glass-card p-8 rounded-3xl border border-white relative overflow-hidden">
        <div className="flex items-center space-x-3 text-emerald-600 mb-6 font-outfit relative z-10">
           <CreditCard size={28} />
           <h2 className="text-2xl font-bold">Action Required: Pending Bills</h2>
        </div>
        
        <div className="space-y-4 relative z-10">
           {bills.filter(b => b.status !== 'paid').length === 0 ? (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center border border-emerald-100 font-bold">
                 You have no pending municipal bills. You're all caught up! 🎉
              </div>
           ) : (
              bills.filter(b => b.status !== 'paid').map(bill => (
                 <div key={bill.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                    <div>
                       <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">{bill.type} Bill</div>
                       <div className="text-3xl font-black font-outfit text-slate-800 leading-tight">₹{Number(bill.amount).toFixed(2)}</div>
                       <div className="text-xs text-amber-600 mt-2 flex items-center font-bold tracking-wide"><AlertTriangle size={12} className="mr-1" /> DUE: {new Date(bill.due_date).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => setCheckoutBill(bill)} className="mt-4 md:mt-0 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:-translate-y-1 transition-transform border border-emerald-400">
                       Pay Now Securely
                    </button>
                 </div>
              ))
           )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-red-100 flex flex-col items-center justify-center text-center pb-8">
         <AlertTriangle className="text-red-400 mb-3" size={32} />
         <h3 className="text-xl font-bold font-outfit text-slate-800 mb-2">Danger Zone</h3>
         <p className="text-sm text-slate-500 max-w-md mb-6">If you no longer wish to use CitySphere, you can permanently erase your account and all associated data from our servers.</p>
         <button onClick={openDeleteModal} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm">
            Erase My Account Instantly
         </button>
      </div>

      {/* Account Deletion Verification Modal */}
      {showDeleteModal && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-red-100 animate-slide-up relative">
               <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition">✕</button>
               
               <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <AlertTriangle size={32} />
               </div>
               
               <h3 className="text-2xl font-extrabold text-slate-800 font-outfit text-center mb-2">Final Verification</h3>
               <p className="text-slate-500 text-sm mb-6 text-center leading-relaxed">
                  To permanently erase your CitySphere account and all filed complaints, please verify your identity by entering your credentials.
               </p>
               
               <form onSubmit={handleConfirmDelete} className="space-y-4">
                  <div>
                     <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Your Email</label>
                     <input type="email" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 font-medium text-slate-800 transition" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} placeholder={user?.email} />
                  </div>
                  <div>
                     <label className="block tracking-wide text-xs font-bold text-slate-500 uppercase mb-2">Your Password</label>
                     <input type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-400/10 font-medium text-slate-800 transition" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  
                  <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-4 mt-2 rounded-xl transition shadow-lg hover:shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
                     {loading ? 'Erasing Account...' : 'Permanently Delete Account'}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* Checkout Modal */}
      {checkoutBill && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center text-slate-800 font-bold font-outfit text-xl">
                     <ShieldCheck size={24} className="text-emerald-500 mr-2" /> Quick Checkout
                  </div>
                  <button onClick={() => setCheckoutBill(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                     <span className="text-emerald-700 font-bold text-sm uppercase tracking-widest block mb-1">Paying</span>
                     <span className="text-4xl font-black font-outfit text-emerald-900">₹{Number(checkoutBill.amount).toFixed(2)}</span>
                     <div className="text-emerald-800 font-medium mt-2">{checkoutBill.type} Bill</div>
                  </div>

                  {!paypalLoaded ? (
                     <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                     </div>
                  ) : (
                     <div id="paypal-button-container-dashboard" className="pt-4 min-h-[150px]"></div>
                  )}

                  <div className="text-center text-xs text-slate-400 flex items-center justify-center mt-4">
                     <ShieldCheck size={14} className="mr-1" /> Payments are encrypted and securely processed by PayPal.
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
