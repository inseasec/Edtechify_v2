import React, { useState } from "react";
import { decodeToken } from "../authConfig";
import api from "../api";
import toast from "react-hot-toast";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

function ChangePassword() {
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const user_ID = decodeToken();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      return "Password must include uppercase, lowercase, numbers, and special characters.";
    }
    return null;
  };

  const updatePassword = async () => {
    if (user_ID == null) {
      showErrorToast("Please sign in again.");
      return;
    }
    try {
      const res = await api.put(`/users/updatePassword/${user_ID}`, password);
      const msg = typeof res.data === "string" ? res.data : res.data?.message;

      if (msg === "Current password is incorrect") {
        showErrorToast(msg);
        return;
      }
      if (msg && msg !== "Password Updated Successfully" && String(msg).toLowerCase().includes("incorrect")) {
        showErrorToast(msg);
        return;
      }

      showSuccessToast("Password updated successfully");
      setTimeout(() => {
        localStorage.removeItem("authToken");
        toast.dismiss();
        window.location.href = "/signin";
      }, 2000);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : null) ||
        error?.message ||
        "Something went wrong";
      showErrorToast(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password.oldPassword || !password.newPassword || !confirmPassword) {
      showErrorToast("All fields are required.");
      return;
    }

    if (password.newPassword !== confirmPassword) {
      showErrorToast("New passwords do not match.");
      return;
    }

    const passwordError = validatePassword(password.newPassword);
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    updatePassword();
  };

  const handlePassword = (e) => {
    setPassword((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (user_ID == null) {
    return <p className="text-slate-600">Please sign in to change your password.</p>;
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-slate-500">Change Password</h2>
      <form
        className="mt-4 flex flex-col space-y-10 bg-slate-100 p-8 rounded-tr-3xl rounded-br-3xl text-sm rounded-bl-3xl"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <input
            name="oldPassword"
            value={password.oldPassword}
            onChange={handlePassword}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="p-3 border border-gray-300 focus:outline-none rounded-md focus:ring-2 focus:ring-orange-400 w-full"
            placeholder="OLD PASSWORD"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 bg-transparent border-0 p-0"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
          </button>
        </div>
        <div className="relative">
          <input
            name="newPassword"
            value={password.newPassword}
            onChange={handlePassword}
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            className="p-3 border border-gray-300 focus:outline-none rounded-md focus:ring-2 focus:ring-orange-400 w-full"
            placeholder="NEW PASSWORD"
          />
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 bg-transparent border-0 p-0"
            aria-label={showPasswords ? "Hide password" : "Show password"}
          >
            <i className={showPasswords ? "ri-eye-off-line" : "ri-eye-line"} />
          </button>
        </div>
        <input
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          className="p-3 border border-gray-300 focus:outline-none rounded-md focus:ring-2 focus:ring-orange-400 w-full"
          placeholder="CONFIRM PASSWORD"
        />
        <button type="submit" className="bg-black text-white rounded-full w-40 px-8 py-2">
          Update Now
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
