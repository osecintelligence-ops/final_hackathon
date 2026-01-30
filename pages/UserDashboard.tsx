import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Camera, Activity, AlertCircle, Sparkles, LogOut, TrendingUp, TrendingDown, Calendar, RefreshCw, CheckSquare, Lock, Watch, ShieldAlert, FileWarning, ArrowRight, Brain, UserCheck, ShieldCheck, CheckCircle2, Shield } from 'lucide-react';
import { subscribeToUser, submitReport } from '../services/firebase';
import { extractClinicalData, getAIHealthNudges } from '../services/geminiService';
import { UserProfile, ClinicalReport, ReportStatus, Nudge } from '../types';
import { useNavigate } from 'react-router-dom';

const getVitalStatus = (val: number, type: 'bmi' | 'bp' | 'sugar') => {
  if (type === 'bmi') return (val >= 18.5 && val <= 24.9) ? 'Healthy' : 'Attention';
  if (type === 'bp') return (val >= 110 && val <= 125) ? 'Optimal' : 'Check';
  if (type === 'sugar') return (val >= 70 && val <= 100) ? 'Normal' : 'Check';
  return 'Check';
};

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  
  // --- WORKFLOW STATE MANAGEMENT ---
  const [step, setStep] = useState<'IDLE' | 'WARNING' | 'ANALYZING' | 'REVIEW' | 'SUBMITTED' | 'APPROVED'>('IDLE');
  
  // Data States
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [extractedReview, setExtractedReview] = useState<any>(null); 
  const [submitting, setSubmitting] = useState(false);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [uploadDateDisplay, setUploadDateDisplay] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('optima_user_id');
    if (!userId) {
        navigate('/');
        return;
    }

    const unsub = subscribeToUser(userId, (data) => {
      if (data) {
        setUser(data);
        setLoading(false);
        if (data.metrics) {
            getAIHealthNudges(data.metrics).then(setNudges);
        }
      } else {
        // Handle case where ID in localstorage doesn't exist in DB
        localStorage.removeItem('optima_user_id');
        navigate('/');
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('optima_user_id');
    navigate('/');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload an image or PDF smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setReportImage(base64);
      setUploadDateDisplay(new Date().toLocaleDateString());
      setStep('WARNING'); 
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToAnalysis = async () => {
    if (!reportImage) return;
    setStep('ANALYZING');
    try {
        const data = await extractClinicalData(reportImage);
        setExtractedReview(data);
        setStep('REVIEW');
    } catch (e) {
        alert("Error analyzing file. Please try a clearer image.");
        setStep('IDLE');
        setReportImage(null);
    }
  };

  const confirmSubmission = async () => {
    if (!user || !extractedReview || !reportImage) return;
    try {
        setSubmitting(true);
        const cleanData = { ...extractedReview };
        delete cleanData.isMock;
        const report: ClinicalReport = {
          id: `report_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          uploadDate: new Date().toISOString(),
          status: ReportStatus.ADMIN_PENDING,
          imageUrl: reportImage,
          extractedData: cleanData
        };
        await submitReport(report);
        setSubmitting(false);
        setStep('SUBMITTED');
        setTimeout(() => {
           setExtractedReview(null);
           setReportImage(null);
           setStep('IDLE'); 
        }, 5000);
    } catch (error) {
        console.error("Submission failed", error);
        setSubmitting(false);
    }
  };

  const handleDiscard = () => {
      setReportImage(null);
      setExtractedReview(null);
      setStep('IDLE');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50 font-medium">Loading Secure Health Data...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50">User not found. Please log in again.</div>;

  // Derived Calculations
  const savingsAmount = user.basePremium - user.currentPremium;
  const savingsPercent = Math.round((savingsAmount / user.basePremium) * 100);
  
  // Logic Fix: Only excellent if actual savings exist.
  const isDiscount = savingsAmount > 0;
  const isLoading = savingsAmount < 0;
  // If savingsAmount === 0, it's neutral/standard

  const bmi = (user.metrics.weight / ((user.metrics.height/100)**2)).toFixed(1);

  const steps = [
      { id: 'analysis', label: 'AI Analysis', icon: Brain },
      { id: 'verify', label: 'Self Verify', icon: UserCheck },
      { id: 'admin', label: 'Admin Review', icon: ShieldCheck },
      { id: 'approved', label: 'Approved', icon: CheckCircle2 }
  ];

  const getCurrentStepIndex = () => {
      switch(step) {
          case 'IDLE': case 'WARNING': case 'ANALYZING': return 0;
          case 'REVIEW': return 1;
          case 'SUBMITTED': return 2;
          case 'APPROVED': return 3;
          default: return 0;
      }
  };
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 selection:bg-teal-100">
      <header className="bg-white/80 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-600 p-1.5 rounded-lg shadow-sm shadow-teal-600/20">
                <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Health<span className="text-teal-600">IQ</span>ure</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setWearableConnected(!wearableConnected)}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${wearableConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
                {wearableConnected ? (
                    <><RefreshCw size={12} className="animate-spin-slow" /> Live Sync: Apple Health</>
                ) : (
                    <><Watch size={12} /> Connect Device</>
                )}
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block leading-tight">
                    <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-wide">ID: {user.id.slice(0,8)}</div>
                </div>
                <div className="h-9 w-9 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
                    {user.name.charAt(0)}
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                    <LogOut size={18} />
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden flex items-center justify-between group">
                <div className="relative z-10 max-w-lg">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border ${isDiscount ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        <Sparkles size={12} className={isDiscount ? "fill-teal-700" : "text-slate-500"}/> Dynamic Pricing Engine
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                        {isDiscount 
                            ? `Excellent Work, ${user.name.split(' ')[0]}!` 
                            : isLoading 
                                ? "Action Required" 
                                : `Welcome, ${user.name.split(' ')[0]}!`}
                    </h1>
                    
                    <p className="text-slate-500 text-lg leading-relaxed">
                        {isDiscount 
                            ? <span>Your consistent healthy habits have unlocked a <span className="font-bold text-teal-600">{savingsPercent}% premium discount</span> this month.</span>
                            : isLoading 
                                ? <span>Your current health score has triggered a <span className="font-bold text-red-600">Risk Loading</span>. Upload new reports to improve.</span>
                                : "Upload your latest clinical report to verify your vitals and start reducing your premium."}
                    </p>
                </div>
                
                <div className="hidden md:block relative z-10">
                     <div className="text-right">
                        <div className="text-sm font-medium text-slate-400 mb-1">{isDiscount ? "Current Savings" : "Potential Savings"}</div>
                        <div className={`text-4xl font-bold tracking-tight ${isDiscount ? 'text-emerald-500' : 'text-slate-300'}`}>
                             {isDiscount ? `₹${savingsAmount}` : '₹0'}
                             <span className="text-lg font-normal text-slate-300">/mo</span>
                        </div>
                     </div>
                </div>

                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-teal-50 to-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-900/10 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <Calendar size={14} className="text-teal-400" /> Next Review
                    </div>
                    <div className="text-2xl font-bold mb-1">April 1, 2025</div>
                    <div className="text-xs text-slate-400">Submission Window: Mar 25 - Mar 31</div>
                    <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-end">
                        <div>
                            <div className="text-xs text-slate-500">Predicted Score</div>
                            <div className="font-bold text-emerald-400 text-lg">89 <span className="text-xs text-slate-600">▲</span></div>
                        </div>
                        <ArrowRight size={18} className="text-slate-600" />
                    </div>
                </div>
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Health Score */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Health Score</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className={`h-2 w-2 rounded-full ${user.healthScore >= 80 ? 'bg-emerald-500' : user.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-medium text-slate-500">{user.healthScore >= 80 ? 'Excellent' : user.healthScore >= 50 ? 'Fair' : 'Needs Attention'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="relative h-36 w-36 flex-shrink-0">
                                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                    <path className={`${user.healthScore >= 80 ? 'text-emerald-500' : user.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${user.healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-slate-900 tracking-tighter">{user.healthScore}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">/ 100</span>
                                </div>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="text-slate-500 font-medium">BMI Status</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getVitalStatus(Number(bmi), 'bmi') === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{getVitalStatus(Number(bmi), 'bmi')}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-slate-800 h-1.5 rounded-full" style={{width: '40%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5">
                                        <span className="text-slate-500 font-medium">Daily Steps</span>
                                        <span className="font-bold text-slate-900">{user.metrics.dailySteps}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-teal-500 h-1.5 rounded-full" style={{width: `${Math.min(100, (user.metrics.dailySteps/10000)*100)}%`}}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                         <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Your Premium</h3>
                            <p className="text-xs text-slate-500">Monthly auto-debit amount</p>
                         </div>
                         
                         <div className="mt-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">₹{user.currentPremium}</span>
                                <span className="text-sm text-slate-400 line-through">₹{user.basePremium}</span>
                            </div>
                            
                            <div className={`mt-6 p-3 rounded-xl flex items-center gap-3 ${
                                isDiscount 
                                    ? 'bg-emerald-50/50 text-emerald-800 border border-emerald-100' 
                                    : isLoading 
                                        ? 'bg-red-50/50 text-red-800 border border-red-100'
                                        : 'bg-blue-50/50 text-blue-800 border border-blue-100'
                            }`}>
                                <div className={`p-1.5 rounded-lg ${
                                    isDiscount ? 'bg-emerald-100' : isLoading ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                    {isDiscount ? <TrendingDown size={16} /> : isLoading ? <TrendingUp size={16} /> : <Shield size={16} />}
                                </div>
                                <div className="leading-tight">
                                    <div className="font-bold text-sm">
                                        {isDiscount ? 'Discount Active' : isLoading ? 'Loading Applied' : 'Standard Rate'}
                                    </div>
                                    <div className="text-[10px] opacity-80 uppercase tracking-wide font-semibold mt-0.5">
                                        {isDiscount ? 'Wellness Reward' : isLoading ? 'Risk Adjustment' : 'Base Coverage'}
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Premium History</h3>
                            <p className="text-sm text-slate-500 mt-1">Tracking your financial savings over time</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-50"></span> Paid Premium
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span> Base Rate
                            </div>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={user.premiumHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '12px' }} 
                                    formatter={(val: number) => [`₹${val}`, "Premium"]}
                                    labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                                />
                                <ReferenceLine y={user.basePremium} stroke="#cbd5e1" strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorPremium)" activeDot={{ r: 6, fill: "#0d9488", stroke: "white", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Nudges */}
                <div>
                     <div className="flex items-center gap-2 mb-5">
                        <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-700">
                             <Sparkles size={16} />
                        </div>
                        <h3 className="font-bold text-slate-900">AI Health Recommendations</h3>
                     </div>
                     <div className="grid md:grid-cols-3 gap-4">
                        {nudges.map((nudge, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-default">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                                    {nudge.icon === 'shoe' ? '👟' : nudge.icon === 'water' ? '💧' : nudge.icon === 'bed' ? '🛌' : '🍎'}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{nudge.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{nudge.description}</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Live Vitals</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div className="text-sm">
                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Blood Pressure</div>
                                <div className="font-bold text-slate-900 text-lg">{user.metrics.systolicBP} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                            </div>
                            <div className={`h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white ${getVitalStatus(user.metrics.systolicBP, 'bp') === 'Optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div className="text-sm">
                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Fasting Sugar</div>
                                <div className="font-bold text-slate-900 text-lg">{user.metrics.fastingSugar} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                            </div>
                            <div className={`h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white ${getVitalStatus(user.metrics.fastingSugar, 'sugar') === 'Normal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div className="text-sm">
                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Weight</div>
                                <div className="font-bold text-slate-900 text-lg">{user.metrics.weight} <span className="text-xs font-normal text-slate-400">kg</span></div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">BMI {bmi}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg shadow-teal-900/5 border border-slate-100 sticky top-28 overflow-hidden">
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-teal-500 rounded-full animate-pulse"></div>
                            <h3 className="font-bold text-slate-900">Quarterly Review</h3>
                        </div>
                        <p className="text-xs text-slate-500">Actuarial verification workflow.</p>
                    </div>

                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-0"></div>
                            <div 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-500 -z-0 transition-all duration-500 ease-in-out" 
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>
                            {steps.map((s, idx) => {
                                const isCompleted = currentStepIndex > idx;
                                const isActive = currentStepIndex === idx;
                                return (
                                    <div key={s.id} className="relative z-10 flex flex-col items-center">
                                        <div 
                                            className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                isCompleted 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                    : isActive 
                                                        ? 'bg-white border-teal-500 text-teal-600 shadow-lg shadow-teal-500/20 scale-110' 
                                                        : 'bg-white border-slate-200 text-slate-300'
                                            }`}
                                        >
                                            {isCompleted ? <CheckSquare size={14} /> : <s.icon size={14} />}
                                        </div>
                                        {isActive && (
                                            <div className="absolute -bottom-6 w-24 text-center">
                                                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">{s.label}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="p-6 pt-8">
                        {step === 'IDLE' && (
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-all group cursor-pointer bg-slate-50/30">
                                <div className="h-12 w-12 bg-white text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Upload Report</h4>
                                <p className="text-xs text-slate-500 mb-4">Support for JPG, PNG, PDF</p>
                                <label className="block">
                                    <span className="sr-only">Choose file</span>
                                    <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer file:transition-colors file:cursor-pointer"/>
                                </label>
                            </div>
                        )}

                        {step === 'WARNING' && (
                            <div className="bg-red-50/50 border border-red-100 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
                                <div className="bg-red-500 p-3 flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
                                    <ShieldAlert size={14} /> Fraud Protocol Active
                                </div>
                                <div className="p-5">
                                    <div className="flex gap-3 mb-4">
                                        <FileWarning className="text-red-500 shrink-0 h-6 w-6 mt-1" />
                                        <div className="text-xs text-red-900/80 leading-relaxed">
                                            <strong className="block mb-1 text-sm text-red-900">Do not upload edited documents.</strong>
                                            Digital tampering is detectable by our AI and constitutes insurance fraud.
                                            {uploadDateDisplay && <div className="mt-2 text-slate-500 font-medium">Uploaded: {uploadDateDisplay}</div>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={handleDiscard} className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                                        <button onClick={handleProceedToAnalysis} className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                                            Agree & Analyze <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'ANALYZING' && (
                            <div className="border border-teal-100 bg-teal-50/20 rounded-2xl p-8 text-center">
                                <div className="relative h-16 w-16 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="text-teal-600 h-6 w-6 animate-pulse" />
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">Processing Vitals...</h4>
                                <p className="text-[10px] text-slate-400 mt-1">Gemini Vision Engine</p>
                            </div>
                        )}

                        {step === 'REVIEW' && extractedReview && (
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in zoom-in-95 shadow-sm">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-teal-500"/> Verified Data
                                    </span>
                                </div>
                                <div className="p-4 space-y-3">
                                    {Object.entries(extractedReview).filter(([k]) => k !== 'isMock').map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                                            <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{val as string}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                                    <button onClick={handleDiscard} className="py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Discard</button>
                                    <button 
                                        onClick={confirmSubmission} 
                                        disabled={submitting}
                                        className="py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex justify-center items-center gap-2"
                                    >
                                        {submitting ? <RefreshCw className="animate-spin" size={14}/> : 'Submit to Admin'}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {step === 'SUBMITTED' && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-in zoom-in-95">
                                <div className="h-12 w-12 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-emerald-900 text-sm">Submission Received</h4>
                                <p className="text-xs text-emerald-700/80 mt-1 mb-4">Your report is now under actuarial review.</p>
                                <div className="text-[10px] text-emerald-600 font-medium bg-white/50 py-1 px-3 rounded-full inline-block">
                                    Est. Adjustment: 24 Hours
                                </div>
                            </div>
                        )}

                        {step === 'IDLE' && (
                            <div className="mt-6 flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                    Skipping this quarter's upload will result in a <span className="font-bold text-slate-600">5% risk loading</span> on next month's premium.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;