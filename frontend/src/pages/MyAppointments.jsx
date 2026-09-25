import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, User, ArrowRight, X } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const isPastAppointment = (slotDate, slotTime) => {
  try {
    const dateParts = slotDate.split(' ');
    if (dateParts.length !== 3) return false;
    
    const day = parseInt(dateParts[0]);
    const monthStr = dateParts[1];
    const year = parseInt(dateParts[2]);
    
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const month = months[monthStr];
    if (month === undefined) return false;
    
    const timeMatch = slotTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const appointmentDate = new Date(year, month, day, hours, minutes);
    return appointmentDate < new Date();
  } catch (e) {
    console.error("Error parsing slot date/time:", e);
    return false;
  }
};

const MyAppointments = () => {
  const { appointments, fetchAppointments, token } = useAppContext();
  const navigate = useNavigate();
  const [showSimulator, setShowSimulator] = React.useState(false);
  const [simulatorData, setSimulatorData] = React.useState(null);
  const [showSuccessModal, setShowSuccessModal] = React.useState(null); // holds payment details

  const handleSimulateSuccess = async (method) => {
    if (!simulatorData) return;
    const { order, appointmentId, doctorName, speciality, date, time, fee } = simulatorData;
    
    try {
      const mockPaymentId = "pay_mock_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const verifyRes = await fetch('/api/appointment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: order.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "mock_signature",
          appointmentId
        })
      });

      const verifyData = await verifyRes.json();
      setShowSimulator(false);
      
      if (verifyData.success) {
        fetchAppointments();
        setShowSuccessModal({ doctorName, speciality, date, time, amount: fee, transactionId: mockPaymentId });
      } else {
        navigate('/payment-failure', {
          state: {
            appointmentId,
            errorMsg: verifyData.message || "Simulated payment verification failed."
          }
        });
      }
    } catch (err) {
      console.error("Simulation verification error:", err);
      setShowSimulator(false);
      navigate('/payment-failure', {
        state: {
          appointmentId,
          errorMsg: "Error verifying simulated transaction."
        }
      });
    }
  };

  const handleSimulateFailure = () => {
    if (!simulatorData) return;
    const { appointmentId } = simulatorData;
    setShowSimulator(false);
    navigate('/payment-failure', {
      state: {
        appointmentId,
        errorMsg: "Simulated payment transaction was declined."
      }
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCancel = async (id) => {
    try {
      const res = await fetch('/api/appointment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId: id })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this appointment from your history?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/appointment/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      } else {
        alert(data.message || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Delete appointment error:", error);
      alert("Error deleting appointment");
    }
  };

  const handlePayment = async (appointmentId, method) => {
    if (method === 'Cash') {
      alert("Payment method set to Cash. Please pay at the clinic counter.");
      return;
    }

    const appointment = appointments.find(apt => apt._id === appointmentId);
    const doctorName = appointment?.doctorId?.name || "Doctor Specialist";
    const speciality = appointment?.doctorId?.speciality || "Healthcare Expert";
    const date = appointment?.slotDate;
    const time = appointment?.slotTime;
    const rawFee = appointment?.doctorId?.consultationFee || appointment?.consultationFee || "500";
    const fee = parseInt(String(rawFee).replace(/\D/g, '')) || 500;

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const res = await fetch('/api/appointment/pay-online', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to initiate online payment.");
        return;
      }

      const { order, key } = data;

      if (order.id.startsWith("order_mock_")) {
        setSimulatorData({
          order,
          key,
          appointmentId,
          doctorName,
          speciality,
          date,
          time,
          fee
        });
        setShowSimulator(true);
        return;
      }

      const options = {
        key: key || "rzp_test_dummykey",
        amount: order.amount,
        currency: order.currency,
        name: "Medicore Clinic",
        description: "Doctor Consultation Fee Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/appointment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              fetchAppointments();
              setShowSuccessModal({ doctorName, speciality, date, time, amount: fee, transactionId: response.razorpay_payment_id });
            } else {
              navigate('/payment-failure', {
                state: {
                  appointmentId,
                  errorMsg: verifyData.message || "Payment verification failed."
                }
              });
            }
          } catch (err) {
            console.error("Verification error:", err);
            navigate('/payment-failure', {
              state: {
                appointmentId,
                errorMsg: "Verification process encountered an unexpected error."
              }
            });
          }
        },
        prefill: {
          name: "Patient",
        },
        theme: {
          color: "#3182CE",
        },
        modal: {
          ondismiss: function() {
            navigate('/payment-failure', {
              state: {
                appointmentId,
                errorMsg: "Payment process was cancelled by the user."
              }
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Online payment error:", error);
      navigate('/payment-failure', {
        state: {
          appointmentId,
          errorMsg: "Failed to initialize payment process with Razorpay."
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-12 pt-4">

      {/* ===== Payment Success Modal ===== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)'}}>
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Close button */}
            <button onClick={() => setShowSuccessModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {/* Animated Check Icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 ring-8 ring-emerald-50/50">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Successful!</h2>
              <p className="text-sm text-slate-500 mt-2">Your appointment has been confirmed &amp; secured.</p>
            </div>

            {/* Receipt */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Receipt Summary</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3.5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{showSuccessModal.doctorName || 'Doctor Specialist'}</p>
                    <p className="text-xs text-slate-400 font-medium">{showSuccessModal.speciality || 'Healthcare Expert'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">📅 Date</span>
                    <p className="text-xs font-bold text-slate-700">{showSuccessModal.date || '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">⏰ Time</span>
                    <p className="text-xs font-bold text-slate-700">{showSuccessModal.time || '—'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Amount Paid</span>
                    {showSuccessModal.transactionId && (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Txn: {showSuccessModal.transactionId}</span>
                    )}
                  </div>
                  <div className="flex items-center text-xl font-black text-emerald-600">
                    <span className="text-sm font-bold">₹</span>
                    <span>{showSuccessModal.amount || '500'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close / CTA */}
            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer"
            >
              <span>Done — View My Appointments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <p className="text-2xl font-bold text-primary-800 mb-6">My Appointments</p>
        <hr className="border-gray-200 mb-8" />

        <div className="flex flex-col gap-6">
          {appointments.length > 0 ? (
            appointments.map((apt, index) => {
              const isPast = isPastAppointment(apt.slotDate, apt.slotTime);
              return (
                <div key={index} className="flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                
                {/* Image */}
                <div className="w-36 h-40 bg-primary-100 rounded-lg overflow-hidden shrink-0">
                  <img 
                    src={apt.doctorId?.images?.[0]?.url || apt.doctorId?.image || 'https://via.placeholder.com/150'} 
                    alt={apt.doctorId?.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="font-bold text-primary-800 text-lg">{apt.doctorId?.name}</p>
                  <p className="text-primary-600 text-sm mb-4">{apt.doctorId?.speciality}</p>
                  
                  <p className="font-semibold text-gray-800 text-[13px] mb-1">Address:</p>
                  <p className="text-primary-600 text-[13px] whitespace-pre-wrap mb-4">
                    {apt.doctorId?.address || "Address not available"}
                  </p>

                  <p className="text-[13px] text-gray-800 font-semibold mb-1">
                    Date & Time: <span className="text-primary-600 font-normal">{apt.slotDate} | {apt.slotTime}</span>
                  </p>
                  <p className="text-[13px] text-gray-800 font-semibold">
                    Status: <span className="text-primary-600 font-normal">{apt.status}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-end sm:w-48 shrink-0 pb-2">
                  {apt.status !== 'Cancelled' && apt.status !== 'Completed' && !isPast && (
                    <>
                      {!apt.isPaid && (
                        <>
                          <button 
                            onClick={() => handlePayment(apt._id, 'Online')}
                            className="w-full py-2 border border-gray-300 text-gray-600 font-medium text-sm rounded cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            Pay Online
                          </button>
                          <button 
                            onClick={() => handlePayment(apt._id, 'Cash')}
                            className="w-full py-2 border border-gray-300 text-gray-600 font-medium text-sm rounded cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            Pay by Cash
                          </button>
                        </>
                      )}
                      {apt.isPaid && (
                        <div className="w-full text-center">
                          <span className="block w-full py-2 border border-emerald-300 text-emerald-600 font-semibold text-sm rounded bg-emerald-50 cursor-default">
                            Paid (Online)
                          </span>
                          {apt.paymentId && (
                            <p className="text-[11px] text-gray-500 mt-1.5 font-mono">
                              Txn ID: {apt.paymentId}
                            </p>
                          )}
                        </div>
                      )}
                      <button 
                        onClick={() => handleCancel(apt._id)}
                        className="w-full py-2 border border-gray-300 text-gray-600 font-medium text-sm rounded cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors mt-2"
                      >
                        Cancel appointment
                      </button>
                    </>
                  )}
                  {(apt.status === 'Cancelled' || apt.status === 'Completed' || isPast) && (
                    <div className="flex flex-col gap-2">
                      <span className={`block w-full py-2 text-center border font-semibold text-sm rounded cursor-default ${
                        apt.status === 'Completed'
                          ? 'border-emerald-350 text-emerald-600 bg-emerald-50/70'
                          : apt.status === 'Cancelled'
                          ? 'border-rose-300 text-rose-500 bg-rose-50'
                          : 'border-amber-300 text-amber-600 bg-amber-50'
                      }`}>
                        {apt.status === 'Completed' ? 'Completed' : apt.status === 'Cancelled' ? 'Cancelled' : 'Passed / Expired'}
                      </span>
                      <button 
                        onClick={() => handleDelete(apt._id)}
                        className="w-full py-2 border border-rose-300 text-rose-600 font-bold text-sm rounded cursor-pointer hover:bg-rose-50 transition-colors text-center"
                      >
                        Delete from History
                      </button>
                    </div>
                  )}
                </div>

              </div>
              );
            })
          ) : (
            <p className="text-gray-500 font-medium text-center py-10">No appointments found.</p>
          )}
        </div>
      </div>

      {showSimulator && simulatorData && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-420px rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col font-sans text-slate-800">
            {/* Modal Header */}
            <div className="bg-[#092c5c] text-white p-6 relative">
              <button 
                onClick={() => {
                  setShowSimulator(false);
                  navigate('/payment-failure', {
                    state: {
                      appointmentId: simulatorData.appointmentId,
                      errorMsg: "Payment simulation was cancelled by the user."
                    }
                  });
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg tracking-wider border border-white/20">
                  MC
                </div>
                <div>
                  <h3 className="font-bold text-base">Medicore Clinic</h3>
                  <p className="text-[12px] text-white/80">Doctor Consultation Fee Payment</p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-white/70">Amount to Pay</span>
                <span className="text-2xl font-extrabold">₹{simulatorData.fee}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 bg-slate-50 flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-800 leading-relaxed flex gap-2 items-start">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>Razorpay Sandbox Mode:</strong> Real payment keys are not configured. You are using the secure custom payment simulator.
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Simulated Payment Method
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Method Option: Card */}
                <button 
                  onClick={() => handleSimulateSuccess('Card')}
                  className="w-full bg-white border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-800">Simulate Card Payment</p>
                      <p className="text-[11px] text-slate-450">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <span className="text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Pay &rarr;</span>
                </button>

                {/* Method Option: UPI */}
                <button 
                  onClick={() => handleSimulateSuccess('UPI')}
                  className="w-full bg-white border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-800">Simulate UPI Payment</p>
                      <p className="text-[11px] text-slate-450">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <span className="text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Pay &rarr;</span>
                </button>

                {/* Method Option: Netbanking */}
                <button 
                  onClick={() => handleSimulateSuccess('Netbanking')}
                  className="w-full bg-white border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-800">Simulate Netbanking</p>
                      <p className="text-[11px] text-slate-450">SBI, HDFC, ICICI, Axis</p>
                    </div>
                  </div>
                  <span className="text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Pay &rarr;</span>
                </button>

                {/* Method Option: Failure */}
                <button 
                  onClick={handleSimulateFailure}
                  className="w-full bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50/10 p-3.5 rounded-xl flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-800">Simulate Payment Failure</p>
                      <p className="text-[11px] text-slate-450">Test error handling & failure routing</p>
                    </div>
                  </div>
                  <span className="text-rose-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Fail &rarr;</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-350" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Connection
              </span>
              <span>ID: {simulatorData.order.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
