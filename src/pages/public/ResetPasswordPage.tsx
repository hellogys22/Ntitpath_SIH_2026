import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, Shield, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { GovHeaderBar } from '../../components/layout/GovHeaderBar';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Recovery Session States
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Read the recovery session Supabase sets from URL fragment/token via onAuthStateChange
  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      setHasRecoverySession(false);
      return;
    }

    // Check for error parameters in URL (e.g. error=access_denied&error_code=otp_expired)
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (
      hash.includes('error=') ||
      hash.includes('otp_expired') ||
      search.includes('error=') ||
      search.includes('otp_expired')
    ) {
      setHasRecoverySession(false);
      setIsCheckingSession(false);
      return;
    }

    // 1. Listen for Supabase PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true);
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
        setIsCheckingSession(false);
      } else if (event === 'SIGNED_IN' && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        setHasRecoverySession(true);
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
        setIsCheckingSession(false);
      }
    });

    // 2. Immediate session check for already processed token in URL
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setHasRecoverySession(false);
        setIsCheckingSession(false);
        return;
      }

      const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('access_token=');

      if (session?.user && (hasRecoveryToken || hash === '')) {
        // If there's an active session from recovery link or recent token
        setHasRecoverySession(true);
        if (session.user.email) {
          setUserEmail(session.user.email);
        }
        setIsCheckingSession(false);
      } else if (!hasRecoveryToken) {
        // User navigated here directly without a valid token or session
        setHasRecoverySession(false);
        setIsCheckingSession(false);
      } else {
        // Allow brief moment for Supabase to exchange hash
        const timer = setTimeout(() => {
          setIsCheckingSession(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Password Reset Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation: must match and meet minimum strength (>= 6 chars, same as /register)
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client is not available.');
      }

      // Step 2 #4: Call supabase.auth.updateUser({ password: newPassword })
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      // Sync local database password hash so traditional password login also accepts the new credentials
      const targetEmail = userEmail || data.user?.email;
      if (targetEmail) {
        try {
          await api.resetPassword(targetEmail, newPassword);
        } catch (dbErr: any) {
          console.warn('[ResetPassword] Local DB password sync note:', dbErr?.message);
        }
      }

      // Step 3: Success state & sign out of temporary recovery session
      setIsSuccess(true);

      // Sign user out of temporary recovery session so they don't stay silently logged in
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('Sign out note:', signOutErr);
      }

      // Redirect to /login after short delay (~2.5s)
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to update password. Please ensure your new password meets the security requirements.'
      );
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
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Security Verification</span>
              <span className="text-sm font-bold text-govNavy-900">National SSO Gate</span>
              <span className="text-[10px] text-slate-500 block">Single-Use Recovery Token</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-govNavy-700" />
              <div className="text-left text-[11px]">
                <span className="font-bold block text-slate-900">Encrypted Channel</span>
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
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              नया पासवर्ड सेट करें / Set New Password
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Supabase Auth Recovery Session
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {isCheckingSession ? (
              /* Loading / Session Verification State */
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-govNavy-700 animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    रीसेट लिंक का सत्यापन किया जा रहा है...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verifying single-use recovery token with Supabase Auth...
                  </p>
                </div>
              </div>
            ) : !hasRecoverySession ? (
              /* Invalid or Expired Token State (Form is completely hidden) */
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-rose-900">
                    This reset link is invalid or has expired
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    यह पासवर्ड रीसेट लिंक अमान्य है या समाप्त हो चुका है। सुरक्षा कारणों से, रीसेट लिंक केवल <strong>60 मिनट</strong> के लिए मान्य होते हैं और केवल एक बार उपयोग किए जा सकते हैं।
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Why is this link invalid?</p>
                      <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                        <li>The link has expired (past 60 minutes).</li>
                        <li>The link has already been used to update a password.</li>
                        <li>You arrived here directly without a recovery token in the URL.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/forgot-password"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Request a New Reset Link / नया लिंक प्राप्त करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Back to Login</span>
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              /* Success State */
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Password updated successfully
                  </h3>
                  <p className="text-xs text-slate-600">
                    आपका पासवर्ड सफलतापूर्वक बदल दिया गया है। अब आप नए पासवर्ड के साथ लॉगिन कर सकते हैं।
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium">
                  Redirecting to login portal in 2 seconds...
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-md shadow-xs transition-all cursor-pointer"
                  >
                    <span>लॉगिन करें / Continue to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Valid Recovery Session: New Password Form */
              <form onSubmit={handleResetPassword} className="space-y-5">
                {userEmail && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Account:</span>
                    <span className="font-bold text-govNavy-900">{userEmail}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    नया पासवर्ड / New Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      placeholder="Enter minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must be at least 6 characters (identical requirement to enterprise registration).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    नए पासवर्ड की पुष्टि करें / Confirm New Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      placeholder="Re-enter your new password"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govNavy-700"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Updating Password via Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>पासवर्ड रीसेट करें / Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-govNavy-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel and return to login</span>
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
