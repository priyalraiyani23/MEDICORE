import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { Upload, Plus, FileText, CheckCircle, Activity, Sparkles } from 'lucide-react';

const LaboratoryView = () => {
  const { token } = usePortalAuth();
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);

  // Form state
  const [patientId, setPatientId] = useState('');
  const [testType, setTestType] = useState('Blood Test');
  const [description, setDescription] = useState('');

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [resultSummary, setResultSummary] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const testTypes = ['Blood Test', 'CBC Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan'];

  useEffect(() => {
    fetchReports();
    fetchPatients();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/admin/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!patientId) {
      alert("Please select a patient");
      return;
    }

    try {
      const res = await fetch('/api/reports/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId,
          title: testType,
          description
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Test created successfully");
        setPatientId('');
        setDescription('');
        fetchReports();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/reports/test/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to: ${newStatus.replace('_', ' ')}`);
        fetchReports();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    }
  };

  const handleUploadReport = async (e, id) => {
    e.preventDefault();

    const fd = new FormData();
    if (uploadFile) {
      fd.append('fileUrl', uploadFile);
    }
    fd.append('resultSummary', resultSummary);

    try {
      const res = await fetch(`/api/reports/test/${id}/upload`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Report uploaded successfully");
        setUploadingId(null);
        setUploadFile(null);
        setResultSummary('');
        fetchReports();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openUploadForm = (report) => {
    setUploadingId(report._id);
    setUploadFile(null);
    
    // Set realistic mock findings based on test title
    const titleLower = report.title.toLowerCase();
    let mockFindings = "";
    if (titleLower.includes('cbc') || titleLower.includes('blood') || titleLower.includes('lipid')) {
      mockFindings = "Hemoglobin: 14.2 g/dL, Total WBC: 6.5 x10^3/uL, Platelets: 2.8 x10^5/uL, Total Cholesterol: 245 mg/dL (High), Triglycerides: 185 mg/dL (High), Fasting Blood Sugar: 92 mg/dL.";
    } else if (titleLower.includes('urine')) {
      mockFindings = "Urine color is pale yellow, appearance is clear. pH: 6.0, Specific Gravity: 1.015. Glucose: Negative, Protein: Trace. Pus cells: 1-2 /hpf.";
    } else if (titleLower.includes('x-ray') || titleLower.includes('xray')) {
      mockFindings = "Lungs are clear. No focal consolidation, pleural effusion, or pneumothorax is identified. The cardiomediastinal silhouette is within normal limits. Visualized bony structures are intact.";
    } else if (titleLower.includes('mri')) {
      mockFindings = "Brain MRI shows normal ventricles and sulci. No acute intracranial hemorrhage, mass effect, or large territorial infarct is identified. Normal flow voids of the major intracranial vessels are noted.";
    } else if (titleLower.includes('ct') || titleLower.includes('scan')) {
      mockFindings = "CT Scan shows normal organ sizes and structures. No lymphadenopathy, free fluid, or acute inflammatory changes identified. Visualized bowel loops are normal.";
    } else {
      mockFindings = "All tested parameters are within normal clinical reference ranges. No significant abnormalities detected.";
    }
    setResultSummary(mockFindings);
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary-800">Laboratory Dashboard</h2>
            <p className="text-gray-500 mt-1">Track tests, collect samples, and upload reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Create Test Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-primary-800">Create New Test</h3>
              </div>

              <form onSubmit={handleCreateTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                    required
                  >
                    <option value="">Select Patient...</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                  >
                    {testTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm h-24"
                    placeholder="Add any notes for this test..."
                  />
                </div>

                <button type="submit" className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-[#2B405E] transition-colors cursor-pointer">
                  Create Test
                </button>
              </form>
            </div>
          </div>

          {/* Pending / Completed Tests List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary-800 mb-6">Test Records</h3>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${report.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                        {report.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{report.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Patient: {report.patientId?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(report.date).toLocaleDateString()}</p>
                        {report.description && <p className="text-xs text-gray-400 mt-1">Notes: {report.description}</p>}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                        report.status === 'completed' ? 'bg-green-100 text-green-700' :
                        report.status === 'processing' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                        report.status === 'sample_collected' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {report.status.replace('_', ' ')}
                      </span>

                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'sample_collected')}
                          className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-lg hover:bg-amber-100 cursor-pointer w-full sm:w-auto"
                        >
                          Collect Sample
                        </button>
                      )}
                      
                      {report.status === 'sample_collected' && (
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'processing')}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 cursor-pointer w-full sm:w-auto"
                        >
                          Start Processing
                        </button>
                      )}

                      {report.status === 'processing' && (
                        uploadingId === report._id ? (
                          <form onSubmit={(e) => handleUploadReport(e, report._id)} className="flex flex-col gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full max-w-xs">
                             <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Report PDF/Image (Optional)</label>
                              <a 
                                href="/sample_lab_report.pdf" 
                                download="sample_lab_report.pdf" 
                                className="text-[10px] text-blue-600 hover:underline block mb-2 font-semibold"
                              >
                                📥 Download Sample Lab Report PDF (for demo)
                              </a>
                              <input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="text-xs block w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Findings (for AI Summary)</label>
                              <textarea
                                placeholder="e.g. Hemoglobin 10.2 g/dL (Low), Blood Sugar slightly high..."
                                value={resultSummary}
                                onChange={(e) => setResultSummary(e.target.value)}
                                className="text-xs w-full h-16 border border-gray-200 rounded p-1 bg-white outline-none"
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-md cursor-pointer hover:bg-emerald-600">Complete</button>
                              <button type="button" onClick={() => { setUploadingId(null); setResultSummary(''); }} className="px-3 py-1 bg-gray-250 text-gray-700 text-xs font-semibold rounded-md cursor-pointer">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => openUploadForm(report)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg hover:bg-emerald-100 cursor-pointer w-full sm:w-auto"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload Result
                          </button>
                        )
                      )}

                      {report.status === 'completed' && (
                        <div className="flex gap-2 mt-1">
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100 flex items-center gap-1"
                          >
                            View File
                          </a>
                          {report.aiSummary && (
                            <button
                              onClick={() => alert(`🤖 AI Summary Explanation:\n\n${report.aiSummary}`)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> AI Summary
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No reports found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryView;
//