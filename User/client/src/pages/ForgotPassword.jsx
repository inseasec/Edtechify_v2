import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiErrorMessage } from "../utils/authPayload";
import defaultAuthSideImg from "../assets/auth-side-default.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = window._CONFIG_?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

  const initialIdentifier = useMemo(() => {
    const s = location?.state?.identifier;
    return typeof s === "string" ? s : "";
  }, [location?.state?.identifier]);

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: send otp, 2: reset
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const identifierRaw = useMemo(() => String(identifier ?? "").trim(), [identifier]);
  const identifierType = useMemo(() => {
    if (!identifierRaw) return "unknown";
    if (/^\d{10}$/.test(identifierRaw.replace(/\D/g, "").slice(-10))) return "mobile";
    if (/\S+@\S+\.\S+/.test(identifierRaw)) return "email";
    return "unknown";
  }, [identifierRaw]);
  const identifierNormalized = useMemo(() => {
    if (identifierType === "mobile") {
      const digits = identifierRaw.replace(/\D/g, "");
      return digits.length >= 10 ? digits.slice(-10) : digits;
    }
    if (identifierType === "email") return identifierRaw.toLowerCase();
    return identifierRaw;
  }, [identifierRaw, identifierType]);

  const sendOtp = async () => {
    setError("");
    setMessage("");
    if (!identifierRaw) {
      setError("Email or phone number is required.");
      return;
    }
    if (identifierType === "unknown") {
      setError("Enter a valid email or 10-digit mobile number.");
      return;
    }

    setBusy(true);
    try {
      const payload =
        identifierType === "email"
          ? { email: identifierNormalized }
          : { mobileNo: identifierNormalized };
      const { data } = await axios.post(`${baseUrl}/users/password/otp/send`, payload);
      // Keep UI clean: don't show "OTP sent" message here.
      setMessage("");
      setStep(2);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");
    const otpClean = String(otp ?? "").replace(/\s+/g, "");
    if (!otpClean) {
      setError("OTP is required.");
      return;
    }
    if (!/^\d{6}$/.test(otpClean)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }
    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (identifierType === "unknown") {
      setError("Enter a valid email or 10-digit mobile number.");
      return;
    }

    setBusy(true);
    try {
      const payload =
        identifierType === "email"
          ? { email: identifierNormalized, otp: otpClean, newPassword }
          : { mobileNo: identifierNormalized, otp: otpClean, newPassword };
      const { data } = await axios.post(`${baseUrl}/users/password/reset`, payload);
      setMessage(typeof data === "string" ? data : "Password updated successfully");
      setTimeout(() => navigate("/signin", { replace: true }), 800);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-[30%] flex items-start justify-center p-6 pt-10 bg-white">
        <div className="w-full max-w-md">
          <div className="mx-auto px-1 py-2">
            {/* <div className="h-14 w-14 rounded-2xl bg-indigo-600/15 flex items-center justify-center">
              <span className="text-indigo-700 font-bold text-2xl">V</span>
            </div> */}

            <h3 className="mt-2 text-2xl font-semibold text-gray-900">Forgot Password</h3>
            {/* <p className="mt-2 text-sm text-gray-500">Reset your password using OTP</p> */}

          {message && (
            <p className="mt-4 text-sm text-green-700" role="status">
              {/* {message} */}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-[25%] space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 ">Email or mobile number</label>
              <input
                className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setStep(1);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                type="text"
                autoComplete="username"
                disabled={busy}
              />
            </div>

            {step === 1 ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={busy}
                className="mt-1 h-9 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? "Sending OTP…" : "Send OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">OTP</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 tracking-[0.35em] shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
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
                      className=" mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={busy}
                  />
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={busy}
                  className="mt-2 h-9 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy ? "Updating…" : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={busy}
                  className="text-indigo-700 text-sm underline w-full mt-2"
                >
                  Resend OTP
                </button>
              </>
            )}
          </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered it?{" "}
            <Link className="text-indigo-600 font-medium" to="/signin">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative md:w-[70%] min-h-[40vh] md:min-h-screen overflow-hidden">
        <img
          src={defaultAuthSideImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
    </div>
  );
}

