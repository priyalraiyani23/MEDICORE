import React, { useEffect, useState } from 'react';
import { Pill, CheckCircle, Clock, Search, ShoppingBag } from 'lucide-react';

const PharmacyView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPresc, setSelectedPresc] = useState(null);
  const token = localStorage.getItem('portalToken');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prescriptions/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to dispense medicines for this prescription? This will deduct stocks and add charges to the patient's bill.")) {
      return;
    }

    try {
      const res = await fetch('/api/prescriptions/dispense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prescriptionId })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Medicines dispensed successfully and added to the patient's bill!");
        fetchPrescriptions();
        if (selectedPresc && selectedPresc._id === prescriptionId) {
          setSelectedPresc(prev => ({ ...prev, isDispensed: true }));
        }
      } else {
        alert(data.message || "Failed to dispense medicines");
      }
    } catch (error) {
      console.error("Error dispensing medicines:", error);
      alert("Network error occurred.");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p => {
    const patientName = p.patientId?.name?.toLowerCase() || '';
    const doctorName = p.doctorId?.name?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return patientName.includes(query) || doctorName.includes(query);
  });

  return (
    <div className="flex-1 bg-gray-50 p-4 sm:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-primary-500" />
              Pharmacy & Medicine Dispensing
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Manage prescriptions, dispense drugs, and automatically update patient billing.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-full bg-slate-50/50"
            />
          </div>
        </div>

        {/* Main Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of Prescriptions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-gray-800 text-sm">Prescriptions List</h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {filteredPrescriptions.length} Records
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                  Loading prescriptions...
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm font-medium">
                  No prescriptions found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-150 overflow-y-auto">
                  {filteredPrescriptions.map(p => (
                    <div 
                      key={p._id}
                      onClick={() => setSelectedPresc(p)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer ${selectedPresc?._id === p._id ? 'bg-primary-50/30 border-l-4 border-primary-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${p.isDispensed ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Pill className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {p.patientId?.name || 'Unknown Patient'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Prescribed by <span className="font-semibold">{p.doctorId?.name || 'Dr. Self Refer'}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Date: {new Date(p.date || p.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${p.isDispensed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.isDispensed ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Dispensed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 animate-spin" /> Pending Dispense
                            </>
                          )}
                        </span>
                        
                        {!p.isDispensed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDispense(p._id);
                            }}
                            className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                          >
                            Dispense
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Sidebar Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-3 mb-4">
                Prescription Details
              </h3>

              {selectedPresc ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient</p>
                    <p className="font-bold text-gray-800 text-sm mt-1">{selectedPresc.patientId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Email: {selectedPresc.patientId?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prescribing Doctor</p>
                    <p className="font-bold text-gray-800 text-sm mt-1">{selectedPresc.doctorId?.name || 'Dr. Self Refer'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedPresc.doctorId?.speciality || 'General Medicine'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Prescribed Medicines</p>
                    <div className="space-y-2 max-h-100 overflow-y-auto pr-1">
                      {selectedPresc.medicines?.map((med, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-900">{med.name}</span>
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{med.dosage}</span>
                          </div>
                          <div className="flex justify-between text-gray-500 mt-1.5 text-[10px] font-medium">
                            <span>Freq: {med.frequency}</span>
                            <span>Duration: {med.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPresc.instructions && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doctor Instructions</p>
                      <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-gray-600 mt-1 italic">
                        "{selectedPresc.instructions}"
                      </p>
                    </div>
                  )}

                  {!selectedPresc.isDispensed ? (
                    <button
                      onClick={() => handleDispense(selectedPresc._id)}
                      className="w-full py-3 bg-linear-to-r from-primary-500 to-primary-700 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(61,90,128,0.2)] hover:from-primary-600 hover:to-primary-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Pill className="w-4 h-4" /> Dispense Medicines & Bill
                    </button>
                  ) : (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Medicines Successfully Dispensed
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  Select a prescription from the list to view full details and dispense.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PharmacyView;
