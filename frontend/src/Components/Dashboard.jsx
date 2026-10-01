import Sidebar from "./Sidebar";
import {
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiOfficeBuilding,
} from "react-icons/hi";
import { useState,useEffect } from "react";
import { getAllEmployees } from "../../services/Userservice";
import { leaveGetAll } from "../../services/Leaveservice";
import { getAllDepartments } from "../../services/Departmentservice";
import { getAllAttendance } from "../../services/Attendanceservice";


function Dashboard() {
  const [user,setUser]=useState([]);
  const [attendance,setAttendance]=useState([]);
  const [onLeave,setOnLeave]=useState([]);
  const [department,setDepartment]=useState([]);

  const fetchemployees = async () => {
    try {
      const response = await getAllEmployees();
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await getAllAttendance();
      if (response.data?.attendance) {
        setAttendance(response.data.attendance);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const fetchOnLeave = async () => {
    try {
      const response = await leaveGetAll();
      if (response.data?.leaves) {
        setOnLeave(response.data.leaves);
      }
    } catch (err) {
      console.error("Failed to fetch on leave:", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await getAllDepartments();
      if (response.data?.department) {
        setDepartment(response.data.department);
      }
    } catch (err) {
      console.error("Failed to fetch department:", err);
    }
  };

  useEffect(() => {
    fetchemployees();
    fetchAttendance();
    fetchOnLeave();
    fetchDepartment();
  }, []);
  
  const presentCount = attendance.filter(
    (item) => item.attendance_status?.toLowerCase() === 'present'
  ).length;

  const absentCount = attendance.filter(
    (item) => item.attendance_status?.toLowerCase() === 'absent'
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Employee Management System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of company employees, attendance, and departments
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Employees */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Employees
              </h2>
              <p className="text-3xl font-extrabold text-gray-900 mt-1.5">{user.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
              <HiUsers />
            </div>
          </div>

          {/* Present Today */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Present Today
              </h2>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1.5">{presentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
              <HiCheckCircle />
            </div>
          </div>

          {/* On Absent */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                On Absent
              </h2>
              <p className="text-3xl font-extrabold text-amber-500 mt-1.5">{absentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl">
              <HiClock />
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Departments
              </h2>
              <p className="text-3xl font-extrabold text-purple-600 mt-1.5">{department.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
              <HiOfficeBuilding />
            </div>
          </div>
        </div>

        {/* Dashboard Banner Image */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <img
            src="/ems.jpg"
            alt="EMS Dashboard Overview"
            className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover object-center"
          />
        </div>
      </div>
    </div>
  
  );
}

export default Dashboard;