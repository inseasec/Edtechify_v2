import React, { useEffect, useRef, useState } from "react";
// import Navbar from "../Components/Navbar";
// import banner from "../assets/banner.jpeg";
import api from "../api";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};
const Career = () => {
  const fileRef = useRef(null);
  const formShellRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const finalBlobRef = useRef(null);

  const webcamVideoRef = useRef(null);
  const webcamVideoStreamRef = useRef(null);
  const webcamAudioStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const offscreenVideosRef = useRef([]);
  const drawIntervalRef = useRef(null);
  const webcamEnabledRef = useRef(false);

  const [rolesList, setRolesList] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const [roleType, setRoleType] = useState("");

  // Filter roles based on roleType from rolesList
  const techRoles = rolesList.filter(role => role.roleType === "TECH");
  const nonTechRoles = rolesList.filter(role => role.roleType === "NON_TECH");

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", maritalStatus: "", state: "", city: "", dob: "", gender: "",
    qualification: "", currentSalary: "", expectedSalary: "", experienceLevel: "", roleType: "", role: "",
    subjects: "", resume: null, introVideo: null, videoUrl: "", applicationDate: getTodayDate()
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [showVideoInForm, setShowVideoInForm] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [statesCities, setStatesCities] = useState([]);
  const [cityQuery, setCityQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [applyOption, setApplyOption] = useState("");
  const [salaryChoice, setSalaryChoice] = useState({
    current: "",
    expected: "",
  });
  const [customSalary, setCustomSalary] = useState({
    current: "",
    expected: "",
  });

  const SALARY_OPTIONS = [
    "Less than 1 LPA",
    "1-3 LPA",
    "3-4 LPA",
    "4-5 LPA",
    "5-6 LPA",
    "6-7 LPA",
    "7-8 LPA",
    "8+ LPA",
    "Custom LPA",
  ];

  const STEPS = [
    { id: "personal", label: "Personal Info" },
    { id: "portfolio", label: "Portfolio & Experience" },
    { id: "video", label: "Intro Video & Submit" },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  const [activeTab, setActiveTab] = useState("new"); // 'new' | 'existing'
  const [signupMode, setSignupMode] = useState("BOTH"); // NORMAL | EMAIL | MOBILE | BOTH
  const [alreadyApplied, setAlreadyApplied] = useState({
    open: false,
    message: "",
    appliedOn: "",
  });
  const [existing, setExisting] = useState({
    identifier: "",
    otp: "",
    otpSent: false,
    verifying: false,
    sending: false,
    token: "",
    application: null,
  });

  const scrollFormIntoView = () => {
    formShellRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const focusFirstFieldInForm = () => {
    const root = formShellRef.current;
    if (!root) return;
    const el = root.querySelector("input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])");
    if (el && typeof el.focus === "function") el.focus();
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      roleType: roleType,
      role: selectedRole
    }));
  }, [roleType, selectedRole]);

  useEffect(() => {
    let mounted = true;
    const fetchMode = async () => {
      try {
        const res = await api.get("/users/signup-mode");
        const mode = String(res?.data?.mode || "BOTH").toUpperCase();
        if (mounted) setSignupMode(["NORMAL", "EMAIL", "MOBILE", "BOTH"].includes(mode) ? mode : "BOTH");
      } catch {
        // keep default
      }
    };
    fetchMode();
    return () => {
      mounted = false;
    };
  }, []);

  const existingMode = signupMode === "NORMAL" ? "EMAIL" : signupMode;
  const existingLabel =
    existingMode === "EMAIL" ? "Email" : existingMode === "MOBILE" ? "Mobile" : "Email / Mobile";
  const existingPlaceholder =
    existingMode === "EMAIL"
      ? "Enter your email"
      : existingMode === "MOBILE"
        ? "Enter your mobile number"
        : "Enter your email or mobile number";

  const resetExisting = () => {
    setExisting({
      identifier: "",
      otp: "",
      otpSent: false,
      verifying: false,
      sending: false,
      token: "",
      application: null,
    });
  };

  const sendExistingOtp = async () => {
    const identifier = existing.identifier.trim();
    if (!identifier) return showErrorToast(`${existingLabel} is required`);
    setExisting((p) => ({ ...p, sending: true }));
    try {
      await api.post("/careers/existing/otp/send", { identifier, mode: existingMode });
      showSuccessToast("OTP sent");
      setExisting((p) => ({ ...p, otpSent: true }));
    } catch (err) {
      showErrorToast(err?.response?.data || err?.message || "Failed to send OTP");
    } finally {
      setExisting((p) => ({ ...p, sending: false }));
    }
  };

  const verifyExistingOtp = async () => {
    const identifier = existing.identifier.trim();
    const otp = existing.otp.trim();
    if (!identifier) return showErrorToast(`${existingLabel} is required`);
    if (!otp) return showErrorToast("OTP is required");
    setExisting((p) => ({ ...p, verifying: true }));
    try {
      const res = await api.post("/careers/existing/otp/verify", { identifier, otp, mode: existingMode });
      const token = res?.data?.token || "";
      if (!token) throw new Error("Missing token");
      const appRes = await api.get(`/careers/existing?identifier=${encodeURIComponent(identifier)}`, {
        headers: { "X-OTP-Token": token },
      });
      setExisting((p) => ({ ...p, token, application: appRes?.data || null }));
      showSuccessToast("OTP verified");
    } catch (err) {
      showErrorToast(err?.response?.data || err?.message || "OTP verification failed");
    } finally {
      setExisting((p) => ({ ...p, verifying: false }));
    }
  };

  const validateStep = (stepIdx) => {
    const newErrors = {};

    // Step 0: Personal
    if (stepIdx === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = "Valid Name is required";
      if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.dob) newErrors.dob = "DOB is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.maritalStatus) newErrors.maritalStatus = "Select marital status";
    }

    // Step 1: Portfolio/Experience
    if (stepIdx === 1) {
      if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
      if (!formData.experienceLevel) newErrors.experienceLevel = "Select experience";
      if (!formData.currentSalary.trim()) newErrors.currentSalary = "Current Salary is required";
      if (!formData.expectedSalary.trim()) newErrors.expectedSalary = "Expected Salary is required";

      if (!roleType) newErrors.roleType = "Please select a role type";
      if (roleType === "NON_TECH") {
        if (!formData.subjects.trim()) newErrors.subjects = "Subjects are required";
        if (nonTechRoles.length > 0 && !selectedRole) newErrors.role = "Please select a non-tech role";
      } else if (roleType === "TECH") {
        if (techRoles.length > 0 && !selectedRole) newErrors.role = "Please select a tech role";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    const ok = validateStep(currentStep);
    if (!ok) return;
    const next = Math.min(currentStep + 1, STEPS.length - 1);
    setCurrentStep(next);
    setTimeout(() => {
      scrollFormIntoView();
      focusFirstFieldInForm();
    }, 0);
  };

  const goBack = () => {
    const prev = Math.max(currentStep - 1, 0);
    setCurrentStep(prev);
    setTimeout(() => {
      scrollFormIntoView();
      focusFirstFieldInForm();
    }, 0);
  };

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const statesRes = await axios.post(
          "https://countriesnow.space/api/v0.1/countries/states",
          { country: "India" }
        );
        const statesData = statesRes.data.data.states || [];
        const statesWithCities = await Promise.all(
          statesData.map(async s => {
            const cityRes = await axios.post(
              "https://countriesnow.space/api/v0.1/countries/state/cities",
              { country: "India", state: s.name }
            );
            return { state: s.name, cities: cityRes.data.data || [] };
          })
        );
        setStatesCities(statesWithCities);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/applyfor/getAllJobs");
        const roles = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        setRolesList(roles);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoles();
  }, []);

  const selectedRoleDesc = rolesList.find(r => r.applyingFor === selectedRole)?.description || "";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Valid Name is required";

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.dob) newErrors.dob = "DOB is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.currentSalary.trim()) newErrors.currentSalary = "Current Salary is required";
    if (!formData.expectedSalary.trim()) newErrors.expectedSalary = "Expected Salary is required";
    if (!formData.experienceLevel) newErrors.experienceLevel = "Select experience";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Select marital status";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.introVideo) newErrors.introVideo = "Intro video is required";

    // Role type specific validations
    if (roleType === "NON_TECH") {
      if (!formData.subjects.trim()) newErrors.subjects = "Subjects are required";
      // For non-tech roles, check if a role is selected
      if (nonTechRoles.length > 0 && !selectedRole) {
        newErrors.role = "Please select a non-tech role";
      }
    } else if (roleType === "TECH") {
      // For tech roles, check if a role is selected
      if (techRoles.length > 0 && !selectedRole) {
        newErrors.role = "Please select a tech role";
      }
    }

    if (!roleType) {
      newErrors.roleType = "Please select a role type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      fullName: "", email: "", phone: "", city: "", dob: "", gender: "", state: "", maritalStatus: "",
      qualification: "", currentSalary: "", expectedSalary: "", experienceLevel: "", roleType: "", role: "",
      subjects: "", resume: null, videoUrl: "", introVideo: null, applicationDate: getTodayDate()
    });
    setErrors({});
    setAlreadyApplied({ open: false, message: "", appliedOn: "" });
    setShowVideoInForm(false);
    setCityQuery(""); setFilteredCities([]); setShowCityDropdown(false);
    if (fileRef.current) fileRef.current.value = "";
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
    finalBlobRef.current = null;
    setRoleType("");
    setSelectedRole("")
    setSalaryChoice({ current: "", expected: "" });
    setCustomSalary({ current: "", expected: "" });
    setCurrentStep(0);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedRoleObj = rolesList.find(r => r.applyingFor === selectedRole);

      const payload = {
        fullName: formData.fullName,
        email: formData.email || null,
        phone: formData.phone,
        maritalStatus: formData.maritalStatus,
        state: formData.state,
        city: formData.city,
        dob: formData.dob,
        gender: formData.gender,
        qualification: formData.qualification,
        currentSalary: formData.currentSalary,
        expectedSalary: formData.expectedSalary,
        experienceLevel: formData.experienceLevel,
        subjects: formData.subjects || null,
        videoUrl: formData.videoUrl || undefined,
        applyFor: selectedRoleObj?.id || null,
        roleType: formData.roleType || null,
        role: formData.role || null,
        applicationDate: formData.applicationDate
      };

      const fd = new FormData();
      fd.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      if (formData.resume instanceof File) {
        fd.append("resume", formData.resume);
      }

      if (formData.introVideo instanceof Blob) {
        fd.append("video", formData.introVideo, "intro-video.webm");
      }

      const res = await api.post("/careers/apply", fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showSuccessToast(res?.data?.message || "Application submitted successfully!");
      setSubmitted(true);
      setAlreadyApplied({ open: false, message: "", appliedOn: "" });

    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409) {
        const serverMsg = typeof data === "string" ? data : data?.message;
        const appliedOn = data?.appliedOn ? String(data.appliedOn) : "";
        setAlreadyApplied({
          open: true,
          message:
            serverMsg ||
            "Your application already exists with your mobile number and email. Please open it from the Existing Application tab.",
          appliedOn,
        });
      } else {
        showErrorToast("Failed to submit application: " + (data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const startTimer = () => { setSeconds(0); timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000); };
  const stopTimer = () => { clearInterval(timerRef.current); timerRef.current = null; };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const openRecordModal = () => { setOpenVideoModal(true); setShowVideoInForm(false); };
  const handleRemoveVideo = () => { videoURL && URL.revokeObjectURL(videoURL); setVideoURL(null); finalBlobRef.current = null; setShowVideoInForm(false); setFormData(prev => ({ ...prev, introVideo: null })); };
  const handleRerecord = () => { handleRemoveVideo(); setOpenVideoModal(true); };

  const getMediaDevicesOrExplain = () => {
    const md = navigator?.mediaDevices;
    if (md?.getUserMedia) return md;
    const host = window?.location?.hostname || "";
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const secure = Boolean(window?.isSecureContext) || isLocalhost;
    const hint = secure
      ? "Your browser does not support camera access on this device/browser."
      : "Camera access requires HTTPS (or running on localhost).";
    showErrorToast(
      `${hint} Please open the site on https:// (recommended) or use http://localhost during development.`
    );
    return null;
  };

  const startCapture = async () => {
    if (!webcamEnabledRef.current) return showErrorToast("Please enable camera first!");
    try {
      const md = getMediaDevicesOrExplain();
      if (!md) return;

      // Camera-only recording (no screen share).
      const stream = await md.getUserMedia({ video: true, audio: true });
      webcamVideoStreamRef.current = stream;

      videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      recordedChunksRef.current = [];
      recorder.ondataavailable = e => e.data.size > 0 && recordedChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        finalBlobRef.current = blob;
        if (videoURL) URL.revokeObjectURL(videoURL);
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setFormData(prev => ({ ...prev, introVideo: blob }));
        setShowVideoInForm(false);
      };
      recorder.start(); mediaRecorderRef.current = recorder;
      setRecording(true); startTimer();
    } catch (err) { showErrorToast("Recording failed: " + err.message); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    stopTimer();
    webcamVideoStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    webcamAudioStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    offscreenVideosRef.current.forEach((v) => {
      v.pause();
      v.srcObject = null;
      v.remove();
    });
    offscreenVideosRef.current = [];
    webcamVideoRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const toggleWebcam = async () => {
    if (webcamEnabledRef.current) {
      webcamVideoStreamRef.current?.getTracks?.().forEach((t) => t.stop());
      webcamVideoRef.current?.remove();
      webcamVideoRef.current = null;
      webcamEnabledRef.current = false;
      setWebcamEnabled(false);
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    try {
      const md = getMediaDevicesOrExplain();
      if (!md) return;
      const webcamStream = await md.getUserMedia({ video: true });
      webcamVideoStreamRef.current = webcamStream;
      webcamEnabledRef.current = true;
      setWebcamEnabled(true);

      // Preview camera feed in modal video element.
      if (videoRef.current) {
        videoRef.current.srcObject = webcamStream;
      }
    } catch (err) {
      showErrorToast("Failed to enable webcam: " + err.message);
    }
  };

  const handleRoleTypeChange = (e) => {
    const value = e.target.value;
    setRoleType(value);
    setSelectedRole("");
  };

  const handleSelectedRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRole(value);
  };

  // Opposite roles logic
  const visibleRoles =
    roleType === "NON_TECH" ? techRoles :
      roleType === "TECH" ? nonTechRoles :
        [];




  return (
    <>
      {/* <Navbar /> */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        {alreadyApplied.open ? (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-orange-900">Application already exists</p>
                <p className="mt-1 text-sm text-orange-800">
                  {alreadyApplied.message}
                  {alreadyApplied.appliedOn ? (
                    <span className="ml-2 text-orange-700">(Applied on: {alreadyApplied.appliedOn})</span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("existing");
                    setSubmitted(false);
                    setAlreadyApplied((p) => ({ ...p, open: false }));
                    // Prefill identifier to reduce friction.
                    const identifier = (formData.email || formData.phone || "").trim();
                    setExisting((prev) => ({ ...prev, identifier }));
                  }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Open Existing Application
                </button>
                <button
                  type="button"
                  onClick={() => setAlreadyApplied({ open: false, message: "", appliedOn: "" })}
                  className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-900 hover:bg-orange-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("new");
              resetExisting();
              setAlreadyApplied({ open: false, message: "", appliedOn: "" });
            }}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
              activeTab === "new"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            New Application
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("existing");
              setSubmitted(false);
              setAlreadyApplied({ open: false, message: "", appliedOn: "" });
            }}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
              activeTab === "existing"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Existing Application
          </button>
        </div>

        {activeTab === "existing" ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Find your application</h2>

            {!existing.application ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">{existingLabel}</label>
                    <input
                      value={existing.identifier}
                      onChange={(e) => setExisting((p) => ({ ...p, identifier: e.target.value }))}
                      placeholder={existingPlaceholder}
                      className="w-full border rounded-lg px-3 py-2 text-sm h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">OTP</label>
                    <input
                      value={existing.otp}
                      onChange={(e) => setExisting((p) => ({ ...p, otp: e.target.value }))}
                      placeholder="Enter OTP"
                      className="w-full border rounded-lg px-3 py-2 text-sm h-[42px]"
                      disabled={!existing.otpSent}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={sendExistingOtp}
                    disabled={existing.sending}
                    className="px-6 py-2 rounded-xl shadow text-white disabled:opacity-50"
                    style={{ backgroundColor: "#f57200" }}
                  >
                    {existing.sending ? "Sending..." : existing.otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={verifyExistingOtp}
                    disabled={!existing.otpSent || existing.verifying}
                    className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 disabled:opacity-50"
                  >
                    {existing.verifying ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={resetExisting}
                    className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm text-gray-600">Application details</p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{existing.application.fullName || "—"}</h3>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-gray-800">
                    <div><span className="font-medium">Email:</span> {existing.application.email || "—"}</div>
                    <div><span className="font-medium">Mobile:</span> {existing.application.phone || "—"}</div>
                    <div><span className="font-medium">City:</span> {existing.application.city || "—"}</div>
                    <div><span className="font-medium">State:</span> {existing.application.state || "—"}</div>
                    <div><span className="font-medium">Qualification:</span> {existing.application.qualification || "—"}</div>
                    <div><span className="font-medium">Experience:</span> {existing.application.experienceLevel || "—"}</div>
                    <div><span className="font-medium">Current salary:</span> {existing.application.currentSalary || "—"}</div>
                    <div><span className="font-medium">Expected salary:</span> {existing.application.expectedSalary || "—"}</div>
                    <div className="sm:col-span-2"><span className="font-medium">Subjects:</span> {existing.application.subjects || "—"}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetExisting}
                  className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                >
                  Search another
                </button>
              </div>
            )}
          </div>
        ) : null}

        {submitted ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-200 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Your application has been submitted</h2>
            <p className="mt-3 text-gray-600">
              Thanks for applying. Our team will review your application and contact you if you’re shortlisted.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 rounded-xl shadow-lg text-white hover:scale-105 transition-transform"
                style={{ backgroundColor: "#f57200" }}
              >
                Submit another application
              </button>
            </div>
          </div>
        ) : activeTab === "new" ? (
          <form
            ref={formShellRef}
            onSubmit={(e) => {
              // Prevent accidental submits from intermediate steps.
              if (currentStep !== STEPS.length - 1) {
                e.preventDefault();
                return;
              }
              handleSubmit(e);
            }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 space-y-3 border border-gray-200"
          >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    // allow navigating backwards only
                    if (idx <= currentStep) setCurrentStep(idx);
                  }}
                  className={`rounded-full px-3 py-1 border transition ${
                    idx === currentStep
                      ? "bg-gray-900 text-white border-gray-900"
                      : idx < currentStep
                        ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                  disabled={idx > currentStep}
                >
                  {idx + 1}. {s.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-600">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>

          {currentStep === 0 && (
          <Section color="bg-gradient-to-r from-blue-50 to-white/80">
            <h3 className="text-2xl font-semibold border-b pb-2 text-center">
              <span style={{ color: "orange" }}>Personal</span>{" "}
              <span style={{ color: "black" }}>Information</span>
            </h3>

            <span className="absolute -top-3 right-6 bg-white px-2 text-sm text-gray-600">
              Date: {formData.applicationDate}
            </span>

            <div className="grid md:grid-cols-2 gap-4">
              <Input name="fullName" label="Full Name" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} required error={errors.fullName} />
              <Input name="dob" label="DOB" placeholder="30/04/2000" type="date" value={formData.dob} onChange={handleChange} required error={errors.dob} />
              <Input name="phone" label="Phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} required error={errors.phone} />
              <Input name="email" label="Email" placeholder="Enter your email " type="email" value={formData.email} onChange={handleChange} error={errors.email} />
              <CityInput {...{ formData, setFormData, statesCities, cityQuery, setCityQuery, filteredCities, setFilteredCities, showCityDropdown, setShowCityDropdown }} error={errors.city} />
              <Input name="state" label="State" placeholder="Enter your state" value={formData.state} onChange={handleChange} required error={errors.state} />
              <SelectInput name="gender" label="Gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} required error={errors.gender} />
              <SelectInput name="maritalStatus" label="Marital Status" value={formData.maritalStatus} onChange={handleChange} options={["Single", "Married"]} required error={errors.maritalStatus} />
            </div>
          </Section>
          )}

          {currentStep === 1 && (
          <Section color="bg-gradient-to-r from-blue-50 to-white/80">

            <h3 className="text-2xl font-semibold border-b pb-2 text-center">
              <span className="text-black">Portfolio &</span>{" "}
              <span className="text-orange-500">Experience</span>
            </h3>

            {/* Qualification + Experience */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Input
                name="qualification"
                label="Qualification"
                placeholder="Your highest qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                error={errors.qualification}
              />

              <SelectInput
                name="experienceLevel"
                label="Experience"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
                error={errors.experienceLevel}
                options={["0-1", "1-3", "3-5", "5+"]}
              />
            </div>

            {/* Subjects + Role */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <Input
                name="subjects"
                label="Subjects You Can Teach"
                placeholder="e.g. Math, Physics"
                value={formData.subjects}
                onChange={handleChange}
                required={roleType === "NON_TECH"}
                error={errors.subjects}
              />

              <div>
                <label className="block font-medium mb-2 mt-[-5px]">
                  Select Role <span className="text-red-500">*</span>
                </label>

                {/* Role Type */}
                <div className="relative">
                  <select
                    value={roleType}
                    onChange={handleRoleTypeChange}
                    className={`w-full border rounded-xl px-4 py-2 text-sm
        transition-all focus:ring-2 focus:ring-orange-400
        ${errors.roleType ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Choose Role Type</option>
                    <option value="NON_TECH">Teaching</option>
                    <option value="TECH">Non-Teaching</option>
                  </select>

                  {errors.roleType && (
                    <p className="text-red-500 text-sm mt-1">{errors.roleType}</p>
                  )}
                </div>

                {/* Animated Role Selector */}
                {roleType && (
                  <div className="mt-3 animate-slideDown">
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={handleSelectedRoleChange}
                        required
                        className={`w-full border rounded-xl px-4 py-2 text-sm
            transition-all focus:ring-2 focus:ring-orange-400
            ${errors.role ? "border-red-500" : "border-orange-400 shadow-md"}`}
                      >
                        <option value="">Choose Your Role</option>
                        {visibleRoles.map((role) => (
                          <option key={role.id} value={role.applyingFor}>
                            {role.applyingFor}
                          </option>
                        ))}

                      </select>

                      {/* Reset */}
                      <button
                        type="button"
                        onClick={() => {
                          setRoleType("");
                          setSelectedRole("");
                        }}
                        className="px-4 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
                        title="Change role type"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>

            </div>

            {/* Current + Expected Salary */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <SalaryField
                label="Current Salary"
                name="currentSalary"
                required
                value={formData.currentSalary}
                error={errors.currentSalary}
                options={SALARY_OPTIONS}
                choice={salaryChoice.current}
                setChoice={(v) => setSalaryChoice((p) => ({ ...p, current: v }))}
                customValue={customSalary.current}
                setCustomValue={(v) => setCustomSalary((p) => ({ ...p, current: v }))}
                setFormValue={(v) => setFormData((p) => ({ ...p, currentSalary: v }))}
              />

              <SalaryField
                label="Expected Salary"
                name="expectedSalary"
                required
                value={formData.expectedSalary}
                error={errors.expectedSalary}
                options={SALARY_OPTIONS}
                choice={salaryChoice.expected}
                setChoice={(v) => setSalaryChoice((p) => ({ ...p, expected: v }))}
                customValue={customSalary.expected}
                setCustomValue={(v) => setCustomSalary((p) => ({ ...p, expected: v }))}
                setFormValue={(v) => setFormData((p) => ({ ...p, expectedSalary: v }))}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Upload Resume <span className="text-gray-500 text-sm"> (Optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  name="resume"
                  onChange={handleChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click?.()}
                  className={`h-[42px] whitespace-nowrap rounded-lg px-4 text-sm font-medium text-white transition ${
                    errors.resume ? "bg-red-600" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  Choose file
                </button>
                {formData.resume ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (fileRef.current) fileRef.current.value = "";
                      setFormData((p) => ({ ...p, resume: null }));
                    }}
                    className="h-[42px] whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 hover:bg-gray-50"
                    title="Remove selected file"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              {formData.resume?.name ? (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium text-gray-900">{formData.resume.name}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No file selected</p>
              )}
              {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">Video Profile Link (YouTube / Instagram / Other) - Optional</label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="Paste Video URL"
                className="w-full border rounded-lg px-3 py-2 text-sm h-[42px]"
              />
            </div>

          </Section>
          )}

          {currentStep === 2 && (
          <Section title="Intro Video" color="bg-gradient-to-r from-blue-50 to-white/80">
            <VideoSection {...{ openRecordModal, formData, errors, showVideoInForm, setShowVideoInForm, videoURL, handleRerecord, handleRemoveVideo, selectedRole, selectedRoleDesc }} />
          </Section>
          )}

          <div className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-white/95 backdrop-blur border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goBack();
              }}
              disabled={currentStep === 0 || loading}
              className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  goNext();
                }}
                disabled={loading}
                className="px-10 py-3 rounded-xl shadow-lg text-white hover:scale-105 transition-transform disabled:opacity-50"
                style={{ backgroundColor: "#f57200" }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  // Ensure required fields are satisfied before submit.
                  if (!validateForm()) {
                    // If only the intro video is missing, keep user on the video step.
                    if (!formData.introVideo) {
                      setCurrentStep(2);
                      setTimeout(() => {
                        scrollFormIntoView();
                      }, 0);
                      return;
                    }
                    const step0Ok = validateStep(0);
                    if (!step0Ok) setCurrentStep(0);
                    else setCurrentStep(1);
                    setTimeout(() => {
                      scrollFormIntoView();
                      focusFirstFieldInForm();
                    }, 0);
                    return;
                  }
                  handleSubmit(e);
                }}
                className="bg-gradient-to-r to-indigo-700 text-white px-10 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                style={{ backgroundColor: "#f57200" }}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
          </form>
        ) : null}
      </div>

      {openVideoModal && <VideoModal {...{ videoRef, canvasRef, videoURL, recording, formatTime, seconds, webcamEnabled, toggleWebcam, startCapture, stopRecording, setOpenVideoModal, handleRerecord }} />}
    </>
  );
};


const Section = ({ title, children, color }) => (
  <section
    className={`${color} relative rounded-xl px-5 md:px-6 pt-3 md:pt-4 pb-5 md:pb-6 shadow-md border border-gray-200 space-y-5`}
  >
    {title ? (
      <h3 className="text-2xl font-semibold border-b pb-2 text-center">{title}</h3>
    ) : null}
    {children}
  </section>
);



const Input = ({ name, label, value, onChange, type = "text", placeholder, required = false, error }) => (
  <div>
    <label className="block font-medium mb-1">
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border rounded-lg px-3 py-1.5 text-sm"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SelectInput = ({ name, label, value, onChange, options = [], required = false, error }) => (
  <div>
    <label className="block font-medium mb-1">
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded-lg px-3 py-1.5 text-sm"
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SalaryField = ({
  label,
  required,
  value,
  error,
  options,
  choice,
  setChoice,
  customValue,
  setCustomValue,
  setFormValue,
}) => {
  const isCustom = choice === "Custom LPA";

  return (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        className={`w-full border rounded-lg px-3 py-1.5 text-sm h-[42px] ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={choice}
        onChange={(e) => {
          const next = e.target.value;
          setChoice(next);
          if (next === "Custom LPA") {
            setCustomValue("");
            setFormValue("");
          } else {
            setCustomValue("");
            setFormValue(next);
          }
        }}
      >
        <option value="">Select salary</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {isCustom ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => {
              const clean = e.target.value.replace(/[^0-9.]/g, "");
              setCustomValue(clean);
              setFormValue(clean ? `${clean} LPA` : "");
            }}
            placeholder="Enter LPA (e.g. 5.5)"
            className={`w-full border rounded-lg px-3 py-1.5 text-sm h-[42px] ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            className="px-3 bg-gray-200 rounded h-[42px]"
            onClick={() => {
              setChoice("");
              setCustomValue("");
              setFormValue("");
            }}
            title="Clear"
          >
            ✕
          </button>
        </div>
      ) : null}

      {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
      {/* Keep this so value is tracked by existing validators */}
      <input type="hidden" value={value || ""} readOnly />
    </div>
  );
};


const Error = ({ msg }) => <p className="text-red-500 text-sm mt-1">{msg}</p>;
const CityInput = ({
  formData,
  setFormData,
  statesCities,
  cityQuery,
  setCityQuery,
  filteredCities,
  setFilteredCities,
  showCityDropdown,
  setShowCityDropdown,
  error
}) => (
  <div className="relative">
    <label className="block font-medium mb-1">
      City <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      name="city"
      value={formData.city}
      placeholder="Type to search city"
      onChange={(e) => {
        const val = e.target.value;
        setFormData((prev) => ({ ...prev, city: val }));
        setCityQuery(val);
        if (val.length) {
          const filtered = statesCities
            .map((s) => ({
              state: s.state,
              cities: s.cities.filter((c) =>
                c.toLowerCase().includes(val.toLowerCase())
              ),
            }))
            .filter((s) => s.cities.length);
          setFilteredCities(filtered);
          setShowCityDropdown(true);
        } else {
          setShowCityDropdown(false);
        }
      }}
      onFocus={() => cityQuery && setShowCityDropdown(true)}
      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
      className={`w-full border rounded-lg px-3 py-1.5 text-sm ${error ? "border-red-500" : ""
        }`}
    />

    {showCityDropdown && filteredCities.length > 0 && (
      <ul className="absolute z-50 w-full max-h-40 overflow-auto border bg-white rounded-lg mt-1 shadow-lg">
        {filteredCities.map((s, idx) => (
          <li key={idx}>
            <div className="font-semibold px-2 py-1 bg-gray-100 border-b">
              {s.state}
            </div>
            {s.cities.map((c, i) => (
              <div
                key={i}
                className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    city: c,
                    state: s.state   // auto-fill state here
                  }));
                  setCityQuery(c);
                  setShowCityDropdown(false);
                }}
              >
                {c}
              </div>

            ))}
          </li>
        ))}
      </ul>
    )}

    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);


const VideoSection = ({ openRecordModal, formData, errors, showVideoInForm, setShowVideoInForm, videoURL, handleRerecord, handleRemoveVideo, selectedRole, selectedRoleDesc }) => (
  <div className="bg-gray-50 rounded-2xl px-6 py-6 space-y-4 shadow-md border border-gray-200">
    <div className="flex justify-between items-start gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Record your intro video
          <span className="text-red-500">*</span>
        </h3>
        <button type="button" onClick={openRecordModal} className="inline-flex items-center gap-2 text-gray-800 px-3 py-1 text-sm font-medium rounded hover:opacity-90 transition" style={{ backgroundColor: "#cc8e51b2" }}><span className="font-bold">+</span> Record video</button>
        {errors?.introVideo ? <p className="text-red-600 text-sm mt-2">{errors.introVideo}</p> : null}
        {formData.introVideo && <div className="flex gap-2 mt-2 flex-wrap">
          <button type="button" onClick={() => setShowVideoInForm(true)} className="bg-white border px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition">View</button>
          <button type="button" onClick={handleRerecord} className="bg-black text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition">Re-record</button>
          <button type="button" onClick={handleRemoveVideo} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition">Remove</button>
        </div>}
      </div>
      <div className="text-sm text-gray-700 mt-1 space-y-1">
        {selectedRole && <div className="mt-4 p-4 border rounded-lg bg-gray-50 text-gray-800"><p>{selectedRoleDesc}</p></div>}
      </div>
    </div>
    {showVideoInForm && videoURL && <video src={videoURL} controls className="rounded-lg w-full max-h-64 mt-2 shadow-lg" />}
  </div>
);

const VideoModal = ({ videoRef, canvasRef, videoURL, recording, formatTime, seconds, webcamEnabled, toggleWebcam, startCapture, stopRecording, setOpenVideoModal, handleRerecord }) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl w-[95vw] max-w-3xl max-h-[85vh] overflow-auto p-4 sm:p-6 relative">
      <button onClick={() => setOpenVideoModal(false)} className="absolute top-3 right-3" type="button">✕</button>
      <h2 className="text-xl font-bold mb-4">Record Intro Video</h2>
      {/* Canvas no longer needed (camera-only recording). Kept to avoid ref churn. */}
      <canvas ref={canvasRef} width="1480" height="800" className="hidden" />
      {!videoURL ? <>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full border rounded shadow bg-black mb-4 h-[45vh] sm:h-[420px] max-h-[55vh]"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <button type="button" onClick={toggleWebcam} className={`px-4 py-2 rounded text-white ${webcamEnabled ? "bg-green-600" : "bg-gray-500"}`}>{webcamEnabled ? "Camera Enabled" : "Enable Camera"}</button>
          {!recording && <button type="button" onClick={startCapture} disabled={!webcamEnabled} className={`px-4 py-2 rounded text-white ${webcamEnabled ? "bg-blue-600" : "bg-blue-300 cursor-not-allowed"}`}>Start Recording</button>}
          {recording && (
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="text-red-600 font-semibold">REC</span>
              <span className="font-bold text-gray-800">{formatTime(seconds)}</span>
              <button type="button" onClick={stopRecording} className="bg-red-600 text-white px-4 py-2 rounded">Stop</button>
            </div>
          )}
        </div>
      </> : (
        <>
          <video
            src={videoURL}
            controls
            className="w-full border rounded shadow bg-black mb-4 h-[45vh] sm:h-[420px] max-h-[55vh]"
          />
          <div className="flex flex-wrap gap-3 items-center justify-end">
            <button type="button" onClick={handleRerecord} className="rounded-lg bg-gray-200 px-6 py-2">
              Re-record
            </button>
            <button type="button" onClick={() => setOpenVideoModal(false)} className="rounded-lg bg-black px-6 py-2 text-white">
              Done
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

export default Career;

