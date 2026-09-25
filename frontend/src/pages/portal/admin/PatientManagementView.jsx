import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { User, Edit, Trash2, UserPlus, FileText } from 'lucide-react';

const PatientManagementView = () => {
  const { token } = usePortalAuth();
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '',
    gender: 'Not Selected', dob: '', age: '', bloodGroup: '',
    medicalHistory: '', allergies: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchPatients();
    }
  }, [view]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const res = await fetch(`/api/admin/patient/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchPatients();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (p) => {
    setFormData({
      name: p.name || '', email: p.email || '', password: '', phone: p.phone || '', address: p.address || '',
      gender: p.gender || 'Not Selected', dob: p.dob || '', age: p.age || '', bloodGroup: p.bloodGroup || '',
      medicalHistory: p.medicalHistory ? p.medicalHistory.join(', ') : '',
      allergies: p.allergies ? p.allergies.join(', ') : ''
    });
    setEditingId(p._id);
    setImage(null);
    setView('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'password' && !formData.password) return; // ignore blank password on edit
        fd.append(key, formData[key]);
      });
      if (image) fd.append('image', image);

      const endpoint = view === 'add' ? '/api/admin/patient' : `/api/admin/patient/${editingId}`;
      const method = view === 'add' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        alert(`Patient ${view === 'add' ? 'added' : 'updated'} successfully`);
        setView('list');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-800">
          {view === 'list' ? 'Patient Management' : view === 'add' ? 'Add Patient' : 'Edit Patient'}
        </h1>
        {view === 'list' && (
          <button onClick={() => {
            setView('add');
            setFormData({
              name: '', email: '', password: '', phone: '', address: '',
              gender: 'Not Selected', dob: '', age: '', bloodGroup: '',
              medicalHistory: '', allergies: ''
            });
          }} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2B405E] self-start md:self-auto">
            <UserPlus className="w-4 h-4" /> Add Patient
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Blood Group</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full rounded-full object-cover"/> : p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-primary-800">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.age || '?'} Yrs • {p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p>{p.phone}</p>
                    <p className="text-xs">{p.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">{p.bloodGroup || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Patient Image</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-1">Name</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Password</label><input type={view === 'add' ? 'password' : 'text'} required={view === 'add'} placeholder={view === 'edit' ? 'Leave blank to keep current' : ''} className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select className="w-full px-4 py-2 border rounded-lg" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Age</label><input type="number" className="w-full px-4 py-2 border rounded-lg" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Blood Group</label><input className="w-full px-4 py-2 border rounded-lg" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Address</label><textarea className="w-full px-4 py-2 border rounded-lg" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Medical History (comma separated)</label><textarea className="w-full px-4 py-2 border rounded-lg" value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Allergies (comma separated)</label><textarea className="w-full px-4 py-2 border rounded-lg" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} /></div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700">Save Patient</button>
            <button type="button" onClick={() => setView('list')} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientManagementView;
