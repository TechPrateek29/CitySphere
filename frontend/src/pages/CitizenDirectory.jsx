import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Users, FilePlus, X, ClipboardList } from 'lucide-react';

const CitizenDirectory = () => {
   const [citizens, setCitizens] = useState([]);
   const [loading, setLoading] = useState(true);
   const [issuingBillTo, setIssuingBillTo] = useState(null);
   const [newBill, setNewBill] = useState({ type: 'Property Tax', amount: '', due_date: '' });

   useEffect(() => {
      fetchCitizens();
   }, []);

   const fetchCitizens = async () => {
      try {
         const { data } = await supabase.from('profiles').select('*').eq('role', 'citizen').order('created_at', { ascending: false });
         if (data) setCitizens(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleIssueBill = async (e) => {
      e.preventDefault();
      try {
         const { error } = await supabase.from('bills').insert([{
            citizen_id: issuingBillTo.id,
            title: `Municipal Bill - ${newBill.type}`,
            type: newBill.type,
            amount: parseFloat(newBill.amount),
            status: 'unpaid',
            due_date: newBill.due_date
         }]);
         if (error) throw error;
         alert(`Successfully issued ${newBill.type} bill to ${issuingBillTo.name}`);
         setIssuingBillTo(null);
         setNewBill({ type: 'tax', amount: '', due_date: '' });
      } catch (err) {
         console.error(err);
         alert(`Failed to issue bill to citizen: ${err.message || JSON.stringify(err)}`);
      }
   };

   if (loading) return <div>Loading directory...</div>;

   return (
      <div className="space-y-6">
         <div className="flex items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-slate-800 font-bold text-2xl font-outfit">
            <Users className="text-secondary mr-3" size={28} />
            <h2>Citizen Directory</h2>
         </div>
         <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200 font-extrabold">
                     <th className="p-5">Full Name</th>
                     <th className="p-5">Email Address</th>
                     <th className="p-5">Phone Number</th>
                     <th className="p-5 text-right">Join Date</th>
                     <th className="p-5 text-center w-32">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {citizens.length === 0 ? (
                     <tr><td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No citizens registered yet.</td></tr>
                  ) : null}
                  {citizens.map(citizen => (
                     <tr key={citizen.id} className="hover:bg-slate-50/50 transition duration-200">
                        <td className="p-5 font-bold text-slate-800 text-base">{citizen.name || 'Unnamed Citizen'}</td>
                        <td className="p-5 text-slate-600">{citizen.email}</td>
                        <td className="p-5 text-slate-600 font-medium">{citizen.phone_number || <span className="text-slate-400 italic">Not Provided</span>}</td>
                        <td className="p-5 text-slate-500 text-sm text-right font-medium">{new Date(citizen.created_at).toLocaleDateString()}</td>
                        <td className="p-5 text-center">
                           <button 
                              onClick={() => setIssuingBillTo(citizen)}
                              className="px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 hover:from-teal-600 hover:to-emerald-600 hover:text-white rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center shadow-sm w-full justify-center border border-teal-100 hover:border-transparent cursor-pointer"
                           >
                              <FilePlus size={14} className="mr-1.5" /> Issue Bill
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Bill Issuance Modal */}
         {issuingBillTo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
               <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20 animate-slide-up">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-br from-teal-50 to-emerald-50">
                     <div className="flex items-center text-teal-900 font-extrabold font-outfit text-xl">
                        <div className="p-2 bg-white rounded-xl shadow-sm mr-3">
                           <FilePlus size={24} className="text-teal-600" />
                        </div>
                        Issue Municipal Bill
                     </div>
                     <button onClick={() => setIssuingBillTo(null)} className="text-teal-400 hover:text-teal-600 bg-white shadow-sm rounded-full p-1.5 transition"><X size={20}/></button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                        <div>
                           <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Billing To</div>
                           <div className="text-lg font-bold text-slate-800 font-outfit">{issuingBillTo.name || issuingBillTo.email}</div>
                        </div>
                        <div className="h-10 w-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold font-outfit">
                           {issuingBillTo.name ? issuingBillTo.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                     </div>

                     <form onSubmit={handleIssueBill} className="space-y-4">
                        <div>
                           <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 flex items-center"><ClipboardList size={14} className="mr-1"/> Service Category</label>
                           <select 
                              required 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 font-bold text-slate-700 transition cursor-pointer custom-select"
                              value={newBill.type}
                              onChange={e => setNewBill({...newBill, type: e.target.value})}
                           >
                              <option value="tax">🏛️ Property Tax</option>
                              <option value="water">💧 Water Supply</option>
                              <option value="electricity">⚡ Electricity</option>
                              <option value="other">📦 Other / Fine</option>
                           </select>
                        </div>
                        
                        <div>
                           <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">Amount (INR)</label>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                              <input 
                                 type="number" 
                                 step="0.01"
                                 required 
                                 min="0"
                                 placeholder="0.00"
                                 className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 font-extrabold text-slate-800 transition font-outfit text-xl"
                                 value={newBill.amount}
                                 onChange={e => setNewBill({...newBill, amount: e.target.value})}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2">Due Date</label>
                           <input 
                              type="date" 
                              required 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 font-bold text-slate-700 transition"
                              value={newBill.due_date}
                              onChange={e => setNewBill({...newBill, due_date: e.target.value})}
                           />
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-extrabold py-4 mt-6 rounded-2xl shadow-lg shadow-teal-500/30 hover:-translate-y-1 transition-all text-lg flex items-center justify-center">
                           <FilePlus size={22} className="mr-2" /> Issue Secure Invoice
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default CitizenDirectory;
