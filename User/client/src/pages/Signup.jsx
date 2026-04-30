import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { buildAuthPayload, getApiErrorMessage } from "../utils/authPayload";
import defaultAuthSideImg from "../assets/auth-side-default.jpg";
import AuthHeroTagline from "../Components/AuthHeroTagline";

function createNonce() {
  try {
    return globalThis.crypto?.randomUUID?.() || String(Date.now());
  } catch {
    return String(Date.now());
  }
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(true);

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

function loadFacebookScript() {
  return new Promise((resolve, reject) => {
    if (window.FB) return resolve(true);

    const existing = document.querySelector('script[src="https://connect.facebook.net/en_US/sdk.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Failed to load Facebook script")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Facebook script"));
    document.head.appendChild(script);
  });
}

function Signup() {
  const navigate = useNavigate();
  const [signupMode, setSignupMode] = useState("BOTH"); // NORMAL | EMAIL | MOBILE | BOTH
  const [normalStep, setNormalStep] = useState(1); // NORMAL mode only: 1=email, 2=password
  const [otpNotice, setOtpNotice] = useState("");
  const [socialProviders, setSocialProviders] = useState({
    googleEnabled: true,
    facebookEnabled: true,
    githubEnabled: true,
  });
  const [userInfo, setUserInfo] = useState({
    identifier: "",
    otp: "",
    password: "",
  });
  const [error, setError] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googlePrompting, setGooglePrompting] = useState(false);
  const [facebookAppId, setFacebookAppId] = useState("");
  const [facebookError, setFacebookError] = useState("");
  const [facebookPrompting, setFacebookPrompting] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [authUi, setAuthUi] = useState({
    signinSideImageUrl: "",
    signupSideImageUrl: "",
    titlePrimary: "",
    titleAccent: "",
    tagline: "",
  });
  const [sideImageUseBundled, setSideImageUseBundled] = useState(false);
  const [authSideConfigLoaded, setAuthSideConfigLoaded] = useState(false);
  const [authConfigEpoch, setAuthConfigEpoch] = useState(0);
  const [availability, setAvailability] = useState({
    checking: false,
    available: true,
    message: "",
  });
  const baseUrl = window._CONFIG_?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  /** Sign-up side art is served from the admin/media app (port 8114) alongside OrgData uploads. */
  const adminBaseUrl = window._CONFIG_?.VITE_ADMIN_PROJECT_URL?.replace(/\/$/, "") ?? "";

  function resolveUserApiAssetPath(path, baseOverride) {
    const base = String(baseOverride || "").trim();
    const raw = String(path || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!base) return raw;
    try {
      const rel = raw.startsWith("/") ? raw : `/${raw}`;
      return new URL(rel, base + "/").toString();
    } catch {
      return raw;
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const oauthError = url.searchParams.get("oauthError");

    if (token) {
      localStorage.setItem("authToken", token);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
      navigate("/", { replace: true });
      return;
    }
    if (oauthError) {
      setGithubError("GitHub Sign-In failed. Please try again.");
      url.searchParams.delete("oauthError");
      window.history.replaceState({}, "", url.toString());
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      try {
        window.google?.accounts?.id?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${baseUrl}/users/signup-mode`)
      .then((res) => {
        const m = res?.data?.mode;
        if (!mounted) return;
        if (typeof m === "string" && m.trim()) setSignupMode(m.trim().toUpperCase());
        setSocialProviders({
          googleEnabled: Boolean(res?.data?.googleEnabled),
          facebookEnabled: Boolean(res?.data?.facebookEnabled),
          githubEnabled: Boolean(res?.data?.githubEnabled),
        });
      })
      .catch(() => {
        // ignore; keep default
      });
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  useEffect(() => {
    let mounted = true;
    setAuthSideConfigLoaded(false);
    axios
      .get(`${baseUrl}/users/auth-ui-config`, { params: { _t: Date.now() } })
      .then((res) => {
        if (!mounted) return;
        setAuthUi({
          signinSideImageUrl: String(res?.data?.USER_SIGNIN_SIDE_IMAGE_URL || "").trim(),
          signupSideImageUrl: String(res?.data?.USER_SIGNUP_SIDE_IMAGE_URL || "").trim(),
          titlePrimary: String(res?.data?.USER_AUTH_TITLE_PRIMARY || "").trim(),
          titleAccent: String(res?.data?.USER_AUTH_TITLE_ACCENT || "").trim(),
          tagline: String(res?.data?.USER_AUTH_TAGLINE || "").trim(),
        });
        setAuthConfigEpoch((e) => e + 1);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthUi({
          signinSideImageUrl: "",
          signupSideImageUrl: "",
          titlePrimary: "",
          titleAccent: "",
          tagline: "",
        });
        setAuthConfigEpoch((e) => e + 1);
      })
      .finally(() => {
        if (mounted) setAuthSideConfigLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  /** Hero image: same as Sign In — always `USER_SIGNIN_SIDE_IMAGE_URL` from API */
  const authSidePath = useMemo(
    () => authUi.signinSideImageUrl,
    [authUi.signinSideImageUrl]
  );

  const authSideTitlePrimary = useMemo(
    () => (authUi.titlePrimary && authUi.titlePrimary.trim()) || "Welcome",
    [authUi.titlePrimary]
  );
  const authSideTitleAccent = useMemo(
    () => (authUi.titleAccent && authUi.titleAccent.trim()) || "Users",
    [authUi.titleAccent]
  );
  const authSideTagline = useMemo(
    () => (authUi.tagline && authUi.tagline.trim()) || "Time and Tide wait for none",
    [authUi.tagline]
  );

  const authSideBgUrl = useMemo(
    () => resolveUserApiAssetPath(authSidePath, adminBaseUrl),
    [authSidePath, adminBaseUrl]
  );

  const signupSideImageSrc = useMemo(() => {
    if (!authSideConfigLoaded) return null;
    if (sideImageUseBundled) return defaultAuthSideImg;
    if (authSideBgUrl) return authSideBgUrl;
    return defaultAuthSideImg;
  }, [authSideConfigLoaded, defaultAuthSideImg, sideImageUseBundled, authSideBgUrl]);

  useEffect(() => {
    setSideImageUseBundled(false);
  }, [authSideBgUrl]);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${baseUrl}/users/oauth/google/client-id`)
      .then((res) => {
        const id = res?.data?.clientId;
        if (!mounted) return;
        if (typeof id === "string" && id.trim()) setGoogleClientId(id.trim());
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${baseUrl}/users/oauth/facebook/app-id`)
      .then((res) => {
        const id = res?.data?.appId;
        if (!mounted) return;
        if (typeof id === "string" && id.trim()) setFacebookAppId(id.trim());
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  const identifierRaw = useMemo(
    () => String(userInfo.identifier ?? "").trim(),
    [userInfo.identifier]
  );
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
    return identifierRaw;
  }, [identifierRaw, identifierType]);
  const isIdentifierValid = identifierType !== "unknown";
  const otpRequired = signupMode !== "NORMAL";
  const isNormalMode = signupMode === "NORMAL";
  const shouldShowIdentifierInput = useMemo(() => {
    if (isNormalMode) return normalStep === 1;
    if (!otpRequired) return true;
    // OTP modes: show identifier only before OTP is sent/verified.
    return !otpSent && !otpVerified;
  }, [isNormalMode, normalStep, otpRequired, otpSent, otpVerified]);
  const isAllowedIdentifier = useMemo(() => {
    if (!isIdentifierValid) return false;
    // NORMAL mode: email or mobile + password (no OTP)
    if (signupMode === "NORMAL") return identifierType === "email" || identifierType === "mobile";
    if (signupMode === "BOTH") return true;
    if (signupMode === "EMAIL") return identifierType === "email";
    if (signupMode === "MOBILE") return identifierType === "mobile";
    return true;
  }, [identifierType, isIdentifierValid, signupMode]);

  useEffect(() => {
    // Reset availability when identifier changes.
    setAvailability({ checking: false, available: true, message: "" });
    if (!identifierNormalized || !isIdentifierValid || !isAllowedIdentifier) return;

    const timer = setTimeout(() => {
      let cancelled = false;
      setAvailability((p) => ({ ...p, checking: true, message: "" }));

      const params =
        identifierType === "email"
          ? { email: identifierNormalized }
          : identifierType === "mobile"
            ? { mobileNo: identifierNormalized }
            : {};

      axios
        .get(`${baseUrl}/users/availability`, { params })
        .then((res) => {
          if (cancelled) return;
          const available = Boolean(res?.data?.available);
          const message = String(res?.data?.message || "");
          setAvailability({ checking: false, available, message });
          if (!available && message) {
            setError((p) => ({ ...p, identifier: message }));
          }
        })
        .catch(() => {
          if (cancelled) return;
          // If check fails, don't block user.
          setAvailability({ checking: false, available: true, message: "" });
        });

      return () => {
        cancelled = true;
      };
    }, 450);

    return () => clearTimeout(timer);
  }, [baseUrl, identifierNormalized, identifierType, isAllowedIdentifier, isIdentifierValid]);

  const sendOtpMutation = useMutation({
    mutationFn: async ({ type, value }) => {
      if (type === "email") {
        const { data } = await axios.post(`${baseUrl}/users/otp/send`, { email: value });
        return data;
      }
      const { data } = await axios.post(`${baseUrl}/users/otp/mobile/send`, { mobileNo: value });
      return data;
    },
    onSuccess: (_data, variables) => {
      setOtpSent(true);
      setOtpNotice(variables?.isResend ? "OTP resent" : "");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ type, value, otp }) => {
      if (type === "email") {
        const { data } = await axios.post(`${baseUrl}/users/otp/verify`, { email: value, otp });
        return data;
      }
      const { data } = await axios.post(`${baseUrl}/users/otp/mobile/verify`, { mobileNo: value, otp });
      return data;
    },
    onSuccess: () => {
      setOtpVerified(true);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post(`${baseUrl}/users/signup`, payload);
      return data;
    },
    onSuccess: async () => {
      try {
        const loginPayload = {
          email: identifierType === "email" ? identifierNormalized : "",
          mobileNo: identifierType === "mobile" ? identifierNormalized : "",
          password: userInfo.password,
        };
        const { data } = await axios.post(`${baseUrl}/users/signin`, loginPayload);
        const token = typeof data === "string" ? data : data?.token ?? data?.accessToken ?? data?.jwt;
        if (token) localStorage.setItem("authToken", token);
        navigate("/", { replace: true });
      } catch {
        // If auto-login fails for any reason, send user to sign in.
        navigate("/signin", { replace: true });
      }
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err);
      if (msg && (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("mobile"))) {
        setError((p) => ({ ...p, identifier: msg }));
      }
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: async (idToken) => {
      const { data } = await axios.post(`${baseUrl}/users/auth/google`, { idToken });
      return data;
    },
    onSuccess: (data) => {
      const token = typeof data === "string" ? data : data?.token ?? data?.accessToken ?? data?.jwt;
      if (token) localStorage.setItem("authToken", token);
      navigate("/", { replace: true });
      setGooglePrompting(false);
    },
    onError: (err) => {
      setGoogleError(getApiErrorMessage(err) || "Google sign-in failed.");
      setGooglePrompting(false);
    },
  });

  const facebookAuthMutation = useMutation({
    mutationFn: async (accessToken) => {
      const { data } = await axios.post(`${baseUrl}/users/auth/facebook`, { accessToken });
      return data;
    },
    onSuccess: (data) => {
      const token = typeof data === "string" ? data : data?.token ?? data?.accessToken ?? data?.jwt;
      if (token) localStorage.setItem("authToken", token);
      navigate("/", { replace: true });
      setFacebookPrompting(false);
    },
    onError: (err) => {
      setFacebookError(getApiErrorMessage(err) || "Facebook sign-in failed.");
      setFacebookPrompting(false);
    },
  });

  const handleGoogleSignup = async () => {
    setGoogleError("");
    if (!googleClientId) {
      setGoogleError("Google Sign-In is not configured. Please contact support.");
      return;
    }
    if (googlePrompting) return;

    try {
      setGooglePrompting(true);
      await loadGoogleScript();
      if (!window.google?.accounts?.id) {
        setGoogleError("Google Sign-In failed to load.");
        setGooglePrompting(false);
        return;
      }

      if (window.__rankwellGoogleClientId !== googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          nonce: createNonce(),
          // Let GIS/Chrome choose the best flow (FedCM is rolling out and flags are being deprecated).
          callback: (response) => {
            const credential = response?.credential;
            if (!credential) {
              setGoogleError("Google Sign-In cancelled.");
              setGooglePrompting(false);
              return;
            }
            googleAuthMutation.mutate(credential);
          },
        });
        window.__rankwellGoogleClientId = googleClientId;
      }

      window.google.accounts.id.prompt((notification) => {
        if (
          notification?.isNotDisplayed?.() ||
          notification?.isSkippedMoment?.() ||
          notification?.isDismissedMoment?.()
        ) {
          if (notification?.isNotDisplayed?.()) {
            const reason = notification?.getNotDisplayedReason?.();
            if (reason) setGoogleError(`Google Sign-In unavailable: ${reason}.`);
          }
          setGooglePrompting(false);
        }
      });
    } catch {
      setGoogleError("Google Sign-In failed to load.");
      setGooglePrompting(false);
    }
  };

  const handleFacebookSignup = async () => {
    setFacebookError("");
    if (!facebookAppId) {
      setFacebookError("Facebook Sign-In is not configured. Please contact support.");
      return;
    }
    if (facebookPrompting) return;

    try {
      setFacebookPrompting(true);
      await loadFacebookScript();
      if (!window.FB) {
        setFacebookError("Facebook Sign-In failed to load.");
        setFacebookPrompting(false);
        return;
      }

      if (!window.__rankwellFacebookInit) {
        window.fbAsyncInit = function () {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: false,
            version: "v20.0",
          });
          window.__rankwellFacebookInit = true;
        };
        try {
          window.fbAsyncInit();
        } catch {
          // ignore
        }
      }

      window.FB.login(
        (response) => {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            setFacebookError("Facebook Sign-In cancelled.");
            setFacebookPrompting(false);
            return;
          }
          facebookAuthMutation.mutate(accessToken);
        },
        { scope: "public_profile,email" }
      );
    } catch {
      setFacebookError("Facebook Sign-In failed to load.");
      setFacebookPrompting(false);
    }
  };

  const handleGithubSignup = () => {
    setGithubError("");
    window.location.href = `${baseUrl}/users/oauth/github/login`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError({});
    if (!validate()) return;
    const payload = buildAuthPayload(userInfo);
    signupMutation.mutate(payload);
  };

  const handleSendOtp = async () => {
    setError((p) => ({ ...p, otpSend: undefined, otpVerify: undefined, identifier: undefined, otp: undefined }));
    setOtpNotice("");

    if (!identifierRaw) {
      setError((p) => ({
        ...p,
        identifier: signupMode === "NORMAL" || signupMode === "EMAIL" ? "Email is required." : "Email or mobile number is required.",
      }));
      return;
    }
    if (!isIdentifierValid) {
      setError((p) => ({
        ...p,
        identifier: signupMode === "NORMAL" || signupMode === "EMAIL" ? "Enter a valid email." : "Enter a valid email or 10-digit mobile number.",
      }));
      return;
    }
    if (!isAllowedIdentifier) {
      setError((p) => ({
        ...p,
        identifier:
          signupMode === "NORMAL" || signupMode === "EMAIL"
            ? "Enter a valid email."
            : "Enter a valid 10-digit mobile number.",
      }));
      return;
    }

    const isResend = otpSent;
    setOtpVerified(false);
    setOtpSent(false);
    setUserInfo((prev) => ({ ...prev, otp: "" }));
    try {
      verifyOtpMutation.reset?.();
      sendOtpMutation.reset?.();
    } catch {
      // ignore
    }
    sendOtpMutation.mutate({ type: identifierType, value: identifierNormalized, isResend });
  };

  const handleVerifyOtp = async () => {
    setError((p) => ({ ...p, otpVerify: undefined, otp: undefined, identifier: undefined }));

    const otp = String(userInfo.otp ?? "").replace(/\s+/g, "");
    if (!otp) {
      setError((p) => ({ ...p, otp: "OTP is required." }));
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError((p) => ({ ...p, otp: "Enter a valid 6-digit OTP." }));
      return;
    }
    if (!isIdentifierValid) {
      setError((p) => ({ ...p, identifier: "Enter a valid email or 10-digit mobile number." }));
      return;
    }

    verifyOtpMutation.mutate({ type: identifierType, value: identifierNormalized, otp });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
    if (name === "identifier") {
      setOtpSent(false);
      setOtpVerified(false);
      if (signupMode === "NORMAL") setNormalStep(1);
      setUserInfo((prev) => ({ ...prev, otp: "" }));
      // Don't keep showing "exists" error while typing; availability check will set it.
      setError((p) => ({ ...p, identifier: undefined }));
    }
  };

  const validateIdentifierOnly = () => {
    const tempError = {};

    if (!identifierRaw) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Email is required."
          : signupMode === "MOBILE"
            ? "Mobile number is required."
            : "Email or mobile number is required.";
    } else if (!isIdentifierValid) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Enter a valid email."
          : signupMode === "MOBILE"
            ? "Enter a valid 10-digit mobile number."
            : "Enter a valid email or 10-digit mobile number.";
    } else if (!isAllowedIdentifier) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Enter a valid email."
          : signupMode === "MOBILE"
            ? "Enter a valid 10-digit mobile number."
            : "Enter a valid email or 10-digit mobile number.";
    } else if (!availability.available) {
      tempError.identifier = availability.message || "This account already exists.";
    }

    setError((p) => ({ ...p, ...tempError }));
    return Object.keys(tempError).length === 0;
  };

  const handleNormalContinue = () => {
    setError((p) => ({ ...p, identifier: undefined }));
    if (!validateIdentifierOnly()) return;
    setNormalStep(2);
  };

  const validate = () => {
    const tempError = {};
    const { password } = userInfo;

    if (!identifierRaw) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Email is required."
          : signupMode === "MOBILE"
            ? "Mobile number is required."
            : "Email or mobile number is required.";
    } else if (!isIdentifierValid) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Enter a valid email."
          : signupMode === "MOBILE"
            ? "Enter a valid 10-digit mobile number."
            : "Enter a valid email or 10-digit mobile number.";
    }
    else if (!isAllowedIdentifier) {
      tempError.identifier =
        signupMode === "EMAIL"
          ? "Enter a valid email."
          : signupMode === "MOBILE"
            ? "Enter a valid 10-digit mobile number."
            : "Enter a valid email or 10-digit mobile number.";
    }
    else if (!availability.available) {
      tempError.identifier = availability.message || "This account already exists.";
    }

    if (otpRequired && !otpVerified) tempError.otpVerify = "Please verify OTP before creating the account.";

    if (password.length < 6) tempError.password = "Password must be at least 6 characters.";

    if (!isChecked) tempError.checkbox = "You must accept the terms.";

    setError(tempError);
    return Object.keys(tempError).length === 0;
  };

  const apiMessageRaw =
    (sendOtpMutation.isError && getApiErrorMessage(sendOtpMutation.error)) ||
    (verifyOtpMutation.isError && getApiErrorMessage(verifyOtpMutation.error)) ||
    (signupMutation.isError ? getApiErrorMessage(signupMutation.error) : null);
  const apiMessage = apiMessageRaw && apiMessageRaw !== error.identifier ? apiMessageRaw : null;

  const otpNormalized = useMemo(() => String(userInfo.otp ?? "").replace(/\s+/g, ""), [userInfo.otp]);
  const isOtpComplete = /^\d{6}$/.test(otpNormalized);
  const canProceedWithIdentifier = isIdentifierValid && isAllowedIdentifier && availability.available;
  const currentStep = useMemo(() => {
    if (otpVerified) return 3;
    if (otpSent) return 2;
    return 1;
  }, [otpSent, otpVerified]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-[30%] flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="mx-auto px-1 py-2">
           

            <h1 className="mt-6 text-4xl font-semibold text-gray-900">
              {authSideTitlePrimary}
            </h1>
            {/* <p className="mt-2 text-sm text-gray-500">Sign in to your account or create a new one</p> */}

            {(apiMessage || googleError || facebookError || githubError) && (
              <div className="mt-5 space-y-2" role="alert">
                {apiMessage && <p className="text-sm text-red-600">{apiMessage}</p>}
                {googleError && <p className="text-sm text-red-600">{googleError}</p>}
                {facebookError && <p className="text-sm text-red-600">{facebookError}</p>}
                {githubError && <p className="text-sm text-red-600">{githubError}</p>}
              </div>
            )}

            {shouldShowIdentifierInput &&
              (socialProviders.googleEnabled || socialProviders.facebookEnabled || socialProviders.githubEnabled) && (
              <div className="mt-7 space-y-3">
                {socialProviders.googleEnabled && (
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleAuthMutation.isPending || googlePrompting}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-label="Continue with Google"
                    title="Continue with Google"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.216 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.195 0-9.617-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.224-2.252 4.114-4.093 5.57l.003-.002 6.19 5.238C36.965 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                )}

                {socialProviders.facebookEnabled && (
                  <button
                    type="button"
                    onClick={handleFacebookSignup}
                    disabled={facebookAuthMutation.isPending || facebookPrompting}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-label="Continue with Facebook"
                    title="Continue with Facebook"
                  >
                    <i className="ri-facebook-fill text-lg text-[#1877F2]" />
                    Continue with Facebook
                  </button>
                )}

                {socialProviders.githubEnabled && (
                  <button
                    type="button"
                    onClick={handleGithubSignup}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-label="Continue with GitHub"
                    title="Continue with GitHub"
                  >
                    <i className="ri-github-fill text-lg text-gray-900" />
                    Continue with GitHub
                  </button>
                )}
              </div>
            )}

            {shouldShowIdentifierInput && (
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-semibold tracking-wide text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              {shouldShowIdentifierInput && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {signupMode === "NORMAL"
                      ? "Email or mobile number"
                      : signupMode === "EMAIL"
                        ? "Email address"
                      : signupMode === "MOBILE"
                        ? "Mobile number"
                        : "Email or mobile number"}
                  </label>
                  <div className="relative mt-2">
                    <input
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                      name="identifier"
                      value={userInfo.identifier}
                      onChange={handleChange}
                      type="text"
                      autoComplete="username"
                      placeholder={signupMode === "NORMAL" || signupMode === "EMAIL" ? "you@company.com" : ""}
                      disabled={sendOtpMutation.isPending || verifyOtpMutation.isPending || otpVerified}
                    />
                  </div>
                  {error.identifier && <p className="mt-2 text-sm text-red-600">{error.identifier}</p>}
                  {otpVerified && (
                    <p className="mt-2 text-sm text-green-600">
                      {identifierType === "email" ? "Email verified" : "Mobile verified"}
                    </p>
                  )}
                </div>
              )}

              {otpRequired && otpSent && (
                <div className="space-y-3">
                  {/* <p className="text-xs text-gray-500">
                    OTP sent to your {identifierType === "email" ? "email" : "mobile"}.
                  </p> */}
                  {otpNotice && <p className="text-xs text-green-700">{otpNotice}</p>}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {identifierType === "mobile" ? "Mobile number" : "Email address"}
                    </label>
                    <div className="relative mt-2">
                      <input
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 shadow-sm outline-none"
                        name="identifier"
                        value={userInfo.identifier}
                        type="text"
                        autoComplete="username"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">OTP</label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 tracking-[0.35em] shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                      name="otp"
                      value={userInfo.otp}
                      onChange={handleChange}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="------"
                      disabled={otpVerified}
                    />
                    {error.otp && <p className="mt-2 text-sm text-red-600">{error.otp}</p>}
                    {otpVerified && <p className="mt-2 text-sm text-green-600">OTP verified</p>}
                  </div>

                  {!otpVerified && error.otpVerify && <p className="text-sm text-red-600">{error.otpVerify}</p>}

                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyOtpMutation.isPending || !isOtpComplete}
                      className="h-11 w-full rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {verifyOtpMutation.isPending ? "Verifying…" : "Verify OTP"}
                    </button>
                  )}
                </div>
              )}

              {(!otpRequired || otpVerified) && (!isNormalMode || normalStep === 2) && (
                <div className="space-y-4">
                  {/* <div>
                    <label className="text-sm font-medium text-gray-700">
                      {identifierType === "mobile" ? "Mobile number" : "Email address"}
                    </label>
                    <div className="relative mt-2">
                      <input
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 shadow-sm outline-none"
                        name="identifier"
                        value={userInfo.identifier}
                        type="text"
                        autoComplete="username"
                        disabled
                        readOnly
                      />
                    </div>
                  </div> */}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative mt-2">
                      <input
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50"
                        name="password"
                        value={userInfo.password}
                        onChange={handleChange}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                      </button>
                    </div>
                    {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 pt-1">
                <input
                  className="mt-1"
                  name="checkbox"
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                />
                <div className="text-sm text-gray-600">
                  {error.checkbox ? (
                    <p className="text-red-600">You must accept the terms.</p>
                  ) : (
                    <p>Accept all terms &amp; conditions</p>
                  )}
                </div>
              </div>

              {isNormalMode && normalStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNormalContinue}
                  disabled={!canProceedWithIdentifier || availability.checking}
                  className="mt-2 h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {identifierType === "mobile" ? "SignUp" : "SignUp"}
                </button>
              ) : otpRequired && !otpVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending || !canProceedWithIdentifier || availability.checking}
                  className="mt-2 h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendOtpMutation.isPending ? "Sending OTP…" : otpSent ? "Resend OTP" : "SignUp"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    signupMutation.isPending ||
                    (otpRequired && !otpVerified) ||
                    !canProceedWithIdentifier ||
                    availability.checking
                  }
                  className="mt-2 h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? "Creating account…" : "Sign Up"}
                </button>
              )}

              <p className="pt-2 text-xs text-gray-500">
                By continuing you agree to our{" "}
                <span className="underline underline-offset-2">Terms of Service</span> and{" "}
                <span className="underline underline-offset-2">Privacy Policy</span>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="text-indigo-600 font-medium" to="/signin">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative md:w-[70%] min-h-[40vh] md:min-h-screen overflow-hidden">
        {!authSideConfigLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" aria-hidden="true" />
        )}
        {authSideConfigLoaded && signupSideImageSrc && (
          <img
            key={`${String(signupSideImageSrc)}-${authConfigEpoch}`}
            src={signupSideImageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              if (authSideBgUrl && !sideImageUseBundled) {
                setSideImageUseBundled(true);
              }
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 w-full h-full min-h-[40vh] md:min-h-screen flex flex-col">
          <p className="text-white text-5xl font-semibold text-center pt-[30%]">
            {authSideTitlePrimary}{" "}
            <span className="text-orange-600">{authSideTitleAccent}</span>
          </p>
          <AuthHeroTagline
            text={authSideTagline}
            className="text-white mt-8 text-center text-xl"
          />
        </div>
      </div>
    </div>
  );
}

export default Signup;
