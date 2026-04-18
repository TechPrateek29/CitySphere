import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { FileText, Plus, Upload, CheckCircle, Clock } from 'lucide-react';

const ServiceRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ 
    service_type: 'birth_certificate', 
    applicant_name: user?.name || '',
    contact_number: '',
    address: '',
    idProof: null,
    addressProof: null,
    supportingDoc: null
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    let query = supabase.from('service_requests').select('*, citizen:profiles!user_id(name)').order('created_at', { ascending: false });
    if (user.role === 'citizen') {
      query = query.eq('user_id', user.id);
    }
    
    try {
       const { data } = await query;
       if (data) setRequests(data);
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const docDataUrls = [];
    
    // Add metadata block
    docDataUrls.push({
       type: 'metadata',
       applicant_name: newRequest.applicant_name,
       contact_number: newRequest.contact_number,
       address: newRequest.address
    });

    const uploadFile = async (file, typeLabel) => {
        if (!file) return;
        const ext = file.name.split('.').pop();
        const fileName = `request_${typeLabel.replace(/\s+/g, '')}_${Math.random()}.${ext}`;
        const { data, error } = await supabase.storage.from('docs').upload(fileName, file);
        if (!error && data) {
            const docUrl = supabase.storage.from('docs').getPublicUrl(fileName).data.publicUrl;
            docDataUrls.push({ type: typeLabel, url: docUrl });
        }
    };

    await Promise.all([
       uploadFile(newRequest.idProof, 'ID Proof'),
       uploadFile(newRequest.addressProof, 'Address Proof'),
       uploadFile(newRequest.supportingDoc, 'Supporting Doc')
    ]);

    await supabase.from('service_requests').insert([{
        user_id: user.id,
        service_type: newRequest.service_type,
        document_urls: docDataUrls
    }]);

    setNewRequest({ 
       service_type: 'birth_certificate', 
       applicant_name: user?.name || '',
       contact_number: '',
       address: '',
       idProof: null,
       addressProof: null,
       supportingDoc: null
    });
    setShowForm(false);
    fetchRequests();
  };

  const updateStatus = async (id, status) => {
     await supabase.from('service_requests').update({ status }).eq('id', id);
     fetchRequests();
  };

  if (loading) return <div>Loading service requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm gap-4">
         <div className="flex items-center space-x-3 text-primary">
            <FileText size={24} className="text-secondary shrink-0" />
            <h2 className="text-xl font-bold">Service Requests</h2>
         </div>
         {user.role === 'citizen' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition">
               <Plus size={18} className="mr-1" /> New Request
            </button>
         )}
      </div>

      {showForm && user.role === 'citizen' && (
         <form onSubmit={submitRequest} className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            
            <div className="border-b border-slate-100 pb-4">
               <h3 className="font-extrabold text-2xl text-slate-800 font-outfit">Apply for a Municipal Certificate</h3>
               <p className="text-slate-500 text-sm mt-1">Please provide accurate verification details for your application.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Service Type</label>
                     <select 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 font-medium text-slate-800 transition"
                        value={newRequest.service_type}
                        onChange={e => setNewRequest({...newRequest, service_type: e.target.value})}
                     >
                        <option value="birth_certificate">Birth Certificate</option>
                        <option value="death_certificate">Death Certificate</option>
                        <option value="marriage_certificate">Marriage Certificate</option>
                        <option value="trade_license">Trade License</option>
                        <option value="building_permit">Building Permit</option>
                        <option value="utility_connection">New Utility Connection</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Applicant Full Name</label>
                     <input type="text" required placeholder="John Doe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 font-medium text-slate-800 transition" value={newRequest.applicant_name} onChange={e => setNewRequest({...newRequest, applicant_name: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                     <input type="tel" required placeholder="+1 234 567 8900" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 font-medium text-slate-800 transition" value={newRequest.contact_number} onChange={e => setNewRequest({...newRequest, contact_number: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Address / Business Location</label>
                     <textarea required placeholder="123 Example Street, City, ZIP" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 font-medium text-slate-800 transition resize-none h-24" value={newRequest.address} onChange={e => setNewRequest({...newRequest, address: e.target.value})}></textarea>
                  </div>
               </div>

               <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-700 tracking-tight">Required Verification Documents</h4>
                  
                  <label className="flex flex-col space-y-2 bg-white border border-dashed border-slate-300 px-4 py-4 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group">
                     <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-slate-700">1. Identity Proof <span className="text-red-500">*</span></span>
                        <Upload size={16} className="text-indigo-400 group-hover:-translate-y-1 transition-transform" />
                     </div>
                     <span className="text-xs text-slate-500 truncate">{newRequest.idProof ? newRequest.idProof.name : 'Upload Aadhaar / SSN / Passport (PDF/Image)'}</span>
                     <input type="file" className="hidden" required onChange={e => setNewRequest({...newRequest, idProof: e.target.files[0]})} />
                  </label>

                  <label className="flex flex-col space-y-2 bg-white border border-dashed border-slate-300 px-4 py-4 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group">
                     <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-slate-700">2. Address Proof <span className="text-red-500">*</span></span>
                        <Upload size={16} className="text-indigo-400 group-hover:-translate-y-1 transition-transform" />
                     </div>
                     <span className="text-xs text-slate-500 truncate">{newRequest.addressProof ? newRequest.addressProof.name : 'Upload Utility Bill / Lease Agreement'}</span>
                     <input type="file" className="hidden" required onChange={e => setNewRequest({...newRequest, addressProof: e.target.files[0]})} />
                  </label>

                  <label className="flex flex-col space-y-2 bg-white border border-dashed border-slate-300 px-4 py-4 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group">
                     <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-bold text-slate-700">3. Supporting Document (Optional)</span>
                        <Upload size={16} className="text-indigo-400 group-hover:-translate-y-1 transition-transform" />
                     </div>
                     <span className="text-xs text-slate-500 truncate">{newRequest.supportingDoc ? newRequest.supportingDoc.name : 'E.g., Existing Trade License, Affidavit'}</span>
                     <input type="file" className="hidden" onChange={e => setNewRequest({...newRequest, supportingDoc: e.target.files[0]})} />
                  </label>
               </div>
            </div>

            <div className="pt-4 flex justify-end">
               <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all min-w-[200px] shadow-indigo-500/30">
                  {loading ? 'Processing...' : 'Submit Application'}
               </button>
            </div>
         </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
               <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                     <th className="p-4">Service Type</th>
                     {user.role !== 'citizen' && <th className="p-4">Applicant</th>}
                     <th className="p-4">Status</th>
                     <th className="p-4">Documents</th>
                     {user.role !== 'citizen' && <th className="p-4">Actions</th>}
                  </tr>
               </thead>
               <tbody>
                  {requests.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No requests found.</td></tr>}
                  {requests.map(req => {
                     const safeUrls = Array.isArray(req.document_urls) ? req.document_urls : [];
                     const metadata = safeUrls.find(u => u && typeof u === 'object' && u.type === 'metadata') || {};
                     const files = safeUrls.filter(u => !u || typeof u === 'string' || u.type !== 'metadata');

                     return (
                        <tr key={req.id} className="border-t hover:bg-gray-50 transition">
                           <td className="p-4">
                              <div className="font-bold text-slate-800 capitalize leading-tight mb-1">{req.service_type.replace(/_/g, ' ')}</div>
                              {metadata.applicant_name && (
                                 <div className="text-xs text-slate-500 flex flex-col space-y-0.5 mt-2">
                                    <span><strong className="text-slate-600">Applicant:</strong> {metadata.applicant_name}</span>
                                    <span><strong className="text-slate-600">Contact:</strong> {metadata.contact_number}</span>
                                 </div>
                              )}
                           </td>
                           {user.role !== 'citizen' && <td className="p-4 font-medium text-slate-700">{req.citizen?.name}</td>}
                           <td className="p-4">
                              <span className={`px-3 py-1 text-xs font-bold rounded-full flex w-max items-center ${
                                 req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                                 req.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                 {req.status === 'approved' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                 {req.status.replace('_', ' ').toUpperCase()}
                              </span>
                           </td>
                           <td className="p-4">
                              {files.length > 0 ? (
                                 <div className="flex flex-col space-y-1.5 min-w-[120px]">
                                    {files.map((file, i) => {
                                       if (!file) return null;
                                       const url = typeof file === 'string' ? file : file.url;
                                       const label = typeof file === 'string' ? `Doc ${i+1}` : file.type;
                                       return (
                                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit hover:bg-indigo-100 hover:text-indigo-800 text-xs font-bold flex items-center shadow-sm transition border border-indigo-100">
                                             <FileText size={10} className="mr-1.5 opacity-50" /> {label}
                                          </a>
                                       );
                                    })}
                                 </div>
                              ) : <span className="text-sm text-slate-400 font-medium whitespace-nowrap">No Documents</span>}
                           </td>
                           {user.role !== 'citizen' && (
                              <td className="p-4 flex space-x-2">
                                 <button onClick={() => updateStatus(req.id, 'approved')} className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition shadow-sm whitespace-nowrap">Approve</button>
                                 <button onClick={() => updateStatus(req.id, 'rejected')} className="text-xs bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-200 transition shadow-sm whitespace-nowrap">Reject</button>
                              </td>
                           )}
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
