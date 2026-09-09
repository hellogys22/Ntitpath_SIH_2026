import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  Building, 
  UserCheck, 
  Sparkles,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GovHeaderBar } from '../../components/layout/GovHeaderBar';
import { OtpInput } from '../../components/auth/OtpInput';
import { api } from '../../services/api';

export const OfficerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setRole, showToast } = useApp();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Commerce & Industries Department');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [codeLength, setCodeLength] = useState<number>(6);
  const [stealthNotice, setStealthNotice] = useState<string | null>(null);

  // Pre-authorized officer demo seed accounts for fast hackathon evaluation
  const demoOfficers = [
    {
      email: 'officer@gov.in',
      name: 'Dr. Ananya Verma, IAS',
      role: 'Joint Director of Industries',
      dept: 'Commerce & Industries Department',
    },
    {
      email: 'epcb.officer@cg.gov.in',
      name: 'Shri Rajesh Kumar Kujur',
      role: 'Senior Environmental Engineer',
      dept: 'Environment & Pollution Control Board',
    },
    {
      email: 'admin@demo.com',
      name: 'System Admin Officer',
      role: 'Chief Technology Administrator',
      dept: 'State Single Window Clearance Directorate',
    },
  ];

  const handleSendOfficerOtp = async (targetEmail: string) => {
    const emailToSend = (targetEmail || email).trim().toLowerCase();
    if (!emailToSend) {
      setErrorMessage("Please enter an official government email address.");
      return;
    }

    setErrorMessage(null);
    setStealthNotice(null);
    setIsSubmitting(true);

    try {
      const res = await api.sendOtp(emailToSend, 'officer');
      
      if (res?.data?.stealth) {
        // Anti-enumeration: Generic response, stay on page or proceed to OTP screen
        setStealthNotice("If this email is registered as an authorized official, a verification code has been sent.");
        setStep('otp');
        return;
      }

      if (res?.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }

      setStep('otp');
      showToast(`Government portal OTP dispatched to ${emailToSend}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code. Please contact system administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOfficerOtp = async (otpCode: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setIsExpired(false);

    try {
      const res = await api.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otpCode,
        type: 'officer',
        department,
      });

      if (res?.user && res?.role === 'admin') {
        // Enforce verified officer session
        setUser({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'admin',
          department: res.user.department || department,
        });
        setRole('admin');

        showToast(`Official access granted: ${res.user.name}`);
        // Part 2 #3: Route to distinct officer/admin dashboard route, NEVER to regular business dashboard
        navigate('/admin/dashboard');
      } else {
        throw new Error("Officer verification failed. Role unauthorized.");
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP code.';
      setErrorMessage(msg);
      if (err.isExpired || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setIsExpired(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOfficerOtp = async () => {
    setErrorMessage(null);
    setIsExpired(false);
    try {
      const res = await api.sendOtp(email, 'officer');
      if (res?.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }
      showToast(`Fresh verification code sent to ${email}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Official Government Top Bar */}
      <GovHeaderBar />

      {/* Restricted Government Clearance Header */}
      <div className="bg-slate-950 border-b border-amber-500/30 py-4 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 p-1 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Restricted Access
                </span>
                <span className="text-[11px] text-slate-400 font-mono">GOV-NET ID-26130</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight font-serif mt-0.5">
                Government Regulatory Clearance Portal • नीतिपथ
              </h1>
              <p className="text-xs text-slate-400">
                Departmental Officer Single Sign-On (SSO) &amp; Digital Clearance Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Business Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
        
        <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
          
          {/* Top Banner Notice */}
          <div className="bg-amber-950/40 border-b border-amber-500/20 p-4 text-xs text-amber-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">Official Personnel Only • Authorized Clearance Channel</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                Access to this gateway is restricted to verified state regulatory clearance officers, inspectors, and board members. All login actions are tracked in statutory audit ledgers.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            
            {step === 'email' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOfficerOtp(email);
                }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Officer Identity Verification
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your authorized official email to receive a single-use 6-digit verification code.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Clearance Department <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option>Commerce & Industries Department</option>
                        <option>Environment & Pollution Control Board</option>
                        <option>Directorate of Industrial Safety & Health (DISH)</option>
                        <option>State Fire & Emergency Services</option>
                        <option>State Power Distribution Corporation (DISCOM)</option>
                        <option>State Single Window Clearance Directorate</option>
                      </select>
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Official Government Email ID <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="e.g. officer@gov.in or epcb.officer@cg.gov.in"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Must be pre-authorized in the State Administrative Roster.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-govNavy-950 text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-govNavy-950" />
                      <span>Verifying Authorization &amp; Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Clearance OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Pre-Authorized Quick Evaluation Accounts */}
                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pre-Authorized Official Test Credentials (Demo Roster)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {demoOfficers.map((off, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEmail(off.email);
                          setDepartment(off.dept);
                          handleSendOfficerOtp(off.email);
                        }}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all group cursor-pointer"
                      >
                        <p className="text-xs font-bold text-white group-hover:text-amber-300">
                          {off.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {off.role}
                        </p>
                        <p className="text-[9px] font-mono text-amber-400/80 mt-1">
                          {off.email}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMessage(null);
                    setStealthNotice(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use different official email ({email})</span>
                </button>

                {stealthNotice && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>{stealthNotice}</p>
                  </div>
                )}

                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
                  <OtpInput
                    length={codeLength}
                    email={email}
                    onVerify={handleVerifyOfficerOtp}
                    onResend={handleResendOfficerOtp}
                    isLoading={isVerifying}
                    errorMessage={errorMessage}
                    isExpired={isExpired}
                    devOtp={devOtp}
                    title="Government Portal Access Code"
                    description={`Single-use verification code sent to ${email}. Verification grants administrative approval and regulatory review authority.`}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Bottom Security Footer */}
          <div className="bg-slate-900/90 px-6 py-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Security Standard: ISO 27001 / CERT-In Certified</span>
            <span>IP: Logged &amp; Verified</span>
          </div>

        </div>

      </main>

      {/* Official Government Footer */}
      <footer className="bg-slate-950 text-slate-500 text-[11px] py-4 border-t border-slate-800 text-center">
        <p>National Industrial Approval &amp; Compliance Intelligence Portal • SIH26130</p>
      </footer>
    </div>
  );
};
