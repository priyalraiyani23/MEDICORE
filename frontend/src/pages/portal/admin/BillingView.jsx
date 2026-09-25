import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { Receipt, CheckCircle2, Clock, IndianRupee, User, CreditCard, Banknote } from 'lucide-react';

const BillingView = () => {
  const { token } = usePortalAuth();
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'generate'
  const [appointments, setAppointments] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchAllBills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bills/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBills(data.bills);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointment/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter appointments that don't have a bill yet
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { 
    fetchAllBills(); 
    fetchAppointments();
  }, []);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!selectedApptId) return alert('Select an appointment');
    setGenerating(true);
    try {
      const res = await fetch('/api/bills/generate-combined', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ appointmentId: selectedApptId })
      });
      const data = await res.json();
      if (data.success) {
        alert('Bill generated successfully');
        setSelectedApptId('');
        setView('list');
        fetchAllBills();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error generating bill');
    } finally {
      setGenerating(false);
    }
  };

  const filtered = bills.filter(b => filter === 'all' || b.status === filter);
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const totalPending = bills.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-800">Billing & Payments</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'border border-primary-200 text-primary-600 hover:bg-primary-50'}`}>
            View Bills
          </button>
          <button onClick={() => setView('generate')} className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${view === 'generate' ? 'bg-primary-600 text-white' : 'border border-primary-200 text-primary-600 hover:bg-primary-50'}`}>
            Generate Bill
          </button>
          <button onClick={fetchAllBills} className="text-xs text-primary-600 font-semibold border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {view === 'generate' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Generate Combined Bill</h2>
          <p className="text-sm text-gray-500 mb-6">Select a completed appointment to generate a final invoice combining consultation fee, medicines, and lab tests.</p>
          
          <form onSubmit={handleGenerateBill} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Appointment</label>
              <select 
                required 
                value={selectedApptId} 
                onChange={(e) => setSelectedApptId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">-- Select Appointment --</option>
                {appointments.map(appt => (
                  <option key={appt._id} value={appt._id}>
                    {appt.slotDate} {appt.slotTime} - Patient: {appt.userId?.name || 'Unknown'} (Dr. {appt.doctorId?.name || 'Unknown'}) - {appt.status}
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={generating}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Invoice'}
            </button>
          </form>
        </div>
      )}

      {view === 'list' && (
        <>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Collected</p>
            <p className="text-xl font-extrabold text-green-700 flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4" />{totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Pending Amount</p>
            <p className="text-xl font-extrabold text-amber-700 flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4" />{totalPending.toFixed(0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Total Bills</p>
            <p className="text-xl font-extrabold text-primary-800">{bills.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'paid', 'unpaid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'all' ? `All (${bills.length})` : f === 'paid' ? `Paid (${bills.filter(b => b.status === 'paid').length})` : `Unpaid (${bills.filter(b => b.status === 'unpaid').length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading bills...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No bills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Subtotal</th>
                  <th className="px-4 py-3 font-semibold">GST</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((bill, idx) => (
                  <tr key={bill._id} className={`hover:bg-gray-50/60 transition-colors`}>
                    <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{bill.patientId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-gray-400">{bill.patientId?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-45">
                        {bill.items?.map((item, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium border border-blue-100 truncate max-w-30" title={item.name}>
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">Rs.{bill.subTotal?.toFixed(0)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">Rs.{bill.tax?.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className="font-extrabold text-gray-800">Rs.{bill.totalAmount?.toFixed(0)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {bill.paymentMethod === 'online' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          <CreditCard className="w-3 h-3" /> Online
                        </span>
                      ) : bill.paymentMethod === 'cash' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          <Banknote className="w-3 h-3" /> Cash
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {bill.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default BillingView;
