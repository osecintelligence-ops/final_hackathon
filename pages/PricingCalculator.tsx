
import React, { useState } from 'react';
import { calculateHealthScore } from '../services/engine';
import { HealthMetrics } from '../types';
import { Activity, Calculator, ArrowRight, RotateCcw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingCalculator: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    age: 30,
    weight: 70,
    height: 175,
    systolicBP: 120,
    fastingSugar: 90,
    dailySteps: 5000,
    smoker: false,
    alcohol: false,
    preExistingConditions: false
  });

  const [score, setScore] = useState<number | null>(null);

  const calculate = () => {
    const s = calculateHealthScore(metrics);
    setScore(s);
  };

  const getZone = (s: number) => {
    if (s >= 80) return { 
        name: 'Green Zone', 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200', 
        discount: '-5% to -20%',
        desc: 'Premium Discount applied annually.'
    };
    if (s >= 50) return { 
        name: 'Yellow Zone', 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200', 
        discount: 'No Change',
        desc: 'Standard market rates apply.'
    };
    return { 
        name: 'Red Zone', 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        discount: 'Discount Reduces', 
        desc: 'Your accumulated discount decreases. You never pay more than the Base Premium.'
    };
  };

  const zoneInfo = score !== null ? getZone(score) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        <div className="w-full md:w-1/2 p-8 md:p-12 border-r border-slate-100">
          <div className="flex items-center gap-2 mb-6">
             <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                <Activity className="h-6 w-6 text-teal-600" />
                <span className="font-bold text-lg text-slate-900">HealthIQure</span>
             </Link>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Discount Calculator</h2>
          <p className="text-slate-500 mb-8">See how much you could save based on your vitals.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                  <input type="number" value={metrics.age} onChange={e => setMetrics({...metrics, age: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Steps (Daily)</label>
                  <input type="number" value={metrics.dailySteps} onChange={e => setMetrics({...metrics, dailySteps: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Height (cm)</label>
                  <input type="number" value={metrics.height} onChange={e => setMetrics({...metrics, height: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Weight (kg)</label>
                  <input type="number" value={metrics.weight} onChange={e => setMetrics({...metrics, weight: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">BP (Systolic)</label>
                  <input type="number" value={metrics.systolicBP} onChange={e => setMetrics({...metrics, systolicBP: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Fasting Sugar</label>
                  <input type="number" value={metrics.fastingSugar} onChange={e => setMetrics({...metrics, fastingSugar: +e.target.value})} className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded focus:border-teal-500 outline-none" />
               </div>
            </div>

            <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={metrics.smoker} onChange={e => setMetrics({...metrics, smoker: e.target.checked})} className="accent-teal-600 h-4 w-4" />
                    <span className="text-sm text-slate-700">Smoker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={metrics.alcohol} onChange={e => setMetrics({...metrics, alcohol: e.target.checked})} className="accent-teal-600 h-4 w-4" />
                    <span className="text-sm text-slate-700">Alcohol</span>
                </label>
            </div>

            <button onClick={calculate} className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors mt-4 flex items-center justify-center gap-2">
                Calculate Score <Calculator size={18} />
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-slate-50 p-8 md:p-12 flex items-center justify-center">
            {score !== null && zoneInfo ? (
                <div className="text-center w-full animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-sm text-slate-500 font-bold uppercase mb-2">Estimated Health Score</div>
                    <div className="text-6xl font-black text-slate-900 mb-6">{score} <span className="text-2xl text-slate-400 font-medium">/100</span></div>
                    
                    <div className={`p-6 rounded-2xl border mb-6 ${zoneInfo.bg} ${zoneInfo.border}`}>
                        <div className={`text-xl font-bold mb-1 ${zoneInfo.color}`}>{zoneInfo.name}</div>
                        <div className="text-4xl font-bold text-slate-900">{zoneInfo.discount}</div>
                        <div className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wide">Premium Adjustment</div>
                    </div>
                    
                    {score < 50 && (
                        <div className="flex gap-2 items-start bg-white p-3 rounded-lg border border-slate-200 text-left mb-8 shadow-sm">
                            <Info className="text-slate-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                <strong>Protection Cap:</strong> Even in the Red Zone, you will <span className="text-slate-900 font-bold">never pay more than the Base Premium</span>. The "Reduction" only applies to discounts you have previously earned.
                            </p>
                        </div>
                    )}

                    {score >= 50 && (
                         <div className="mb-8 p-2">
                            <p className="text-sm text-slate-500">{zoneInfo.desc}</p>
                         </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setScore(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-100 flex items-center gap-2">
                           <RotateCcw size={16} /> Reset
                        </button>
                        <Link to="/signup" className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center gap-2">
                           Get this Deal <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-400">
                    <Activity size={64} className="mx-auto mb-4 opacity-20" />
                    <p>Enter your vitals to see your potential savings.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default PricingCalculator;
