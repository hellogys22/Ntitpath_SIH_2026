import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Phone, Lock, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { OtpInput } from '../../components/auth/OtpInput';
import { api } from '../../services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setRole, updateBusinessProfile, showToast } = useApp();

  // Step management: 'form' -> 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & OTP states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);
  const [codeLength, setCodeLength] = useState<number>(6);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid business email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send OTP via Supabase Auth
      const res = await api.sendOtp(normalizedEmail, 'business');
      if (res?.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }

      setStep('otp');
      showToast(`Verification code sent to ${normalizedEmail}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setIsExpired(false);

    try {
      const res = await api.verifyOtp({
        email,
        otp: otpCode,
        type: 'business',
        companyName: companyName.trim(),
        mobile: mobile.trim(),
      });

      if (res?.user) {
        // Enforce verified session: Only after successful server-side OTP verification
        setUser({
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          role: 'business',
          companyName: res.business?.name || companyName,
        });
        setRole('business');

        if (res.business) {
          updateBusinessProfile({
            companyName: res.business.name,
            contactEmail: res.user.email,
            contactMobile: mobile,
          });
        }

        showToast("Email verified successfully! Proceeding to business assessment onboarding.");
        const search = window.location.search;
        navigate(`/assessment${search}`);
      } else {
        throw new Error("Verification response did not contain an active verified user session.");
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
      const res = await api.sendOtp(email, 'business');
      if (res?.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      if (res?.data?.codeLength) {
        setCodeLength(res.data.codeLength);
      }
      showToast(`Fresh verification code sent to ${email}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again shortly.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-8">
          
          <div className="bg-govNavy-900 text-white p-6 text-center border-b border-govNavy-800">
            <div className="inline-flex p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {step === 'form' ? 'Create Business Account' : 'Verify Official Email'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {step === 'form'
                ? 'Register your industrial enterprise for approval intelligence'
                : 'Supabase Built-in OTP Verification (Statutory Session Gate)'}
            </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Company Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                    placeholder="e.g. Raipur Fresh Foods Pvt. Ltd."
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                      placeholder="Enter official email"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                      placeholder="+91 98765 43210"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                      placeholder="Create a password"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-govNavy-700"
                      placeholder="Re-enter password"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-govNavy-700 shrink-0 mt-0.5" />
                <span>
                  By registering, your enterprise will receive a Supabase 6-digit email OTP to activate statutory approval features.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Sending 6-digit OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-govNavy-700 hover:underline">
                    Sign In Here
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-govNavy-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change registration details ({email})</span>
              </button>

              <OtpInput
                length={codeLength}
                email={email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                isLoading={isVerifying}
                errorMessage={errorMessage}
                isExpired={isExpired}
                devOtp={devOtp}
                title="Verify Business Email"
                description={`A 6-digit verification code has been dispatched to ${email}. Enter the code below to complete your enterprise registration.`}
              />
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};
