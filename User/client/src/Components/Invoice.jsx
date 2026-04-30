import axios from 'axios';
import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

const Invoice = ({ invoice, onClose, orgData, invoiceSettings }) => {
  const token = localStorage.getItem("authToken");
  const baseUrl =  window._CONFIG_.VITE_API_BASE_URL;
  const adminApiBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;

  const timestamp = invoice.invoiceDate;

  const date = timestamp.slice(0, 10);
  const [y, m, d] = date.split('-');
  const formattedDate = `${d}/${m}/${y}`;

  const [discount, setDiscount] = useState(invoice.invoiceDiscount);
  const [taxRate, setTaxRate] = useState(invoice.invoiceTaxRate);

  const [invoiceData, setInvoiceData] = useState({
    companyName: orgData?.orgName,
    companyAddress: orgData?.orgAddress,

    billToName: invoice.payment.user.userName,
    billToPhone: invoice.payment.user.mobileNo,
    billToAddress: invoice.payment.user.streetAddress,
    billToCity: invoice.payment.user.city,
    billToPincode: invoice.payment.user.postalCode,

    invoiceGST: invoiceSettings?.invoicegst,
    invoiceId: invoice.invoiceId?.replace(/\s+/g, ""),
    invoiceDate: formattedDate,
  });

  // const getInvoiceData = async () => {
  //   try {
  //     const response = await axios.get(`${adminApiBaseUrl}/invoiceSettings/getInvoiceValues`, {
  //       headers: token ? { Authorization: `Bearer ${token}` } : {},
  //     });
  //     setInvoiceData(prev => ({
  //       ...prev,
  //       invoiceGST: response.data.invoiceGST || prev.invoiceGST,
  //     }));
  //   } catch (error) {
  //     console.error('Error Fetching from API:', error);
  //   }
  // };

  // useEffect(() => {
  //   getInvoiceData();
  // }, []);

  useEffect(() => {
    if (orgData) {
      setInvoiceData(prev => ({
        ...prev,
        companyName: orgData?.orgName,
        companyAddress: orgData?.orgAddress,
      }));
    }
  }, [orgData]);

  const calculateTotals = () => {
    const total = 10;
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
  const downloadInvoice = () => {
    const element = document.getElementById('invoice');

    if (!element) {
      console.error("Invoice element not found");
      return;
    }

    // Clone the element
    const cloneElement = element.cloneNode(true);

    // Add a style block to the clone that overrides all oklch colors
    const styleBlock = document.createElement('style');
    styleBlock.textContent = `
    * {
      color: #000000 !important;
      background-color: #ffffff !important;
      border-color: #e5e7eb !important;
    }
    .text-green-600 {
      color: #16a34a !important;
    }
    .text-red-600 {
      color: #dc2626 !important;
    }
    .bg-gray-50 {
      background-color: #f9fafb !important;
    }
    .bg-gray-100 {
      background-color: #f3f4f6 !important;
    }
    img {
      display: inline-block !important;
      max-width: 100% !important;
    }
  `;
    cloneElement.prepend(styleBlock);

    // Create temporary div
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.appendChild(cloneElement);
    document.body.appendChild(tempDiv);

    // Generate PDF
    html2pdf()
      .from(cloneElement)
      .set({
        margin: 0.5,
        filename: `invoice_${invoiceData.invoiceId || 'download'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error("PDF Error:", error);
        document.body.removeChild(tempDiv);
        alert("Error generating PDF. Please try again.");
      });
  };

  return (
    <div className="p-6 fixed top-0 left-0 h-full w-full inset-0 flex justify-center items-center bg-black bg-opacity-90 text-black">
      <div className="bg-white mt-4 h-screen overflow-y-auto py-5 w-[60%]">
        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* Top Actions */}
          <div className='relative flex mb-6'>
            <button
              onClick={downloadInvoice}
              className="px-4 py-2 bg-orange-500 text-white rounded-md"
            >
              Download Invoice
            </button>

            <button
              onClick={onClose}
              className='absolute right-0 top-0 bg-red-500 text-white p-3 rounded-full'
            >
              ✕
            </button>
          </div>

          {/* Invoice Body */}
          <div className="border rounded-lg p-6 bg-gray-50 text-black" id="invoice">

            <p className="text-2xl font-black mb-4 text-center text-black">
              Invoice
            </p>

            <hr className='py-2' />

            {/* Company Header */}
            <div className="flex relative gap-[4%] items-start mb-6">

              <div className='w-[40%] text-left'>
                <img
                  src={`${adminApiBaseUrl}/${orgData?.orgLogo}`}
                  alt="Company Logo"
                  className="w-32 h-32 object-contain mb-2"
                />
              </div>

              <div className='w-[40%]'>
                <h3 className="font-bold text-xl">{orgData?.orgName}</h3>
                <p className="text-sm text-black">{orgData?.orgAddress}</p>
              </div>

              <div className='absolute right-1 bottom-0'>
                <p className="text-sm text-black">
                  <span className='font-bold mr-1'>GST No.:</span>
                  {invoiceData?.invoiceGST}
                </p>
              </div>

            </div>

            <hr className='my-4' />

            {/* Bill To */}
            <div className="flex justify-between mb-6">

              <div className='flex gap-2'>
                <h4 className="font-semibold">Bill To:</h4>
                <div>
                  <p className="font-medium">{invoiceData.billToName}</p>
                  <p className="text-sm">{invoiceData.billToPhone}</p>
                  <p className="text-sm">{invoiceData.billToAddress}</p>
                  <p className="text-sm">
                    {invoiceData.billToCity} - {invoiceData.billToPincode}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm">
                  <span className='font-bold'>Invoice Id:</span>{" "}
                  {invoiceData.invoiceId}
                </p>
                <p className="text-sm">
                  <span className='font-bold'>Invoice Date:</span>{" "}
                  {invoiceData.invoiceDate}
                </p>
              </div>

            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-sm font-semibold text-black border">Course Name</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black border">Duration</th>
                  <th className="py-3 px-4 text-sm font-semibold text-black border">Unit price</th>
                </tr>
              </thead>

              <tbody>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 text-sm border">Item</td>
                  <td className="py-2 px-4 text-sm border">12 days</td>
                  <td className="py-2 px-4 text-sm border">₹10</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end">
              <div className="w-64 space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="font-medium">Sub Total:</span>
                  <span>₹{totals.total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">GST:</span>
                  <span className='text-green-600'>{taxRate}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Total (Including GST):</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Discount:</span>
                  <span className='text-red-600'>
                    -₹{discount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Amount:</span>
                  <span className="font-semibold">
                    ₹{totals.amount.toLocaleString()}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;