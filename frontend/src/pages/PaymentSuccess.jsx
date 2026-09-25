import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentDetails = location.state || {};


  const {
    doctorName,
    speciality,
    date,
    time,
    amount,
    transactionId
  } = paymentDetails;

  useEffect(() => {
    // Simple notification logic if needed or standard tracking
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans relative pt-24">
      {/* Background soft glowing elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-100/60 rounded-full blur-3xl opacity-35 pointer-events-none" />

      <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* Animated Check Icon */}
        <div className="flex flex-col tems-center text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 ring-8 ring-emerald-50/50 relative">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-slate-500 mt-2">Your appointment has been confirmed & secured.</p>
        </div>

        {/* Receipt Details card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-8 shadow-xs relative">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 select-none">Receipt Summary</p>

          <div className="space-y-4">
            {/* Doctor Info */}
            <div className="flex items-start gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{doctorName || "Doctor Specialist"}</p>
                <p className="text-xs text-slate-400 font-medium">{speciality || "Healthcare Expert"}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-slate-100">
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-450 font-semibold mb-1">
                  📅 Date
                </span>
                <p className="text-xs font-bold text-slate-700">{date || "Not set"}</p>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs text-slate-450 font-semibold mb-1">
                  ⏰ Time
                </span>
                <p className="text-xs font-bold text-slate-700">{time || "Not set"}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex justify-between items-center pt-1.5">
              <div>
                <span className="text-xs text-slate-450 font-semibold block">Amount Paid</span>
                {transactionId && (
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">Txn: {transactionId}</span>
                )}
              </div>
              <div className="flex items-center text-xl font-black text-emerald-600">
                <span className="text-sm font-bold">₹</span>
                <span>{amount || "500"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/my-appointments"
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <span>Go to My Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 cursor-pointer text-center"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
