import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Calendar, CheckCircle, AlertTriangle, DollarSign, Clock, Printer, X, ShieldCheck } from 'lucide-react';

const CitizenFinancials = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [checkoutBill, setCheckoutBill] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    fetchBills();
    
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=INR';
    script.addEventListener('load', () => setPaypalLoaded(true));
    document.body.appendChild(script);

    return () => {
       document.body.removeChild(script);
    };
  }, [user]);

  const fetchBills = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('citizen_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      if (data) {
         setBills(data);
         // Generate reminders for bills due within 3 days
         const now = new Date();
         data.forEach(async (bill) => {
            if (bill.status !== 'paid') {
               const dueDate = new Date(bill.due_date);
               const diffTime = dueDate.getTime() - now.getTime();
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               
               if (diffDays <= 3 && diffDays >= 0) {
                  // Check if reminder already exists
                  const { data: existing } = await supabase
                     .from('notifications')
                     .select('id')
                     .eq('citizen_id', user.id)
                     .ilike('title', `%${bill.type}%`)
                     .eq('is_read', false);
                     
                  if (!existing || existing.length === 0) {
                     await supabase.from('notifications').insert([{
                        citizen_id: user.id,
                        title: `Payment Reminder: ${bill.type.toUpperCase()}`,
                        message: `Your municipal ${bill.type} bill of ₹${bill.amount} is due in ${diffDays} days. Please pay promptly to avoid late fees.`,
                        is_read: false
                     }]);
                  }
               }
            }
         });
      }
    } catch (err) {
      console.error('Error fetching citizen bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = (bill) => {
    setCheckoutBill(bill);
  };

  useEffect(() => {
     if (checkoutBill && paypalLoaded && window.paypal) {
        // Clear previous buttons if re-opened
        const container = document.getElementById('paypal-button-container');
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
                    .update({ status: 'paid', transaction_id: order.id })
                    .eq('id', checkoutBill.id);
                 if (error) throw error;
                 
                 setCheckoutBill(null);
                 fetchBills();
                 setSelectedReceipt(checkoutBill); // Instantly show receipt!
              } catch (err) {
                 alert('Error processing transaction record.');
              }
           },
           onError: (err) => {
              console.error('PayPal Checkout onError', err);
              alert('Payment gateway encountered an error. Please try again.');
           }
        }).render('#paypal-button-container');
     }
  }, [checkoutBill, paypalLoaded]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center w-fit"><CheckCircle size={12} className="mr-1"/> Paid</span>;
      case 'overdue': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 flex items-center w-fit"><AlertTriangle size={12} className="mr-1"/> Overdue</span>;
      default: return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center w-fit"><Clock size={12} className="mr-1"/> Unpaid</span>;
    }
  };

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
  const totalPending = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + Number(b.amount), 0);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading financial records...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative z-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
             <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">My Financial Records</h2>
             <p className="text-slate-500 mt-2">Track your utility bills, tax payments, and municipal fines.</p>
          </div>
          <div className="flex space-x-4">
             <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total Paid</span>
                <span className="text-xl font-black font-outfit">₹{totalPaid.toFixed(2)}</span>
             </div>
             <div className="bg-amber-50 text-amber-700 px-5 py-3 rounded-2xl border border-amber-100 flex flex-col items-end shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Amount Due</span>
                <span className="text-xl font-black font-outfit">₹{totalPending.toFixed(2)}</span>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200">
                      <th className="p-5 font-bold">Bill Reference</th>
                      <th className="p-5 font-bold">Category</th>
                      <th className="p-5 font-bold">Amount</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {bills.map(bill => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 transition duration-150">
                         <td className="p-5">
                            <div className="font-bold text-slate-800 text-sm font-mono tracking-wider">#{bill.id.split('-')[0].toUpperCase()}</div>
                            <div className="text-slate-500 text-xs mt-1 flex items-center">
                               <Calendar size={12} className="mr-1 text-slate-400" /> Due: {new Date(bill.due_date).toLocaleDateString()}
                            </div>
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
                         <td className="p-5 text-right w-32">
                            {bill.status !== 'paid' ? (
                               <button 
                                  onClick={() => handlePayBill(bill)}
                                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                               >
                                  Pay Now
                               </button>
                            ) : (
                               <button 
                                  onClick={() => setSelectedReceipt(bill)}
                                  className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center shadow-sm"
                               >
                                  <Printer size={14} className="mr-1.5"/> Receipt
                               </button>
                            )}
                         </td>
                      </tr>
                   ))}
                   {bills.length === 0 && (
                      <tr>
                         <td colSpan="5" className="p-8 text-center text-slate-500">You currently have no financial records or bills.</td>
                      </tr>
                   )}
                </tbody>
              </table>
           </div>
        </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in print:bg-white print:p-0">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative print:shadow-none print:max-w-none">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
                  <h3 className="text-xl font-bold font-outfit text-slate-800">Official Receipt</h3>
                  <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
               </div>
               
               <div className="p-10 space-y-6 print:p-0" id="printable-receipt">
                  <div className="text-center space-y-2 border-b border-slate-100 pb-6 print:border-b-2 print:border-slate-800">
                     <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 print:border-2 print:border-slate-800 print:text-slate-800 print:bg-white">
                        <CheckCircle size={32} />
                     </div>
                     <h2 className="text-2xl font-black font-outfit text-slate-800 tracking-tight">Payment Successful</h2>
                     <p className="text-slate-500 font-medium">Thank you for your timely payment.</p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Receipt No.</span>
                        <span className="text-slate-800 font-mono font-bold text-sm">{selectedReceipt.id.split('-')[0].toUpperCase()}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Date Paid</span>
                        <span className="text-slate-800 font-bold text-sm">{new Date().toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Billed To</span>
                        <span className="text-slate-800 font-bold text-sm">{user.name}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Service Type</span>
                        <span className="text-slate-800 font-bold text-sm uppercase">{selectedReceipt.type}</span>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 flex justify-between items-center border border-slate-100 mt-6 print:bg-white print:border-2 print:border-slate-800">
                     <span className="text-slate-600 font-bold print:text-slate-800">Total Amount Paid</span>
                     <span className="text-3xl font-black font-outfit text-indigo-600 print:text-slate-800">₹{Number(selectedReceipt.amount).toFixed(2)}</span>
                  </div>
                  
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest pt-4">
                     CitySphere Municipal Corporation
                  </div>
               </div>

               <div className="p-6 bg-slate-50 flex space-x-4 border-t border-slate-100 print:hidden">
                  <button onClick={() => window.print()} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center shadow-md">
                     <Printer size={18} className="mr-2"/> Download PDF / Print
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Checkout Modal */}
      {checkoutBill && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center text-slate-800 font-bold font-outfit text-xl">
                     <ShieldCheck size={24} className="text-emerald-500 mr-2" /> Secure Checkout
                  </div>
                  <button onClick={() => setCheckoutBill(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center">
                     <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest block mb-1">Paying</span>
                     <span className="text-4xl font-black font-outfit text-indigo-900">₹{Number(checkoutBill.amount).toFixed(2)}</span>
                     <div className="text-indigo-700 font-medium mt-2">{checkoutBill.type} Bill</div>
                  </div>

                  {!paypalLoaded ? (
                     <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                     </div>
                  ) : (
                     <div id="paypal-button-container" className="pt-4 min-h-[150px]"></div>
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

export default CitizenFinancials;
