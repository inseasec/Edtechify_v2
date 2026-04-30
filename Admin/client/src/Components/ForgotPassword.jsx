import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import bgImage from '../assets/pexels-fauxels-3184460-1.jpg';
import LoadingSpinner from '@/utils/LoadingSpinner';

function getApiErrorMessage(error) {
  const d = error?.response?.data;
  if (typeof d === 'string' && d.trim()) return d;
  if (d?.message) return d.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const baseUrl = window._CONFIG_?.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const emailNormalized = useMemo(() => String(email ?? '').trim().toLowerCase(), [email]);

  const sendOtp = async () => {
    setError('');
    if (!emailNormalized) {
      setError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailNormalized)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!baseUrl) {
      setError('API URL is not configured (VITE_API_BASE_URL).');
      return;
    }

    setBusy(true);
    try {
      await axios.post(`${baseUrl}/admin/password/otp/send`, { email: emailNormalized });
      setStep(2);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    const otpClean = String(otp ?? '').replace(/\s+/g, '');
    if (!otpClean) {
      setError('OTP is required.');
      return;
    }
    if (!/^\d{6}$/.test(otpClean)) {
      setError('Enter a valid 6-digit OTP.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!baseUrl) {
      setError('API URL is not configured (VITE_API_BASE_URL).');
      return;
    }

    setBusy(true);
    try {
      await axios.post(`${baseUrl}/admin/password/reset`, {
        email: emailNormalized,
        otp: otpClean,
        newPassword,
      });
      setTimeout(() => navigate('/login', { replace: true }), 600);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="flex justify-end inset-0 bg-cover bg-center min-h-screen relative"
    >
      {busy && <LoadingSpinner />}

      <div className="bg-black absolute opacity-20 h-screen w-full" />

      <div className="md:mr-36 pt-24 md:pt-32 flex-col w-[400px] md:w-[500px] z-10 relative">
        <div className="flex-col justify-center items-center px-4">
          <p className="text-center text-white relative capitalize font-semibold text-xl md:text-3xl mb-6">
            Rankwell&apos;s Admin Panel
          </p>
        </div>

        <div
          style={{ boxShadow: '0px 5px 5px 5px rgba(0.5, 0.5, 0.5, 0.5)' }}
          className="w-[80%] py-6 mt-2 ml-3 md:ml-16 shadow-2xl bg-white rounded-lg"
        >
          <p className="text-center font-bold text-xl text-slate-900 py-2">Forgot Password</p>

          <div className="w-[79%] mx-auto mt-4 space-y-4">
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                className={`mt-1 w-full border-2 outline-none p-[6px] rounded-md text-sm disabled:bg-blue-50 ${
                  step === 2 ? 'border-gray-300 bg-blue-50' : 'border-black bg-white focus:border-blue-600'
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStep(1);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                type="email"
                autoComplete="username"
                readOnly={step === 2}
                disabled={busy && step === 2}
              />
            </div>

            {step === 1 ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={busy}
                className="w-full text-white font-semibold rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Sending OTP…' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">OTP</label>
                  <input
                    className="mt-1 w-full border-2 border-black outline-none p-[6px] rounded-md bg-white focus:border-blue-600 tracking-[0.35em] text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="------"
                    disabled={busy}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative mt-1">
                    <input
                      className="w-full border-2 border-black outline-none p-[6px] pr-10 rounded-md bg-white focus:border-blue-600 text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={busy}
                    />
                    <span
                      className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                      onClick={() => setShowPassword((p) => !p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    className="mt-1 w-full border-2 border-black outline-none p-[6px] rounded-md bg-white focus:border-blue-600 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={busy}
                  />
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={busy}
                  className="w-full text-white font-semibold rounded-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {busy ? 'Updating…' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={busy}
                  className="text-blue-600 text-sm underline w-full text-center"
                >
                  Resend OTP
                </button>
              </>
            )}
          </div>

          <p className="mt-6 mb-4 text-center text-sm text-gray-600">
            Remembered it?{' '}
            <Link className="text-blue-600 font-medium" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
