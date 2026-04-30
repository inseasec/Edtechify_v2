import React, { useState, useEffect } from "react";
import api from "../api";
import { decodeToken } from "../authConfig";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

export default function EditInfo({ onClose, initialData }) {
  const userId = decodeToken();
  const [form, setForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    timeZone: "",
  });

  useEffect(() => {
    if (!initialData) return;
    setForm({
      streetAddress: initialData.streetAddress ?? "",
      city: initialData.city ?? "",
      state: initialData.state ?? "",
      postalCode: initialData.postalCode ?? "",
      country: initialData.country ?? "",
      timeZone: initialData.timeZone ?? "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await api.put(`/users/updateUserAddress/${userId}`, {
        streetAddress: form.streetAddress,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        timeZone: form.timeZone,
      });
      showSuccessToast("Address saved");
      onClose?.();
    } catch (err) {
      showErrorToast(err?.response?.data || err?.message || "Could not save address");
    }
  };

  return (
    <div className="rounded-2xl bg-slate-100 p-6 shadow-inner">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Edit address</h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-600">Street</label>
          <input
            name="streetAddress"
            value={form.streetAddress}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Postal code</label>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Country</label>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Time zone</label>
          <input
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange}
            placeholder="e.g. Asia/Kolkata"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={() => onClose?.()}
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
  );
}
