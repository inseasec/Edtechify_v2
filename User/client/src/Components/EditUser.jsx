import React, { useState, useEffect } from "react";
import api from "../api";
import { decodeToken } from "../authConfig";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

export default function EditUser({ isOpen, isClose, refreshUser }) {
  const userId = decodeToken();
  const [form, setForm] = useState({ userName: "", email: "", mobileNo: "" });

  useEffect(() => {
    if (!isOpen || !userId) return;
    (async () => {
      try {
        const { data } = await api.get(`/users/getUser/${userId}`);
        setForm({
          userName: data.userName ?? "",
          email: data.email ?? "",
          mobileNo: data.mobileNo ?? "",
        });
      } catch (e) {
        showErrorToast(e?.response?.data?.message || "Could not load profile");
      }
    })();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") return; // email is not editable
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await api.put(`/users/updateUserInfo/${userId}`, {
        userName: form.userName,
        mobileNo: form.mobileNo || undefined,
      });
      showSuccessToast("Profile updated");
      await refreshUser?.();
      isClose?.();
    } catch (err) {
      showErrorToast(err?.response?.data || err?.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Name</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              readOnly
              aria-readonly="true"
              title="Email cannot be changed"
              className="mt-1 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Mobile</label>
            <input
              name="mobileNo"
              value={form.mobileNo}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => isClose?.()}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm text-white">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
