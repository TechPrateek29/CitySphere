import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Search, User, Shield, Briefcase, Mail, Phone, Calendar } from 'lucide-react';

const AdminUserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching global registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-bold border border-pink-200 flex items-center w-fit"><Shield size={12} className="mr-1"/> Admin</span>;
      case 'field_staff': return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200 flex items-center w-fit"><Briefcase size={12} className="mr-1"/> Staff</span>;
      case 'pending_staff': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 flex items-center w-fit">Pending</span>;
      default: return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 flex items-center w-fit"><User size={12} className="mr-1"/> Citizen</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading citizen registry...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10 h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 shrink-0">
          <div>
             <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Global User Registry</h2>
             <p className="text-slate-500 mt-2">Comprehensive directory of all citizens, field staff, and administrators.</p>
          </div>
          <div className="relative w-full md:w-96">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
             </div>
             <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800 shadow-sm"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-12">
          {filteredUsers.map(user => (
             <div key={user.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xl font-outfit shadow-inner group-hover:scale-110 transition-transform">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                   </div>
                   {getRoleBadge(user.role)}
                </div>
                
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1">{user.name || 'Unnamed User'}</h3>
                   <div className="space-y-2 mt-4 text-sm">
                      <div className="flex items-center text-slate-500">
                         <Mail size={14} className="mr-2 text-slate-400"/>
                         <span className="truncate" title={user.email}>{user.email}</span>
                      </div>
                      {user.phone_number && (
                         <div className="flex items-center text-slate-500">
                            <Phone size={14} className="mr-2 text-slate-400"/>
                            <span>{user.phone_number}</span>
                         </div>
                      )}
                      <div className="flex items-center text-slate-500">
                         <Calendar size={14} className="mr-2 text-slate-400"/>
                         <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
             </div>
          ))}
          
          {filteredUsers.length === 0 && (
             <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="text-slate-400 mb-2 flex justify-center"><Search size={48} className="opacity-20"/></div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No users found</h3>
                <p className="text-slate-500 font-medium">No citizens or staff match your search query.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default AdminUserDirectory;
