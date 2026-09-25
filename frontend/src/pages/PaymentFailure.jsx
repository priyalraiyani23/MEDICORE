import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const failureDetails = location.state || {};

  const {
    errorMsg,
    appointmentId
  } = failureDetails;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans relative pt-24">
      {/* Background soft glowing elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Error Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 ring-8 ring-rose-50/50 relative">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Failed</h1>
          <p className="text-sm text-slate-500 mt-2">Something went wrong while processing your payment.</p>
        </div>

        {/* Details Card */}
        <div className="bg-rose-50/50 border border-rose-100/70 rounded-2xl p-5 mb-8 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700/80 mb-2 select-none">Failure Reason</p>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {errorMsg || "The transaction was cancelled or declined by the bank. Please try again or check your account."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/my-appointments"
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Appointments</span>
          </Link>
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm py-3 px-6 rounded-2xl transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
