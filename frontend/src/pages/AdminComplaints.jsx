import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FileText, MapPin, Calendar, CheckCircle, Clock } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles:user_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center w-fit"><CheckCircle size={12} className="mr-1"/> Resolved</span>;
      case 'in_progress': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center w-fit"><Clock size={12} className="mr-1"/> In Progress</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center w-fit"><FileText size={12} className="mr-1"/> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading municipal complaints...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
       <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
          <div>
             <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Master Complaints Log</h2>
             <p className="text-slate-500 mt-2">View and monitor all city-wide issues reported by citizens.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 w-fit">
             Total Records: {complaints.length}
          </div>
       </div>

       <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200">
                      <th className="p-5 font-bold">Issue Details</th>
                      <th className="p-5 font-bold">Reported By</th>
                      <th className="p-5 font-bold">Location</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold text-right">Date Filed</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {complaints.map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition duration-150">
                         <td className="p-5">
                            <div className="font-bold text-slate-800 text-base">{comp.title}</div>
                            <div className="text-slate-500 text-sm mt-1 line-clamp-1 max-w-sm">{comp.description}</div>
                         </td>
                         <td className="p-5">
                            <div className="text-sm font-medium text-slate-700">{comp.profiles?.name || 'Unknown Citizen'}</div>
                         </td>
                         <td className="p-5">
                            <div className="flex items-center text-slate-600 text-sm">
                               <MapPin size={14} className="mr-1.5 text-slate-400" /> {comp.location || 'Not Specified'}
                            </div>
                         </td>
                         <td className="p-5">
                            {getStatusBadge(comp.status)}
                         </td>
                         <td className="p-5 text-right">
                            <div className="flex items-center justify-end text-slate-500 text-sm">
                               <Calendar size={14} className="mr-1.5" /> 
                               {new Date(comp.created_at).toLocaleDateString()}
                            </div>
                         </td>
                      </tr>
                   ))}
                   {complaints.length === 0 && (
                      <tr>
                         <td colSpan="5" className="p-8 text-center text-slate-500">No complaints found in the system.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default AdminComplaints;
