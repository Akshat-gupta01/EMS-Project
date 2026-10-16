import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout,getMe } from "../../services/Authservice";
import toast from "react-hot-toast";
import { hasPermission } from "../../utils/Permission";
import {
  HiChartPie,
  HiUsers,
  HiShieldCheck,
  HiCalendar,
  HiClipboardList,
  HiOfficeBuilding,
  HiCash,
  HiLogout,
  HiDocumentReport,
  HiClipboardCheck,

  HiCog,
  HiChevronDown,
  HiAdjustments
} from "react-icons/hi";
import { useState, useEffect } from "react";


export default function AppSidebar() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isSettingsActive =
    location.pathname === "/settings" ||
    location.pathname === "/roles-permissions" ||
    location.pathname === "/leave-type-settings";

  useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsOpen(true);
    }
  }, [location.pathname]);

  const subNavItem = (to, Icon, label) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 pl-10 pr-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
          isActive
            ? "bg-blue-600/20 text-blue-400 font-semibold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
        }`}
      >
        <Icon className={`text-base shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
        <span>{label}</span>
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      const response = await logout();
      toast.success(response.data?.message || "Logout Successful");
      navigate('/');
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Logout Failed");
    }
  };

  const navItem = (to, Icon, label) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? "bg-slate-800 text-white font-semibold shadow-xs"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`}
      >
        <Icon className={`text-lg shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
        <span>{label}</span>
      </Link>
    );
  };

  const fetchUser = async () => {
    try {
      const response = await getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
        setPermissions(response.data.permissions || []);
        setRole(response.data.user.role || '');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(()=>{
   fetchUser();
  },[])

  return (
    <aside className="w-72 h-screen sticky top-0 shrink-0 bg-[#0f172a] border-r border-slate-800 flex flex-col shadow-lg z-20">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/40">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
            <HiUsers />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wider leading-tight">
              SOFTFIX
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5 whitespace-nowrap">
              EMPLOYEE MANAGEMENT SYSTEM
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3.5 space-y-1.5">
        {navItem("/dashboard", HiChartPie, "Dashboard")}
        {navItem("/employees", HiUsers, "Employees")}
        {navItem("/attendance", HiCalendar, "Attendance")}
        {navItem("/attendance-report", HiDocumentReport, "Attendance Report")}
        {navItem("/leave", HiClipboardList, "Leave Management")}
        {navItem("/department", HiOfficeBuilding, "Departments")}
        {navItem("/tasks", HiClipboardCheck, "Task Managements")}
        {navItem("/salary", HiCash, "Salary")}
        {/* Settings Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-none bg-transparent ${
              isSettingsActive
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <HiCog className={`text-lg shrink-0 ${isSettingsActive ? "text-white" : "text-slate-400"}`} />
              <span>Settings</span>
            </div>
            <HiChevronDown
              className={`text-base transition-transform duration-200 ${
                isSettingsOpen ? "rotate-180 text-white" : "text-slate-400"
              }`}
            />
          </button>

          {isSettingsOpen && (
            <div className="mt-1 space-y-1">
              {(role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin') &&
                subNavItem("/roles-permissions", HiShieldCheck, "Roles & Permissions")}
              {hasPermission(permissions, "leave_type_settings", role || user?.role) &&
                subNavItem("/leave-type-settings", HiAdjustments, "Leave Type Settings")}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer border-none bg-transparent"
          >
            <HiLogout className="text-lg shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}