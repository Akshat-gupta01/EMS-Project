import React, { useState, useEffect } from 'react';
import { leaveCreate, leaveUpdate, leaveGetAll } from '../../services/leaveservice';
import { getMe } from '../../services/Authservice';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';

function Leave() {
  const [canApprove, setCanApprove] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const response = await leaveGetAll();
      setLeaves(response.data?.leaves || response.data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error(error.response?.data?.message || "Failed to fetch leaves");
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const response = await leaveCreate(formData);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || "Leave applied successfully");
        setFormData({
          leaveType: 'Casual Leave',
          startDate: '',
          endDate: '',
          reason: ''
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      toast.error(error.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await leaveUpdate(id, { status });
      if (response.status === 200) {
        toast.success(response.data?.message || `Leave ${status} successfully`);
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error(error.response?.data?.message || "Failed to update leave");
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getMe();
        const user = response.data?.user;
        const permissions = response.data?.permissions || [];

        const role = (user?.role || '').toLowerCase();
        const hasApprovePermission =
          permissions.includes('approve_leave') ||
          role === "admin" ||
          role === "hr" ||
          role === "manager" ||
          (user?.roleId && Number(user.roleId) <= 3);

        setCanApprove(Boolean(hasApprovePermission));

        fetchLeaves();
      } catch (err) {
        console.error("Failed to load user or leaves:", err);
        fetchLeaves();
      }
    }

    loadData();
  }, []);


  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review, manage and apply for employee leave applications
            </p>
          </div>
        </div>

        {/* Apply Leave Form */}
        <div className="mb-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
            📝 Apply for Leave
          </h2>
          <form onSubmit={handleApplyLeave} className="flex flex-wrap gap-3 items-center">
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <label className="text-xs font-medium text-gray-500 uppercase">From:</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <label className="text-xs font-medium text-gray-500 uppercase">To:</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <input
              type="text"
              placeholder="Reason for leave"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[200px]"
            />

            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
            >
              Apply Leave
            </button>
          </form>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Employee</th>
                <th className="text-left px-6 py-4">Leave Type</th>
                <th className="text-left px-6 py-4">From</th>
                <th className="text-left px-6 py-4">To</th>
                <th className="text-left px-6 py-4">Reason</th>
                <th className="text-left px-6 py-4">Status</th>
                {canApprove && <th className="text-left px-6 py-4">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {leaves && leaves.length > 0 ? (
                leaves.map((item) => {
                  const name = item.user?.username || `User #${item.userId}`;
                  const email = item.user?.email || '';
                  const start = item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A';
                  const end = item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            {email && <p className="text-xs text-gray-400">{email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.leaveType || 'General'}</td>
                      <td className="px-6 py-4 text-gray-600">{start}</td>
                      <td className="px-6 py-4 text-gray-600">{end}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{item.reason}</td>
                      <td className="px-6 py-4 capitalize font-medium text-gray-700">{item.status || 'pending'}</td>
                      {canApprove && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {item.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {item.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canApprove ? 7 : 6} className="text-center py-10 text-gray-400">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Leave;