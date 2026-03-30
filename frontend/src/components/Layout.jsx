import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationInbox from './NotificationInbox';
import ChatAssistant from './ChatAssistant';
import { LogOut, Home, Hexagon, User, Bell, FileText, Users, AlertCircle, DollarSign, Database, LayoutGrid } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter selection:bg-indigo-500 selection:text-white relative z-0">
      {/* Background blobs for internal pages */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

      <aside className="w-72 glass flex flex-col h-full transition-all border-r border-white/40">
        <div className="p-6">
           <div className="mb-8 font-extrabold text-2xl text-primary flex items-center space-x-3 font-outfit tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                 <Hexagon size={20} />
              </div>
              <span>{t('appTitle') || 'CitySphere'}</span>
           </div>
           
           <nav className="flex-1 mt-8">
          <ul className="space-y-2 font-medium text-gray-700">
             <Link to={user.role === 'admin' ? '/admin' : user.role === 'field_staff' ? '/staff' : '/dashboard'}>
                <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                  location.pathname === '/admin' || location.pathname === '/staff' || location.pathname === '/dashboard' 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-secondary font-bold shadow-sm border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                }`}>
                   <Home size={18} className="mr-3" /> Dashboard Overview
                </li>
             </Link>
             {user.role === 'admin' && (
               <>
                 <Link to="/admin/complaints">
                   <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                     location.pathname === '/admin/complaints' 
                     ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 font-bold shadow-sm border border-red-100' 
                     : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                   }`}>
                      <AlertCircle size={18} className="mr-3" /> Master Complaints
                   </li>
                 </Link>
                 <Link to="/admin/financials">
                   <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                     location.pathname === '/admin/financials' 
                     ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold shadow-sm border border-emerald-100' 
                     : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                   }`}>
                      <DollarSign size={18} className="mr-3" /> Financial Records
                   </li>
                 </Link>
                 <Link to="/admin/registry">
                   <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                     location.pathname === '/admin/registry' 
                     ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-bold shadow-sm border border-blue-100' 
                     : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                   }`}>
                      <Database size={18} className="mr-3" /> Global Registry
                   </li>
                 </Link>
                 <Link to="/admin/operations">
                   <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                     location.pathname === '/admin/operations' 
                     ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-bold shadow-sm border border-indigo-100' 
                     : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                   }`}>
                      <LayoutGrid size={18} className="mr-3" /> Operations Board
                   </li>
                 </Link>
               </>
             )}
             {user.role !== 'admin' && (
                <>
                  <Link to="/services">
                     <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                       location.pathname === '/services' 
                       ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-secondary font-bold shadow-sm border border-indigo-100' 
                       : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                     }`}>
                        <FileText size={18} className="mr-3" /> Service Requests
                     </li>
                  </Link>
                  {user.role !== 'field_staff' && (
                     <>
                        <Link to="/citizen/complaints">
                           <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                             location.pathname === '/citizen/complaints' 
                             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-bold shadow-sm border border-indigo-100' 
                             : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                           }`}>
                              <FileText size={18} className="mr-3" /> Historical Requests
                           </li>
                        </Link>
                        <Link to="/citizen/financials">
                           <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                             location.pathname === '/citizen/financials' 
                             ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-bold shadow-sm border border-emerald-100' 
                             : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                           }`}>
                              <DollarSign size={18} className="mr-3" /> My Financials
                           </li>
                        </Link>
                     </>
                  )}
                </>
             )}
             {user.role === 'field_staff' && (
                <>
                  <Link to="/directory">
                     <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                       location.pathname === '/directory' 
                       ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-secondary font-bold shadow-sm border border-indigo-100' 
                       : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                     }`}>
                        <Users size={18} className="mr-3" /> Citizen Directory
                     </li>
                  </Link>
                  <Link to="/staff/complaints">
                     <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                       location.pathname === '/staff/complaints' 
                       ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 font-bold shadow-sm border border-red-100' 
                       : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                     }`}>
                        <AlertCircle size={18} className="mr-3" /> Master Complaints
                     </li>
                  </Link>
                  <Link to="/staff/operations">
                     <li className={`p-4 rounded-xl cursor-pointer flex items-center transition-all ${
                       location.pathname === '/staff/operations' 
                       ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-bold shadow-sm border border-indigo-100' 
                       : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                     }`}>
                        <LayoutGrid size={18} className="mr-3" /> Operations Board
                     </li>
                  </Link>
                </>
             )}
          </ul>
        </nav>
        </div>
        
        <div className="p-6 border-t border-slate-200/50 mt-auto bg-white/30">
          <div className="flex items-center space-x-3 mb-4">
             <div className="bg-blue-100 p-2 rounded-full text-secondary">
               <User size={20} />
             </div>
             <div>
               <p className="text-sm font-semibold text-gray-800">{user.name}</p>
               <p className="text-xs text-gray-500 uppercase">{user.role.replace('_', ' ')}</p>
             </div>
          </div>
          <button 
             onClick={logout} 
             className="w-full flex items-center justify-center space-x-2 bg-red-50/80 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all font-medium border border-red-100/50 shadow-sm"
          >
            <LogOut size={18} />
            <span>{t('logout') || 'Logout'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        <header className="glass flex justify-between items-center py-4 px-8 border-b border-white/60">
           <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight">
              Welcome back, <span className="text-gradient">{user.name}</span>
           </h2>
           <div className="flex items-center space-x-4">
              <NotificationInbox />
           </div>
        </header>
        <section className="p-8 h-full overflow-y-auto no-scrollbar scroll-smooth">
          <Outlet />
        </section>
      </main>
      <ChatAssistant />
    </div>
  );
};

export default Layout;
