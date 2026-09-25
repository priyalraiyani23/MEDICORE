import React, { useEffect, useState } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { Calendar, Users, FileText, LogOut, LayoutDashboard, CreditCard, User, Settings, Bell, MessageSquare, Search, Phone, FileSignature, MessageCircle, Check, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import PatientHistoryModal from './PatientHistoryModal';
import DoctorReports from './DoctorReports';

const DoctorDashboard = () => {
  const { token, role, logout } = usePortalAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    recentAppointments: [],
    doctor: null
  });
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  // Unavailable slots state (for doctor's own profile panel)
  const [docSlotsDate, setDocSlotsDate] = useState('');
  const [docBlockedTimes, setDocBlockedTimes] = useState([]);
  const [docUnavailableSlots, setDocUnavailableSlots] = useState([]);
  const [docSlotsSaving, setDocSlotsSaving] = useState(false);
  const [docSlotsSaveMsg, setDocSlotsSaveMsg] = useState('');

  // Doctor Settings profile form state
  const [settingsForm, setSettingsForm] = useState({
    name: '', speciality: '', phone: '', address: '', consultationFee: '', qualification: '', about: '', availability: true, password: ''
  });

  // All 30-min slots 10 AM – 8:30 PM
  const ALL_SLOTS = (() => {
    const slots = [];
    for (let h = 10; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const d = new Date(2000, 0, 1, h, m);
        slots.push(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      }
    }
    return slots;
  })();

  // Mock data for the pie chart
  const pieData = [
    { name: 'New Patients', value: 400, color: '#E2E8F0' },
    { name: 'Old Patients', value: 300, color: '#F6AD55' },
    { name: 'Total Patients', value: 700, color: '#2B6CB0' },
  ];

  // Mock data for Patient Reviews
  const reviewsData = [
    { label: 'Excellent', percent: 85, color: 'bg-blue-600' },
    { label: 'Great', percent: 60, color: 'bg-green-500' },
    { label: 'Good', percent: 40, color: 'bg-primary-400' },
    { label: 'Average', percent: 20, color: 'bg-teal-400' },
  ];

  useEffect(() => {
    if (!token || role !== 'doctor') {
      navigate('/doctor-admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [token, role, navigate]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/doctors/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
        // Sync doctor's unavailable slots into local state
        setDocUnavailableSlots(data.data.doctor?.unavailableSlots || []);

        // Sync settings form fields
        const doc = data.data.doctor;
        if (doc) {
          setSettingsForm({
            name: doc.name || '',
            speciality: doc.speciality || '',
            phone: doc.phone || '',
            address: doc.address || '',
            consultationFee: doc.consultationFee || '500',
            qualification: doc.qualification || 'MBBS',
            about: doc.about || '',
            availability: doc.availability !== false,
            password: ''
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...settingsForm };
      if (!payload.password) delete payload.password; // Do not overwrite with blank password

      const res = await fetch('/api/doctors/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Profile settings updated successfully!");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to update profile settings.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile settings.");
    }
  };

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    appointmentId: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    labTests: [{ title: '', description: '' }],
    instructions: ''
  });

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const validTests = prescriptionForm.labTests.filter(t => t.title);
      
      const res = await fetch('/api/doctors/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: prescriptionForm.patientId,
          appointmentId: prescriptionForm.appointmentId,
          medicines: prescriptionForm.medicines.filter(m => m.name),
          labTests: validTests,
          instructions: prescriptionForm.instructions
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Prescription and Lab Tests created successfully");
        setPrescriptionForm({
          patientId: '',
          appointmentId: '',
          medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
          labTests: [{ title: '', description: '' }],
          instructions: ''
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/doctor-admin/login');
  };

  const handleDocSlotsDateChange = (date) => {
    setDocSlotsDate(date);
    if (!date) { setDocBlockedTimes([]); return; }
    const existing = docUnavailableSlots.find(s => s.date === date);
    setDocBlockedTimes(existing ? existing.times : []);
  };

  const toggleDocBlockedTime = (time) => {
    setDocBlockedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const handleDocSaveSlots = async () => {
    if (!docSlotsDate) { setDocSlotsSaveMsg('error'); return; }
    setDocSlotsSaving(true);
    setDocSlotsSaveMsg('');
    try {
      const res = await fetch('/api/doctors/unavailable-slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: docSlotsDate, times: docBlockedTimes })
      });
      const data = await res.json();
      if (data.success) {
        setDocUnavailableSlots(data.unavailableSlots);
        // Also update metrics.doctor availability
        if (data.availability !== undefined) {
          setMetrics(prev => ({ ...prev, doctor: { ...prev.doctor, availability: data.availability } }));
        }
        setDocSlotsSaveMsg('success');
        setTimeout(() => setDocSlotsSaveMsg(''), 2500);
      } else {
        setDocSlotsSaveMsg('error');
      }
    } catch (error) {
      console.error(error);
      setDocSlotsSaveMsg('error');
    } finally {
      setDocSlotsSaving(false);
    }
  };

  const handleDocRemoveDate = async (dateToRemove) => {
    try {
      const res = await fetch('/api/doctors/unavailable-slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: dateToRemove, times: [] })
      });
      const data = await res.json();
      if (data.success) {
        setDocUnavailableSlots(data.unavailableSlots);
        if (data.availability !== undefined) {
          setMetrics(prev => ({ ...prev, doctor: { ...prev.doctor, availability: data.availability } }));
        }
        if (docSlotsDate === dateToRemove) { setDocBlockedTimes([]); }
      }
    } catch (e) { console.error(e); }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const endpoint = action === 'accept' ? 'accept' : action === 'reject' ? 'reject' : 'complete';
      const res = await fetch(`/api/appointment/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-[#F8F9FB] pt-4 md:pt-6">
      {/* Sidebar - Matching Zippay Fintech Reference Image */}
      <div className="w-full md:w-72 bg-white border-r border-[#F0F1F5] shrink-0 flex flex-col pt-4 md:pt-6 md:min-h-screen">
        
        {/* Nav Item Helper */}
        {(() => {
          const NavItem = ({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button 
                onClick={() => setActiveTab(id)} 
                className={`w-full flex items-center justify-between px-6 py-3 font-semibold transition-all mb-1 ${isActive ? 'bg-linear-to-r from-primary-500 to-primary-700 text-white rounded-r-full mr-4 rounded-l-lg shadow-[0_4px_12px_rgba(61,90,128,0.3)]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </button>
            );
          };

          return (
            <nav className="w-full flex md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none flex-1 mt-4">
              <div className="px-6 mb-3 mt-2"><p className="text-[10px] font-bold text-gray-400 tracking-wider">PAGES</p></div>
              <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem id="appointment" icon={Calendar} label="Appointments" />
              <NavItem id="payment" icon={CreditCard} label="Payments" />
              
              <div className="px-6 mb-3 mt-6"><p className="text-[10px] font-bold text-gray-400 tracking-wider">MANAGEMENT</p></div>
              <NavItem id="patients" icon={Users} label="Patients" />
              <NavItem id="prescriptions" icon={FileText} label="Prescriptions" />
              <NavItem id="reports" icon={FileSignature} label="Lab Reports" />

              <div className="px-6 mb-3 mt-6"><p className="text-[10px] font-bold text-gray-400 tracking-wider">SETTINGS</p></div>
              <NavItem id="profile" icon={User} label="Profile" />
              <NavItem id="settings" icon={Settings} label="Settings" />
            </nav>
          );
        })()}

        {/* Logout */}
        <div className="w-full px-6 pb-8 mt-auto hidden md:block border-t border-[#F0F1F5] pt-4">
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-semibold transition-all w-full text-left cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-10 py-5 bg-[#F8F9FB]">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-11 pr-4 py-2.5 bg-white border border-[#F0F1F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-gray-600 font-medium"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-primary-600 transition-colors relative bg-white p-2.5 rounded-full shadow-sm border border-[#F0F1F5]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-gray-400 hover:text-primary-600 transition-colors bg-white p-2.5 rounded-full shadow-sm border border-[#F0F1F5]">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 overflow-hidden shrink-0">
                <img 
                  src={metrics.doctor?.images?.[0]?.url || "https://via.placeholder.com/150"} 
                  alt="Doctor" 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800">{metrics.doctor?.name || "Doctor Name"}</p>
                <p className="text-[11px] text-gray-400 font-semibold">{metrics.doctor?.qualification || "Medical Specialist"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-auto px-10 pb-10">
          
          {activeTab === 'dashboard' && (
            <>
              {/* Top Metrics Cards - Zippay Fintech Style */}
              <div className="mb-6 flex items-center justify-between">
                 <h1 className="text-2xl font-extrabold text-[#111827]">Overview</h1>
                 <button className="bg-white border border-[#F0F1F5] text-gray-600 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm">This Week</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Patient */}
                <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                         <Users className="w-4 h-4" />
                       </div>
                       <p className="text-gray-500 font-bold text-sm">Total Patients</p>
                    </div>
                    <span className="text-gray-400 text-xs font-semibold">ALL TIME</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{metrics.totalPatients}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">+12.5%</span>
                    <span className="text-gray-400 font-medium">Growth rate</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-blue-500"></div>
                </div>
                
                {/* Today Patient */}
                <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                         <User className="w-4 h-4" />
                       </div>
                       <p className="text-gray-500 font-bold text-sm">Today Patients</p>
                    </div>
                    <span className="text-gray-400 text-xs font-semibold">TODAY</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{metrics.todayAppointments}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">+5%</span>
                    <span className="text-gray-400 font-medium">From yesterday</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary-500 to-primary-700"></div>
                </div>

                {/* Today Appointments */}
                <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                         <Calendar className="w-4 h-4" />
                       </div>
                       <p className="text-gray-500 font-bold text-sm">Appointments</p>
                    </div>
                    <span className="text-gray-400 text-xs font-semibold">TODAY</span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{metrics.todayAppointments}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-purple-500 font-bold bg-purple-50 px-2 py-0.5 rounded text-xs">Scheduled</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-purple-400 to-purple-500"></div>
                </div>
              </div>

              {/* Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column 1: Today's Appointments (Wider) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                      <h3 className="text-gray-900 font-extrabold text-base flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Today's Appointments
                      </h3>
                      <button onClick={() => setActiveTab('appointment')} className="text-primary-600 hover:text-primary-700 text-xs font-bold hover:underline">See All</button>
                    </div>

                    <div className="space-y-4">
                      {metrics.recentAppointments && metrics.recentAppointments.length > 0 ? (
                        metrics.recentAppointments.map((app, i) => (
                          <div 
                            key={app._id} 
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 hover:bg-slate-50/50 rounded-2xl border border-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-xs bg-primary-50/50 shrink-0 flex items-center justify-center font-extrabold text-primary-600 text-base">
                                {app.userId?.image ? (
                                   <img src={app.userId.image} className="w-full h-full object-cover" alt="patient"/>
                                ) : (
                                   app.userId?.name?.charAt(0)
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{app.userId?.name}</p>
                                <p className="text-[11px] text-gray-400 font-semibold">{app.slotTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                {app.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500 text-sm font-medium">
                          No appointments scheduled for today.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Next Patient Details (Sidebar) */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                    <h3 className="text-gray-900 font-extrabold text-base border-b border-gray-50 pb-4 mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-500" />
                      Next Patient Profile
                    </h3>
                    
                    {metrics.recentAppointments && metrics.recentAppointments.length > 0 ? (
                      (() => {
                        const patient = metrics.recentAppointments[0].userId || {};
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white shadow-sm bg-primary-100 flex items-center justify-center font-extrabold text-primary-700 text-lg shrink-0">
                                 {patient.image ? (
                                   <img src={patient.image} className="w-full h-full object-cover" alt="patient" />
                                 ) : (
                                   patient.name?.charAt(0)
                                 )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-gray-900 text-sm truncate">{patient.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">ID: {patient.patientId || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DOB</p>
                                <p className="text-xs text-gray-800 font-bold mt-1">{patient.dob || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</p>
                                <p className="text-xs text-gray-800 font-bold mt-1">{patient.gender || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</p>
                                <p className="text-xs text-gray-800 font-bold mt-1">{patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Height</p>
                                <p className="text-xs text-gray-800 font-bold mt-1">{patient.height ? `${patient.height} cm` : 'N/A'}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">History & Allergies</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {patient.allergies && patient.allergies.length > 0 ? patient.allergies.map((a, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase">{a}</span>
                                )) : null}
                                {patient.medicalHistory && patient.medicalHistory.length > 0 ? patient.medicalHistory.map((h, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{h}</span>
                                )) : null}
                                {(!patient.allergies?.length && !patient.medicalHistory?.length) && (
                                  <span className="text-xs text-gray-500 italic">No medical history recorded.</span>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-6 font-medium">No upcoming patients today</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Appointments Tab Content */}
          {activeTab === 'appointment' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1A365D] mb-6">All Appointments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#EEF4FF] text-[#2B6CB0] rounded-lg">
                      <tr>
                        <th className="px-6 py-4 font-bold rounded-l-lg">Patient Name</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Time</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold rounded-r-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {metrics.recentAppointments && metrics.recentAppointments.length > 0 ? (
                        metrics.recentAppointments.map(app => (
                          <tr key={app._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-[#1A365D]">{app.userId?.name}</td>
                            <td className="px-6 py-4 text-gray-600">{app.slotDate}</td>
                            <td className="px-6 py-4 text-gray-600">{app.slotTime}</td>
                            <td className="px-6 py-4">
                               <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 app.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                 app.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                 app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                 'bg-primary-100 text-primary-700'}`}>
                                 {app.status || 'Pending'}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {(!app.status || app.status === 'Pending') && (
                                  <>
                                    <button 
                                      onClick={() => handleAppointmentAction(app._id, 'accept')}
                                      className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Accept"
                                    ><Check className="w-4 h-4"/></button>
                                    <button 
                                      onClick={() => handleAppointmentAction(app._id, 'reject')}
                                      className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject"
                                    ><X className="w-4 h-4"/></button>
                                  </>
                                )}
                                {app.status === 'Approved' && (
                                  <button 
                                      onClick={() => handleAppointmentAction(app._id, 'complete')}
                                      className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded hover:bg-blue-200"
                                  >Complete</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No appointments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* Prescriptions Tab Content */}
          {activeTab === 'prescriptions' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1A365D] mb-6">Create Prescription</h2>
                <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Select Patient</label>
                      <select 
                        required
                        value={prescriptionForm.patientId}
                        onChange={(e) => {
                          const selectedApp = metrics.recentAppointments.find(a => a.userId?._id === e.target.value);
                          setPrescriptionForm({
                            ...prescriptionForm, 
                            patientId: e.target.value,
                            appointmentId: selectedApp ? selectedApp._id : ''
                          });
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select Patient --</option>
                        {metrics.recentAppointments?.map(app => (
                          <option key={app._id} value={app.userId?._id}>{app.userId?.name} ({app.slotDate})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-600">Medicines</label>
                      <button 
                        type="button"
                        onClick={() => setPrescriptionForm({
                          ...prescriptionForm,
                          medicines: [...prescriptionForm.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
                        })}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Add Medicine
                      </button>
                    </div>
                    
                    {prescriptionForm.medicines.map((med, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 md:p-0 border border-gray-100 md:border-none rounded-xl bg-gray-50 md:bg-transparent">
                        <input 
                          type="text" placeholder="Medicine Name" required
                          value={med.name}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].name = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, medicines: newMeds });
                          }}
                          className="px-4 py-2 bg-white md:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <input 
                          type="text" placeholder="Dosage (e.g. 500mg)" required
                          value={med.dosage}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].dosage = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, medicines: newMeds });
                          }}
                          className="px-4 py-2 bg-white md:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <input 
                          type="text" placeholder="Freq (e.g. 1-0-1)" required
                          value={med.frequency}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].frequency = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, medicines: newMeds });
                          }}
                          className="px-4 py-2 bg-white md:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <input 
                          type="text" placeholder="Duration (e.g. 5 Days)" required
                          value={med.duration}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medicines];
                            newMeds[index].duration = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, medicines: newMeds });
                          }}
                          className="px-4 py-2 bg-white md:bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-600">Lab Tests (Optional)</label>
                      <button 
                        type="button"
                        onClick={() => setPrescriptionForm({
                          ...prescriptionForm,
                          labTests: [...prescriptionForm.labTests, { title: '', description: '' }]
                        })}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Add Test
                      </button>
                    </div>
                    {prescriptionForm.labTests.map((test, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select
                          value={test.title}
                          onChange={(e) => {
                            const newTests = [...prescriptionForm.labTests];
                            newTests[index].title = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, labTests: newTests });
                          }}
                          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Test Type</option>
                          <option value="Blood Test">Blood Test</option>
                          <option value="CBC Blood Test">CBC Blood Test</option>
                          <option value="Urine Test">Urine Test</option>
                          <option value="X-Ray">X-Ray</option>
                          <option value="MRI">MRI</option>
                          <option value="CT Scan">CT Scan</option>
                        </select>
                        <input 
                          type="text" placeholder="Description / Notes"
                          value={test.description}
                          onChange={(e) => {
                            const newTests = [...prescriptionForm.labTests];
                            newTests[index].description = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, labTests: newTests });
                          }}
                          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Special Instructions (Optional)</label>
                    <textarea 
                      rows="3"
                      value={prescriptionForm.instructions}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Take after meals"
                    ></textarea>
                  </div>

                  <button type="submit" className="px-8 py-3 bg-[#2B6CB0] text-white font-bold rounded-xl shadow-md hover:bg-[#1A365D] transition-colors">
                    Save Prescription
                  </button>
                </form>
             </div>
          )}

          {/* Patients Tab Content */}
          {activeTab === 'patients' && (
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1A365D] mb-6">My Patients</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from(new Set(metrics.recentAppointments?.map(a => a.userId?._id)))
                    .map(id => metrics.recentAppointments.find(a => a.userId?._id === id)?.userId)
                    .filter(Boolean)
                    .map((patient, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow bg-[#F8FAFC]">
                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 overflow-hidden border-4 border-white shadow-sm">
                          {patient.image ? <img src={patient.image} alt="Patient" className="w-full h-full object-cover" /> : patient.name?.charAt(0)}
                        </div>
                        <h3 className="font-bold text-[#1A365D] text-lg">{patient.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">{patient.email}</p>
                        <div className="flex gap-2 w-full mt-auto">
                          <button onClick={() => setSelectedPatientForHistory(patient)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">View History</button>
                          <button className="flex-1 bg-[#EEF4FF] text-[#2B6CB0] py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('prescriptions')}>Prescribe</button>
                        </div>
                      </div>
                  ))}
                  {(!metrics.recentAppointments || metrics.recentAppointments.length === 0) && (
                    <p className="text-gray-500 col-span-full text-center py-10">No patients found.</p>
                  )}
                </div>
             </div>
          )}

           {/* Profile Tab Content */}
          {activeTab === 'profile' && (
             <div className="space-y-6 max-w-4xl mx-auto">
               {/* Profile Card */}
               <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                 <h2 className="text-2xl font-bold text-[#1A365D] mb-8 border-b pb-4">Doctor Profile</h2>
                 {metrics.doctor ? (
                   <div className="space-y-6">
                     <div className="flex items-center gap-6 mb-8">
                       <div className="w-24 h-24 rounded-full border-4 border-blue-100 overflow-hidden bg-gray-50">
                         {metrics.doctor.images?.[0]?.url ? (
                           <img src={metrics.doctor.images[0].url} alt="Doctor" className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-12 h-12 m-auto mt-5 text-gray-400" />
                         )}
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-primary-800">{metrics.doctor.name}</h3>
                         <p className="text-primary-500 font-medium">{metrics.doctor.qualification}</p>
                         <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                           {metrics.doctor.speciality}
                         </span>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                       <div>
                         <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                         <p className="text-sm text-gray-900 font-medium">{metrics.doctor.email}</p>
                       </div>
                       <div>
                         <p className="text-xs text-gray-500 font-semibold mb-1">Experience</p>
                         <p className="text-sm text-gray-900 font-medium">{metrics.doctor.experience} Years</p>
                       </div>
                       <div>
                         <p className="text-xs text-gray-500 font-semibold mb-1">Consultation Fee</p>
                         <p className="text-sm text-gray-900 font-medium">₹500{metrics.doctor.fees}</p>
                       </div>
                       <div>
                         <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                         <p className="text-sm text-green-600 font-bold">Active</p>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <p className="text-gray-500 text-center py-10">Loading profile...</p>
                 )}
               </div>

               {/* ── Manage Unavailable Slots Card ── */}
               <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                 <div className="flex items-center justify-between mb-6 border-b pb-4">
                   <div>
                     <h2 className="text-xl font-bold text-[#1A365D]">Manage Unavailable Slots</h2>
                     <p className="text-xs text-gray-400 mt-0.5 font-medium">Block time slots so patients cannot book during that time</p>
                   </div>
                   {metrics.doctor && (
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                       metrics.doctor.availability !== false
                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                         : 'bg-red-50 text-red-600 border-red-200'
                     }`}>
                       <span className={`w-2 h-2 rounded-full animate-pulse ${
                         metrics.doctor.availability !== false ? 'bg-emerald-500' : 'bg-red-500'
                       }`}></span>
                       {metrics.doctor.availability !== false ? 'Currently Available' : 'Unavailable (Auto)'}
                     </span>
                   )}
                 </div>

                 {/* Date Picker */}
                 <div className="mb-5">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date to Manage</label>
                   <input
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     value={docSlotsDate}
                     onChange={e => handleDocSlotsDateChange(e.target.value)}
                     className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
                   />
                 </div>

                 {/* Time Slots Grid */}
                 {docSlotsDate && (
                   <div className="mb-5">
                     <div className="flex items-center justify-between mb-3">
                       <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                         <Calendar className="w-4 h-4 text-blue-500" />
                         Click slots to block / unblock
                       </label>
                       <div className="flex gap-2">
                         <button onClick={() => setDocBlockedTimes([...ALL_SLOTS])} className="text-[10px] font-bold text-red-500 hover:underline">Block All</button>
                         <span className="text-gray-300">|</span>
                         <button onClick={() => setDocBlockedTimes([])} className="text-[10px] font-bold text-emerald-600 hover:underline">Clear All</button>
                       </div>
                     </div>
                     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                       {ALL_SLOTS.map(slot => {
                         const isBlocked = docBlockedTimes.includes(slot);
                         return (
                           <button
                             key={slot}
                             onClick={() => toggleDocBlockedTime(slot)}
                             className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                               isBlocked
                                 ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                 : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                             }`}
                           >
                             {isBlocked ? '✕ ' : ''}{slot}
                           </button>
                         );
                       })}
                     </div>
                     {docBlockedTimes.length > 0 && (
                       <p className="mt-3 text-xs text-red-500 font-semibold">
                         {docBlockedTimes.length} slot{docBlockedTimes.length > 1 ? 's' : ''} will be hidden from patients on {new Date(docSlotsDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                     )}
                   </div>
                 )}

                 {/* Save Button & Feedback */}
                 {docSlotsDate && (
                   <div className="flex items-center gap-4 mb-6">
                     <button
                       onClick={handleDocSaveSlots}
                       disabled={docSlotsSaving}
                       className="px-6 py-2.5 text-sm font-bold text-white bg-[#2B6CB0] rounded-xl hover:bg-[#1A365D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                     >
                       {docSlotsSaving ? 'Saving...' : 'Save Changes'}
                     </button>
                     {docSlotsSaveMsg === 'success' && (
                       <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                         <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                         Saved successfully!
                       </span>
                     )}
                     {docSlotsSaveMsg === 'error' && (
                       <span className="text-xs font-bold text-red-500">
                         {!docSlotsDate ? 'Please select a date first.' : 'Failed to save. Try again.'}
                       </span>
                     )}
                   </div>
                 )}

                 {/* Currently Blocked Dates Summary */}
                 {docUnavailableSlots.length > 0 && (
                   <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Currently Blocked Dates</p>
                     <div className="space-y-2">
                       {docUnavailableSlots.map(s => (
                         <div key={s.date} className="flex items-start justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
                           <span className="text-xs font-semibold text-gray-700 shrink-0 mt-0.5 w-14">
                             {new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                           </span>
                           <div className="flex flex-wrap gap-1 flex-1">
                             {s.times.map(t => (
                               <span key={t} className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-medium">{t}</span>
                             ))}
                           </div>
                           <button
                             onClick={() => handleDocRemoveDate(s.date)}
                             title="Remove all blocks for this date"
                             className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold"
                           >
                             ×
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {docUnavailableSlots.length === 0 && (
                   <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                     <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                     <p className="text-xs text-emerald-700 font-semibold">No slots blocked — all times are available for patients to book.</p>
                   </div>
                 )}
               </div>
             </div>
          )}

          {activeTab === 'settings' && (
             <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 max-w-3xl font-sans text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 text-[#3182CE] rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage your personal and clinic information</p>
                  </div>
                </div>

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Speciality / Department</label>
                      <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800" value={settingsForm.speciality} onChange={e => setSettingsForm({...settingsForm, speciality: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                      <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Consultation Fee (₹)</label>
                      <input type="number" required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800" value={settingsForm.consultationFee} onChange={e => setSettingsForm({...settingsForm, consultationFee: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qualification</label>
                      <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800" value={settingsForm.qualification} onChange={e => setSettingsForm({...settingsForm, qualification: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Change Password (optional)</label>
                      <input type="password" placeholder="Leave blank to keep current" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-850" value={settingsForm.password} onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Address</label>
                      <textarea required className="w-full px-4 py-2 border border-gray-200 rounded-lg h-20 text-sm text-gray-800" value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">About / Bio</label>
                      <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg h-20 text-sm text-gray-800" value={settingsForm.about} onChange={e => setSettingsForm({...settingsForm, about: e.target.value})} />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="avail-check" className="w-4 h-4 text-primary-650 rounded cursor-pointer" checked={settingsForm.availability} onChange={e => setSettingsForm({...settingsForm, availability: e.target.checked})} />
                      <label htmlFor="avail-check" className="text-xs font-bold text-gray-650 cursor-pointer">Mark profile as active and available to take appointments</label>
                    </div>
                  </div>

                  <button type="submit" className="bg-[#2B6CB0] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#1A365D] transition-colors cursor-pointer text-sm shadow-sm">
                    Save Profile Settings
                  </button>
                </form>
             </div>
          )}

          {activeTab === 'reports' && (
             <DoctorReports token={token} doctorId={metrics.doctor?._id} />
          )}

          {activeTab === 'payment' && (() => {
            const doctorFee = parseInt(String(metrics.doctor?.fees || "500").replace(/\D/g, '')) || 500;
            const allAppointments = metrics.allAppointments || [];
            const paidAppointments = allAppointments.filter(app => app.isPaid);
            const unpaidAppointments = allAppointments.filter(app => !app.isPaid && app.status !== 'Cancelled' && app.status !== 'Rejected');
            
            const totalEarnings = paidAppointments.reduce((sum, app) => sum + (app.consultationFee || doctorFee), 0);
            const pendingEarnings = unpaidAppointments.reduce((sum, app) => sum + (app.consultationFee || doctorFee), 0);

            return (
              <div className="flex flex-col gap-8 font-sans">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Earnings Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                      ₹
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">₹{totalEarnings.toLocaleString()}</h3>
                      <p className="text-[11px] text-slate-450 mt-0.5">Received from {paidAppointments.length} visits</p>
                    </div>
                  </div>

                  {/* Paid Appointments */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Consultations</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">{paidAppointments.length}</h3>
                      <p className="text-[11px] text-slate-450 mt-0.5">Successfully completed transactions</p>
                    </div>
                  </div>

                  {/* Pending Payments */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
                      ⏱
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Payments</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">₹{pendingEarnings.toLocaleString()}</h3>
                      <p className="text-[11px] text-slate-450 mt-0.5">From {unpaidAppointments.length} upcoming visits</p>
                    </div>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Billing & Transactions</h2>
                    <span className="bg-slate-50 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full border border-slate-100">
                      Total: {allAppointments.length} records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#EEF4FF] text-[#2B6CB0]">
                          <th className="px-6 py-4 font-bold rounded-l-2xl text-sm">Patient</th>
                          <th className="px-6 py-4 font-bold text-sm">Date & Time</th>
                          <th className="px-6 py-4 font-bold text-sm">Consultation Fee</th>
                          <th className="px-6 py-4 font-bold text-sm">Payment Method</th>
                          <th className="px-6 py-4 font-bold text-sm">Status</th>
                          <th className="px-6 py-4 font-bold rounded-r-2xl text-sm">Transaction Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allAppointments.length > 0 ? (
                          allAppointments.map((app) => (
                            <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4.5">
                                <p className="font-bold text-slate-800 text-[14px]">{app.userId?.name || "Anonymous Patient"}</p>
                                <p className="text-[11px] text-slate-450 mt-0.5">{app.userId?.email || "No email provided"}</p>
                              </td>
                              <td className="px-6 py-4.5">
                                <p className="text-slate-700 text-sm font-semibold">{app.slotDate}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{app.slotTime}</p>
                              </td>
                              <td className="px-6 py-4.5">
                                <p className="text-slate-850 font-extrabold text-sm">₹{app.consultationFee || doctorFee}</p>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                  app.paymentMethod === 'Online'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : app.paymentMethod === 'Cash'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                                }`}>
                                  {app.paymentMethod || 'Not selected'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  app.isPaid 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                                    : app.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-150'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${app.isPaid ? 'bg-emerald-500' : app.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                  {app.isPaid ? 'Paid' : app.status === 'Cancelled' ? 'Cancelled' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                {app.paymentId ? (
                                  <span className="font-mono text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                                    {app.paymentId}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium cursor-default italic">
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-16 text-slate-450 font-medium leading-relaxed">
                              No billing or transaction records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

         </div>
       </div>

       {selectedPatientForHistory && (
         <PatientHistoryModal 
           patient={selectedPatientForHistory} 
           token={token} 
           onClose={() => setSelectedPatientForHistory(null)} 
         />
       )}
     </div>
   );
};

export default DoctorDashboard;
