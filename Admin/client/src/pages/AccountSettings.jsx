import api from '@/lib/api'
import { showErrorToast, showSuccessToast } from '@/utils/toastUtils'
import { Info, Eye, EyeOff } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const PaymentAccount = () => {
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    const [showSecret, setShowSecret] = useState(false);



    // // Fetch from API on component mount
    useEffect(() => {
        fetchApiData();
    }, []);

    const fetchApiData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/paymentConfig/getConfigDetails');
            // console.log("API Response:", response.data);
            setApiSecret(response.data.razorpaySecret)
            setApiKey(response.data.razorpayKey)

        } catch (error) {
            console.error('Error Fetching from API:', error);
            if (status = 404) {
                setMsg("Alert: No Payment Configuration found!")
                // toast.error("No Payment Configuration found")
            }
        } finally {
            setLoading(false);
        }
    };
    const saveToAPI = async () => {
        setSaving(true);
        try {
            await api.post('/paymentConfig/saveOrUpdate', {
                "razorpayKey": apiKey,
                "razorpaySecret": apiSecret,
                "isActive": true
            });
            showSuccessToast("Api credentials Saved Successfully");
            setMsg(" ")
        } catch (error) {
            showErrorToast(error?.response?.data?.message || 'Error in saving Api credentials');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='h-[100vh]' style={{ margin: 'auto', padding: '20px' }}>
            <h1 className='text-center text-grey-800 bg-[whitesmoke] font-black shadow-md shadow-white text-xl p-4'>Razorpay Account Configuration</h1>
            <h2 className='text-orange-500 text-left font-bold flex p-[15px_2px]'>
                <Info className="shrink-0" size={22} /> <span className='text-white ml-[20px] font-bold bg-orange-500 p-[3px_7px] rounded-md'>
                    Note: Enter your Razorpay API Key and API Secret Key to connect your Razorpay account with the application and enable online payments.</span></h2>
            <div className='w-[100%]'>
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* API Key Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        API Key
                                        <span className="text-xs text-gray-500 ml-2">(Razorpay Key ID)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="rzp_live_xxxxxxxxxxxx"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 hover:bg-white text-gray-700"
                                        />
                                        {apiKey && (
                                            <span className="absolute right-3 top-3 text-green-500">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* API Secret Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        API Secret
                                        <span className="text-xs text-gray-500 ml-2">(Razorpay Key ID)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? "text" : "password"}
                                            value={apiSecret}
                                            onChange={(e) => setApiSecret(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 hover:bg-white text-gray-700"
                                        />
                                        {apiSecret && (
                                            <button
                                                type="button"
                                                onClick={() => setShowSecret(!showSecret)}
                                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                {apiSecret ? (
                                                    showSecret ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )
                                                ) : null}
                                            </button>

                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row justify-between  border-t pt-6">
                                <div className='pt-[5px]'>
                                    <h1 className='bg-red-500 text-white text-[14px] font-medium p-[0px_5px] rounded-md ' >{msg}</h1>
                                </div>
                                {/* <button
                                    onClick={() => {
                                        setApiKey('');
                                        setApiSecret('');
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Clear
                                </button> */}

                                <button
                                    onClick={saveToAPI}
                                    disabled={!apiKey || !apiSecret || saving}
                                    className={`
                                         w-full sm:w-auto px-8 py-3 text-sm font-bold text-white rounded-lg
                                              transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                                                ${(!apiKey || !apiSecret)
                                            ? 'bg-gray-300 cursor-not-allowed hover:scale-100'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                                        }
                                              ${saving ? 'opacity-75 cursor-wait' : ''}
                                               `}
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Configuration'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
export default PaymentAccount;
