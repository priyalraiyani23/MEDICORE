import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, FileText, CheckCircle, Banknote, Sparkles, X } from 'lucide-react';

const MyProfile = () => {
  const { user, token, fetchUserProfile } = useAppContext();
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    age: '',
    bloodGroup: '',
    height: '',
    weight: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  });

  const [image, setImage] = useState(false);
  const [reports, setReports] = useState([]);
  const [bills, setBills] = useState([]);
  const [payingBillId, setPayingBillId] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, isLoading: false, summary: '', reportTitle: '' });

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/patients/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePayBill = async (billId, amount) => {
    if (!window.confirm(`Confirm online payment of ₹${amount.toFixed(2)}?`)) return;
    setPayingBillId(billId);
    try {
      const res = await fetch(`/api/bills/${billId}/pay`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Payment successful! Your bill has been marked as paid.');
        fetchBills();
      } else {
        alert(data.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setPayingBillId(null);
    }
  };

  const handleDownloadPDF = (bill) => {
    const printWindow = window.open('', '_blank');

    // Format items for the bill
    const itemsHtml = bill.items && bill.items.length > 0 ? bill.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">₹${item.amount}</td>
      </tr>
    `).join('') : `<tr><td colspan="2" style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;">No items specified</td></tr>`;

    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${bill._id}</title>
          <style>
            body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0056b3; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
            .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .bill-info div { flex: 1; }
            .bill-info strong { color: #555; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            th { background: #0056b3; color: white; padding: 12px; text-align: left; font-weight: 600; }
            .totals { width: 350px; float: right; background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row span:last-child { font-weight: 500; }
            .totals-row.bold { font-weight: bold; font-size: 1.2em; border-top: 2px solid #ddd; padding-top: 15px; margin-top: 10px; color: #0056b3; }
            .footer { text-align: center; margin-top: 80px; font-size: 0.9em; color: #777; clear: both; padding-top: 20px; border-top: 1px solid #eee; }
            @media print {
              body { padding: 0; }
              .bill-info, .totals { background: transparent; }
              th { background: #eee !important; color: #333 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICORE Healthcare</h1>
            <p>Official Invoice</p>
          </div>
          <div class="bill-info">
            <div>
              <strong>Patient Name:</strong> ${user?.name || 'N/A'}<br>
              <strong>Email:</strong> ${user?.email || 'N/A'}<br>
              <strong>Phone:</strong> ${user?.phone || 'N/A'}
            </div>
            <div style="text-align: right;">
              <strong>Bill No:</strong> ${bill._id}<br>
              <strong>Date:</strong> ${new Date(bill.createdAt || bill.date).toLocaleDateString()}<br>
              <strong>Status:</strong> <span style="text-transform: uppercase; color: ${bill.status === 'paid' ? '#059669' : '#dc2626'}; font-weight: bold;">${bill.status}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${bill.subTotal || (bill.totalAmount - (bill.tax || 0) + (bill.discount || 0))}</span>
            </div>
            <div class="totals-row">
              <span>Tax (18% GST):</span>
              <span>₹${bill.tax || 0}</span>
            </div>
            <div class="totals-row">
              <span>Discount:</span>
              <span>₹${bill.discount || 0}</span>
            </div>
            <div class="totals-row bold">
              <span>Total Amount:</span>
              <span>₹${bill.totalAmount}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing MEDICORE Healthcare.</p>
            <p>If you have any questions concerning this invoice, please contact our billing department.</p>
          </div>
          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print(); 
                window.onafterprint = function() { window.close(); }
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/patients/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || 'Not Selected',
        dob: user.dob || '',
        age: user.age || '',
        bloodGroup: user.bloodGroup || '',
        height: user.height || '',
        weight: user.weight || '',
        emergencyContact: user.emergencyContact || '',
        medicalHistory: user.medicalHistory ? user.medicalHistory.join(', ') : '',
        allergies: user.allergies ? user.allergies.join(', ') : '',
        currentMedications: user.currentMedications ? user.currentMedications.join(', ') : ''
      });
      fetchReports();
      fetchBills();
      fetchPrescriptions();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('bloodGroup', formData.bloodGroup);
      formDataToSend.append('height', formData.height);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('emergencyContact', formData.emergencyContact);

      // Convert comma-separated strings back to arrays
      if (formData.medicalHistory) {
        const mhArray = formData.medicalHistory.split(',').map(item => item.trim());
        mhArray.forEach(item => formDataToSend.append('medicalHistory[]', item));
      }
      if (formData.allergies) {
        const alArray = formData.allergies.split(',').map(item => item.trim());
        alArray.forEach(item => formDataToSend.append('allergies[]', item));
      }
      if (formData.currentMedications) {
        const cmArray = formData.currentMedications.split(',').map(item => item.trim());
        cmArray.forEach(item => formDataToSend.append('currentMedications[]', item));
      }

      if (image) {
        formDataToSend.append('image', image);
      }

      const res = await fetch('/api/patients/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      const data = await res.json();
      if (data.success) {
        setIsEdit(false);
        fetchUserProfile(); // Refresh data
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving profile", error);
    }
  };

  const handleAISummary = async (report) => {
    // If the report already has an AI summary in the database, use it directly!
    if (report.aiSummary) {
      setSummaryModal({
        isOpen: true,
        isLoading: false,
        summary: report.aiSummary,
        reportTitle: report.title
      });
      return;
    }

    setSummaryModal({ isOpen: true, isLoading: true, summary: '', reportTitle: report.title });
    try {
      const res = await fetch('/api/ai/report-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: report.resultSummary || "No result summary available." })
      });
      const data = await res.json();
      if (data.success) {
        setSummaryModal(prev => ({ ...prev, isLoading: false, summary: data.summary }));
      } else {
        setSummaryModal(prev => ({ ...prev, isLoading: false, summary: "Failed to generate summary." }));
      }
    } catch (error) {
      console.error(error);
      setSummaryModal(prev => ({ ...prev, isLoading: false, summary: "Network error." }));
    }
  };

  const renderBoldText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-purple-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) return <div className="min-h-screen pt-8 flex justify-center items-center font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 font-sans pb-12 pt-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto px-4 md:px-8">

          <div className="flex justify-between items-center mb-6">
            <p className="text-3xl font-bold text-primary-800">My Profile</p>
            {isEdit ? (
              <button
                onClick={handleSave}
                className="border border-primary-500 bg-primary-50 text-primary-800 font-bold px-6 py-2 rounded-full hover:bg-primary-500 hover:text-white transition-all cursor-pointer shadow-sm text-sm flex items-center gap-2"
              >
                Save Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="border border-primary-500 bg-primary-50 text-primary-800 font-bold px-6 py-2 rounded-full hover:bg-primary-50 border-b-2 hover:border-b-primary-600 transition-all cursor-pointer shadow-sm text-sm flex items-center gap-2"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-lg relative">

            {/* Profile Image Section */}
            <div className="flex items-center gap-6 mb-8">
              <label htmlFor="image" className="relative cursor-pointer block">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-primary-300">
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-3xl">
                      {formData.name ? formData.name.charAt(0) : "P"}
                    </div>
                  )}
                </div>
                {isEdit && (
                  <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
                <input type="file" id="image" hidden onChange={(e) => setImage(e.target.files[0])} disabled={!isEdit} />
              </label>

              {isEdit ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-2xl font-bold text-primary-800 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-sm"
                />
              ) : (
                <p className="text-2xl font-bold text-primary-800">{formData.name}</p>
              )}
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* Contact Information */}
            <div className="mb-8">
              <p className="text-primary-500 font-bold text-sm underline mb-4 tracking-wide uppercase">Contact Information</p>
              <div className="grid grid-cols-[100px_1fr] gap-y-4 text-[15px]">

                <p className="font-semibold text-gray-600">Email id:</p>
                <p className="text-primary-600">{formData.email}</p>

                <p className="font-semibold text-gray-600">Phone:</p>
                {isEdit ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-primary-600">{formData.phone || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Address:</p>
                {isEdit ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-primary-600 whitespace-pre-wrap">{formData.address || "Not Set"}</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <p className="text-primary-500 font-bold text-sm underline mb-4 tracking-wide uppercase">Basic Information</p>
              <div className="grid grid-cols-[150px_1fr] gap-y-4 text-[15px]">

                <p className="font-semibold text-gray-600">Gender:</p>
                {isEdit ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  >
                    <option value="Not Selected">Not Selected</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-primary-600">{formData.gender}</p>
                )}

                <p className="font-semibold text-gray-600">Birthday:</p>
                {isEdit ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  />
                ) : (
                  <p className="text-primary-600">{formData.dob || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Age:</p>
                {isEdit ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  />
                ) : (
                  <p className="text-primary-600">{formData.age || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Blood Group:</p>
                {isEdit ? (
                  <input
                    type="text"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  />
                ) : (
                  <p className="text-primary-600">{formData.bloodGroup || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Height (cm):</p>
                {isEdit ? (
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  />
                ) : (
                  <p className="text-primary-600">{formData.height || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Weight (kg):</p>
                {isEdit ? (
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-max"
                  />
                ) : (
                  <p className="text-primary-600">{formData.weight || "Not Set"}</p>
                )}
              </div>
            </div>

            <hr className="border-gray-200 mb-8 mt-8" />

            {/* Medical Information */}
            <div className="mb-8">
              <p className="text-primary-500 font-bold text-sm underline mb-4 tracking-wide uppercase">Medical Information</p>
              <div className="grid grid-cols-[150px_1fr] gap-y-4 text-[15px]">

                <p className="font-semibold text-gray-600">Emergency Contact:</p>
                {isEdit ? (
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                  />
                ) : (
                  <p className="text-primary-600">{formData.emergencyContact || "Not Set"}</p>
                )}

                <p className="font-semibold text-gray-600">Medical History:</p>
                {isEdit ? (
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Comma separated"
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                  />
                ) : (
                  <p className="text-primary-600">{formData.medicalHistory || "None"}</p>
                )}

                <p className="font-semibold text-gray-600">Allergies:</p>
                {isEdit ? (
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Comma separated"
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                  />
                ) : (
                  <p className="text-primary-600">{formData.allergies || "None"}</p>
                )}

                <p className="font-semibold text-gray-600">Current Medications:</p>
                {isEdit ? (
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Comma separated"
                    className="bg-gray-50 border border-gray-300 rounded-md px-3 py-1 text-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                  />
                ) : (
                  <p className="text-primary-600">{formData.currentMedications || "None"}</p>
                )}
              </div>
            </div>

            <hr className="border-gray-200 mb-8 mt-8" />

            {/* My Reports Information */}
            <div className="mb-8">
              <p className="text-primary-500 font-bold text-sm underline mb-4 tracking-wide uppercase">My Lab Reports</p>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${report.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                        {report.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{report.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Prescribed by: {report.doctorId?.name || 'Self/Admin'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(report.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-wrap gap-2">
                      {report.status === 'pending' ? (
                        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-lg border border-primary-100 h-9 flex items-center">
                          Pending Result
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAISummary(report)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors border border-purple-100 shadow-sm"
                          >
                            <Sparkles className="w-4 h-4" /> AI Summary
                          </button>
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-100 shadow-sm"
                          >
                            View Report
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    No lab reports found
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-200 mb-8 mt-8" />

            {/* My Prescriptions Information */}
            <div className="mb-8">
              <p className="text-primary-500 font-bold text-sm underline mb-4 tracking-wide uppercase">My Prescriptions</p>

              <div className="space-y-4">
                {prescriptions.map((presc) => (
                  <div key={presc._id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Prescription from {presc.doctorId?.name || 'Unknown Doctor'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{presc.medicines?.length || 0} Medicines Prescribed</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(presc.date || presc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${presc.isDispensed ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                          {presc.isDispensed ? 'Dispensed' : 'Pending at Pharmacy'}
                        </span>
                        <button
                          onClick={() => setSelectedPrescriptionId(selectedPrescriptionId === presc._id ? null : presc._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                          {selectedPrescriptionId === presc._id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>

                    {selectedPrescriptionId === presc._id && (
                      <div className="mt-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <h5 className="font-bold text-primary-500 mb-3 text-sm">Medicines</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm mb-4 border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                                <th className="p-2 font-semibold">Medicine</th>
                                <th className="p-2 font-semibold">Dosage</th>
                                <th className="p-2 font-semibold">Frequency</th>
                                <th className="p-2 font-semibold">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {presc.medicines?.map((med, idx) => (
                                <tr key={idx} className="border-b border-gray-50">
                                  <td className="p-2 font-medium">{med.name}</td>
                                  <td className="p-2 text-gray-600">{med.dosage}</td>
                                  <td className="p-2 text-gray-600">{med.frequency}</td>
                                  <td className="p-2 text-gray-600">{med.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {presc.instructions && (
                          <div>
                            <h5 className="font-bold text-primary-500 mb-1 text-sm">Special Instructions</h5>
                            <p className="text-gray-600 text-sm">{presc.instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {prescriptions.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    No prescriptions found
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-200 mb-8 mt-8" />

            {/* My Bills Information */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <Banknote className="w-4 h-4" />
                </div>
                <p className="text-primary-800 font-extrabold text-lg tracking-tight">My Bills & Invoices</p>
              </div>

              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill._id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md hover:border-primary-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bill.status === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Hospital Bill - {new Date(bill.date).toLocaleDateString()}</h4>
                        <p className="text-xs text-gray-500 mt-1">Total Amount: <span className="font-bold text-primary-700 text-sm">₹{bill.totalAmount}</span> (Tax: ₹{bill.tax}, Discount: ₹{bill.discount})</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                      {bill.status === 'unpaid' ? (
                        <button
                          onClick={() => handlePayBill(bill._id, bill.totalAmount)}
                          disabled={payingBillId === bill._id}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 shadow-sm transition-colors cursor-pointer hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {payingBillId === bill._id ? 'Processing...' : `Pay ₹${bill.totalAmount.toFixed(2)} Now`}
                        </button>
                      ) : (
                        <button onClick={() => handleDownloadPDF(bill)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors cursor-pointer">
                          Download PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {bills.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 bg-primary-50/50 rounded-2xl border border-primary-100 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-200 mb-4 shadow-sm">
                      <Banknote className="w-8 h-8" />
                    </div>
                    <h4 className="text-primary-900 font-bold mb-1">No pending or past bills</h4>
                    <p className="text-primary-500 text-sm">Your medical invoices will securely appear here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div></div>

      {/* AI Summary Modal */}
      {summaryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-purple-50">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> AI Report Summary
              </h3>
              <button onClick={() => setSummaryModal({ isOpen: false, isLoading: false, summary: '', reportTitle: '' })} className="p-1 hover:bg-purple-200 rounded-full text-purple-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">{summaryModal.reportTitle}</h4>
              {summaryModal.isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-purple-600 font-medium animate-pulse">Generating simplified summary...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">{renderBoldText(summaryModal.summary)}</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
              Disclaimer: This summary is generated by AI and is not a substitute for professional medical advice.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
