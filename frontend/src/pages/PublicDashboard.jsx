import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Activity, CheckCircle, Clock, ArrowRight, ShieldCheck, Zap, Hexagon, MessageSquare, Lock, TrendingUp, Users, MapPin, Search, Leaf, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicDashboard = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, inProgress: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  // Rotating Headline Words
  const words = ["sustainable", "ecological", "efficient", "accountable", "green"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    fetchPublicStats();
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const fetchPublicStats = async () => {
    try {
      const { data, error } = await supabase.from('complaints').select('status, rating');
      if (error) throw error;
      
      let resolvedCount = 0;
      let inProgressCount = 0;
      let totalRating = 0;
      let ratedCount = 0;

      data.forEach(c => {
        if (c.status === 'resolved') resolvedCount++;
        if (c.status === 'in-progress') inProgressCount++;
        if (c.rating) {
          totalRating += c.rating;
          ratedCount++;
        }
      });

      setStats({
        total: data.length,
        resolved: resolvedCount,
        inProgress: inProgressCount,
        avgRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-teal-900/20" />
      <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6 relative z-10"></div>
      <p className="text-emerald-200 font-medium tracking-widest uppercase text-sm animate-pulse relative z-10">INITIALIZING ECO-GRID...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06110d] text-slate-300 font-inter selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* Nature City Background Texture */}
      <div 
         className="absolute top-0 inset-x-0 h-screen bg-cover bg-center opacity-10 pointer-events-none mix-blend-screen"
         style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}
      />
      
      {/* Glowing Nature Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-teal-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-lime-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-blob animation-delay-4000 pointer-events-none" />

      {/* Cyber Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#06110d]/60 backdrop-blur-2xl border-b border-emerald-900/30 shadow-2xl transition-all duration-300">
         <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center space-x-3 text-white font-outfit font-extrabold text-2xl tracking-tight">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <Hexagon size={24} />
               </div>
               <span>City<span className="text-emerald-400">Sphere</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-10 font-medium text-sm text-emerald-100/60">
               <a href="#stats" className="hover:text-emerald-300 transition-colors">Live Operations</a>
               <a href="#features" className="hover:text-emerald-300 transition-colors">Features</a>
               <a href="#how-it-works" className="hover:text-emerald-300 transition-colors">Architecture</a>
               <Link to="/login" className="group relative px-6 py-2.5 rounded-full font-bold text-white overflow-hidden flex items-center space-x-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center space-x-2">
                     <span>Access Portals</span>
                     <ArrowRight size={16} />
                  </span>
               </Link>
            </div>
         </div>
      </nav>

      <div className="relative z-10 pt-40 pb-24 overflow-hidden">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center mb-24">
           {/* Left Hero Content */}
           <div className="text-left animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
             
             <div className="inline-flex items-center space-x-3 bg-emerald-950/40 border border-emerald-800/50 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-2xl">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 uppercase tracking-wider text-xs">Environment Online</span>
             </div>
             
             <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight font-outfit tracking-tight">
               A smarter, more <br/>
               <span className="relative inline-block w-full h-[1.2em] overflow-hidden align-bottom">
                 {words.map((word, i) => (
                    <span 
                      key={word} 
                      className={`absolute left-0 transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 ${
                         i === wordIndex ? 'top-0 opacity-100' : 
                         i < wordIndex ? '-top-full opacity-0' : 'top-full opacity-0'
                      }`}
                    >
                      {word}
                    </span>
                 ))}
               </span>
               <br/>city for everyone.
             </h1>
             
             <p className="text-xl text-emerald-100/50 mb-10 leading-relaxed max-w-lg">
               The ultimate open-source sustainable municipal command center. Turn your phone into a civic tool to log issues, protect nature, and mobilize city workforce teams instantly.
             </p>
             
             <div className="flex flex-wrap items-center gap-5">
                <Link to="/register" className="relative group overflow-hidden rounded-full p-[1px] shadow-2xl">
                   <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-lime-500 rounded-full group-hover:opacity-80 transition-opacity"></span>
                   <div className="relative bg-[#06110d] px-8 py-4 rounded-full flex items-center space-x-2 transition-all group-hover:bg-opacity-0">
                      <span className="text-emerald-50 font-bold text-lg">Join the Initiative</span>
                      <Leaf size={20} className="text-emerald-400 group-hover:text-emerald-100 group-hover:translate-x-1 transition-all" />
                   </div>
                </Link>
                <a href="#how-it-works" className="px-8 py-4 rounded-full font-bold text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-900/20 border border-emerald-800/30 transition-all backdrop-blur-sm">
                  System Architecture
                </a>
             </div>
           </div>
           
           {/* Right 3D Perspective Graphic */}
           <div className="hidden lg:block relative perspective-1000 animate-fade-in opacity-0 h-[600px]" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
               <div className="absolute inset-0 transform rotate-y-[-15deg] rotate-x-[10deg] scale-105">
                  
                  {/* Glass Dashboard Base */}
                  <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-2xl border border-emerald-500/20 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
                     <div className="h-16 border-b border-emerald-500/10 flex items-center px-8 bg-black/30">
                        <div className="flex space-x-2">
                           <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                           <div className="w-3 h-3 rounded-full bg-teal-500/80"></div>
                           <div className="w-3 h-3 rounded-full bg-lime-500/80"></div>
                        </div>
                        <div className="mx-auto bg-black/40 px-6 py-1.5 rounded-md border border-emerald-500/10 flex items-center space-x-2">
                           <Lock size={12} className="text-emerald-400" />
                           <span className="text-xs text-emerald-200/50 font-mono tracking-wider">citysphere://eco-dash</span>
                        </div>
                     </div>
                     <div className="p-8 flex-1 relative overflow-hidden">
                        
                        {/* Live Floating Cards */}
                        <div className="absolute right-8 top-12 left-8 h-full flex flex-col space-y-6">
                           <div className="bg-[#05140e]/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/10 flex items-center space-x-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform translate-x-4">
                              <div className="bg-red-500/10 p-4 rounded-xl text-red-400 border border-red-500/20"><MapPin size={24} /></div>
                              <div>
                                 <p className="text-emerald-50 font-bold text-lg font-outfit">Critical: Illegal Dumping</p>
                                 <p className="text-sm text-emerald-200/60 font-mono mt-1">LAT 40.71 • LNG -74.00 • PRIORITY: HIGH</p>
                              </div>
                           </div>

                           <div className="bg-[#05140e]/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/10 flex items-center space-x-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform -translate-x-2">
                              <div className="bg-amber-500/10 p-4 rounded-xl text-amber-400 border border-amber-500/20"><Zap size={24} /></div>
                              <div>
                                 <p className="text-emerald-50 font-bold text-lg font-outfit">Cleanup Unit Dispatched</p>
                                 <p className="text-sm text-emerald-200/60 font-mono mt-1">Staff ID #8493 en route to location.</p>
                              </div>
                           </div>

                           <div className="bg-[#05140e]/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/10 flex items-center space-x-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform translate-x-8">
                              <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400 border border-emerald-500/20"><CheckCircle size={24} /></div>
                              <div>
                                 <p className="text-emerald-50 font-bold text-lg font-outfit">Area Restored</p>
                                 <p className="text-sm text-emerald-400/80 font-mono mt-1">+ Image Proof Attached. Ticket Closed.</p>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
           </div>
        </div>

        {/* Global Impact Banner */}
        <div className="border-y border-emerald-500/10 bg-emerald-900/[0.02] py-8 backdrop-blur-sm mb-32 overflow-hidden flex whitespace-nowrap">
           <div className="animate-pulse flex items-center justify-center space-x-16 px-8 text-emerald-200/50 font-outfit font-bold tracking-widest uppercase text-sm w-full opacity-80">
              <span className="flex items-center"><Leaf size={18} className="mr-2"/> Eco-Friendly</span>
              <span className="flex items-center"><Zap size={18} className="mr-2"/> Green Energy Edge</span>
              <span className="flex items-center"><ShieldCheck size={18} className="mr-2"/> Data Privacy</span>
              <span className="flex items-center"><Activity size={18} className="mr-2"/> Real-time Sync</span>
              <span className="flex items-center"><Users size={18} className="mr-2"/> Community First</span>
           </div>
        </div>

        {/* Live Metrics Grid (Nature edition) */}
        <div id="stats" className="max-w-7xl mx-auto px-6 mb-40">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                 <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block border-l-2 border-emerald-400 pl-3">Live Telemetry</span>
                 <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-emerald-50 tracking-tight">Radical Transparency.</h2>
              </div>
              <p className="text-emerald-100/60 font-medium max-w-md mt-4 md:mt-0 leading-relaxed text-sm lg:text-base">
                 We bypass closed filing cabinets to pipe raw operational statistics directly from the municipal database to your screen, instantaneously.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-emerald-900/10 backdrop-blur-md p-8 rounded-3xl border border-emerald-500/10 hover:bg-emerald-900/20 transition-colors group relative overflow-hidden">
               <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 mb-8 border border-teal-500/30">
                  <Activity size={28} />
               </div>
               <h3 className="text-6xl font-extrabold text-emerald-50 mb-3 font-outfit tracking-tighter">{stats.total}</h3>
               <p className="text-sm text-emerald-200/60 font-bold tracking-widest uppercase">Verified Issues</p>
               <div className="absolute -bottom-2 -right-2 text-teal-500/10 group-hover:scale-150 transition-transform duration-700">
                  <Activity size={120} />
               </div>
             </div>
             
             <div className="bg-emerald-900/10 backdrop-blur-md p-8 rounded-3xl border border-emerald-500/10 hover:bg-emerald-900/20 transition-colors group relative overflow-hidden">
               <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/30">
                  <CheckCircle size={28} />
               </div>
               <h3 className="text-6xl font-extrabold text-emerald-50 mb-3 font-outfit tracking-tighter">{stats.resolved}</h3>
               <p className="text-sm text-emerald-200/60 font-bold tracking-widest uppercase">Fixed & Audited</p>
               <div className="absolute -bottom-2 -right-2 text-emerald-500/10 group-hover:scale-150 transition-transform duration-700">
                  <CheckCircle size={120} />
               </div>
             </div>
             
             <div className="bg-emerald-900/10 backdrop-blur-md p-8 rounded-3xl border border-emerald-500/10 hover:bg-emerald-900/20 transition-colors group relative overflow-hidden">
               <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-8 border border-amber-500/30">
                  <Clock size={28} />
               </div>
               <h3 className="text-6xl font-extrabold text-emerald-50 mb-3 font-outfit tracking-tighter">{stats.inProgress}</h3>
               <p className="text-sm text-emerald-200/60 font-bold tracking-widest uppercase">Teams Deployed</p>
               <div className="absolute -bottom-2 -right-2 text-amber-500/10 group-hover:scale-150 transition-transform duration-700">
                  <Clock size={120} />
               </div>
             </div>
             
             <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl p-8 rounded-3xl border border-emerald-400/30 group relative overflow-hidden">
               <div className="w-14 h-14 rounded-2xl bg-emerald-50/10 flex items-center justify-center text-emerald-50 mb-8 border border-emerald-50/20">
                  <span className="text-2xl font-bold">★</span>
               </div>
               <h3 className="text-6xl font-extrabold text-emerald-50 mb-3 font-outfit tracking-tighter flex items-baseline">
                  {stats.avgRating} <span className="text-2xl text-emerald-50/40 ml-1 font-medium tracking-normal">/ 5.0</span>
               </h3>
               <p className="text-sm text-emerald-200 font-bold tracking-widest uppercase">Citizen Satisfaction</p>
               <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
             </div>
           </div>
        </div>

        {/* Architecture / How It Works Section */}
        <div id="how-it-works" className="max-w-7xl mx-auto px-6 mb-40 pt-20">
           <div className="text-center mb-16">
              <span className="text-lime-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">System Workflow</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-emerald-50 tracking-tight">How CitySphere Operates</h2>
              <p className="text-emerald-100/60 max-w-2xl mx-auto mt-6 text-lg">A fully integrated municipal pipeline connecting citizens directly to resolution teams via high-speed edge networks.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting lines for desktop */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 -translate-y-1/2 z-0"></div>
              
              <div className="relative z-10 bg-[#05140e]/90 backdrop-blur-xl border border-emerald-500/20 p-8 rounded-[2rem] shadow-2xl hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-16 h-16 bg-emerald-900/50 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 mb-6 shadow-inner mx-auto">
                    <span className="text-2xl font-black font-outfit">1</span>
                 </div>
                 <h3 className="text-center text-xl font-bold text-emerald-50 mb-4 font-outfit">Citizen Reporting</h3>
                 <p className="text-emerald-100/70 text-center text-sm leading-relaxed">Citizens log in via a strictly authenticated portal to submit geotagged issues, attach photographic evidence, and file municipal service requests.</p>
              </div>

              <div className="relative z-10 bg-[#05140e]/90 backdrop-blur-xl border border-teal-500/20 p-8 rounded-[2rem] shadow-2xl hover:-translate-y-2 transition-transform duration-300 transform md:scale-105 border-b-4 border-b-teal-500/50">
                 <div className="w-16 h-16 bg-teal-900/50 rounded-2xl flex items-center justify-center border border-teal-500/30 text-teal-400 mb-6 shadow-inner mx-auto">
                    <span className="text-2xl font-black font-outfit">2</span>
                 </div>
                 <h3 className="text-center text-xl font-bold text-emerald-50 mb-4 font-outfit">Staff Dispatch</h3>
                 <p className="text-teal-100/70 text-center text-sm leading-relaxed">Admin nodes automatically route verified payloads to the Field Staff tracking queue. Field workers mark tickets as "In Progress" and resolve them dynamically on site.</p>
              </div>

              <div className="relative z-10 bg-[#05140e]/90 backdrop-blur-xl border border-lime-500/20 p-8 rounded-[2rem] shadow-2xl hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-16 h-16 bg-lime-900/50 rounded-2xl flex items-center justify-center border border-lime-500/30 text-lime-400 mb-6 shadow-inner mx-auto">
                    <span className="text-2xl font-black font-outfit">3</span>
                 </div>
                 <h3 className="text-center text-xl font-bold text-emerald-50 mb-4 font-outfit">Real-time Resolution</h3>
                 <p className="text-lime-100/70 text-center text-sm leading-relaxed">Upon staff resolution, the central database instantly beams robust WebSocket payloads back to the Citizen's device, securely closing the bureaucratic loop.</p>
              </div>
           </div>
        </div>

        {/* Features 6-Grid */}
        <div id="features" className="max-w-7xl mx-auto px-6 mb-40">
           <div className="text-center mb-20">
              <span className="text-teal-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block text-center">Platform Architecture</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-emerald-50 tracking-tight">Built for Scale & Security.</h2>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              <div className="group">
                 <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-500 group-hover:text-emerald-50 transition-all duration-300">
                    <Lock size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Identity & Access</h4>
                 <p className="text-emerald-100/60 leading-relaxed">Strictly isolated routing portals powered by JSON Web Tokens and Row Level Security, ensuring data privacy at the foundational database level.</p>
              </div>
              <div className="group">
                 <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-emerald-50 transition-all duration-300">
                    <TrendingUp size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Real-time Sockets</h4>
                 <p className="text-emerald-100/60 leading-relaxed">Our unified dashboard establishes persistent secure WebSocket connections, broadcasting resolution changes globally within milliseconds.</p>
              </div>
              <div className="group">
                 <div className="w-14 h-14 bg-lime-500/10 border border-lime-500/20 rounded-2xl flex items-center justify-center text-lime-400 mb-6 group-hover:bg-lime-500 group-hover:text-emerald-50 transition-all duration-300">
                    <Users size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Digital KYC</h4>
                 <p className="text-emerald-100/60 leading-relaxed">City staff must complete an extensive cryptographic onboarding procedure requiring uploaded state credentials prior to authorization.</p>
              </div>
              <div className="group">
                 <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-emerald-50 transition-all duration-300">
                    <MessageSquare size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Continuous Evaluation</h4>
                 <p className="text-emerald-100/60 leading-relaxed">Closed complaints trigger interactive feedback loops where citizens submit qualitative and quantitative ratings, ensuring bureaucratic accountability.</p>
              </div>
              <div className="group">
                 <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-emerald-50 transition-all duration-300">
                    <Search size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Data Liquidity</h4>
                 <p className="text-emerald-100/60 leading-relaxed">CitySphere automatically structures chaotic field data and renders it back to public dashboards so nobody is left in the dark regarding operations.</p>
              </div>
              <div className="group">
                 <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-400 mb-6 group-hover:bg-green-500 group-hover:text-emerald-50 transition-all duration-300">
                    <Zap size={26} />
                 </div>
                 <h4 className="text-2xl font-bold text-emerald-50 mb-3 font-outfit">Edge Infrastructure</h4>
                 <p className="text-emerald-100/60 leading-relaxed">Serverless deployment across global edge nodes guarantees robust uptime, automated scaling, and nearly unnoticeable UI latencies.</p>
              </div>
           </div>
        </div>

        {/* Supported Services Section */}
        <div className="max-w-7xl mx-auto px-6 mb-40 pt-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                 <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Civic Capabilities</span>
                 <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-emerald-50 tracking-tight">Everything you need, <br className="hidden md:block"/>in one portal.</h2>
              </div>
              <p className="text-emerald-100/60 max-w-md mt-6 md:mt-0 text-lg">CitySphere isn't just for complaints. It's a comprehensive digital town hall designed to handle complex municipal logistics.</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { icon: <MapPin size={24}/>, title: "Infrastructure Reports", desc: "Log potholes, broken streetlights, or damaged public property with pinpoint GPS accuracy." },
                 { icon: <FileText size={24}/>, title: "Official Certificates", desc: "Apply for birth, death, and marriage certificates seamlessly with digital document uploads." },
                 { icon: <Zap size={24}/>, title: "Utility Connections", desc: "Request new water or electricity connections and track the dispatch of city engineers." },
                 { icon: <Shield size={24}/>, title: "Emergency Broadcasts", desc: "Receive instant push notifications from the municipal admin during city-wide emergencies." }
              ].map((service, i) => (
                 <div key={i} className="bg-emerald-950/20 backdrop-blur-md p-8 rounded-[2rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">{service.icon}</div>
                    <h4 className="text-xl font-bold text-emerald-50 mb-3">{service.title}</h4>
                    <p className="text-sm text-emerald-100/60 leading-relaxed">{service.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-6 mb-40">
           <div className="text-center mb-16">
              <span className="text-teal-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Support & Questions</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold font-outfit text-emerald-50 tracking-tight">Frequently Asked Questions</h2>
           </div>

           <div className="space-y-4">
              {[
                 { q: "Is CitySphere completely free for citizens to use?", a: "Yes. The citizen portal is a public utility. Only municipality administrators and field staff require enterprise licenses." },
                 { q: "How long does it take for a complaint to be resolved?", a: "This depends on the issue priority and the city's specific SLA (Service Level Agreement). Critical issues like water leaks are flagged for immediate dispatch." },
                 { q: "Are my uploaded documents secure?", a: "Absolutely. Documents are uploaded securely to Supabase Storage buckets governed by strict Row Level Security (RLS) policies. Only authorized admins can view your certificates." },
                 { q: "Can I track the exact location of the field staff?", a: "For security and privacy reasons, exact live location of staff is restricted. However, you will receive real-time updates when they are dispatched and when they arrive on site." }
              ].map((faq, i) => (
                 <details key={i} className="group bg-[#06110d] border border-emerald-900/40 rounded-2xl overflow-hidden cursor-pointer open:bg-emerald-900/10 transition-colors">
                    <summary className="flex justify-between items-center px-8 py-6 font-bold text-lg text-emerald-50 select-none">
                       {faq.q}
                       <span className="text-emerald-500 transition-transform duration-300">
                          <svg className="group-open:rotate-180" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                       </span>
                    </summary>
                    <div className="px-8 pb-6 text-emerald-100/60 leading-relaxed cursor-text">
                       {faq.a}
                    </div>
                 </details>
              ))}
           </div>
        </div>

        {/* Call to action (Nature Cyber) */}
        <div className="max-w-6xl mx-auto px-6 mb-24 relative">
           <div className="relative rounded-[3rem] p-[1px] overflow-hidden bg-gradient-to-b from-emerald-500/20 to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent blur-xl pointer-events-none"></div>
              <div className="bg-[#05140e]/90 backdrop-blur-2xl rounded-[3rem] p-12 md:p-24 text-center relative z-10 border border-emerald-500/10 shadow-2xl">
                 <h2 className="text-4xl md:text-6xl font-extrabold text-emerald-50 mb-6 font-outfit tracking-tight">Deploy the City of the Future.</h2>
                 <p className="text-xl text-emerald-100/60 mb-12 max-w-2xl mx-auto leading-relaxed">Gain absolute situational awareness of your surrounding infrastructure. Create your digital passport and start shaping a sustainable municipality today.</p>
                 <Link to="/register" className="inline-flex items-center space-x-3 bg-emerald-50 text-emerald-950 px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all">
                    <span>Generate Access Token</span>
                    <ArrowRight size={20} />
                 </Link>
              </div>
           </div>
        </div>

      </div>

      <footer className="bg-[#030a07] text-emerald-100/40 py-16 border-t border-emerald-900/40 relative z-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center space-x-2 text-emerald-50 font-outfit font-bold text-2xl tracking-tight mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-emerald-50"><Hexagon size={18} /></div>
                  <span>CitySphere</span>
               </div>
               <p className="max-w-sm mb-6 leading-relaxed">The open-source hyper-municipal management abstraction engine designed to unify administrators, field personnel, and normal citizens.</p>
            </div>
            <div>
               <h4 className="text-emerald-50 font-bold mb-6 font-outfit tracking-wide uppercase text-sm">Portals</h4>
               <ul className="space-y-4 font-medium text-sm">
                  <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Citizen Gateway</Link></li>
                  <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Field Staff Connect</Link></li>
                  <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Admin Governance</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="text-emerald-50 font-bold mb-6 font-outfit tracking-wide uppercase text-sm">Infrastructure</h4>
               <ul className="space-y-4 font-medium text-sm">
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">API Documentation</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Security Disclosures</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition-colors">Data Privacy Manifest</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-emerald-900/40 flex flex-col md:flex-row justify-between items-center text-xs font-mono">
            <p>V2.0.0 © 2026 CITYSPHERE INITIATIVE. ALL SYSTEMS NORMAL.</p>
            <p className="mt-4 md:mt-0 flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span> NETWORK LINK: ACTIVE
            </p>
         </div>
      </footer>
    </div>
  );
};

export default PublicDashboard;
