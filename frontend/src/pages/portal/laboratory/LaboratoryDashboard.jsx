import React, { useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, LogOut, ChevronRight, Bell } from 'lucide-react';
import LaboratoryView from '../admin/LaboratoryView';

const LaboratoryDashboard = () => {
  const { token, role, logout } = usePortalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || role !== 'laboratory') {
      navigate('/doctor-admin/login');
    }
  }, [token, role, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/doctor-admin/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-[#F8F9FB] pt-4 md:pt-6 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white border-r border-[#F0F1F5] shrink-0 flex flex-col pt-4 md:pt-6 md:min-h-screen">


        {/* Navigation */}
        <nav className="w-full flex md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none flex-1 mt-4">
          <div className="px-6 mb-3 mt-2">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider">LAB TASKS</p>
          </div>
          <button className="w-full flex items-center justify-between px-6 py-3 font-semibold transition-all mb-1 bg-linear-to-r from-primary-500 to-primary-700 text-white rounded-r-full mr-4 rounded-l-lg shadow-[0_4px_12px_rgba(61,90,128,0.3)] cursor-default">
            <div className="flex items-center gap-4">
              <FlaskConical className="w-5 h-5" />
              <span className="text-sm">Manage Lab Tests</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </nav>

        {/* Logout */}
        <div className="w-full px-6 pb-8 mt-auto hidden md:block border-t border-[#F0F1F5] pt-4">
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-xl font-semibold transition-all w-full text-left cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center px-10 py-5 bg-[#F8F9FB] border-b border-[#F0F1F5]">
          <h1 className="text-lg font-bold text-slate-800">MediCore Lab Management</h1>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-blue-600 transition-colors relative bg-white p-2.5 rounded-full shadow-sm border border-[#F0F1F5]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden shrink-0 flex items-center justify-center text-blue-600 font-bold">
                LB
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800">Lab Technician</p>
                <p className="text-[11px] text-gray-450 font-semibold uppercase">Staff Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Lab Subview */}
        <div className="flex-1 overflow-auto">
          <LaboratoryView />
        </div>
      </div>
    </div>
  );
};

export default LaboratoryDashboard;
