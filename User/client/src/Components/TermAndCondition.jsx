import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TermAndCondition() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const userBaseUrl =  window._CONFIG_.VITE_API_BASE_URL;
  const adminBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;
  const baseUrl = adminBaseUrl || userBaseUrl;

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${baseUrl}/organizations/details`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled) setData(res.data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load terms.");
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  const terms = data?.orgHome?.termsAndConditions || "";

  return (
    <div className="w-full max-w-none">
      <h2 className="text-3xl font-bold text-slate-500">Terms and Conditions</h2>
      <div className="mt-4 bg-slate-100 p-8 rounded-tr-3xl rounded-br-3xl text-sm rounded-bl-3xl text-slate-700 whitespace-pre-wrap">
        {error && <p className="text-red-600">{error}</p>}
        {!error && terms ? <p>{terms}</p> : !error && <p>No terms available.</p>}
      </div>
    </div>
  );
}
