import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { Users, Edit, Trash2, UserPlus, Key } from 'lucide-react';

const StaffManagementView = () => {
  const { token } = usePortalAuth();
  const [staff, setStaff] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'laboratory', phone: '', address: '', status: 'Active'
  });

  useEffect(() => {
    if (view === 'list') {
      fetchStaff();
    }
  }, [view]);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff member deleted successfully");
        fetchStaff();
      } else {
        alert(data.message || "Failed to delete staff");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (s) => {
    setFormData({
      name: s.name || '',
      email: s.email || '',
      password: '', // leave empty to not update
      role: s.role || 'laboratory',
      phone: s.phone || '',
      address: s.address || '',
      status: s.status || 'Active'
    });
    setEditingId(s._id);
    setView('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (view === 'edit' && !payload.password) {
        delete payload.password; // Do not overwrite with blank
      }

      const endpoint = view === 'add' ? '/api/admin/staff' : `/api/admin/staff/${editingId}`;
      const method = view === 'add' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Staff member ${view === 'add' ? 'added' : 'updated'} successfully`);
        setView('list');
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-800">
          {view === 'list' ? 'Staff Directory' : view === 'add' ? 'Add New Staff' : 'Edit Staff Details'}
        </h1>
        {view === 'list' && (
          <button onClick={() => {
            setView('add');
            setFormData({ name: '', email: '', password: '', role: 'laboratory', phone: '', address: '', status: 'Active' });
          }} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2B405E] self-start md:self-auto cursor-pointer">
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map(s => (
                <tr key={s._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-primary-850">
                    {s.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {s.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    <p>Phone: {s.phone || 'N/A'}</p>
                    <p>Email: {s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${s.status === 'Active' ? 'bg-green-105 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">No staff members found. Add some above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl font-sans">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input required className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <input 
                type="text" 
                required={view === 'add'} 
                placeholder={view === 'edit' ? 'Leave blank to keep current' : 'Enter login password'} 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System Role</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="laboratory">Laboratory Staff</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residential Address</label>
              <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg h-20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button type="submit" className="bg-primary-500 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-primary-700 cursor-pointer">Save Staff Member</button>
            <button type="button" onClick={() => setView('list')} className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-bold hover:bg-gray-300 cursor-pointer">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StaffManagementView;
