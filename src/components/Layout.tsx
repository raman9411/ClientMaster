import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 mr-3">
              <span className="text-white text-lg font-black tracking-tighter">C</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight truncate">ClientMaster</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
