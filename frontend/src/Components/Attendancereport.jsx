import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast';
import Pagination from './Pagination';
import { getAttendanceReport } from '../../services/Attendanceservice';

function Attendancereport() {
  // ── 1. STATE VARIABLES ──────────────────────────────────────────────
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [records, setRecords] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── 2. DATE HELPERS ─────────────────────────────────────────────────
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Is mahine ka start aur aaj ki date set karo
  const handleThisMonth = () => {
    const now = new Date(); // current date
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(now));
    setCurrentPage(1);
  };

  // Pichhle mahine ka 1st aur last day set karo
  const handleLastMonth = () => {
    const now = new Date();
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(formatDate(firstDayOfLastMonth));
    setEndDate(formatDate(lastDayOfLastMonth));
    setCurrentPage(1);
  };

  // ── 3. API CALL ─────────────────────────────────────────────────────
  const fetchReport = async (page = currentPage) => {
    if (!startDate || !endDate) return;

    try {
      const response = await getAttendanceReport({
        startDate,
        endDate,
        page,
        limit: 10
      });
      console.log(response);
      setRecords(response.data?.data || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      console.error('Report fetch error:', err);
      toast.error('Failed to load attendance report');
    }
  };

  // Default "This Month" on load
  useEffect(() => {
    handleThisMonth();
  }, []);

  // Fetch report whenever currentPage or dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReport(currentPage);
    }
  }, [currentPage, startDate, endDate]);

  // ── 4. SEARCH & KPI CALCULATIONS (Simple & Clean) ───────────────────
  const query = searchEmployee.trim().toLowerCase();

  const filteredRecords = query
    ? records.filter((item) => {
        const name = item.user?.username?.toLowerCase() || '';
        const email = item.user?.email?.toLowerCase() || '';
        const dept = item.user?.department?.departmentName?.toLowerCase() || '';
        return name.includes(query) || email.includes(query) || dept.includes(query);
      })
    : records;

  // Counts
  const total = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.attendance_status?.toLowerCase() === 'present').length;
  const absentCount = filteredRecords.filter((r) => r.attendance_status?.toLowerCase() === 'absent').length;
  const leaveCount = filteredRecords.filter((r) => r.attendance_status?.toLowerCase() === 'leave').length;
  const presentPercent = total > 0 ? Math.round((presentCount / total) * 100) : 0;


  // Status badge styling
  const getBadgeStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'present') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'absent') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  // ── 5. UI RENDER ────────────────────────────────────────────────────
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6">
        {/* Top Header & Preset Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Report</h1>
            <p className="text-sm text-gray-500">View and track employee monthly attendance history</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleThisMonth}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              onClick={handleLastMonth}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Last Month
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase">Total Records</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
            <p className="text-xs font-medium text-green-600 uppercase">Present ({presentPercent}%)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{presentCount}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
            <p className="text-xs font-medium text-red-600 uppercase">Absent</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{absentCount}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
            <p className="text-xs font-medium text-yellow-600 uppercase">On Leave</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{leaveCount}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={fetchReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search employee or dept..."
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                <tr>
                  <th className="p-3.5 pl-6">Employee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">
                      No records found for selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                            {item.user?.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.user?.username}</p>
                            <p className="text-xs text-gray-400">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {item.user?.department?.departmentName || '—'}
                      </td>
                      <td className="p-3.5 text-gray-600 font-medium">
                        {item.date}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
                            item.attendance_status
                          )}`}
                        >
                          {item.attendance_status?.toUpperCase() || 'NOT MARKED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Material Tailwind Pagination */}
            {filteredRecords.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendancereport;