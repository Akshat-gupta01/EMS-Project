import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast';
import Pagination from './Pagination';
import { getAllEmployees } from '../../services/Userservice';
import { getAllAttendance, markattendance, updateAttendance } from '../../services/Attendanceservice';

const STATUS_OPTIONS = [
  {
    label: 'Present',
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
  },
  {
    label: 'Absent',
    color: 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-600',
  },
  {
    label: 'Leave',
    color: 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-600',
  },
];

function Attendance() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const displayDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const [users, setUsers]             = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('active'); // Default 'active' ya '' (All)

// Search State
const [search, setSearch] = useState('');

//pagination
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);


  // ── fetch today's attendance records ─────────────────────────────
  const getAttendance = async () => {
    try {
      const response = await getAllAttendance();
      console.log(response);
      setAttendances(response.data?.attendance || []);
    } catch (err) {
      console.log(err);
      toast.error('Error fetching attendance');
    }
  };

  // ── fetch all employees ──────────────────────────────────────────
  const fetchUser = async (page = currentPage) => {
    try {
      const response = await getAllEmployees(page, 10, selectedStatus,search);
      console.log(response);
      setUsers(response.data?.user || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.log(err);
      toast.error('Error fetching user');
    }
  };

  const updateattend = async (emp, status) => {
    try {
      // attendance record ka id dhundho
      const record = attendances.find((a) => a.userId === emp.id);
      const response = await updateAttendance(record.id, { attendance_status: status });
      toast.success(`${emp.username} updated to ${status}`);
      getAttendance();
    } catch (err) {
      console.log(err);
      toast.error('Error updating attendance');
    }
  };

  // Jab bhi currentPage badle, naye page ka data fetch ho
  useEffect(() => {
    fetchUser(currentPage);
  }, [search,currentPage]);

  // Initial load par attendance records fetch karo
  useEffect(() => {
    getAttendance();
  }, []);

  // ── helper: check if a user already has attendance marked today ──
  const getMarkedStatus = (userId) => {
    const record = attendances.find((a) => a.userId === userId);
    return record ? record.attendance_status : null;
  };

  // ── mark attendance for an employee ─────────────────────────────
  const handleMark = async (emp, status) => {
    try {
      await markattendance({
        userId: emp.id,
        date: today,
        attendance_status: status,
      });
      toast.success(`${emp.username} marked as ${status}`);
      getAttendance(); // refresh list so pill shows up
    } catch (err) {
      console.log(err);
      toast.error('Error marking attendance');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Page Header: Title + Subtitle + Date Badge ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Attendance</h1>
              <p className="text-sm text-gray-500 mt-1">
                Record and update employee presence for today
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-full sm:w-64"
              />
              <div className="self-start sm:self-auto bg-blue-600 text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
                <span>{displayDate}</span>
              </div>
            </div>
          </div>

          {/* ── Table Card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5 w-16">S No</th>
                    <th className="py-4 px-5">Employee</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Role</th>
                    <th className="py-4 px-5 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    users.map((emp, idx) => {
                      const markedStatus = getMarkedStatus(emp.id);
                      return (
                        <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-5 text-xs font-medium text-gray-400">
                            {(currentPage - 1) * 10 + idx + 1}
                          </td>

                          {/* Employee Name + Avatar Initial */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-2xs shrink-0">
                                {emp.username ? emp.username.substring(0, 2).toUpperCase() : 'EM'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 leading-tight">{emp.username}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Employee ID: #{emp.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 px-5 text-sm text-gray-600">
                            {emp.department?.departmentName || (
                              <span className="text-xs text-gray-400 italic">Not Assigned</span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="py-4 px-5 text-sm text-gray-600">
                            {emp.Role ? (
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {emp.Role.name}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Pending Approval</span>
                            )}
                          </td>

                          {/* Action — Status Buttons */}
                          <td className="py-4 px-5 text-center">
                            {emp.roleId === 1 ? (
                              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                -
                              </span>
                            ) : markedStatus ? (
                              /* Already marked — pill + change buttons */
                              <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200">
                                <span
                                  className={`px-3 py-1 rounded-lg text-white text-xs font-bold shadow-xs uppercase tracking-wider ${
                                    markedStatus === 'Present'
                                      ? 'bg-emerald-600'
                                      : markedStatus === 'Absent'
                                      ? 'bg-rose-600'
                                      : markedStatus === 'Leave'
                                      ? 'bg-amber-600'
                                      : 'bg-gray-600'
                                  }`}
                                >
                                  {markedStatus}
                                </span>
                                {/* Change buttons */}
                                <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
                                  {STATUS_OPTIONS.filter((s) => s.label !== markedStatus).map((s) => (
                                    <button
                                      key={s.label}
                                      onClick={() => updateattend(emp, s.label)}
                                      className={`${s.color} text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer`}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* Not yet marked — show buttons */
                              <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200">
                                {STATUS_OPTIONS.map((s) => (
                                  <button
                                    key={s.label}
                                    onClick={() => handleMark(emp, s.label)}
                                    className={`${s.color} text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Material Tailwind Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Attendance;