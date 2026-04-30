import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { decodeToken } from "../authConfig"

export default function ConfirmPaymentPage() {
  const navigate = useNavigate();
  const baseUrl = window._CONFIG_.VITE_API_BASE_URL;

  // Static demo data (replace with API later)
  const course = useMemo(
    () => ({
      id: 1,
      courseName: "Web Development Bootcamp",
      courseType: "Complete Course",
      deptName: "Computer Science",
      duration: "12h 30m",
      price: 10,
    }),
    [],
  );

  const [billingData, setBillingData] = useState({
    name: "Demo User",
    email: "demo@example.com",
    mobileNo: "9999999999",
    address: "Sonipat, Haryana",
    gst: "GST12345",
  });

  const [config, setConfig] = useState({});
  const [discount, setDiscount] = useState(2);
  const [taxRate, setTaxRate] = useState(4);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchConfig();
    paymentInfo();
  }, []);

  const paymentInfo = async () => {
    try {
      const response = await api.get("/invoice/getInvoiceSettings");
      const d = response.data || {};
      if (typeof d.invoice_discount === "number") setDiscount(d.invoice_discount);
      if (typeof d.invoice_tax_rate === "number") setTaxRate(d.invoice_tax_rate);
    } catch (error) {
      // keep static fallback
      console.error("Error fetching invoice settings:", error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get(`/paymentConfig/getConfigDetails`);
      setConfig(res.data || {});
      setMsg("");
    } catch (error) {
      console.error("Error fetching payment config:", error);
      setMsg("Razorpay configuration not found.");
    }
  };

  

  const calculateTotals = () => {
    const total = Number(course.price);
    const taxAmount = (total * taxRate) / 100;
    const subtotal = Math.floor(total + taxAmount);

    return {
      total,
      taxAmount,
      subtotal,
      discount: Math.floor(discount),
      amount: subtotal - discount
    };
  };

  const totals = calculateTotals();
  const userId = decodeToken(); // static userId for demo; backend may ignore/override with token
  const createOrder = async (amount, courseId) => {
    const paymentInfoPayload = {
      amountStr: amount,
      userId,
      courseId: [courseId],
    };
    try {
      const res = await api.post("/payment/createOrder", paymentInfoPayload);
      if (res.status === 200) {
        openRazorpayCheckout(res.data);
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      showErrorToast("Order creation failed");
    }

  };
  const openRazorpayCheckout = (order) => {
    if (!window?.Razorpay) {
      showErrorToast("Razorpay script not loaded. Refresh the page.");
      return;
    }

    const key = config?.razorpayKey;
    if (!key) {
      showErrorToast("Razorpay key missing in config.");
      return;
    }

    const options = {
      key,
      amount: Math.max(0, Number(totals.amount) || 0) * 100, // paise
      currency: "INR",
      name: "Rankwell",
      description: "Course Purchase",
      image: "/logo.png",
      order_id: order?.id,
      handler: function (response) {
        axios
          .post(`${baseUrl}/payment/verifyPayment`, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
          .then(() => {
            showSuccessToast("Payment Success!");
            navigate("/account/invoices");
          })
          .catch(() => {
            showErrorToast("Payment Verification Failed");
          });
      },
      theme: { color: "#f03106" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="w-full min-h-[560px] bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 sm:p-6 lg:p-8 rounded-2xl">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl p-7">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span>Billing Information</span>
          </h3>

          <div className="space-y-3 w-full">
            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <input
                value={billingData.name}
                onChange={(e) => setBillingData({ ...billingData, name: e.target.value })}
                className="bg-gray-100 w-full rounded-xl px-4 py-3 font-medium text-gray-800 shadow-inner"
              />
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
              <input
                value={billingData.mobileNo}
                onChange={(e) => setBillingData({ ...billingData, mobileNo: e.target.value })}
                className="bg-gray-100 w-full rounded-xl px-4 py-3 font-medium text-gray-800 shadow-inner"
              />
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">Email Address</p>
              <input
                value={billingData.email}
                onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                className="bg-gray-100 w-full rounded-xl px-4 py-3 font-medium text-gray-800 shadow-inner"
              />
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <input
                value={billingData.address}
                onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                className="bg-gray-100 w-full rounded-xl px-4 py-3 font-medium text-gray-800 shadow-inner"
              />
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">GST No.</p>
              <input
                value={billingData.gst}
                onChange={(e) => setBillingData({ ...billingData, gst: e.target.value })}
                className="bg-gray-100 w-full rounded-xl px-4 py-3 font-medium text-gray-800 shadow-inner"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs text-gray-500">
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">Secure</span>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">Encrypted</span>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full">Trusted</span>
          </div>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl border border-gray-200 p-7 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 opacity-20 rounded-full blur-3xl"></div>

          <div className="flex gap-4 items-center pb-5 border-b">
            <div className="w-20 h-20 rounded-xl bg-slate-200 shadow-md flex items-center justify-center">
              <i className="ri-book-2-line text-3xl text-slate-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 leading-snug truncate">
                {course.courseName}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {course.courseType === "Complete Course" ? "📚" : "📝"} {course.courseType}
              </p>
              <p className="text-xs text-gray-400">• {course.deptName}</p>
              <p className="text-xs text-gray-500 mt-1">⏱ {course.duration}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">₹{totals.total}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>GST</span>
              <span>({taxRate}%)</span>
            </div>

            <div className="flex justify-between pt-3 border-t text-base font-semibold">
              <span>Total (Including GST)</span>
              <span>₹{totals.subtotal}</span>
            </div>

            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>

            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Amount</span>
              <span className="text-2xl font-bold text-orange-600">₹{totals.amount}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-5 leading-relaxed">
            Static course data + real Razorpay flow (config/order/verify).
          </p>

          <button
            type="button"
            onClick={() => createOrder(totals.amount, course.id)}
            disabled={totals.amount <= 0}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            Pay ₹{totals.amount}
          </button>

          <div className="text-center mt-6 text-xs text-gray-500">30-Day Money-Back Guarantee</div>
        </div>
      </div>

      {msg && (
        <div className="mt-6 flex justify-center">
          <div className="bg-red-100 text-red-600 px-5 py-3 rounded-xl shadow-md text-sm">
            ⚠ {msg}
          </div>
        </div>
      )}
    </div>
  );
}

