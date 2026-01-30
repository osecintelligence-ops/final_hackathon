
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ShieldCheck, TrendingDown, ArrowRight, Upload, Zap, Smartphone, 
  FileText, Plus, TrendingUp, Minus, AlertCircle, Database, Scale, FileSignature, CheckCircle, 
  Moon, Footprints, Ruler, Beaker, HeartPulse, Stethoscope, AlertTriangle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg">
               <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Health<span className="text-teal-600">IQ</span>ure</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#engine" className="hover:text-teal-600 transition-colors">The Engine</a>
            <Link to="/calculator" className="hover:text-teal-600 transition-colors">Pricing Calculator</Link>
            <a href="#wallet" className="hover:text-teal-600 transition-colors">Zones</a>
          </div>
          <div className="flex gap-4">
             <Link to="/login" className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
             <Link to="/signup" className="px-5 py-2 text-sm font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Get Insured</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wide">
              <Zap size={14} className="fill-teal-700" /> New: AI-Powered Actuary Engine
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
              India's First <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Dynamic Premium</span> <br/>
              Health Plan.
            </h1>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
              Stop paying for others' risks. Upload your lab reports, maintain a high health score, and reduce your premiums by up to 20% every month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/signup" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all text-lg shadow-xl shadow-teal-600/30 hover:scale-105 active:scale-95">
                Calculate My Premium <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/calculator" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all text-lg">
                 Try Calculator
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              *Regulated by Actuarial Standards. Logic based on Clinical Outcomes.
            </p>
          </div>

          {/* Hero Visual */}
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center">
             <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-1000 delay-200">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                   <div>
                      <div className="text-xs text-slate-400 uppercase">Policy Holder</div>
                      <div className="font-semibold text-lg">Rahul Sharma</div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs text-emerald-400 uppercase">Current Savings</div>
                      <div className="font-bold text-2xl">₹850<span className="text-sm font-normal text-slate-400">/mo</span></div>
                   </div>
                </div>
                <div className="p-6 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <div className="text-sm text-slate-500">Health Score</div>
                         <div className="text-4xl font-bold text-slate-900">88<span className="text-lg text-slate-400">/100</span></div>
                      </div>
                      <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-xl">
                         A+
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-600">Blood Pressure (118/78)</span>
                         <span className="text-emerald-600 font-semibold">+1% Discount</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                         <div className="bg-emerald-500 h-2 rounded-full w-[90%]"></div>
                      </div>
                   </div>
                   
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                      <div className="bg-white p-2 rounded-full h-fit shadow-sm text-blue-600"><Upload size={18}/></div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Lab Report Verified</div>
                         <div className="text-xs text-slate-500 leading-snug mt-1">HbA1c of 5.4% confirmed. Quarterly bonus applied.</div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Floating Elements */}
             <div className="absolute top-10 -right-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
                <ShieldCheck className="text-teal-600 h-8 w-8" />
                <div>
                   <div className="text-xs text-slate-500">Protection</div>
                   <div className="font-bold text-slate-900">₹10 Lakh Cover</div>
                </div>
             </div>
          </div>
          
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-gradient-to-br from-teal-50 to-blue-50 rounded-full blur-3xl opacity-70 translate-x-1/3 -translate-y-1/4"></div>
        </div>
      </section>

      {/* DYNAMIC PREMIUM ENGINE SECTION */}
      <section id="engine" className="py-24 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto px-6">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">The Dynamic Premium Engine</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                  Traditional insurance locks your rate for a year. We calculate it monthly based on your actual health behaviors. The math is simple: <span className="font-bold text-slate-900">Better Health = Lower Premium.</span>
               </p>
            </div>

            {/* The Scoring Formula */}
            <div className="mb-24">
               <h3 className="text-center text-xl font-bold text-slate-900 mb-10">The Scoring Formula</h3>
               
               <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                  
                  {/* Card 1: Quarterly Clinical */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full md:w-[450px] relative">
                     <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                        <FileText className="text-blue-600 h-6 w-6" />
                     </div>
                     <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-slate-900">Quarterly Clinical</h4>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">70% Weight (The Engine)</span>
                     </div>
                     <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Verified lab data provides the baseline stability. We look at long-term markers.
                     </p>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-blue-500" /> HbA1c (Diabetes Control)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-blue-500" /> Lipid Profile (Cholesterol)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-blue-500" /> Serum Creatinine (Kidney)
                        </li>
                     </ul>
                  </div>

                  {/* Connector Plus */}
                  <div className="bg-white rounded-full p-2 border border-slate-200 shadow-sm text-slate-300 z-10">
                     <Plus size={24} />
                  </div>

                  {/* Card 2: Monthly Lifestyle */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full md:w-[450px] relative">
                     <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                        <Activity className="text-emerald-600 h-6 w-6" />
                     </div>
                     <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-slate-900">Monthly Lifestyle</h4>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">30% Weight (The Steering)</span>
                     </div>
                     <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Volatile daily habits that you can control immediately.
                     </p>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-emerald-500" /> Daily Steps Average
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-emerald-500" /> BMI Trends
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                           <CheckCircle size={16} className="text-emerald-500" /> Sleep Consistency
                        </li>
                     </ul>
                  </div>

               </div>
            </div>

            {/* Impact on Your Wallet */}
            <div id="wallet" className="mb-24">
               <h3 className="text-xl font-bold text-slate-900 mb-8">Impact on Your Wallet</h3>
               <div className="grid md:grid-cols-3 gap-6">
                  
                  {/* Green Zone */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 hover:shadow-lg hover:shadow-emerald-900/5 transition-all">
                     <div className="text-emerald-800 font-bold mb-1">Green Zone</div>
                     <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-6">Score 80 - 100</div>
                     
                     <div className="flex items-baseline gap-2 mb-2">
                        <TrendingDown className="text-emerald-600 h-6 w-6" />
                        <span className="text-3xl font-bold text-slate-900">-5% to -20%</span>
                     </div>
                     <p className="text-sm text-emerald-800/80 leading-snug">
                        Premium Discount applied annually.
                     </p>
                  </div>

                  {/* Yellow Zone */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 hover:shadow-lg hover:shadow-amber-900/5 transition-all">
                     <div className="text-amber-800 font-bold mb-1">Yellow Zone</div>
                     <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-6">Score 50 - 79</div>
                     
                     <div className="flex items-baseline gap-2 mb-2">
                        <Minus className="text-amber-600 h-6 w-6" />
                        <span className="text-3xl font-bold text-slate-900">No Change</span>
                     </div>
                     <p className="text-sm text-amber-800/80 leading-snug">
                        Standard market rates apply.
                     </p>
                  </div>

                  {/* Red Zone */}
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-8 hover:shadow-lg hover:shadow-red-900/5 transition-all">
                     <div className="text-red-800 font-bold mb-1">Red Zone</div>
                     <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-6">Score 0 - 49</div>
                     
                     <div className="flex items-baseline gap-2 mb-2">
                        <TrendingUp className="text-red-600 h-6 w-6" />
                        <span className="text-3xl font-bold text-slate-900">Reduced Discount</span>
                     </div>
                     <p className="text-sm text-red-800/80 leading-snug">
                        Your discount decreases, but you <span className="font-bold">never pay more</span> than the base premium.
                     </p>
                  </div>

               </div>
            </div>

            {/* Anti-Fraud Section */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="relative z-10 max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-teal-400 h-8 w-8" />
                        <h3 className="text-2xl font-bold">Anti-Fraud & Verification</h3>
                    </div>
                    
                    <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-2xl">
                        We use Google's Gemini Vision AI to extract data directly from your lab reports. You must self-certify the data. Random audits are conducted by partner clinics. Falsifying data leads to immediate policy termination and potential blacklisting.
                    </p>

                    <div className="grid md:grid-cols-2 gap-y-4 gap-x-12">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                            <span className="font-semibold text-slate-200">OCR Report Extraction</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                            <span className="font-semibold text-slate-200">Device Sync (Apple/Google Health)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                            <span className="font-semibold text-slate-200">Actuarial Audit Trails</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                            <span className="font-semibold text-slate-200">Legal Self-Declaration</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 h-full w-1/3 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
                <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-teal-600 rounded-full blur-[100px] opacity-30"></div>
            </div>

         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-teal-500" />
                  <span className="text-xl font-bold">HealthIQure</span>
               </div>
               <p className="text-slate-400 max-w-sm">Reinventing health insurance for modern India. Fair, transparent, and technology-driven.</p>
            </div>
            <div>
               <h5 className="font-bold mb-4">Contact</h5>
               <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="font-semibold text-white">Prithvi Sharma</li>
                  <li>Delhi, India</li>
                  <li>+91 8826936651</li>
                  <li>support@healthiqure.in</li>
               </ul>
            </div>
            <div>
               <ul className="space-y-2 text-slate-400 text-sm">
                  {/* Legal Section removed as requested */}
                  <li>IRDAI License</li>
               </ul>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
