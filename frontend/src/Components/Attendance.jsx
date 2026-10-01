import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast';
import { getAllEmployees } from '../../services/Userservice';
import { getAllAttendance, markattendance, updateAttendance } from '../../services/Attendanceservice';

const STATUS_OPTIONS = [
  { label: 'Present', color: 'bg-green-500 hover:bg-green-600'   },
  { label: 'Absent',  color: 'bg-red-500   hover:bg-red-600'     },
  { label: 'Leave',   color: 'bg-yellow-500 hover:bg-yellow-600' },
];

function Attendance() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const [users, setUsers]             = useState([]);
  const [attendances, setAttendances] = useState([]);

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
  const fetchUser = async () => {
    try {
      const response = await getAllEmployees();
      console.log(response);
      setUsers(response.data?.user || []);
    } catch (err) {
      console.log(err);
      toast.error('Error fetching user');
    }
  };

  const updateattend = async (emp, status) => {
    try {
      // attendance record ka id dhundho
      const record = attendances.find((a) => a.userId === emp.id);
      const response =await updateAttendance(record.id, { attendance_status: status });
      toast.success(`${emp.username} updated to ${status}`);
      getAttendance();
    } catch (err) {
      console.log(err);
      toast.error('Error updating attendance');
    }
  };

  useEffect(() => {
    getAttendance();
    fetchUser();
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



        {/* Page title + date */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Manage Attendance</h1>
        <h2 className="text-center font-bold text-gray-800 mb-5">
          Mark Attendance for{' '}
          <span className="underline underline-offset-2">{today}</span>
        </h2>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 text-left w-16">S No</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4 text-left">Emp Id</th>
                <th className="px-4 py-4 text-left">Department</th>
                <th className="px-4 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                users.map((emp, idx) => {
                  const markedStatus = getMarkedStatus(emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4 text-sm font-medium text-gray-500">{idx + 1}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-800">{emp.username}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{emp.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {emp.department?.departmentName || (
                          <span className="text-xs text-gray-400 italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Action — status buttons */}
                      <td className="py-4 px-4 text-center">
                        {emp.roleId === 1 ? (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            Admin (N/A)
                          </span>
                        ) : markedStatus ? (
                          /* Already marked — pill + change buttons */
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                                markedStatus === 'Present' ? 'bg-green-500'
                                : markedStatus === 'Absent' ? 'bg-red-500'
                                : markedStatus === 'Leave'   ? 'bg-gray-500'
                                : 'bg-yellow-500'
                              }`}
                            >
                              {markedStatus}
                            </span>
                            {/* Change buttons */}
                            {STATUS_OPTIONS.filter((s) => s.label !== markedStatus).map((s) => (
                              <button
                                key={s.label}
                                onClick={() => updateattend(emp, s.label)}
                                className={`${s.color} text-white text-xs font-semibold px-2 py-1 rounded transition opacity-70 hover:opacity-100`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          /* Not yet marked — show 4 buttons */
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s.label}
                                // id={`btn-${s.label.toLowerCase()}-${emp.id}`}
                                onClick={() => handleMark(emp, s.label)}
                                className={`${s.color} text-white text-xs font-semibold px-3 py-1.5 rounded transition`}
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
      </div>
    </div>
  );
}

export default Attendance;