import React, { useEffect, useState } from "react";
import Invoice from "./Invoice";
import { decodeToken } from "../authConfig";
import api from "../api";
import axios from "axios";

const BillingInvoices = () => {
  const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
  const [invoices, setInvoices] = useState([]);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [orgData, setOrgData] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null);
  const user_ID = decodeToken();
  const token = localStorage.getItem("authToken");
  const adminApiBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;

  const userInfo = async () => {
    if (user_ID == null) return;
    try {
      const response = await api.get(`/invoice/getInvoiceByUserId/${user_ID}`);
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
  };

  const paymentInfo = async () => {
    try {
      const response = await api.get("/invoice/getInvoiceSettings");
      setInvoiceSettings(response.data);
    } catch (error) {
      console.error("Error fetching invoice settings:", error);
    }
  };

  useEffect(() => {
    paymentInfo();
    userInfo();
  }, [user_ID]);

  const fetchOrgData = async () => {
    try {
      const res = await axios.get(`${adminApiBaseUrl}/organizations/details`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = res.data
      setOrgData({
        orgName: data.orgName || '',
        orgAddress: data.orgAddress || '',
        orgPhone: data.orgPhone || '',
        orgEmail: data.orgEmail || '',
        orgLogo: data.orgLogo || null,
      })
    } catch (error) {
      console.error('error fetching orgdata:', error)
    }
  }

  useEffect(() => {
    fetchOrgData()
  }, [])

  const formattedDate = (datestr) => {
    if (!datestr) return "";
    const date = String(datestr).slice(0, 10);
    const [y, m, d] = date.split("-");
    if (!y || !m || !d) return datestr;
    return `${d}/${m}/${y}`;
  };

  if (user_ID == null) {
    return <p className="text-slate-600">Please sign in to view invoices.</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-2 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-2">Billing and Invoices</h2>
      {invoices.length === 0 ? (
        <p className="text-slate-600 py-8">No invoices yet.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-[#F97316] text-sm text-white">
              <th className="px-2 py-2">Invoice Id</th>
              <th className="px-2 py-2">Invoice Date</th>
              <th className="px-2 py-2">Course Name</th>
              <th className="px-2 py-2">Customer Name</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">More</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoiceId ?? invoice.id} className="border-t text-sm">
                <td className="px-4 py-3 text-center">{invoice.invoiceId?.replace(/\s+/g, "")}</td>
                <td className="px-4 py-3 text-center">{formattedDate(invoice.invoiceDate)}</td>
                <td className="px-4 py-3">
                  {Array.isArray(invoice.courses) && invoice.courses.length === 1
                    ? invoice.courses[0]?.courseName
                    : "Multiple courses"}
                </td>
                <td className="px-4 py-3">{invoice.users?.userName ?? "—"}</td>
                <td className="px-4 py-3 text-center">{invoice.payment?.status ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setInvoiceData(invoice)}
                    className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {invoiceData && (
        <Invoice
          invoice={invoiceData}
          orgData={orgData}
          invoiceSettings={invoiceSettings}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
};

export default BillingInvoices;
