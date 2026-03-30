import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CreditCard, Calendar, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

const AdminFinancials = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          profiles:citizen_id(name, email)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (err) {
      console.error('Error fetching admin bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center w-fit"><CheckCircle size={12} className="mr-1"/> Paid</span>;
      case 'overdue': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 flex items-center w-fit"><AlertTriangle size={12} className="mr-1"/> Overdue</span>;
      default: return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center w-fit"><Clock size={12} className="mr-1"/> Unpaid</span>;
    }
  };

  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + Number(b.amount), 0);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading financial records...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
             <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Financial Records</h2>
             <p className="text-slate-500 mt-2">Monitor all citizen utility bills, tax payments, and outstanding municipal fines.</p>
          </div>
          <div className="flex space-x-4">
             <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Collected</span>
                <span className="text-xl font-black font-outfit">₹{totalRevenue.toFixed(2)}</span>
             </div>
             <div className="bg-amber-50 text-amber-700 px-5 py-3 rounded-2xl border border-amber-100 flex flex-col items-end shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Outstanding</span>
                <span className="text-xl font-black font-outfit">₹{totalPending.toFixed(2)}</span>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200">
                      <th className="p-5 font-bold">Citizen Details</th>
                      <th className="p-5 font-bold">Bill Type</th>
                      <th className="p-5 font-bold">Amount</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold text-right">Due Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {bills.map(bill => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 transition duration-150">
                         <td className="p-5">
                            <div className="font-bold text-slate-800 text-base">{bill.profiles?.name || 'Unknown Citizen'}</div>
                            <div className="text-slate-500 text-xs mt-1">{bill.profiles?.email}</div>
                         </td>
                         <td className="p-5">
                            <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase border border-slate-200">
                               <CreditCard size={12} className="mr-1.5"/> {bill.type}
                            </div>
                         </td>
                         <td className="p-5">
                            <div className="text-lg font-bold text-slate-800 font-outfit flex items-center">
                               ₹{Number(bill.amount).toFixed(2)}
                            </div>
                         </td>
                         <td className="p-5">
                            {getStatusBadge(bill.status)}
                         </td>
                         <td className="p-5 text-right">
                            <div className="flex items-center justify-end text-slate-500 text-sm font-medium">
                               <Calendar size={14} className="mr-1.5 text-slate-400" /> 
                               {new Date(bill.due_date).toLocaleDateString()}
                            </div>
                         </td>
                      </tr>
                   ))}
                   {bills.length === 0 && (
                      <tr>
                         <td colSpan="5" className="p-8 text-center text-slate-500">No financial records found.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default AdminFinancials;
