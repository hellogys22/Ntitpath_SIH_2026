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
  RefreshCw,
  Eye,
  Sparkles,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GovHeaderBar } from '../../components/layout/GovHeaderBar';
import { OtpInput } from '../../components/auth/OtpInput';
import { api } from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setUser, setRole, updateBusinessProfile, enterDemoMode, showToast } = useApp();

  // Mode: 'otp' (recommended passwordless) | 'password' (traditional)
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  
  // OTP flow steps: 'input-email' | 'enter-otp'
  const [otpStep, setOtpStep] = useState<'input-email' | 'enter-otp'>('input-email');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9P4');
  const [captchaError, setCaptchaError] = useState(false);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [codeLength, setCodeLength] = useState<number>(6);

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

  // --- OTP FLOW HANDLERS ---
  const handleSendOtp = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const rawTarget = overrideEmail !== undefined ? overrideEmail : email;
    const targetEmail = (rawTarget || 'business@demo.com').trim().toLowerCase();
    
    if (!targetEmail) {
      setErrorMessage("Please enter your registered enterprise email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. business@demo.com).");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.sendOtp(targetEmail, 'business');
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }
      setEmail(targetEmail);
      setOtpStep('enter-otp');
      showToast(`Verification code sent to ${targetEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setIsExpired(false);

    try {
      const targetEmail = email.trim().toLowerCase();
      const res = await api.verifyOtp({
        email: targetEmail,
        otp: otpCode,
        type: 'business',
      });

      if (res?.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'business',
          companyName: res.business?.name || (res.user.businesses?.[0]?.name) || "Raipur Fresh Foods Pvt. Ltd.",
        });
        setRole('business');

        if (res.business) {
          updateBusinessProfile({
            companyName: res.business.name,
            contactEmail: res.user.email,
          });
        }

        showToast(`Welcome back, ${res.user.name}! Signed in to Business Portal.`);
        navigate('/dashboard');
      } else {
        throw new Error("Verification response did not contain an active user profile.");
      }
    } catch (err: any) {
      const msg = err.message || 'Verification failed. Please check the code and try again.';
      setErrorMessage(msg);
      if (err.isExpired || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setIsExpired(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage(null);
    setIsExpired(false);
    try {
      const targetEmail = email.trim().toLowerCase();
      const res = await api.sendOtp(targetEmail, 'business');
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }
      showToast(`Fresh verification code sent to ${targetEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification code.');
    }
  };

  // --- PASSWORD FLOW HANDLER ---
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError(true);
      setErrorMessage("Captcha text does not match. Please re-enter the code shown.");
      refreshCaptcha();
      return;
    }

    login(email || 'business@demo.com', 'business');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Official Government Top Bar */}
      <GovHeaderBar />

      {/* Official Government Portal Title Header */}
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
                  <span>Supabase email OTP verification (single-use token)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pre-submission cross-document consistency verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Parallel approval workflow optimization (DAG engine)</span>
                </div>
              </div>

              {/* Instant Demo Sandbox Shortcut */}
              <div className="mt-6 p-3.5 rounded-lg bg-govNavy-800/80 border border-amber-500/30">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Demo Access</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Want to explore NitiPath without entering credentials? View our pre-seeded Food Processing project (Raipur Fresh Foods Pvt. Ltd. • ₹12.5 Cr).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    navigate('/dashboard');
                  }}
                  className="mt-3 w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-govNavy-950 text-xs font-extrabold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-98"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Demo Dashboard</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-govNavy-800/80 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-300">Important Security Notice:</p>
              <p className="mt-0.5 text-[10px] leading-normal">
                Never share your credentials or OTP code. Access is monitored and logged in compliance with Information Technology Security Guidelines.
              </p>
            </div>
          </div>

          {/* Right Column: Official Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-white">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-govNavy-50 border border-govNavy-200 text-govNavy-800">
                <Building2 className="w-5 h-5 text-govNavy-800" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  उद्योग लॉगिन / Business Applicant Sign In
                </h3>
                <p className="text-[11px] text-slate-500">
                  Access your enterprise compliance roadmap &amp; statutory approvals
                </p>
              </div>
            </div>

            {/* Auth Method Selector Tabs: OTP (Recommended) vs Password */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'otp'
                    ? 'border-govNavy-800 text-govNavy-900 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-govNavy-700" />
                <span>ईमेल ओटीपी लॉगिन / Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setErrorMessage(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'password'
                    ? 'border-govNavy-800 text-govNavy-900 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>पासवर्ड / Password</span>
              </button>
            </div>

            {errorMessage && (authMethod === 'password' || otpStep === 'input-email') && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* TAB 1: EMAIL OTP AUTHENTICATION */}
            {authMethod === 'otp' && (
              <div>
                {otpStep === 'input-email' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        पंजीकृत ईमेल आईडी / Registered Email ID <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          required
                          placeholder="e.g. business@demo.com or enterprise@company.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        We will dispatch a single-use verification code via Supabase Auth.
                      </p>
                    </div>

                    {/* Quick evaluation demo account chip */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Quick Demo Business Account:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('business@demo.com');
                          if (errorMessage) setErrorMessage(null);
                          handleSendOtp(undefined, 'business@demo.com');
                        }}
                        className="w-full text-left p-2 rounded bg-white border border-slate-300 hover:border-govNavy-700 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-govNavy-900">
                            business@demo.com
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Raipur Fresh Foods Pvt. Ltd. • ₹12.5 Cr Food Processing
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-govNavy-700 group-hover:underline">
                          Send OTP →
                        </span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>ओटीपी प्राप्त करें / Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('input-email');
                        setErrorMessage(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-govNavy-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change email address ({email})</span>
                    </button>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <OtpInput
                        length={codeLength}
                        email={email}
                        onVerify={handleVerifyOtp}
                        onResend={handleResendOtp}
                        isLoading={isVerifying}
                        errorMessage={errorMessage}
                        isExpired={isExpired}
                        hideAutoFill={true}
                        title="Business Sign In Verification"
                        description={`Enter the ${codeLength}-digit verification code sent to ${email} to sign in to your industrial compliance dashboard.`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TRADITIONAL PASSWORD AUTHENTICATION */}
            {authMethod === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    पंजीकृत ईमेल या मोबाइल / Registered Email or Mobile ID <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter business email or mobile"
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
                    <span className="text-[11px] text-govNavy-700 font-semibold hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
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

                {/* Security Captcha */}
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    सुरक्षा कोड / Security Captcha Code <span className="text-rose-600">*</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-slate-200 rounded border border-slate-400 text-slate-800 font-mono font-bold tracking-widest text-base select-none italic line-through decoration-slate-400">
                      {captchaCode}
                    </div>

                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Refresh Captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        setCaptchaError(false);
                      }}
                      placeholder="Enter captcha"
                      required
                      className={`flex-1 px-3 py-1.5 bg-white border rounded text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-govNavy-700 ${
                        captchaError ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>पोर्टल में साइन इन करें / Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Instant Demo Sandbox Shortcut */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                या / OR
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-2 border-amber-400/80 text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-amber-500"
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span>View Demo Dashboard (Raipur Fresh Foods • ₹12.5 Cr)</span>
            </button>

            {/* Footer links in card */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
              <div>
                New enterprise registration?{' '}
                <Link to="/register" className="font-bold text-govNavy-700 hover:underline">
                  Register Business Account
                </Link>
              </div>
              <div>
                <Link 
                  to="/officer-login" 
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors group"
                >
                  <Lock className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  <span>Government / Officer Login →</span>
                </Link>
              </div>
            </div>

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
            <Link to="/officer-login" className="hover:text-slate-200 text-slate-400">
              Government / Officer Portal
            </Link>
          </div>

          <p className="text-[10px] text-slate-500">
            © 2026 Government of India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
