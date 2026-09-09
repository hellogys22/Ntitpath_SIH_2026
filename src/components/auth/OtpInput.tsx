import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, Clock, CheckCircle2, KeyRound } from 'lucide-react';

export interface OtpInputProps {
  length?: number;
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
  isExpired?: boolean;
  devOtp?: string;
  title?: string;
  description?: string;
  hideAutoFill?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  email,
  onVerify,
  onResend,
  isLoading = false,
  errorMessage = null,
  isExpired = false,
  devOtp,
  title = "Verify Email Address",
  description,
  hideAutoFill = false,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const [cooldown, setCooldown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update digits array if length prop changes
  useEffect(() => {
    setDigits(Array(length).fill(''));
  }, [length]);

  // 60-second cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric inputs
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val !== '') return;

    const char = cleanVal.slice(-1); // Take last entered character
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance focus to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all digits are filled
    if (char && index === length - 1 && newDigits.every(d => d !== '')) {
      onVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move focus backward and clear previous box
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < length; i++) {
      if (i < pasted.length) {
        newDigits[i] = pasted[i];
      }
    }
    setDigits(newDigits);

    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (newDigits.every(d => d !== '')) {
      onVerify(newDigits.join(''));
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setCooldown(60);
      setDigits(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const handleAutoFillDev = () => {
    if (!devOtp) return;
    const devDigits = devOtp.split('').slice(0, length);
    setDigits(devDigits);
    inputRefs.current[length - 1]?.focus();
    onVerify(devOtp.slice(0, length));
  };

  const fullOtp = digits.join('');
  const isComplete = fullOtp.length === length && digits.every(d => d !== '');

  return (
    <div className="w-full space-y-6">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-govNavy-50 border border-govNavy-200 text-govNavy-800 mb-1">
          <KeyRound className="w-6 h-6 text-govNavy-700" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          {description || (
            <>
              We sent a <span className="font-bold text-slate-900">{length}-digit verification code</span> to{' '}
              <span className="font-bold text-govNavy-800 underline decoration-govNavy-300">{email}</span>
            </>
          )}
        </p>
      </div>

      {/* Dev helper chip if devOtp is present and not hidden */}
      {!hideAutoFill && devOtp && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-amber-700">Simulated/Dev OTP:</span>
            <span className="font-black tracking-widest bg-amber-200/70 px-2 py-0.5 rounded">{devOtp}</span>
          </div>
          <button
            type="button"
            onClick={handleAutoFillDev}
            className="text-[11px] font-bold text-govNavy-900 hover:text-govNavy-700 underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* Error Alert Display */}
      {errorMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isExpired
              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            {isExpired && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResendClick}
                  disabled={cooldown > 0 || isResending}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Resend New Code Directly</span>
                </button>
                {cooldown > 0 && (
                  <span className="text-[11px] text-amber-800 font-medium">
                    (wait {cooldown}s)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6 Separate Digit Input Boxes */}
      <div>
        <label className="block text-center text-xs font-bold text-slate-700 mb-3">
          Enter 6-digit Verification Code
        </label>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border transition-all outline-none ${
                digit
                  ? 'border-govNavy-700 bg-govNavy-50/40 text-govNavy-950 ring-2 ring-govNavy-700/20'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-govNavy-700 focus:ring-2 focus:ring-govNavy-600/30'
              } ${errorMessage ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-200' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => onVerify(fullOtp)}
        disabled={!isComplete || isLoading}
        className={`w-full py-3 rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isComplete && !isLoading
            ? 'bg-govNavy-800 hover:bg-govNavy-900 text-white active:scale-99'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Verifying Code with Supabase...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verify Code & Continue</span>
          </>
        )}
      </button>

      {/* Resend Code Section with Cooldown Timer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <span>Didn't receive the email?</span>

        {cooldown > 0 ? (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Resend code in <strong className="font-bold text-slate-700">{cooldown}s</strong></span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isResending}
            className="font-bold text-govNavy-700 hover:text-govNavy-900 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend Verification Code</span>
          </button>
        )}
      </div>
    </div>
  );
};
