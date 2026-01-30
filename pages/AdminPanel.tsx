
import React, { useEffect, useState } from 'react';
import { subscribeToPendingReports, approveReportInDb, getUser, saveUser, verifyAdmin } from '../services/firebase';
import { calculateHealthScore, calculateNewPremium } from '../services/engine';
import { ClinicalReport, UserProfile } from '../types';
import { CheckCircle, XCircle, FileText, ChevronRight, AlertTriangle, Lock, ShieldCheck, ArrowRight, Activity, LogOut } from 'lucide-react';

const AdminPanel: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard State
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);

  useEffect(() => {
    // Check session on load
    const session = sessionStorage.getItem('optima_admin_auth');
    if (session === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        const unsub = subscribeToPendingReports(setReports);
        return () => unsub();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
        const admin = await verifyAdmin(email, password);
        if (admin) {
            sessionStorage.setItem('optima_admin_auth', 'true');
            setIsAuthenticated(true);
        } else {
            setAuthError('Invalid credentials. Access Denied.');
        }
    } catch (err) {
        setAuthError('Connection failed.');
    } finally {
        setAuthLoading(false);
    }
  };

  const handleLogout = () => {
      sessionStorage.removeItem('optima_admin_auth');
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
  };

  const handleApprove = async () => {
    if (!selectedReport) return;

    const user = await getUser(selectedReport.userId) as UserProfile;
    if (!user) return;

    // 2. Update metrics with Report Data (Merging Quarterly Data)
    const newMetrics = { 
        ...user.metrics, 
        ...selectedReport.extractedData // Merge HbA1c, Cholesterol etc.
    };
    
    // 3. Recalculate Score (Engine automatically uses Age-Weighted tables)
    const newScore = calculateHealthScore(newMetrics);

    // 4. Calculate Premium Adjustment (Compounding logic)
    // Compare new score vs previous score in history to determine trend
    const previousScore = user.premiumHistory.length > 0 
        ? user.premiumHistory[user.premiumHistory.length - 1].score 
        : 50;
        
    const { newPremium, percentChange, trendDesc } = calculateNewPremium(
        user.currentPremium, 
        newScore, 
        previousScore, 
        true // This is a Quarterly Update
    );

    const newCumulative = user.cumulativeAdjustment + percentChange;

    // 5. Update User Object
    const updatedUser: UserProfile = {
      ...user,
      metrics: newMetrics,
      healthScore: newScore,
      currentPremium: newPremium,
      cumulativeAdjustment: newCumulative,
      premiumHistory: [
        ...user.premiumHistory,
        { 
            month: new Date().toLocaleString('default', { month: 'short' }), 
            amount: newPremium, 
            score: newScore,
            trend: trendDesc 
        }
      ]
    };

    // 6. Save DB Updates
    await saveUser(updatedUser);
    await approveReportInDb(selectedReport.id);

    setSelectedReport(null);
  };

  // --- LOGIN SCREEN RENDER ---
  if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-slate-900 p-3 rounded-xl mb-4 shadow-lg shadow-teal-500/10 border border-slate-800">
                        <ShieldCheck className="h-8 w-8 text-teal-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Underwriting Access</h1>
                    <p className="text-slate-500 text-sm">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase">Admin ID</label>
                        <input 
                            type="email" 
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-500 transition-colors text-slate-900" 
                            placeholder="admin@healthiqure.in"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase">Secure Key</label>
                        <input 
                            type="password" 
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-500 transition-colors text-slate-900" 
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {authError && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
                            <AlertTriangle size={14} /> {authError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {authLoading ? 'Verifying...' : 'Authenticate'} <ArrowRight size={16} />
                    </button>
                    
                    <div className="text-center pt-4 border-t border-slate-100 mt-4">
                         <div className="text-[10px] text-slate-400">
                             Restricted System. IP Address Logged.
                             <br />Demo: admin@healthiqure.in / admin123
                         </div>
                    </div>
                </form>
            </div>
        </div>
      );
  }

  // --- DASHBOARD RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-teal-600 h-8 w-8 rounded flex items-center justify-center font-bold">HQ</div>
            <h1 className="text-lg font-bold tracking-tight">HealthIQure <span className="font-normal text-slate-400">| Underwriting Desk</span></h1>
        </div>
        <div className="flex items-center gap-6">
             <div className="text-sm text-slate-300">Admin: <span className="text-white font-semibold">Dr. S. Gupta</span></div>
             <div className="flex items-center gap-4">
                <div className="text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-emerald-400 font-mono">{reports.length} Pending</div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
                    <LogOut size={18} />
                </button>
             </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        
        {/* List */}
        <div className="col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-700">Incoming Queue</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No pending reports</div>}
            {reports.map(report => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${selectedReport?.id === report.id ? 'bg-teal-50 border-teal-500' : 'border-transparent'}`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-slate-900">{report.userName}</span>
                  <span className="text-xs text-slate-500 font-mono">{new Date(report.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText size={12} />
                  <span>Clinical Extraction (Gemini)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {selectedReport ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedReport.userName}</h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Report ID: {selectedReport.id.slice(-8)}</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-semibold transition-colors">Reject</button>
                    <button onClick={handleApprove} className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <CheckCircle size={16} /> Approve & Reprice
                    </button>
                </div>
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto grid grid-cols-2 gap-10">
                {/* Extracted Data */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Vitals</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Quarterly Panel</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-1 border border-slate-100 mb-6">
                        {Object.entries(selectedReport.extractedData).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                                <span className="text-sm font-medium text-slate-600 capitalize">{k}</span>
                                <span className="font-mono font-bold text-slate-900">{v as number}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div className="flex gap-2 items-start mb-2">
                             <AlertTriangle size={16} className="text-yellow-600 mt-0.5"/>
                             <h4 className="text-sm font-bold text-yellow-800">Actuarial Impact</h4>
                        </div>
                        <p className="text-xs text-yellow-800/80 leading-relaxed">
                            Approval will run <strong>engine.ts</strong>. If HbA1c &lt; 5.7 and Lipids &lt; 200, Score will likely increase > 5 points, triggering a <strong>"Strong Improvement"</strong> discount of 5%.
                        </p>
                    </div>
                </div>

                {/* Evidence Image */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Source Document</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-[400px] flex items-center justify-center relative group">
                        <img src={selectedReport.imageUrl} alt="Lab Report" className="max-w-full max-h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold">Zoom Verified</span>
                        </div>
                    </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <FileText size={64} className="mb-4 opacity-20" />
                <p className="font-medium">Select a claim to review</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
