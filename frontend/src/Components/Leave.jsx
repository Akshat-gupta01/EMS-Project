import React, { useState, useEffect } from 'react';
import { leaveCreate, leaveUpdate, leaveGetAll } from '../../services/Leaveservice';
import { getMe } from '../../services/Authservice';
import { toast } from 'react-hot-toast';
import { HiPlus, HiX } from 'react-icons/hi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';

function Leave() {
  const [canApprove, setCanApprove] = useState(false);
  const [leaves, setLeaves] = useState([]); // all leaves store in leaves array
  const [openModal, setOpenModal] = useState(false); // when click the apply leave button so that the modal open 
  const [formData, setFormData] = useState({  // data which is going to be sent to the server
    leaveType: 'Casual Leave', // type of leave
    leaveDate: '',
    duration: 'Full Day',
    reason: ''
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectData, setRejectData] = useState({ id: null, reason: '' });
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaves = async (page = currentPage) => {
    try {
      const response = await leaveGetAll(page, 10,search);
      setLeaves(response.data?.leaves || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leaves');
    }
  };

  const openApplyModal = () => {
    setFormData({
      leaveType: 'Casual Leave',
      leaveDate: '',
      duration: 'Full Day',
      reason: ''
    });
    setOpenModal(true);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!formData.leaveDate || !formData.duration || !formData.reason.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await leaveCreate(formData);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || 'Leave applied successfully');
        setOpenModal(false);
        setFormData({
          leaveType: 'Casual Leave',
          leaveDate: '',
          duration: 'Full Day',
          reason: ''
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error applying leave:', error);
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleStatusUpdate = async (id, status, rejection_reason = '') => {
    try {
      const response = await leaveUpdate(id, { status, rejection_reason });
      if (response.status === 200) {
        toast.success(response.data?.message || `Leave ${status} successfully`);
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.response?.data?.message || 'Failed to update leave');
    }
  };

  const   openRejectModal = (id) => {
    setRejectData({ id, reason: '' });
    setRejectModalOpen(true);
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    if (!rejectData.id) return;
    await handleStatusUpdate(rejectData.id, 'rejected', rejectData.reason.trim());
    setRejectModalOpen(false);
    setRejectData({ id: null, reason: '' });
  };

  // Jab bhi currentPage badle, naye page ki leaves fetch karo
  useEffect(() => {
    fetchLeaves(currentPage);
  }, [search,currentPage]);

  // Initial load par permissions check karo
  useEffect(() => {
    async function loadData() {
      try {
        const response = await getMe();
        const permissions = response.data?.permissions || [];
        setCanApprove(permissions.includes('approve_leave'));
      } catch (err) {
        console.error('Failed to load user permissions:', err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header section with Apply Leave button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review, manage and apply for employee leave applications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-full sm:w-64"
            />
            <button
              onClick={openApplyModal}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer whitespace-nowrap"
            >
              <HiPlus className="text-lg" />
              Apply Leave
            </button>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Employee</th>
                <th className="text-left px-6 py-4">Leave Date</th>
                <th className="text-left px-6 py-4">Duration</th>
                <th className="text-left px-6 py-4">Leave Type</th>
                <th className="text-left px-6 py-4">Reason</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Rejection Reason</th>
                {canApprove && <th className="text-center px-6 py-4">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {leaves && leaves.length > 0 ? (
                leaves.map((item) => {
                  const name = item.user?.username || `User #${item.userId}`;
                  const email = item.user?.email || '';

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
                      <td className="px-6 py-4 text-gray-600">
                        {item.leaveDate ? new Date(item.leaveDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {item.duration || 'Full Day'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.leaveType || 'General'}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{item.reason}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            item.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs">
                        {item.status === 'rejected' ? (
                          item.rejection_reason ? (
                            <span className="text-rose-600 font-medium break-words">
                              {item.rejection_reason}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No reason provided</span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {canApprove && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
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
                                onClick={() => openRejectModal(item.id)}
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
                  <td colSpan={canApprove ? 8 : 7} className="text-center py-10 text-gray-400">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Material Tailwind Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* ── Apply Leave Modal ────────────────────────────────────────── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
                <p className="text-xs text-gray-500">Submit your leave application for review</p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5">
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              {/* Leave Date and Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Date</label>
                  <input
                    type="date"
                    required
                    value={formData.leaveDate}
                    onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="First Half">First Half</option>
                    <option value="Second Half">Second Half</option>
                    <option value="Multiple">Multiple</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Leave</label>
                <textarea
                  rows="3"
                  placeholder="Please describe the reason for your leave..."
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ──────────────────────────────────────── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reject Leave Request</h2>
                <p className="text-xs text-gray-500">Provide a reason for rejecting this leave application</p>
              </div>
            </div>

            <form onSubmit={confirmReject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter rejection reason"
                  value={rejectData.reason}
                  onChange={(e) => setRejectData({ ...rejectData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;