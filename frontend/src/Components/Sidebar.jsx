import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout,getMe } from "../../services/Authservice";
import toast from "react-hot-toast";
import {
  HiChartPie,
  HiUsers,
  HiShieldCheck,
  HiCalendar,
  HiClipboardList,
  HiOfficeBuilding,
  HiCash,
  HiLogout,
  HiDocumentReport
} from "react-icons/hi";
import { useState, useEffect } from "react";

export default function AppSidebar() {
  const [user,setUser] = useState(null)
  const location = useLocation();
  const navigate = useNavigate();

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
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(()=>{
   fetchUser();
  },[])

  return (
    <aside className="w-64 h-screen sticky top-0 shrink-0 bg-[#0f172a] border-r border-slate-800 flex flex-col shadow-lg z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-950">
          E
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide leading-tight">EMS Portal</h2>
          <p className="text-xs text-slate-400">Admin Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {navItem("/dashboard", HiChartPie, "Dashboard")}
        {navItem("/employees", HiUsers, "Employees")}
        {navItem("/attendance", HiCalendar, "Attendance")}
        {navItem("/attendance-report", HiDocumentReport, "Attendance Report")}
        {navItem("/leave", HiClipboardList, "Leave Management")}
        {navItem("/department", HiOfficeBuilding, "Departments")}
        {navItem("/salary", HiCash, "Salary")}
        {(user?.role?.toLowerCase() === "admin" || user?.roleId === 1 || user?.roleId === "1") &&
          navItem("/roles-permissions", HiShieldCheck, "Roles & Permissions")
        }

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer border-none bg-transparent"
          >
            <HiLogout className="text-lg shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}