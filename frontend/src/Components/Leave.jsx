import React, { useState, useEffect } from 'react';
import { leaveCreate, leaveUpdate, leaveStatusUpdate, leaveGetAll, getMyLeaveBalance } from '../../services/Leaveservice';
import { getMe } from '../../services/Authservice';
import { toast } from 'react-hot-toast';
import { HiPlus, HiX, HiPencil } from 'react-icons/hi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';

function Leave() {
  const [currentUser, setCurrentUser] = useState(null);
  const [canApprove, setCanApprove] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    leaveDate: '',
    duration: 'Full Day',
    reason: ''
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectData, setRejectData] = useState({ id: null, reason: '' });
  const [rejectError, setRejectError] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaves = async (page = currentPage) => {
    try {
      const response = await leaveGetAll(page, 10, search);
      setLeaves(response.data?.leaves || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leaves');
    }
  };

  // Default fallback balances if API is loading
  const defaultBalances = [
    { leaveType: 'Casual Leave', totalYearly: 12, usedYearly: 0, remainingYearly: 12, monthlyLimit: 1, usedMonthly: 0, remainingMonthly: 1, paidStatus: 'Paid', color: '#16813D' },
    { leaveType: 'Sick Leave', totalYearly: 2, usedYearly: 0, remainingYearly: 2, monthlyLimit: 2, usedMonthly: 0, remainingMonthly: 2, paidStatus: 'Paid', color: '#DC2626' },
    { leaveType: 'Earned Leave', totalYearly: 2, usedYearly: 0, remainingYearly: 2, monthlyLimit: 2, usedMonthly: 0, remainingMonthly: 2, paidStatus: 'Paid', color: '#64748B' }
  ];

  const displayBalances = leaveBalances && leaveBalances.length > 0 ? leaveBalances : defaultBalances;

  // Fetch logged-in employee's personal leave balance
  const fetchBalances = async () => {
    try {
      const res = await getMyLeaveBalance();
      if (res.data?.balances && res.data.balances.length > 0) {
        setLeaveBalances(res.data.balances);
      }
    } catch (error) {
      console.error('Error fetching my leave balances:', error);
    }
  };

  const openApplyModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormError('');
    fetchBalances();
    const initialType = displayBalances && displayBalances.length > 0 ? displayBalances[0].leaveType : 'Casual Leave';
    setFormData({
      leaveType: initialType,
      leaveDate: '',
      duration: 'Full Day',
      reason: ''
    });
    setOpenModal(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormError('');
    fetchBalances();
    const formattedDate = item.leaveDate ? String(item.leaveDate).split('T')[0] : '';
    setFormData({
      leaveType: item.leaveType || 'Casual Leave',
      leaveDate: formattedDate,
      duration: item.duration || 'Full Day',
      reason: item.reason || ''
    });
    setOpenModal(true);
  };

  // Direct submission without any frontend validation guards - all validation checked by backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      let response;
      if (isEditing) {
        response = await leaveUpdate(editId, formData);
      } else {
        response = await leaveCreate(formData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || (isEditing ? 'Leave updated successfully' : 'Leave applied successfully'));
        setOpenModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormError('');
        setFormData({
          leaveType: 'Casual Leave',
          leaveDate: '',
          duration: 'Full Day',
          reason: ''
        });
        fetchLeaves();
        fetchBalances();
      }
    } catch (error) {
      console.error('Error saving leave:', error);
      const errMsg = error.response?.data?.message || 'Failed to save leave';
      setFormError(errMsg);
      toast.error(errMsg);
    }
  };

  // Approve or Reject actions via leaveStatusUpdate (/api/leave/status/:id)
  const handleStatusUpdate = async (id, status, rejection_reason = '') => {
    try {
      const response = await leaveStatusUpdate(id, { status, rejection_reason });
      if (response.status === 200) {
        toast.success(response.data?.message || `Leave ${status} successfully`);
        fetchLeaves();
        fetchBalances();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating leave status:', error);
      const errMsg = error.response?.data?.message || 'Failed to update leave';
      toast.error(errMsg);
      return false;
    }
  };

  const openRejectModal = (id) => {
    setRejectData({ id, reason: '' });
    setRejectError('');
    setRejectModalOpen(true);
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    if (!rejectData.id) return;
    setRejectError('');
    const ok = await handleStatusUpdate(rejectData.id, 'rejected', rejectData.reason);
    if (ok) {
      setRejectModalOpen(false);
      setRejectData({ id: null, reason: '' });
      setRejectError('');
    } else {
      setRejectError('Rejection reason is required.');
    }
  };

  useEffect(() => {
    fetchLeaves(currentPage);
    fetchBalances();
  }, [search, currentPage]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getMe();
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
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
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {leaves && leaves.length > 0 ? (
                leaves.map((item) => {
                  const name = item.user?.username || `User #${item.userId}`;
                  const email = item.user?.email || '';
                  const applicantId = item.userId ?? item.user?.id;
                  const isOwnLeave = Boolean(currentUser?.id && applicantId && Number(applicantId) === Number(currentUser.id));
                  const isPending = String(item.status || '').toLowerCase() === 'pending';
                  const canEditThisLeave = isOwnLeave && isPending;
                  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
                  const canDecideThisLeave = canApprove && (isAdmin || !isOwnLeave) && isPending;

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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Employee can edit only their own leave before it is approved/rejected */}
                          {canEditThisLeave && (
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Edit your pending leave"
                            >
                              <HiPencil className="text-xs" />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Admin / Manager / HR Approval / Rejection buttons (only for pending leaves) */}
                          {canDecideThisLeave && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(item.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* If no action is available */}
                          {!canEditThisLeave && !canDecideThisLeave && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
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

      {/* ── Apply / Edit Leave Modal ────────────────────────────────────────── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Leave Application' : 'Apply for Leave'}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEditing
                    ? 'Update your pending leave request details before status decision'
                    : 'Submit your leave application for review'}
                </p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
              >
                <HiX className="text-xl" />
              </button>
            </div>


            {/* Backend validation error notification */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <span className="font-bold shrink-0">Validation Error:</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Leave Type <span className="text-red-500 font-bold">*</span>
                </label>

                <select
                  value={formData.leaveType}
                  onChange={(e) => {
                    setFormData({ ...formData, leaveType: e.target.value });
                    setFormError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {displayBalances.map((b, i) => (
                    <option key={i} value={b.leaveType}>
                      {b.leaveType} — {b.remainingYearly} of {b.totalYearly} left ({b.remainingMonthly} left this month)
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Date and Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Leave Date <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.leaveDate}
                    onChange={(e) => {
                      setFormData({ ...formData, leaveDate: e.target.value });
                      setFormError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Today or future date</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData({ ...formData, duration: e.target.value });
                      setFormError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="First Half">First Half</option>
                    <option value="Second Half">Second Half</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Full Day or Half Day</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Reason for Leave <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Mandatory (Max 500 chars)</span>
                </div>
                <textarea
                  rows="3"
                  placeholder="Please describe the reason for your leave..."
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    setFormError('');
                  }}
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
                  {isEditing ? 'Update Leave' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject Modal ────────────────────────────────────────── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Reject Leave Application</h2>
            <p className="text-xs text-gray-500">
              Please provide a reason for rejecting this leave application.
            </p>

            {rejectError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {rejectError}
              </div>
            )}

            <form onSubmit={confirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Reason for rejection (mandatory)..."
                  value={rejectData.reason}
                  onChange={(e) => {
                    setRejectData({ ...rejectData, reason: e.target.value });
                    setRejectError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
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