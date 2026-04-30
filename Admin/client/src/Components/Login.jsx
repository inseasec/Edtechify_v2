import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '@/utils/auth';
import { getPathForRole } from '@/utils/dashboardPaths';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import bgImage from '../assets/pexels-fauxels-3184460-1.jpg';
import LoadingSpinner from '@/utils/LoadingSpinner';
import {
  STATIC_DEMO_JWT,
  isStaticDemoEmail,
  isStaticDemoLogin,
} from '@/utils/staticDemoLogin';

export default function Login() {
  const [admin, setAdmin] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isOtp, setIsOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  const baseUrl = window._CONFIG_.VITE_API_BASE_URL?.replace(/\/$/, '');

  useEffect(() => {
    const role = getUserRole();
    if (role) {
      navigate(getPathForRole(role), { replace: true });
    }
  }, [navigate]);

  const validateForm = (email, password) => {
    let tempErrors = {};
    let valid = true;

    if (!email) {
      tempErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email format';
      valid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(tempErrors);
    setIsValid(valid);
    return valid;
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
    validateForm(name === 'email' ? value : admin.email, name === 'password' ? value : admin.password);
  };

  const runSuccessFlow = (userRole) => {
    Swal.fire({
      title: 'Login Successful!',
      text: 'Welcome back!',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      timer: 2000,
      width: '300px',
      padding: '1rem',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm',
      },
    });

    setTimeout(() => {
      if (!userRole) return;
      const path = getPathForRole(userRole);
      navigate(path, { replace: true });
      if (userRole === 'SUPER_ADMIN') {
        window.location.reload();
      }
    }, 1500);
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    if (isStaticDemoEmail(admin.email) && otp.trim()) {
      setLoading(true);
      try {
        localStorage.setItem('email', admin.email);
        localStorage.setItem('token', STATIC_DEMO_JWT);
        runSuccessFlow(getUserRole());
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!baseUrl) {
      await Swal.fire({
        title: 'Missing API URL',
        text: 'Set VITE_API_BASE_URL in Admin/client/.env (see .env.example).',
        icon: 'warning',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/admin/verify-otp`, {
        email: admin.email,
        otp,
      });

      const { email, token } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('token', token);

      const userRole = getUserRole();
      runSuccessFlow(userRole);
    } catch (error) {
      Swal.fire({
        title: 'OTP Verification Failed!',
        text: error.response?.data?.message || 'Invalid OTP. Please try again.',
        icon: 'error',
        width: '320px',
        timer: 2000,
        showConfirmButton: false,
        backdrop: true,
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-lg p-5 shadow-md',
          title: 'text-lg font-bold text-red-600',
          htmlContainer: 'text-sm text-gray-700',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const ok = validateForm(admin.email, admin.password);
    if (!ok) return;

    if (isStaticDemoLogin(admin.email, admin.password)) {
      setLoading(true);
      try {
        localStorage.setItem('email', admin.email.trim().toLowerCase());
        localStorage.setItem('token', STATIC_DEMO_JWT);
        const userRole = getUserRole();
        runSuccessFlow(userRole);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!baseUrl) {
      await Swal.fire({
        title: 'Missing API URL',
        text: 'Set VITE_API_BASE_URL in Admin/client/.env (see .env.example).',
        icon: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/admin/login`, admin);
      const { email, token } = response.data;

      if (token) {
        localStorage.setItem('email', email);
        localStorage.setItem('token', token);
        const userRole = getUserRole();
        runSuccessFlow(userRole);
      } else {
        setIsOtp(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid Password. Please try again.';
      Swal.fire({
        title: 'Login Failed!',
        text: errorMessage,
        icon: 'error',
        width: '320px',
        timer: 2000,
        showConfirmButton: false,
        backdrop: true,
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-lg p-5 shadow-md',
          title: 'text-lg font-bold text-red-600',
          htmlContainer: 'text-sm text-gray-700',
        },
      });

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${bgImage})` }}
      className="flex justify-end inset-0 bg-cover bg-center min-h-screen relative"
    >
      {loading && <LoadingSpinner />}

      <div className="bg-black absolute opacity-20 h-screen w-full" />

      <div className="md:mr-36 pt-72 md:pt-40 flex-col w-[400px] md:w-[500px] z-10 relative">
        <div className="flex-col justify-center items-center">
          <p className="text-center text-white relative capitalize font-semibold text-2xl md:text-4xl">
            Welcome to the Rankwell’s
          </p>
          <p className="text-center text-white relative capitalize font-semibold text-2xl md:text-4xl">
            Admin Panel
          </p>
        </div>

        <div
          style={{ boxShadow: '0px 5px 5px 5px rgba(0.5, 0.5, 0.5, 0.5)' }}
          className="w-[80%] py-5 mt-5 ml-3 md:ml-16 shadow-2xl bg-white rounded-lg transition-transform transform hover:scale-105"
        >
          <p className="text-center font-bold text-xl text-black py-2">
            {isOtp ? 'Enter OTP' : 'Admin Login'}
          </p>
          <div className="">
            {isOtp ? (
              <form onSubmit={onSubmitOtp} className="w-[79%] mx-auto py-2 space-y-4">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full border-2 border-black outline-none p-[6px] rounded-md bg-white focus:border-blue-600 transition-all duration-300"
                />
                <div className="flex mt-4 justify-center item-center">
                  <button
                    type="submit"
                    className="w-[50%] text-white font-semibold rounded-full px-4 py-2 bg-gray-800 hover:bg-black transition-colors duration-300"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={onSubmitHandler} className="w-[79%] mx-auto mt-2 space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={admin.email}
                    onChange={onChangeHandler}
                    required
                    className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-black-700'} outline-none p-[6px] rounded-md bg-white focus:border-blue-600 transition-all duration-300`}
                  />
                  {errors.email && <p className="text-red-500 text-[12px]">{errors.email}</p>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={admin.password}
                    onChange={onChangeHandler}
                    required
                    className={`w-full border-2 ${errors.password ? 'border-red-500' : 'border-black-700'} outline-none p-[6px] rounded-md bg-white focus:border-blue-600 transition-all duration-300`}
                  />
                  <span
                    className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    onKeyDown={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
                    role="button"
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 mb-3 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 mb-1 text-gray-500" />
                    )}
                  </span>
                  {errors.password && <p className="text-red-500 text-[12px]">{errors.password}</p>}
                </div>
                <div className="flex justify-end -mt-1 mb-1">
                  <Link className="text-sm text-blue-600 hover:underline" to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
                {errors.general && <p className="text-red-500 text-center text-sm">{errors.general}</p>}
                <div className="text-center pb-3 md:pb-5">
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`w-[50%] text-white font-semibold rounded-full px-4 py-2 transition-colors duration-300 ${isValid ? 'bg-gray-800 hover:bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
