import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MapPin, Calendar, LayoutGrid, Clock, CheckCircle2, FileText } from 'lucide-react';

const AdminKanban = () => {
  const [complaints, setComplaints] = useState({ pending: [], in_progress: [], resolved: [] });
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
      
      const categorized = { pending: [], in_progress: [], resolved: [] };
      data?.forEach(comp => {
         if (categorized[comp.status]) {
            categorized[comp.status].push(comp);
         } else {
            categorized.pending.push(comp);
         }
      });
      
      setComplaints(categorized);
    } catch (err) {
      console.error('Error fetching kanban complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const ComplaintCard = ({ comp }) => (
     <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing mb-4 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h4 className="font-bold text-slate-800 text-base mb-2 font-outfit">{comp.title}</h4>
        <p className="text-slate-500 text-xs mb-4 line-clamp-2">{comp.description}</p>
        
        <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
           <div className="space-y-1">
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                 <MapPin size={10} className="mr-1" /> {comp.location || 'Unknown'}
              </div>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                 <Calendar size={10} className="mr-1" /> {new Date(comp.created_at).toLocaleDateString()}
              </div>
           </div>
           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200" title={comp.profiles?.name}>
              {comp.profiles?.name ? comp.profiles.name.charAt(0).toUpperCase() : '?'}
           </div>
        </div>
     </div>
  );

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading operations board...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10 h-full flex flex-col">
       <div className="flex justify-between items-end mb-4 shrink-0">
          <div>
             <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight flex items-center"><LayoutGrid className="mr-3 text-indigo-500"/> Operations Board</h2>
             <p className="text-slate-500 mt-2">Active city-wide issue tracking and pipeline visualization.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
          
          {/* Pending Column */}
          <div className="bg-slate-100/50 rounded-[2rem] p-4 border border-slate-200 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
             <div className="flex justify-between items-center mb-4 px-2 tracking-tight">
                <h3 className="font-bold text-slate-700 flex items-center"><FileText size={16} className="mr-2 text-slate-400"/> Needs Triage</h3>
                <span className="bg-white text-slate-600 px-3 py-1 rounded-full text-xs font-black shadow-sm">{complaints.pending.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
                {complaints.pending.map(comp => <ComplaintCard key={comp.id} comp={comp} />)}
                {complaints.pending.length === 0 && <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">No pending tasks</div>}
             </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-indigo-50/50 rounded-[2rem] p-4 border border-indigo-100/50 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
             <div className="flex justify-between items-center mb-4 px-2 tracking-tight">
                <h3 className="font-bold text-indigo-900 flex items-center"><Clock size={16} className="mr-2 text-indigo-500"/> In Progress</h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black shadow-sm">{complaints.in_progress.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
                {complaints.in_progress.map(comp => <ComplaintCard key={comp.id} comp={comp} />)}
                {complaints.in_progress.length === 0 && <div className="text-center p-8 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-300 text-sm font-medium">No active operations</div>}
             </div>
          </div>

          {/* Resolved Column */}
          <div className="bg-emerald-50/50 rounded-[2rem] p-4 border border-emerald-100/50 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
             <div className="flex justify-between items-center mb-4 px-2 tracking-tight">
                <h3 className="font-bold text-emerald-900 flex items-center"><CheckCircle2 size={16} className="mr-2 text-emerald-500"/> Resolved</h3>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black shadow-sm">{complaints.resolved.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
                {complaints.resolved.map(comp => <ComplaintCard key={comp.id} comp={comp} />)}
                {complaints.resolved.length === 0 && <div className="text-center p-8 border-2 border-dashed border-emerald-100 rounded-2xl text-emerald-300 text-sm font-medium">No resolved tasks</div>}
             </div>
          </div>

       </div>
    </div>
  );
};

export default AdminKanban;
