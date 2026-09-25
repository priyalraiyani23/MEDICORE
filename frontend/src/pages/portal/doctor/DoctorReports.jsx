import React, { useState, useEffect } from 'react';
import { FileSignature, Download, FlaskConical, Calendar } from 'lucide-react';

const DoctorReports = ({ token, doctorId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [token, doctorId]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter reports belonging to this doctor
        const docReports = data.reports.filter(r => r.doctorId?._id === doctorId || r.doctorId === doctorId);
        setReports(docReports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-96">
         <div className="w-20 h-20 bg-blue-50 text-[#3182CE] rounded-full flex items-center justify-center mb-6 animate-pulse">
           <FileSignature className="w-10 h-10" />
         </div>
         <p className="text-gray-500 max-w-sm">Loading lab reports...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-125">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1A365D]">Patient Lab Reports</h2>
          <p className="text-gray-500 mt-1">View and manage diagnostic reports for your patients.</p>
        </div>
        <div className="w-14 h-14 bg-blue-50 text-[#3182CE] rounded-2xl flex items-center justify-center">
          <FileSignature className="w-7 h-7" />
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-500 font-medium">No lab reports found for your patients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report._id} className="bg-[#F8F9FB] p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
              {/* Top Accent */}
              <div className={`absolute top-0 left-0 w-full h-1 ${report.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{report.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{report.patientId?.name || 'Unknown Patient'}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider shrink-0 ${
                  report.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status || 'Pending'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(report.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-gray-100 mb-6 flex-1">
                <p className="text-sm text-slate-600 line-clamp-3">
                  {report.description || 'No additional description provided.'}
                </p>
              </div>

              {report.fileUrl ? (
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-[#3182CE] hover:bg-[#3182CE] hover:text-white hover:border-[#3182CE] py-3 rounded-xl text-sm font-bold transition-colors mt-auto shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Result
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 w-full bg-gray-50 border border-gray-100 text-gray-400 py-3 rounded-xl text-sm font-bold mt-auto cursor-not-allowed"
                >
                  <FlaskConical className="w-4 h-4" />
                  Test in Progress
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorReports;
