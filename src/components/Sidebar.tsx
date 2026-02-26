import { Link, useLocation } from "react-router-dom";
import { Users, CheckSquare, LayoutDashboard, Settings, LogOut, ShieldCheck, BookOpen, X } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ['admin', 'employee', 'client', 'auditor'] },
  { name: "Client Master", href: "/clients", icon: Users, roles: ['admin'] },
  { name: "Task Creation", href: "/tasks", icon: CheckSquare, roles: ['admin'] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ['admin', 'employee', 'client', 'auditor'] },
  { name: "Documentation", href: "/about", icon: BookOpen, roles: ['admin', 'employee', 'client', 'auditor'] },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r border-slate-200 shadow-[2px_0_15px_rgba(0,0,0,0.03)] z-20">
      <div className="flex items-center justify-between lg:justify-center h-20 border-b border-slate-100 px-6">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 mr-3">
            <span className="text-white text-lg font-black tracking-tighter">C</span>
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight truncate">ClientMaster</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-3 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            if (item.roles && user && !item.roles.includes(user.role)) return null;

            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={clsx(
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600",
                    "flex-shrink-0 mr-3 h-5 w-5 transition-colors"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border border-indigo-200">
              <span className="text-sm font-bold text-indigo-700">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{user?.name || "User"}</p>
              <p className="text-xs font-semibold text-indigo-600 truncate max-w-[120px] capitalize">{user?.role || "Role"}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center py-2 px-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
