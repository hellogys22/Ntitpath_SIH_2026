import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Shield, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { GovHeaderBar } from '../../components/layout/GovHeaderBar';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setErrorMessage('Please enter a valid enterprise email address (e.g. business@demo.com).');
      return;
    }

    setIsSubmitting(true);
    const redirectTo = `${window.location.origin}/reset-password`;

    try {
      // 1. Dispatch through rate-limited API route (enforces max 5 requests/hr at route level)
      await api.forgotPassword(targetEmail, redirectTo);

      // 2. Also trigger Supabase Auth client SDK built-in password reset
      if (supabase) {
        try {
          await supabase.auth.resetPasswordForEmail(targetEmail, {
            redirectTo,
          });
        } catch (supabaseErr: any) {
          console.warn('[ForgotPassword] Client Supabase resetPasswordForEmail note:', supabaseErr?.message);
        }
      }

      // 3. Anti-enumeration: Display generic confirmation message
      setIsSubmitted(true);
    } catch (err: any) {
      if (err.message?.includes('Rate limit') || err.message?.includes('429')) {
        setErrorMessage(err.message || 'Rate limit exceeded. Maximum 5 requests per hour. Please wait before requesting again.');
      } else {
        // Fallback generic submission state to prevent email enumeration even on unexpected errors
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Official Government Header Bar */}
      <GovHeaderBar />

      {/* Official Portal Title Header */}
      <div className="bg-white border-b border-slate-300 shadow-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
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
              <span className="text-[10px] uppercase font-bold text-slate-500 block">National Support Desk</span>
              <span className="text-sm font-bold text-govNavy-900">1800-11-2026</span>
              <span className="text-[10px] text-slate-500 block">Mon - Sat (09:00 - 18:00 IST)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-govNavy-700" />
              <div className="text-left text-[11px]">
                <span className="font-bold block text-slate-900">Secure Recovery Portal</span>
                <span className="text-slate-500 text-[10px]">Ministry of Commerce & Industry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
        <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden my-4">
          
          {/* Header Banner */}
          <div className="bg-govNavy-900 text-white p-6 text-center border-b border-govNavy-800">
            <div className="inline-flex p-3 rounded-full bg-govNavy-800 border border-govNavy-700 text-amber-400 mb-2">
              <KeyRound className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              पासवर्ड रीसेट / Reset Password
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Supabase Auth Built-in Password Recovery
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {isSubmitted ? (
              /* Step 1 Generic Confirmation Message (No user enumeration) */
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    रीसेट लिंक प्रेषित किया गया / Reset Link Sent
                  </h3>
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950 font-medium leading-relaxed text-left">
                    <p className="font-semibold mb-1">
                      If an account exists for this email, a password reset link has been sent.
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      कृपया अपना आधिकारिक ईमेल इनबॉक्स एवं स्पैम फोल्डर जांचें। यदि आपका खाता पंजीकृत है, तो आपको 60 मिनट के भीतर मान्य रीसेट लिंक प्राप्त होगा।
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-1.5">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-govNavy-700 shrink-0 mt-0.5" />
                    <span>The password reset link is valid for <strong>60 minutes</strong> and can only be used once.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-govNavy-700 shrink-0 mt-0.5" />
                    <span>If you do not receive an email, please verify that the email was entered correctly or contact the administrator.</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="text-xs font-semibold text-govNavy-700 hover:text-govNavy-900 hover:underline cursor-pointer"
                  >
                    Send to a different email
                  </button>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-govNavy-800 hover:bg-govNavy-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>लॉगिन पर वापस जाएं / Back to Login</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Request Password Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    पंजीकृत व्यावसायिक ईमेल / Registered Business Email <span className="text-rose-600">*</span>
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
                      placeholder="e.g. enterprise@company.com or business@demo.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter the email address registered with your industrial enterprise profile.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-700 block">Rate Limiting Protection:</span>
                  <p>
                    To prevent abuse, password reset requests are limited to a maximum of <strong>5 requests per hour</strong> per email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Reset Link via Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>रीसेट लिंक भेजें / Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-200 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-govNavy-700 hover:text-govNavy-900 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>लॉगिन पर वापस जाएं / Back to Login</span>
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer Info Strip */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>Official Identity & Access Management Gateway</span>
            <span className="font-mono">Security Grade: SHA-256</span>
          </div>

        </div>
      </main>
    </div>
  );
};
