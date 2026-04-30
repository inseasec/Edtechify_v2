import React, { useEffect, useState } from 'react';
import { Edit2, Save, X, Upload, Eye } from 'lucide-react';
import api from '@/lib/api';
import { showErrorToast } from '@/utils/toastUtils';

const InvoiceSettings = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [logo, setLogo] = useState(null);
    const [orgLogo, setOrgLogo] = useState("");
    const [msg, setMsg] = useState("");
    const [seriesMsg, setSeriesMsg] = useState("");
    const [isChange, setIsChange] = useState(false);
    const [discount, setDiscount] = useState(456)
    const [taxRate, setTaxRate] = useState(12)
    const [error, setError] = useState("")
    const [clicked, setClicked] = useState(false)
    // const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    const baseUrl = window._CONFIG_.VITE_API_BASE_URL;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    // Initial invoice data
    const [invoiceData, setInvoiceData] = useState({
        companyName: "rankwell",
        companyAddress: "address",
        // companyCity: "Gurgaon",
        // companyState: "HR",
        // companyPincode: "122101",

        billToName: "Ajay Kumar",
        billToPhone: "+91-9172135726",
        billToAddress: "A802, Mantri Glades",
        billToArea: "Kfc Road",
        billToCity: "Mohali",
        billToPincode: "5600035",

        // invoiceNo: "10001521485",
        invoicePrefix: "",
        invoiceSuffix: "",
        invoiceYear: " ",
        invoiceGST: "GST12345",
        invoiceDate: `${day}/${month}/${year}`,
        invoiceItems: [
            {
                id: 1,
                description: "Springboot and Microservices",
                duration: "3 Months",
                unitPrice: 200,
                // discount: 300
            },
            {
                id: 2,
                description: "Java Programming Masterclass",
                duration: "5 Months",
                unitPrice: 200,
                // discount: 323
            },
            {
                id: 3,
                description: "Machine Learning",
                duration: "7 Months",
                unitPrice: 100,
                // discount: 119
            }
        ]
    });
    const [preview, setPreview] = useState(true)
    const [editView, setEditView] = useState(false)
    // // Temporary data for editing
    const [editData, setEditData] = useState({ ...invoiceData });
    // // Fetch from API on component mount
    const fetchApiData = async () => {
        try {
            const response = await api.get('/organizations/details');
            setOrgLogo(response.data.orgLogo)
            setInvoiceData(prev => ({
                ...prev,
                companyName: response.data.orgName || prev.companyName,
                companyAddress: response.data.orgAddress || prev.companyAddress
            }));

        } catch (error) {
            console.error('Error Fetching from API:', error);
        }
    };
    const getInvoiceData = async () => {
        try {
            const response = await api.get('/invoiceSettings/getInvoiceValues');
            setDiscount(response.data.invoiceDiscount ?? 456)
            setTaxRate(response.data.invoiceTaxRate ?? 12)
            setInvoiceData(prev => ({
                ...prev,
                invoicePrefix: response.data.invoicePrefix || prev.invoicePrefix,
                invoiceSuffix: response.data.invoiceSuffix || prev.invoiceSuffix,
                invoiceYear: response.data.invoiceYear || prev.invoiceYear,
                invoiceGST: response.data.invoiceGST || prev.invoiceGST,
            }));

        } catch (error) {
            console.error('Error Fetching from API:', error);
            toast.error(error?.response?.data?.message || 'Error fetching invoice settings');
        }
    };

    // Keep editData in sync with invoiceData
    useEffect(() => {
        getInvoiceData();
        fetchApiData();
    }, []);


    const postInvoiceData = async () => {
        try {
            const response = await api.post('/invoiceSettings/setInvoiceValues', {
                invoicePrefix: editData.invoicePrefix,
                invoiceSuffix: editData.invoiceSuffix,
                invoiceYear: editData.invoiceYear,
                invoiceDiscount: discount,
                invoiceTaxRate: taxRate,
                invoiceGST: editData.invoiceGST
            });

        } catch (error) {
            console.error('Error Fetching from API:', error);
            showErrorToast(error?.response?.data?.message || 'Error saving invoice settings');
        }
    };


    const handleView = () => {
        setPreview(true)
        setError("")
        setEditView(false)
    };
    const handleEdit = () => {
        setEditView(true)
        setPreview(false)
        setEditData({ ...invoiceData })
        setIsEditing(true);
        setMsg("")
        setSeriesMsg("")
    };

    const handleSave = () => {
        if (editData.invoiceSuffix == " ") {
            setError("Serial no. is required")
            return;
        }
        setInvoiceData({ ...editData });
        postInvoiceData();
        setEditView(false)
        setPreview(true)
        setIsEditing(false);
        setMsg("")
        setIsChange(false)
        setError("")
        setSeriesMsg("")
    };

    const handleCancel = () => {
        setPreview(true)
        setEditView(false)
        setIsEditing(false);
        setMsg("")
        setError("")
        setIsChange(false)
        setSeriesMsg("")
    };


    const handleYes = async () => {
        try {
            await api.post("invoiceSettings/setUpdateNewSerialNo", { "updateSerialNo": true })
            setEditData(prev => ({
                ...prev,
                invoiceSuffix: " ",
            }))
        } catch (error) {
            console.error("updated new serial no. api failed", error)
        }
    }
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    //     Total : rs 500
    // GST(Tax rate) : 18%
    // Sub Total(Including GST) : rs 590
    // Discount : - rs 250 off
    // ---------------------
    // Payable Ammout : rs 340 /-

    // Calculate totals
    const calculateTotals = (items) => {
        const total = items.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0);
        const rate = Number(taxRate);
        const safeRate = Number.isFinite(rate) ? rate : 0;
        const taxAmount = (total * safeRate) / 100;
        const subtotal = total + taxAmount;
        const disc = Number(discount);
        const safeDiscount = Number.isFinite(disc) ? disc : 0;
        return {
            total: total,
            taxAmount: taxAmount,
            subtotal: subtotal,
            discount: safeDiscount,
            amount: subtotal - safeDiscount
        };
    };

    const totals = calculateTotals(invoiceData.invoiceItems);

    const logoSrc =
        logo || (orgLogo ? `${baseUrl}/${orgLogo}` : null) || null;
    const fmt = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString();


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header with Edit/Save Buttons */}
                <div className="flex justify-between items-center mb-6">
                    {preview && <p className="text-lg font-semibold text-gray-800 mb-4">Invoice Preview</p>}
                    {editView && <p className="text-lg font-semibold text-gray-800 mb-4">Invoice Editing</p>}
                    <div className="flex gap-2">
                        {!preview && <button
                            onClick={handleView}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                        >
                            <Eye size={18} />
                            View
                        </button>}
                        {!editView ? (
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                            >
                                <Edit2 size={18} />
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                    <Save size={18} />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Invoice Card */}
                {editView && <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8 flex gap-[4%]">
                        {/* Logo Section */}
                        <div className="w-[34%]">
                            {/* <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label> */}
                            {orgLogo ? (
                                <div className="relative w-32 h-32">
                                    {logoSrc ? (
                                        <img src={logoSrc} alt="Company Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No logo</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    {isEditing ? (
                                        <label className="cursor-pointer text-center">
                                            <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                                            <span className="text-xs text-gray-500">Upload Logo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    ) : (
                                        <span className="text-gray-400">No logo</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Company Details */}
                        <div className="mb-8 w-[40%]">
                            <p className="text-lg font-semibold text-gray-800 mb-2">Company Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                                    <p className="text-gray-500">{invoiceData.companyName}</p>
                                    {/* {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.companyName}
                                        onChange={(e) => {
                                            setEditData({
                                                ...editData,
                                                companyName: e.target.value
                                            })
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                ) : (
                                    <p className="text-gray-900">{invoiceData.companyName}</p>
                                )} */}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                                    <p className="text-gray-500">{invoiceData.companyAddress}</p>

                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-900 mb-1">GST No.</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.invoiceGST}
                                            onChange={(e) => {
                                                setEditData({
                                                    ...editData,
                                                    invoiceGST: e.target.value
                                                })
                                            }}
                                            className="w-[180px] px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm pb-1">{invoiceData.invoiceGST}</p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>
                    <hr className="my-6" />

                    {/* Bill To Details */}
                    <div className="mb-8 flex justify-between">
                        <div className='flex gap-4'>
                            <p className="text-lg font-semibold text-gray-900 mb-4">Bill To:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 ">Customer Name</label>
                                    <p className="text-gray-500">{invoiceData.billToName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Phone</label>
                                    <p className="text-gray-500">{invoiceData.billToPhone}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Address</label>
                                    <p className="text-gray-500">{invoiceData.billToAddress}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Area/Locality</label>
                                    <p className="text-gray-500">{invoiceData.billToArea}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900">City</label>
                                    <p className="text-gray-500">{invoiceData.billToCity}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 ">Pincode</label>
                                    <p className="text-gray-500">{invoiceData.billToPincode}</p>
                                </div>

                            </div>
                        </div>

                        <div className="w-[30vh]">
                            <p className="text-lg font-semibold text-gray-800 mb-2">Invoice Details</p>
                            <div className="grid grid-cols-1 ">
                                <form className='relative grid grid-cols-1 '>
                                    <div className='flex gap-2 mb-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix:</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.invoicePrefix}
                                                onChange={(e) => {
                                                    setEditData({
                                                        ...editData,
                                                        invoicePrefix: e.target.value
                                                    })
                                                }}
                                                className="w-[70px] px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        ) : (
                                            <p className="text-gray-400 text-sm pb-1">{invoiceData.invoicePrefix}</p>
                                        )}
                                    </div>
                                    <div className='flex gap-2 mb-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Year:</label>
                                        {isEditing ? (
                                            <div>
                                                <span className='mr-[5px]'>FY-</span>
                                                <input
                                                    type="text"
                                                    value={editData.invoiceYear}
                                                    onChange={(e) => {
                                                        setEditData({
                                                            ...editData,
                                                            invoiceYear: e.target.value
                                                        })
                                                        setMsg("Do you want to change the invoice Serial no.?")
                                                        setSeriesMsg("")
                                                    }}
                                                    className="w-[70px] px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                        ) : (
                                            <p className="text-gray-400 text-sm pb-1"> <span className='mr-[5px]'>FY-</span>{invoiceData.invoiceYear}</p>
                                        )}
                                    </div>
                                    {/* {msg &&
                                        <div className=" bg-[whitesmoke] p-2 rounded-md">
                                            <h1 className='text-[10px] font-medium'>{msg}</h1>
                                            <div className='flex gap-4 text-[10px] '>
                                                <button className='bg-green-500 text-white rounded-md p-1 ' onClick={() => {
                                                    setMsg("")
                                                    setSeriesMsg("You can enter a new invoice serial no..")
                                                    setIsChange(true)
                                                }}>Yes</button>
                                                <button className='bg-red-500 text-white rounded-md p-1' onClick={() => {
                                                    setMsg("")
                                                    setSeriesMsg("The Existing Invoice series will continue.")
                                                    setIsChange(false)
                                                }}>No</button>
                                            </div>
                                        </div>
                                    } */}
                                    <div className='flex gap-2 mb-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Series:</label>
                                        {isEditing && isChange ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editData.invoiceSuffix}
                                                    onChange={(e) => {
                                                        setEditData({
                                                            ...editData,
                                                            invoiceSuffix: e.target.value
                                                        })
                                                    }}
                                                    className="w-[70px] px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                                {error && <p className='text-red-500 text-[11px] font-black'>{error} </p>}
                                            </div>


                                        ) : (
                                            <div>
                                                <p className="text-gray-400 text-sm pb-1">{invoiceData.invoiceSuffix}</p>
                                            </div>


                                        )}

                                    </div>
                                    {seriesMsg &&
                                        <p className="text-red-500  text-[10px] ">{seriesMsg}</p>
                                    }


                                </form>
                                <div className='flex gap-2'>
                                    <label className="block text-sm font-medium text-gray-700">Invoice Id:</label>
                                    <p className="text-gray-400 text-sm pb-1">{[
                                        invoiceData.invoicePrefix?.trim(),
                                        invoiceData.invoiceYear?.trim(),
                                        invoiceData.invoiceSuffix?.trim()
                                    ].filter(Boolean).join("/")}</p>

                                </div>
                                <div className='flex gap-2'>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date:</label>
                                    <p className="text-gray-400 text-sm">{invoiceData.invoiceDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <hr className="my-6" /> */}
                    {/* Invoice Items Table */}
                    <div className="mt-6">
                        <table className="w-full border-collapse">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Course Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Duration</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Unit price</th>
                                    {/* <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Amount</th> */}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {invoiceData.invoiceItems.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-2 px-4 text-sm text-gray-800 border">{item.description}</td>
                                        <td className="py-2 px-4 text-sm text-gray-800 border">{item.duration}</td>
                                        <td className="py-2 px-4 text-sm text-gray-800 border">Rs. {fmt(item.unitPrice)}</td>
                                        {/* <td className="py-2 px-4 text-sm text-gray-800 border">Rs. {item.amount.toLocaleString()}</td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="mt-4 flex flex-col items-end">
                            <div className="w-64 space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between ">
                                    <span className="font-medium">Sub Total:</span>
                                    <span>₹{fmt(totals.total)}</span>
                                </div>
                                <div className="flex justify-between ">
                                    <span className="font-medium">GST:</span>
                                    {isEditing ? (
                                        <label className='text-green-500'>
                                            <input
                                                type="text"
                                                value={taxRate}
                                                onChange={(e) => {
                                                    setTaxRate(e.target.value)
                                                }}
                                                className="w-[70px] px-2 text-sm text-green-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <span className='ml-[5px]'>%</span>
                                        </label>

                                    ) : (
                                        // <p className="text-gray-400 text-sm pb-1">{totals.discount.toLocaleString()}</p>
                                        <span className='text-green-500'>{fmt(taxRate)}%</span>
                                    )}
                                </div>

                                <div className="flex justify-between ">
                                    <span className="font-medium">Total(Including GST):</span>
                                    <span> ₹{fmt(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between ">
                                    <span className="font-medium">Discount:</span>
                                    {isEditing ? (
                                        <label className='text-red-500'> <span className='mr-[5px]'>-₹</span>
                                            <input
                                                type="text"
                                                value={discount}
                                                onChange={(e) => {
                                                    setDiscount(e.target.value)
                                                }}
                                                className="w-[70px] px-2 text-sm border text-red-500 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </label>

                                    ) : (
                                        // <p className="text-gray-400 text-sm pb-1">{totals.discount.toLocaleString()}</p>
                                        <span className='text-red-500'>-₹{fmt(discount)}</span>
                                    )}
                                </div>

                                <div className="flex justify-between  border-t">
                                    <span className="font-semibold">Amount:</span>
                                    <span className="font-semibold"> ₹{fmt(totals.amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}

                {/* Preview Section */}
                {preview && <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
                    <div className="border rounded-lg p-6 bg-gray-50">
                        {/* Company Header */}
                        <div className="flex relative gap-[4%] items-start text-gray-700 mb-6">
                            {/* {orgLogo && <img src={logo ||(orgLogo ? `${baseUrl}/course-images/${orgLogo}` : '')} alt="Logo" className="h-12 mb-2" />} */}
                            <div className='w-[34%] text-left'>
                                {logoSrc ? (
                                    <img src={logoSrc} alt="Company Logo" className="w-32 h-32 object-contain mb-2" />
                                ) : null}
                            </div>
                            <div className='w-[40%]'>
                                <h3 className="font-bold text-xl">{invoiceData.companyName}</h3>
                                <p className="text-sm  text-gray-600">{invoiceData.companyAddress}</p>
                                {/* <p className="text-sm text-gray-600">
                                    {invoiceData.companyCity}, {invoiceData.companyState} {invoiceData.companyPincode}
                                </p> */}
                            </div>
                            <div className='absolute right-1 bottom-0 w-[15%}'>
                                <p className="text-sm  text-gray-600"><span className='font-bold mr-[5px]'>GST No.:</span>{invoiceData.invoiceGST}</p>
                            </div>

                        </div>
                        <hr className='my-4' />
                        {/* Bill To */}
                        <div className=" flex justify-between mb-6 text-gray-700">
                            <div className='flex gap-2'>
                                <h4 className="font-semibold mb-2">Bill To:</h4>
                                <div>
                                    <p className="font-medium">{invoiceData.billToName}</p>
                                    <p className="text-sm text-gray-600">{invoiceData.billToPhone}</p>
                                    <p className="text-sm text-gray-600">{invoiceData.billToAddress}</p>
                                    <p className="text-sm text-gray-600">{invoiceData.billToArea}</p>
                                    <p className="text-sm text-gray-600">{invoiceData.billToCity} - {invoiceData.billToPincode}</p>
                                </div>
                            </div>
                            <div className="">
                                <p className="text-sm text-gray-600"><span className='font-bold mr-[5px]'>Invoice Id:</span> {[
                                    invoiceData.invoicePrefix?.trim(),
                                    invoiceData.invoiceYear?.trim(),
                                    invoiceData.invoiceSuffix?.trim()
                                ].filter(Boolean).join("/")}</p>
                                <p className="text-sm text-gray-600"><span className='font-bold'>Invoice Date:</span> {invoiceData.invoiceDate}</p>
                            </div>
                        </div>
                        {/* Invoice Items Table */}
                        <div className="mt-6">
                            <table className="w-full border-collapse">
                                {/* Table Header */}
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Course Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Duration</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Unit price</th>
                                        {/* <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 border">Amount</th> */}
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody>
                                    {invoiceData.invoiceItems.map((item, index) => (
                                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="py-2 px-4 text-sm text-gray-800 border">{item.description}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800 border">{item.duration}</td>
                                            <td className="py-2 px-4 text-sm text-gray-800 border">Rs. {fmt(item.unitPrice)}</td>
                                            {/* <td className="py-2 px-4 text-sm text-gray-800 border">Rs. {item.amount.toLocaleString()}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals Section */}
                            <div className="mt-4 flex flex-col items-end">
                                <div className="w-64 space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between ">
                                        <span className="font-medium">Sub Total:</span>
                                        <span>₹{fmt(totals.total)}</span>
                                    </div>
                                    <div className="flex justify-between ">
                                        <span className="font-medium">GST:</span>
                                        <span className='text-green-500'>{fmt(taxRate)}%</span>
                                    </div>

                                    <div className="flex justify-between ">
                                        <span className="font-medium">Total(Including GST):</span>
                                        <span className=''>₹{fmt(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between ">
                                        <span className="font-medium">Discount:</span>
                                        <span className='text-red-500'>-₹{fmt(discount)}</span>
                                    </div>
                                    <div className="flex justify-between  border-t ">
                                        <span className="font-semibold">Amount:</span>
                                        <span className="font-semibold"> ₹{fmt(totals.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
            {msg && !clicked &&
                <div className="fixed top-0 left-0 h-full w-full inset-0  flex justify-center items-center bg-black  bg-opacity-90">
                    <div className=" bg-[whitesmoke] w-[25%] mx-auto p-4 rounded-md">
                        <h1 className='text-[15px] font-medium'>{msg}</h1>
                        <div className='flex items-center mt-3 justify-center gap-3 text-[13px] '>
                            <button className='bg-green-500 text-white rounded-md p-1 ' onClick={() => {
                                handleYes()
                                setClicked(true)
                                setMsg("")
                                setSeriesMsg("You can enter a new invoice serial no..")
                                setIsChange(true)
                            }}>Yes</button>
                            <button className='bg-red-500 text-white rounded-md p-1' onClick={() => {
                                setMsg("")
                                setClicked(true)
                                setSeriesMsg("The Existing Invoice series will continue.")
                                setIsChange(false)
                            }}>No</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default InvoiceSettings;