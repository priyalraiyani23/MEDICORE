import React, { useEffect, useState } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { useAppContext } from '../../../context/AppContext';
import { Users, UserPlus, LogOut, Edit, Trash2, FlaskConical, User, Activity, Receipt, Stethoscope, ChevronRight, Search, Bell, MessageSquare, LayoutDashboard, ToggleLeft, ToggleRight, Calendar, X, Clock, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LaboratoryView from './LaboratoryView';
import PatientManagementView from './PatientManagementView';
import AdminMessagesView from './AdminMessagesView';
import BillingView from './BillingView';
import StaffManagementView from './StaffManagementView';
import PharmacyView from './PharmacyView';

const AdminDashboard = () => {
  const { token, role, logout } = usePortalAuth();
  const { fetchDoctors: fetchGlobalDoctors } = useAppContext();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);
  // Slots modal state
  const [slotsModal, setSlotsModal] = useState(null);
  const [slotsDate, setSlotsDate] = useState('');
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [slotsSaving, setSlotsSaving] = useState(false);
  const [slotsSaveMsg, setSlotsSaveMsg] = useState(''); // '' | 'success' | 'error'
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    pendingBills: 0,
    lowStock: 0,
    appointmentsToday: 0,
    labPending: 0
  });

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', gender: 'Male', experience: '1 Year',
    speciality: 'General physician', phone: '', address: '',
    qualification: 'MBBS', about: '', consultationFee: '500',
    availability: true, status: 'Active',
    department: 'General', dob: '', availableDays: '', availableTimeSlots: ''
  });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDoctors(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const [revenue, setRevenue] = useState(0);

  const fetchRevenue = async () => {
    try {
      const res = await fetch('/api/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.bills) {
        const total = data.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        setRevenue(total);
        const pending = data.bills.filter(b => b.status === 'unpaid').length;
        setDashboardStats(prev => ({ ...prev, pendingBills: pending }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExtraStats = async () => {
    try {
      // Patients
      const pRes = await fetch('/api/admin/patients', { headers: { 'Authorization': `Bearer ${token}` } });
      const pData = await pRes.json();
      if (pData.success) setDashboardStats(prev => ({ ...prev, totalPatients: pData.data.length }));

      // Medicines
      const mRes = await fetch('/api/medicines', { headers: { 'Authorization': `Bearer ${token}` } });
      const mData = await mRes.json();
      if (mData.success) setDashboardStats(prev => ({ ...prev, lowStock: mData.medicines.filter(m => m.stock <= 10).length }));

      // Appointments
      const aRes = await fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } });
      const aData = await aRes.json();
      if (aData.success) {
        const today = new Date().toISOString().split('T')[0];
        setDashboardStats(prev => ({ ...prev, appointmentsToday: aData.appointments.filter(a => a.date === today).length }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/doctor-admin/login');
      return;
    }
    fetchDoctors();
    fetchRevenue();
    fetchExtraStats();
  }, [token, role, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const res = await fetch(`/api/admin/doctor/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
        fetchGlobalDoctors();
      }
      else alert(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await fetch(`/api/admin/doctor/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDoctors(prev => prev.map(d => d._id === id ? { ...d, availability: data.availability } : d));
        fetchGlobalDoctors();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // All possible 30-min slots 10 AM - 8 PM
  const ALL_SLOTS = (() => {
    const slots = [];
    for (let h = 10; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const date = new Date(2000, 0, 1, h, m);
        slots.push(date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      }
    }
    return slots;
  })();

  const openSlotsModal = (doc) => {
    setSlotsModal({ docId: doc._id, docName: doc.name, unavailableSlots: doc.unavailableSlots || [] });
    setSlotsDate('');
    setBlockedTimes([]);
  };

  const handleSlotsDateChange = (date) => {
    setSlotsDate(date);
    if (!date || !slotsModal) { setBlockedTimes([]); return; }
    const existing = slotsModal.unavailableSlots.find(s => s.date === date);
    setBlockedTimes(existing ? existing.times : []);
  };

  const toggleBlockedTime = (time) => {
    setBlockedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const handleSaveSlots = async () => {
    if (!slotsDate) { setSlotsSaveMsg('error'); return; }
    setSlotsSaving(true);
    setSlotsSaveMsg('');
    try {
      const res = await fetch(`/api/admin/doctor/${slotsModal.docId}/unavailable-slots`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: slotsDate, times: blockedTimes })
      });
      const data = await res.json();
      if (data.success) {
        setSlotsModal(prev => ({ ...prev, unavailableSlots: data.unavailableSlots }));
        // Also sync availability if backend auto-changed it
        setDoctors(prev => prev.map(d => d._id === slotsModal.docId
          ? { ...d, unavailableSlots: data.unavailableSlots, ...(data.availability !== undefined && { availability: data.availability }) }
          : d
        ));
        fetchGlobalDoctors();
        setSlotsSaveMsg('success');
        // Auto-close modal after 1 second
        setTimeout(() => { setSlotsModal(null); setSlotsSaveMsg(''); }, 1000);
      } else {
        setSlotsSaveMsg('error');
      }
    } catch (error) {
      console.error(error);
      setSlotsSaveMsg('error');
    } finally {
      setSlotsSaving(false);
    }
  };

  const openEdit = (doc) => {

    setFormData({
      name: doc.name || '', email: doc.email || '', password: '', gender: doc.gender || '', experience: doc.experience || '',
      speciality: doc.speciality || '', phone: doc.phone || '', address: doc.address || '',
      qualification: doc.qualification || '', about: doc.about || '', consultationFee: doc.consultationFee || '',
      availability: doc.availability ?? true, status: doc.status || '',
      department: doc.department || 'General', dob: doc.dob ? new Date(doc.dob).toISOString().split('T')[0] : '',
      availableDays: doc.availableDays ? doc.availableDays.join(', ') : '',
      availableTimeSlots: doc.availableTimeSlots ? doc.availableTimeSlots.join(', ') : ''
    });
    setEditingId(doc._id);
    setImage(null);
    setExistingImage(doc.image || doc.images?.[0]?.url || null);
    setView('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'password' && !formData.password) return; // exclude blank password
        fd.append(key, formData[key]);
      });
      if (image) {
        fd.append('images', image);
      }

      const res = await fetch(`/api/admin/doctor/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Doctor updated successfully");
        setView('list');
        fetchDoctors();
        fetchGlobalDoctors();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (image) {
        fd.append('images', image);
      }

      const res = await fetch('/api/doctor/add-doctor', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert("Doctor added successfully");
        setView('list');
        fetchDoctors();
        fetchGlobalDoctors(); // Update the main website's doctor list
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

  return (
    <>
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-[#F8F9FB] pt-4 md:pt-6">
      {/* Sidebar - Matching Zippay Fintech Reference Image */}
      <div className="w-full md:w-72 bg-white border-r border-[#F0F1F5] shrink-0 flex flex-col pt-4 md:pt-6 md:min-h-screen">
        


        {/* Nav Item Helper */}
        {(() => {
          const NavItem = ({ id, icon: Icon, label, onClickAction }) => {
            const isActive = view === id;
            return (
              <button 
                onClick={onClickAction || (() => setView(id))} 
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
              <div className="px-6 mb-3 mt-2"><p className="text-[10px] font-bold text-gray-400 tracking-wider">MANAGEMENT</p></div>
              <NavItem id="list" icon={Users} label="Doctors List" />
              <NavItem id="add" icon={UserPlus} label="Add Doctor" onClickAction={() => {
                setView('add');
                setFormData({
                  name: '', email: '', password: '', gender: 'Male', experience: '1 Year',
                  speciality: 'General physician', phone: '', address: '',
                  qualification: 'MBBS', about: '', consultationFee: '500',
                  availability: true, status: 'Active'
                });
                setImage(null);
              }} />
              <NavItem id="patients" icon={User} label="Patients" />
              <NavItem id="staff" icon={Users} label="Manage Staff" />
              
              <div className="px-6 mb-3 mt-6"><p className="text-[10px] font-bold text-gray-400 tracking-wider">FACILITIES</p></div>
              <NavItem id="laboratory" icon={FlaskConical} label="Laboratory" />
              <NavItem id="pharmacy" icon={Pill} label="Pharmacy" />
              <NavItem id="billing" icon={Receipt} label="Billing & Payments" />
              
              <div className="px-6 mb-3 mt-6"><p className="text-[10px] font-bold text-gray-400 tracking-wider">COMMUNICATION</p></div>
              <NavItem id="messages" icon={MessageSquare} label="Patient Messages" />
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
              <div className="w-10 h-10 rounded-full bg-primary-500/10 overflow-hidden shrink-0 flex items-center justify-center text-primary-600">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800">System Admin</p>
                <p className="text-[11px] text-gray-400 font-semibold">MediCore Owner</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-10 pb-10">
        {view === 'laboratory' && <LaboratoryView />}
        {view === 'pharmacy' && <PharmacyView />}
        {view === 'patients' && <PatientManagementView />}
        {view === 'messages' && <AdminMessagesView />}
        {view === 'billing' && <BillingView />}
        {view === 'staff' && <StaffManagementView />}

        {view === 'list' ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
               <h1 className="text-2xl font-extrabold text-[#111827]">Overview</h1>
               <button className="bg-white border border-[#F0F1F5] text-gray-600 font-semibold text-xs px-4 py-2 rounded-lg shadow-sm">This Month</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                       <span className="text-lg font-bold">₹</span>
                     </div>
                     <p className="text-gray-500 font-bold text-xs">Total Revenue</p>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">₹{revenue}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-green-400 to-green-500"></div>
              </div>
              
              {/* Total Patients */}
              <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                       <User className="w-4 h-4" />
                     </div>
                     <p className="text-gray-500 font-bold text-xs">Total Patients</p>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{dashboardStats.totalPatients}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-blue-500"></div>
              </div>

              {/* Pending Bills */}
              <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                       <Receipt className="w-4 h-4" />
                     </div>
                     <p className="text-gray-500 font-bold text-xs">Pending Bills</p>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{dashboardStats.pendingBills}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary-500 to-primary-700"></div>
              </div>

              {/* Low Stock Meds */}
              <div className="bg-white p-6 rounded-[20px] border border-[#F0F1F5] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                       <Activity className="w-4 h-4" />
                     </div>
                     <p className="text-gray-500 font-bold text-xs">Low Stock Meds</p>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{dashboardStats.lowStock}</h3>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-red-400 to-red-500"></div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[#1A365D] mb-6">All Doctors</h1>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Speciality</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Availability</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map(doc => (
                    <tr key={doc._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={doc.image || doc.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                          <p className="font-semibold text-primary-800">{doc.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{doc.speciality}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {doc.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <button
                           onClick={() => handleToggleAvailability(doc._id)}
                           title={doc.availability ? 'Click to mark Unavailable' : 'Click to mark Available'}
                           className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                             doc.availability
                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                               : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                           }`}
                         >
                           {doc.availability
                             ? <><ToggleRight className="w-4 h-4" /> Available</>
                             : <><ToggleLeft className="w-4 h-4" /> Unavailable</>}
                         </button>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                         <button onClick={() => openEdit(doc)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit Doctor">
                           <Edit className="w-5 h-5" />
                         </button>
                         <button onClick={() => openSlotsModal(doc)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg" title="Manage Unavailable Slots">
                           <Calendar className="w-5 h-5" />
                         </button>
                         <button onClick={() => handleDelete(doc._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Doctor">
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Manage Slots Modal would go here */}
          </div>
        ) : view === 'add' ? (
          <div>
            <h1 className="text-2xl font-bold text-primary-800 mb-6">Add New Doctor</h1>
            <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Doctor Image</label>
                <div className="flex items-center gap-4">
                  <label htmlFor="doc-image" className="cursor-pointer">
                    <div className="w-20 h-20 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                      {image ? (
                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Click to Add</span>
                      )}
                    </div>
                  </label>
                  <input id="doc-image" hidden type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Name</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" required className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Experience</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Speciality</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.speciality} onChange={e => setFormData({ ...formData, speciality: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Qualification</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Consultation Fee</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.consultationFee} onChange={e => setFormData({ ...formData, consultationFee: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Address</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input type="date" required className="w-full px-4 py-2 border rounded-lg" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Available Days (comma separated)</label><input placeholder="Monday, Wednesday" className="w-full px-4 py-2 border rounded-lg" value={formData.availableDays} onChange={e => setFormData({ ...formData, availableDays: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Available Time Slots (comma separated)</label><input placeholder="10:00 AM - 12:00 PM, 02:00 PM - 04:00 PM" className="w-full px-4 py-2 border rounded-lg" value={formData.availableTimeSlots} onChange={e => setFormData({ ...formData, availableTimeSlots: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">About</label><textarea className="w-full px-4 py-2 border rounded-lg" value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })}></textarea></div>
              </div>
              <button type="submit" className="mt-8 bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700">Save Doctor</button>
            </form>
          </div>
        ) : view === 'edit' ? (
          <div>
            <h1 className="text-2xl font-bold text-primary-800 mb-6">Edit Doctor Details</h1>
            <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Doctor Image</label>
                <div className="flex items-center gap-4">
                  <label htmlFor="edit-doc-image" className="cursor-pointer">
                    <div className="w-20 h-20 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                      {image ? (
                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                      ) : existingImage ? (
                        <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Click to Add</span>
                      )}
                    </div>
                  </label>
                  <input id="edit-doc-image" hidden type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Name</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Password (Leave blank to keep same)</label><input type="password" className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Experience</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Speciality</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.speciality} onChange={e => setFormData({ ...formData, speciality: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Qualification</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Consultation Fee</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.consultationFee} onChange={e => setFormData({ ...formData, consultationFee: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Address</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label><input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Available Days (comma separated)</label><input placeholder="Monday, Wednesday" className="w-full px-4 py-2 border rounded-lg" value={formData.availableDays} onChange={e => setFormData({ ...formData, availableDays: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Available Time Slots (comma separated)</label><input placeholder="10:00 AM - 12:00 PM, 02:00 PM - 04:00 PM" className="w-full px-4 py-2 border rounded-lg" value={formData.availableTimeSlots} onChange={e => setFormData({ ...formData, availableTimeSlots: e.target.value })} /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">About</label><textarea className="w-full px-4 py-2 border rounded-lg" value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })}></textarea></div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="submit" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700">Update Doctor</button>
                <button type="button" onClick={() => setView('list')} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        ) : null}
        </div>
      </div>
    </div>

    {/* ── Manage Unavailable Slots Modal ── */}
    {slotsModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Manage Unavailable Slots</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dr. {slotsModal.docName}</p>
            </div>
            <button onClick={() => setSlotsModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={slotsDate}
                onChange={e => handleSlotsDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all"
              />
            </div>

            {/* Time Slots Grid */}
            {slotsDate && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Select Times to Block
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBlockedTimes(ALL_SLOTS)}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >Block All</button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setBlockedTimes([])}
                      className="text-[10px] font-bold text-emerald-600 hover:underline"
                    >Clear All</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SLOTS.map(slot => {
                    const isBlocked = blockedTimes.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleBlockedTime(slot)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                          isBlocked
                            ? 'bg-red-500 text-white border-red-500 shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                        }`}
                      >
                        {isBlocked ? '✕ ' : ''}{slot}
                      </button>
                    );
                  })}
                </div>
                {blockedTimes.length > 0 && (
                  <p className="mt-3 text-xs text-red-500 font-semibold">
                    {blockedTimes.length} slot{blockedTimes.length > 1 ? 's' : ''} will be hidden from patients on {new Date(slotsDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Existing Blocked Dates Summary */}
            {slotsModal.unavailableSlots.length > 0 && (
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Currently Blocked Dates</p>
                <div className="space-y-2">
                  {slotsModal.unavailableSlots.map(s => (
                    <div key={s.date} className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700 shrink-0 mt-0.5">
                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {s.times.map(t => (
                          <span key={t} className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-medium">{t}</span>
                        ))}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/doctor/${slotsModal.docId}/unavailable-slots`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ date: s.date, times: [] })
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSlotsModal(prev => ({ ...prev, unavailableSlots: data.unavailableSlots }));
                              setDoctors(prev => prev.map(d => d._id === slotsModal.docId
                                ? { ...d, unavailableSlots: data.unavailableSlots, ...(data.availability !== undefined && { availability: data.availability }) }
                                : d
                              ));
                              fetchGlobalDoctors();
                            }
                          } catch (e) { console.error(e); }
                        }}
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 justify-between">
            {/* Feedback message */}
            <div className="flex-1">
              {slotsSaveMsg === 'success' && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                  Saved! Closing...
                </span>
              )}
              {slotsSaveMsg === 'error' && (
                <span className="text-xs font-bold text-red-500">
                  {!slotsDate ? 'Please select a date first.' : 'Failed to save. Try again.'}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setSlotsModal(null); setSlotsSaveMsg(''); }}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveSlots}
                disabled={slotsSaving}
                className="px-6 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {slotsSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminDashboard;
