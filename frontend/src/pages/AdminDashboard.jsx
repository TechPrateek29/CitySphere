import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Users, FileText, CreditCard, Activity, Eye, Mail, ShieldCheck, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({ users: 0, complaints: { total: 0, pending: 0 }, bills: { total: 0, unpaid: 0 } });
  const [usersList, setUsersList] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailPreview, setEmailPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        { count: userCount },
        { count: compCount },
        { count: pendingCompCount },
        { count: billCount },
        { count: unpaidBillCount },
        { data: profilesData },
        { data: billsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('*', { count: 'exact', head: true }).eq('status', 'unpaid'),
        supabase.from('profiles').select('*').neq('role', 'citizen').order('created_at', { ascending: false }),
        supabase.from('bills').select('*, profiles:citizen_id(name)').order('created_at', { ascending: false }).limit(5)
      ]);

      setAnalytics({
        users: userCount || 0,
        complaints: { total: compCount || 0, pending: pendingCompCount || 0 },
        bills: { total: billCount || 0, unpaid: unpaidBillCount || 0 }
      });
      if (profilesData) setUsersList(profilesData);
      if (billsData) setRecentBills(billsData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      
      // If promoting to field staff, trigger notification/email
      if (newRole === 'field_staff') {
         await supabase.from('notifications').insert({
            user_id: userId,
            title: 'Staff Application Approved!',
            message: 'Your CitySphere Field Staff application has been fully approved by the Administration. You can now access the Staff Dashboard.',
         });
         
         const userEmail = usersList.find(u => u.id === userId)?.email;
         if (userEmail) {
            try {
               const res = await fetch('http://localhost:5001/api/email/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     to: userEmail,
                     subject: 'Your CitySphere Field Staff Application is Approved!',
                     html: `
                        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                           <h2 style="color: #4f46e5;">Welcome to the Team!</h2>
                           <p>Dear Applicant,</p>
                           <p>We are thrilled to inform you that your KYC documents have been verified and your application for <strong>Field Staff</strong> has been fully approved by the CitySphere Administration.</p>
                           <p>You may now log in to the portal and select "Staff" to access your assigned tasks and dashboard.</p>
                           <br/>
                           <p>Best regards,<br/><strong>CitySphere Admin Team</strong></p>
                        </div>
                     `
                  })
               });
               const data = await res.json();
               if (data.success && data.previewUrl) {
                  // Display link in UI to avoid popup blockers
                  setEmailPreview(data.previewUrl);
               }
            } catch (emailErr) {
               console.error("Failed to send email", emailErr);
            }
         }
      }

      fetchData();
    } catch (err) {
      console.error("Error updating role:", err);
      alert('Failed to update user role.');
    }
  };

  const deleteUserRecord = async (userId, userName, role) => {
    if (role === 'admin') {
      alert("Security constraint: Cannot delete another Admin account from the dashboard.");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to permanently erase the account for ${userName}? They will be completely removed from the system and will have to register again.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
      if (error) throw new Error(error.message);
      
      alert(`${userName}'s account has been permanently deleted.`);
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.message || "Sever failed to permanently erase data.");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative z-10 w-full max-w-7xl mx-auto">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
           <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><Users size={28} /></div>
           <div>
              <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Total Users</p>
              <h4 className="text-3xl font-extrabold font-outfit text-slate-800">{analytics.users}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
           <div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><FileText size={28} /></div>
           <div>
              <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Total Issues</p>
              <h4 className="text-3xl font-extrabold font-outfit text-slate-800">{analytics.complaints.total}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
           <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><Activity size={28} /></div>
           <div>
              <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Pending Fixes</p>
              <h4 className="text-3xl font-extrabold font-outfit text-slate-800">{analytics.complaints.pending}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
           <div className="p-4 bg-red-100 text-red-600 rounded-xl"><CreditCard size={28} /></div>
           <div>
              <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Unpaid Bills</p>
              <h4 className="text-3xl font-extrabold font-outfit text-slate-800">{analytics.bills.unpaid}</h4>
           </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold font-outfit text-slate-900 flex items-center"><ShieldCheck className="mr-3 text-indigo-500"/> Staff Management Center</h3>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-full">Viewing Staff Only</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200 font-bold">
                     <th className="p-5 font-bold rounded-tl-xl rounded-bl-xl">Name / Email</th>
                     <th className="p-5 font-bold text-center">Contact / KYC</th>
                     <th className="p-5 font-bold">Current Role</th>
                     <th className="p-5 font-bold rounded-tr-xl rounded-br-xl text-right">Settings</th>
                  </tr>
               </thead>
               <tbody>
                  {usersList.map(user => (
                     <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50 transition duration-300">
                        <td className="p-5">
                           <div className="font-bold text-slate-800 text-base">{user.name || 'Unnamed Citizen'}</div>
                           <div className="text-slate-500 text-sm">{user.email}</div>
                        </td>
                        <td className="p-5 text-center">
                           {user.aadhar_number ? (
                              <button onClick={() => setSelectedUser(user)} className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition shadow-sm border border-indigo-200">
                                 <Eye size={14} /> <span>View App</span>
                              </button>
                           ) : <span className="text-slate-400 text-xs font-medium">Standard</span>}
                        </td>
                        <td className="p-5">
                           <select 
                              value={user.role} 
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className={`px-4 py-2 text-xs font-extrabold tracking-wide uppercase rounded-xl outline-none cursor-pointer border shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${
                                 user.role === 'admin' ? 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200' : 
                                 user.role === 'field_staff' ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' : 
                                 user.role === 'pending_staff' ? 'bg-amber-100 text-amber-700 border-amber-300 ring-4 ring-amber-400/20 hover:bg-amber-200' :
                                 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                           >
                              <option value="pending_staff">PENDING APP</option>
                              <option value="field_staff">FIELD STAFF</option>
                              <option value="admin">ADMIN</option>
                           </select>
                        </td>
                        <td className="p-5 text-right flex justify-end space-x-2">
                           <button onClick={() => {}} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Send Email"><Mail size={18} /></button>
                           <button onClick={() => deleteUserRecord(user.id, user.name || 'Unnamed', user.role)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Permanently Delete User"><Trash2 size={18} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Recent Bills Overview */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-full -z-10 opacity-60"></div>
         <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <div>
               <h3 className="text-2xl font-extrabold font-outfit text-slate-900 flex items-center"><div className="p-2 bg-emerald-100 rounded-xl mr-3 shadow-sm"><CreditCard size={24} className="text-emerald-600"/></div> Recent Bills Issued</h3>
               <p className="text-slate-500 text-sm mt-2 font-medium">Live monitoring of municipal invoices generated by Field Staff</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl tracking-wider uppercase shadow-sm">Top 5 Records</span>
         </div>
         <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs tracking-widest uppercase border-b border-slate-100 font-extrabold">
                     <th className="p-5 rounded-tl-xl rounded-bl-xl">Citizen</th>
                     <th className="p-5">Bill Type</th>
                     <th className="p-5">Amount</th>
                     <th className="p-5 rounded-tr-xl rounded-br-xl text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {recentBills.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No bills have been issued yet.</td></tr>
                  ) : null}
                  {recentBills.map(bill => (
                     <tr key={bill.id} className="hover:bg-emerald-50/30 transition duration-300">
                        <td className="p-5 font-bold text-slate-800 text-sm">{bill.profiles?.name || 'Unknown Citizen'}</td>
                        <td className="p-5">
                            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase border border-slate-200 shadow-sm">
                               {bill.type}
                            </span>
                        </td>
                        <td className="p-5 font-bold text-slate-800 text-lg font-outfit">₹{Number(bill.amount).toFixed(2)}</td>
                        <td className="p-5 text-right">
                           {bill.status === 'paid' ? (
                               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Paid</span>
                           ) : (
                               <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">Unpaid</span>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* KYC Application Modal */}
      {selectedUser && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up border border-white/20">
               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                  <div>
                     <h3 className="text-2xl font-bold font-outfit">Staff Application Review</h3>
                     <p className="text-white/80 text-sm mt-1">Applicant: {selectedUser.name}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition">✕</button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4 border-b pb-6">
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                        <p className="text-lg font-medium text-slate-800">{selectedUser.phone_number || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aadhar UID</p>
                        <p className="text-lg font-medium tracking-wider text-slate-800">{selectedUser.aadhar_number || 'N/A'}</p>
                     </div>
                  </div>
                  
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verified Documents</p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a href={selectedUser.aadhar_photo_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition group">
                           <FileText size={28} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition" />
                           <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Aadhar Card</span>
                        </a>
                        <a href={selectedUser.passport_photo_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition group">
                           <FileText size={28} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition" />
                           <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Passport Photo</span>
                        </a>
                        <a href={selectedUser.citizenship_proof_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition group">
                           <FileText size={28} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition" />
                           <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Citizenship</span>
                        </a>
                     </div>
                  </div>
                  
                  <div className="pt-6 flex justify-end space-x-3">
                     <button onClick={() => setSelectedUser(null)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Close</button>
                     {selectedUser.role === 'pending_staff' && (
                        <button onClick={() => { updateUserRole(selectedUser.id, 'field_staff'); setSelectedUser(null); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition">Approve & Send Email</button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Email Success Modal */}
      {emailPreview && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20 animate-slide-up">
               <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Mail size={40} />
               </div>
               <h3 className="text-3xl font-extrabold text-slate-800 font-outfit mb-3">Email Dispatched!</h3>
               <p className="text-slate-600 mb-8 leading-relaxed">
                  A real confirmation email was securely generated and sent to the applicant's address. 
                  Because you are in a test environment without SMTP keys, you can view the exact delivered email using the live preview link below:
               </p>
               <a href={emailPreview} target="_blank" rel="noreferrer" onClick={() => setEmailPreview(null)} className="w-full block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all mb-4">
                  Open Inbox Preview
               </a>
               <button onClick={() => setEmailPreview(null)} className="text-slate-500 font-medium hover:text-slate-700 transition">Close Overlay</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
