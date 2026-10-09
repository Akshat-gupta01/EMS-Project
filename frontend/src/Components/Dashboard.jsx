import Sidebar from "./Sidebar";
import { HiUsers, HiCheckCircle, HiClock, HiOfficeBuilding } from "react-icons/hi";
import { useState, useEffect } from "react";
import { getAllEmployees, getEmployeeStatusStats } from "../../services/Userservice";
import { leaveGetAll } from "../../services/Leaveservice";
import { getAllDepartments } from "../../services/Departmentservice";
import { getAllAttendance } from "../../services/Attendanceservice";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Dashboard() {
  const [user, setUser] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [onLeave, setOnLeave] = useState([]);
  const [department, setDepartment] = useState([]);
  const [statusStats, setStatusStats] = useState({ active: 0, inactive: 0, pending: 0 });

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

  const fetchStatusStats = async () => {
    try {
      const response = await getEmployeeStatusStats();
      if (response.data) {
        setStatusStats({
          active: response.data.active || 0,
          inactive: response.data.inactive || 0,
          pending: response.data.pending || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch employee status stats:", err);
    }
  };

  useEffect(() => {
    fetchemployees();
    fetchAttendance();
    fetchOnLeave();
    fetchDepartment();
    fetchStatusStats();
  }, []);

  // Admin ko exclude karo (Role.name === "Admin") - Set se O(1) optimized lookup
  const adminIds = new Set(
    user
      .filter((u) => u.Role?.name?.toLowerCase() === "admin")
      .map((u) => u.id)
  );

  // Sirf non-admin employees jinki attendance track hoti hai
  const eligibleEmployees = user.filter((u) => !adminIds.has(u.id));
  const totalEmployees = statusStats.active + statusStats.inactive + statusStats.pending;

  const presentCount = attendance.filter((a) => a.attendance_status?.toLowerCase() === 'present').length;
  const absentCount = attendance.filter((a) => a.attendance_status?.toLowerCase() === 'absent').length;
  const leaveCount = attendance.filter((a) => a.attendance_status?.toLowerCase() === 'leave').length;
  const totalMarked = presentCount + absentCount + leaveCount;

  // ── Employee Status Bar Chart Configuration ──
  const barData = {
    labels: ['Active', 'Inactive', 'Pending'],
    datasets: [
      {
        label: 'Employees',
        data: [statusStats.active, statusStats.inactive, statusStats.pending],
        backgroundColor: [
          '#10b981', // Active (Emerald 500)
          '#ef4444', // Inactive (Red 500)
          '#f59e0b', // Pending (Amber 500)
        ],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 38,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12, weight: '600' },
          color: '#475569',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 },
          color: '#94a3b8',
        },
        grid: {
          color: '#f1f5f9',
        },
      },
    },
  };

  // ── Attendance Doughnut Chart Configuration ──
  const doughnutData = {
    labels: ['Present', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [presentCount, absentCount, leaveCount],
        backgroundColor: [
          '#10b981', // Emerald 500 (Present)
          '#f43f5e', // Rose 500 (Absent)
          '#f59e0b', // Amber 500 (Leave)
        ],
        hoverBackgroundColor: [
          '#059669',
          '#e11d48',
          '#d97706',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 16,
          font: { size: 12, weight: '500' },
          color: '#475569',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const percentage = totalMarked > 0 ? Math.round((val / totalMarked) * 100) : 0;
            return ` ${context.label}: ${val} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

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
              <p className="text-3xl font-extrabold text-gray-900 mt-1.5">{totalEmployees}</p>
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

          {/* Absent */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Absent Today
              </h2>
              <p className="text-3xl font-extrabold text-rose-500 mt-1.5">{absentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl">
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

        {/* ── Visual Charts Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* 1. Employee Status Bar Chart (Before Attendance Chart) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Employee Status Overview</h2>
                <p className="text-xs text-gray-400 mt-0.5">Distribution across status categories</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Total: {statusStats.active + statusStats.inactive + statusStats.pending}
              </span>
            </div>

            <div className="relative w-full h-72 flex items-center justify-center">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* 2. Attendance Ratio Doughnut Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Attendance Ratio</h2>
                <p className="text-xs text-gray-400 mt-0.5">Today's presence breakdown</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Today
              </span>
            </div>

            <div className="relative w-full h-72 flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />

              {/* Center Total Count Overlay */}
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total Marked
                </span>
                <span className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {totalMarked}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;