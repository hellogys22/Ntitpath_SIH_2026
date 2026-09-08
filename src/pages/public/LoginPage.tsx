import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GovHeaderBar } from '../../components/layout/GovHeaderBar';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [activeTab, setActiveTab] = useState<'business' | 'admin'>('business');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Environment & Pollution Control Board');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9P4');
  const [captchaError, setCaptchaError] = useState(false);

  const refreshCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const handleTabSwitch = (tab: 'business' | 'admin') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'business') {
      login(email || 'applicant@enterprise.in', 'business');
      navigate('/dashboard');
    } else {
      login(email || 'officer@gov.in', 'admin', department);
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Official Government Top Bar */}
      <GovHeaderBar />

      {/* Official Government Portal Title Header (NO standard website navbar) */}
      <div className="bg-white border-b border-slate-300 shadow-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 text-center md:text-left">
            {/* Government Emblem / National Crest */}
            <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <div className="w-full h-full rounded-full bg-govNavy-900 flex flex-col items-center justify-center text-white border border-amber-500/50">
                <span className="text-amber-400 font-serif font-black text-sm leading-none">N</span>
                <span className="text-[7px] text-amber-200 uppercase font-mono tracking-tighter">INDIA</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-black text-govNavy-900 tracking-tight font-serif">
                  नीतिपथ <span className="font-sans font-bold text-slate-700">| NitiPath</span>
                </h1>
              </div>
              <p className="text-xs font-bold text-govNavy-800">
                राष्ट्रीय औद्योगिक अनुमोदन एवं अनुपालन आसूचना प्रणाली
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                National Industrial Approval & Compliance Intelligence Portal
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-right">
            <div className="border-r border-slate-200 pr-6">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Toll-Free National Helpline</span>
              <span className="text-sm font-bold text-govNavy-900">1800-11-2026</span>
              <span className="text-[10px] text-slate-500 block">Mon - Sat (09:00 - 18:00 IST)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-govNavy-700" />
              <div className="text-left text-[11px]">
                <span className="font-bold block text-slate-900">Secure 256-bit Portal</span>
                <span className="text-slate-500 text-[10px]">Ministry of Commerce & Industry</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Login Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
        
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden my-4">
          
          {/* Left Column: Official Instructions & Information */}
          <div className="lg:col-span-5 bg-govNavy-900 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-govNavy-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-govNavy-800 text-amber-400 text-xs font-bold border border-govNavy-700 mb-4">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Single Sign-On (SSO) Gateway</span>
              </div>

              <h2 className="text-lg font-bold text-white leading-snug">
                Unified Regulatory Intelligence Portal
              </h2>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                NitiPath assists Indian industrial enterprises and department clearance officers with pre-submission validation, risk prediction, and compliance intelligence.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pre-submission cross-document consistency verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Statutory bottleneck prediction across state departments</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Parallel approval workflow optimization (DAG engine)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-govNavy-800/80 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300">Important Security Notice:</p>
              <p className="mt-0.5 text-[10px] leading-normal">
                Never share your credentials. Access is monitored and logged in compliance with Information Technology Security Guidelines.
              </p>
            </div>
          </div>

          {/* Right Column: Official Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white">
            
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('business')}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'business'
                    ? 'border-govNavy-700 text-govNavy-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-govNavy-700" />
                <span>उद्योग / Business Applicant</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('admin')}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>विभागीय अधिकारी / Department Officer</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {activeTab === 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    संबद्ध विभाग / Administrative Department <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                  >
                    <option>Environment & Pollution Control Board</option>
                    <option>Directorate of Industrial Safety & Health (DISH)</option>
                    <option>State Fire & Emergency Services</option>
                    <option>State Power Distribution Corporation (DISCOM)</option>
                    <option>Commerce & Industries Department</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {activeTab === 'business' 
                    ? 'पंजीकृत ईमेल या मोबाइल / Registered Email or Mobile ID' 
                    : 'अधिकारी उपयोगकर्ता आईडी / Official Officer User ID'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={activeTab === 'business' ? 'Enter business email or mobile' : 'Enter official user ID or email'}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    पासवर्ड / Password <span className="text-rose-600">*</span>
                  </label>
                  {activeTab === 'business' && (
                    <span className="text-[11px] text-govNavy-700 font-semibold hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Realistic Security Captcha Verification */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  सुरक्षा कोड / Security Captcha Code <span className="text-rose-600">*</span>
                </label>
                
                <div className="flex items-center gap-3">
                  {/* Captcha Display */}
                  <div className="px-3 py-1.5 bg-slate-200 rounded border border-slate-400 text-slate-800 font-mono font-bold tracking-widest text-base select-none italic line-through decoration-slate-400">
                    {captchaCode}
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter captcha text"
                    required
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                  />
                </div>
              </div>

              {activeTab === 'admin' && (
                <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Authorized regulatory officers only. System logs all verification actions.</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 text-white text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'business'
                    ? 'bg-govNavy-800 hover:bg-govNavy-900'
                    : 'bg-amber-700 hover:bg-amber-800'
                }`}
              >
                <span>{activeTab === 'business' ? 'पोर्टल में साइन इन करें / Sign In' : 'अधिकारी साइन इन / Officer Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {activeTab === 'business' && (
                <div className="pt-2 text-center text-xs text-slate-600">
                  New enterprise registration?{' '}
                  <Link to="/register" className="font-bold text-govNavy-700 hover:underline">
                    Register Business Account
                  </Link>
                </div>
              )}
            </form>

          </div>

        </div>

      </main>

      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-white font-bold">NitiPath • National Industrial Approval & Compliance Intelligence Portal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Ministry of Commerce & Industry • Government of India
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-[10px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Use</span>
            <span>•</span>
            <span>Security Guidelines</span>
            <span>•</span>
            <span>Hyperlinking Policy</span>
          </div>

          <p className="text-[10px] text-slate-500">
            © 2026 Government of India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
