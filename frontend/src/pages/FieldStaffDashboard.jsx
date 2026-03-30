import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, Users, LayoutGrid, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const FieldStaffDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
       <div className="mb-8">
          <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Staff Deployment Hub</h2>
          <p className="text-slate-500 mt-2">Access your assigned municipal modules, resolve active field tasks, and look up citizens securely from this launchpad.</p>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/staff/operations" className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-teal-200 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 opacity-50 group-hover:bg-teal-100 transition-colors"></div>
             <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-teal-500/20 group-hover:-translate-y-1 transition-transform">
                <LayoutGrid size={28} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2 font-outfit">Operations Board</h3>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">Visual Kanban pipeline to triage and resolve real-time complaints.</p>
          </Link>

          <Link to="/staff/complaints" className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-cyan-200 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-full -z-10 opacity-50 group-hover:bg-cyan-100 transition-colors"></div>
             <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20 group-hover:-translate-y-1 transition-transform">
                <ClipboardList size={28} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2 font-outfit">Master Complaints</h3>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">View exhaustive historical database of every public issue filed.</p>
          </Link>

          <Link to="/directory" className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10 opacity-50 group-hover:bg-green-100 transition-colors"></div>
             <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-500/20 group-hover:-translate-y-1 transition-transform">
                <Users size={28} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2 font-outfit">Citizen Records</h3>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">Securely access verified contact records for communications.</p>
          </Link>

          <Link to="/directory" className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden ring-1 ring-white/10">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
             <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-teal-500/30 group-hover:-translate-y-1 transition-transform">
                <FilePlus size={28} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2 font-outfit">Issue Citizen Bill</h3>
             <p className="text-sm text-slate-300 leading-relaxed font-medium">Generate ad-hoc municipal invoices, taxes, or fines for specific citizens.</p>
          </Link>
       </div>
    </div>
  );
};

export default FieldStaffDashboard;
