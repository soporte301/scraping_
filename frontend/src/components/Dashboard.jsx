import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import LinksManager from './LinksManager';
import ScheduleManager from './ScheduleManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Scraper Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Manage Links & Schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-slate-600">
            Welcome, <span className="font-bold text-slate-800">{username}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors focus:ring-2 focus:ring-slate-300"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative mt-4">
        {/* Links Column */}
        <div className="lg:col-span-2 space-y-6">
          <LinksManager />
        </div>

        {/* Configurations / Schedule Column */}
        <div className="space-y-6 lg:sticky top-28">
          <ScheduleManager />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
