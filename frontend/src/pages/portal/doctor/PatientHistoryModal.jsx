import React, { useEffect, useState } from 'react';
import { X, FileText, FlaskConical, Calendar } from 'lucide-react';

const PatientHistoryModal = ({ patient, token, onClose }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/doctors/patient/${patient._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [patient._id, token]);

  const handleOrderLabTest = async (testName) => {
    const testDesc = prompt("Enter test instructions:");
    if (!testDesc) return;
    
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: patient._id,
          testType: testName,
          description: testDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Lab test ordered successfully");
        // refresh history
        setLoading(true);
        const res2 = await fetch(`/api/doctors/patient/${patient._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (data2.success) setHistory(data2.data);
        setLoading(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-xl font-bold text-[#1A365D]">Patient History</h2>
            <p className="text-sm text-gray-500">{patient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="space-y-8">
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-purple-600"/> Lab Tests</h3>
                <div className="flex gap-2">
                   <button onClick={() => handleOrderLabTest('Blood Test')} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">+ Blood Test</button>
                   <button onClick={() => handleOrderLabTest('X-Ray')} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">+ X-Ray</button>
                   <button onClick={() => handleOrderLabTest('MRI')} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">+ MRI</button>
                </div>
              </div>

              {history?.reports && history.reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.reports.map(report => (
                    <div key={report._id} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800">{report.testType}</span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${report.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      {report.status === 'completed' && report.resultSummary && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs text-gray-500 font-semibold mb-1">Result Summary</p>
                          <p className="text-sm text-gray-800">{report.resultSummary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-sm text-gray-500">No lab reports found.</p>
              )}

              <hr className="border-gray-100" />

              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600"/> Prescriptions</h3>
              {history?.prescriptions && history.prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {history.prescriptions.map(presc => (
                    <div key={presc._id} className="border border-gray-100 rounded-xl p-4 shadow-sm bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-600">Prescribed by Dr. {presc.doctorId?.name}</span>
                        <span className="text-xs text-gray-400">{new Date(presc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {presc.medicines.map((med, i) => (
                           <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{med.name} ({med.dosage})</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No prescriptions found.</p>
              )}

              <hr className="border-gray-100" />

              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-green-600"/> Past Appointments</h3>
              {history?.appointments && history.appointments.length > 0 ? (
                <div className="space-y-2">
                  {history.appointments.map(app => (
                    <div key={app._id} className="flex justify-between items-center border border-gray-100 rounded-lg p-3 bg-white">
                      <div>
                         <p className="font-semibold text-gray-800">{app.slotDate} at {app.slotTime}</p>
                         <p className="text-xs text-gray-500">Status: {app.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No past appointments found.</p>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
