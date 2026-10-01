import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout,getMe } from "../../services/Authservice";
import toast from "react-hot-toast";
import {HiChartPie,HiUsers,HiShieldCheck,HiCalendar,HiClipboardList,HiOfficeBuilding, HiCash, HiLogout,} from "react-icons/hi";
import { useState, useEffect } from "react";

export default function AppSidebar() {
  const [user,setUser] = useState(null)
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      toast.success(response.data?.message || "Logout Successful");
      navigate('/login');
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-50 text-indigo-600 font-semibold"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Icon className="text-lg shrink-0" />
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
    <aside className="w-64 h-screen sticky top-0 shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
          E
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">EMS Portal</h2>
          <p className="text-xs text-gray-400">Admin Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItem("/dashboard", HiChartPie, "Dashboard")}
        {navItem("/employees", HiUsers, "Employees")}
        {navItem("/attendance", HiCalendar, "Attendance")}
        {navItem("/leave", HiClipboardList, "Leave Management")}
        {navItem("/department", HiOfficeBuilding, "Departments")}
        {navItem("/salary", HiCash, "Salary")}
        {(user?.role?.toLowerCase() === "admin" || user?.roleId === 1 || user?.roleId === "1") &&
          navItem("/roles-permissions", HiShieldCheck, "Roles & Permissions")
        }

        <div className="pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
          >
            <HiLogout className="text-lg shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}