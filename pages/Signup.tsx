
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Check, User, Ruler, Lock, Wine, FileWarning } from 'lucide-react';
import { calculateBaselinePremium } from '../services/engine';
import { saveUser } from '../services/firebase';
import { UserProfile, RiskZone } from '../types';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: '',
    age: 29,
    weight: 72,
    height: 175,
    smoker: false,
    alcohol: false,
    preExistingConditions: false,
    dailySteps: 6500,
    systolicBP: 118,
    fastingSugar: 92
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  const [estimatedPremium, setEstimatedPremium] = useState(0);

  useEffect(() => {
    const base = calculateBaselinePremium(formData.age, formData.smoker);
    setEstimatedPremium(base);
  }, [formData.age, formData.smoker]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });

    if (e.target.name === 'password') {
        checkPasswordStrength(val as string);
    }
  };

  const checkPasswordStrength = (pass: string) => {
      let score = 0;
      if (pass.length >= 8) score++;
      if (/[A-Z]/.test(pass)) score++;
      if (/[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;
      
      setPasswordStrength(score);
      
      if (score < 2) setPasswordFeedback('Weak: Use 8+ chars, mixed case, numbers');
      else if (score < 4) setPasswordFeedback('Medium: Add special chars for better security');
      else setPasswordFeedback('Strong');
  };

  const handleFinish = () => {
    if (passwordStrength < 2) {
        alert("Please choose a stronger password.");
        setStep(1);
        return;
    }

    setLoading(true);
    
    // Construct User Profile
    const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        joinedDate: new Date().toISOString(),
        metrics: {
            age: Number(formData.age),
            weight: Number(formData.weight),
            height: Number(formData.height),
            systolicBP: Number(formData.systolicBP),
            fastingSugar: Number(formData.fastingSugar),
            dailySteps: Number(formData.dailySteps),
            smoker: Boolean(formData.smoker),
            alcohol: Boolean(formData.alcohol),
            preExistingConditions: Boolean(formData.preExistingConditions)
        },
        basePremium: estimatedPremium,
        currentPremium: estimatedPremium,
        healthScore: 50, // Initial provisional score
        cumulativeAdjustment: 0,
        premiumHistory: [
            { month: 'Start', amount: estimatedPremium, score: 50, trend: 'Policy Issued' }
        ]
    };

    // Save to local storage for instant access
    localStorage.setItem('optima_user_id', newUser.id);

    // Attempt to save to Firebase in background (fire and forget)
    saveUser(newUser).catch(err => console.warn("Background save failed:", err));
    
    // Guarantees navigation after 1.5s regardless of backend status
    setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Sidebar / Summary */}
        <div className="w-full md:w-1/3 bg-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Activity className="text-teal-400" />
              <span className="font-bold text-lg tracking-wide">HealthIQure</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Live Quote</h2>
            <p className="text-slate-400 text-sm mb-6">Pricing updates in real-time.</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Base Premium</div>
                <div className="text-3xl font-bold text-emerald-400">₹{estimatedPremium}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              </div>
              <div className="text-xs text-slate-500">
                 Includes ₹5 Lakh Base Cover + Critical Illness Rider.
              </div>
            </div>
          </div>
          <div className="mt-8 text-xs text-slate-500 leading-relaxed">
            *Final premium is subject to our Quarterly Actuarial Review logic based on Doc 8 standards.
          </div>
        </div>

        {/* Form Area */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-teal-600' : 'bg-slate-100'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold text-slate-900">Personal Details</h3>
              
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Full Name</label>
                 <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400"/>
                    <input name="name" placeholder="Rahul Sharma" value={formData.name} onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Email Address</label>
                 <input name="email" placeholder="rahul@example.com" value={formData.email} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Create Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400"/>
                    <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                 </div>
                 {formData.password && (
                    <div className="pt-2">
                        <div className="flex gap-1 h-1.5 mb-1">
                            <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                            <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-slate-200'}`}></div>
                            <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                            <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        </div>
                        <p className={`text-xs font-medium ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 4 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                            {passwordFeedback}
                        </p>
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Age (Years)</label>
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Smoker?</label>
                    <select name="smoker" value={formData.smoker ? "true" : "false"} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold text-slate-900">Habits & Metrics</h3>
              <p className="text-slate-500 text-sm">We use these to calculate your Base Health Score.</p>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Height (cm)</label>
                    <div className="relative">
                        <Ruler className="absolute left-3 top-3 h-5 w-5 text-slate-400"/>
                        <input name="height" type="number" value={formData.height} onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Weight (kg)</label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                 </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Avg Daily Steps</label>
                <input name="dailySteps" type="number" value={formData.dailySteps} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                <p className="text-xs text-teal-600 font-medium pt-1">Steps > 8000 qualify for a Monthly Engagement Bonus.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-teal-500 transition-colors cursor-pointer" onClick={() => setFormData({...formData, alcohol: !formData.alcohol})}>
                    <div className={`h-5 w-5 rounded border flex items-center justify-center ${formData.alcohol ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                        {formData.alcohol && <Check size={14} className="text-white"/>}
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Wine size={14} /> Alcohol?</span>
                 </div>
                 
                 <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-teal-500 transition-colors cursor-pointer" onClick={() => setFormData({...formData, preExistingConditions: !formData.preExistingConditions})}>
                    <div className={`h-5 w-5 rounded border flex items-center justify-center ${formData.preExistingConditions ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                        {formData.preExistingConditions && <Check size={14} className="text-white"/>}
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileWarning size={14} /> Conditions?</span>
                 </div>
              </div>
            </div>
          )}

        {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold text-slate-900">Baseline Vitals</h3>
              <p className="text-slate-500 text-sm">Self-declare for now. We will verify later via Lab Reports.</p>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Systolic BP</label>
                    <input name="systolicBP" type="number" value={formData.systolicBP} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                    <p className="text-xs text-slate-400">mmHg (e.g. 120)</p>
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Fasting Sugar</label>
                    <input name="fastingSugar" type="number" value={formData.fastingSugar} onChange={handleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                    <p className="text-xs text-slate-400">mg/dL (e.g. 90)</p>
                 </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                 <Activity className="text-blue-600 h-5 w-5 flex-shrink-0" />
                 <p className="text-xs text-blue-800 leading-relaxed">
                    By clicking Activate, you agree to the <strong>Dynamic Pricing Policy</strong>. Your premium may increase or decrease based on the health data you provide monthly and quarterly.
                 </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900">Back</button>
            ) : <div></div>}
            
            {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-transform active:scale-95 shadow-lg">Next <ChevronRight size={18}/></button>
            ) : (
                <button onClick={handleFinish} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition-transform active:scale-95 shadow-lg shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? 'Processing...' : 'Activate Policy'} <Check size={18}/>
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
