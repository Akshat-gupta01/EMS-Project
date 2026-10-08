import React, { useState, useEffect } from 'react';
import { getAllSalary, updateSalary, getmySalary, addSalary } from '../../services/Salaryservice';
import { getAllEmployees } from '../../services/Userservice';
import { getMe } from '../../services/Authservice';
import { toast } from 'react-hot-toast';
import { HiPlus, HiPencil, HiX } from 'react-icons/hi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2024', '2025', '2026', '2027', '2028'];

function Salary() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [salary, setSalary] = useState([]);
  const [employee, setEmployee] = useState([]);

  // Option A: selectedId tracks edit mode (null = Add, ID = Update)
  const [selectedId, setSelectedId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    basicSalary: '',
    bonus: '',
    deduction: '',
    month: '',
    year: ''
  });

  const [selectedStatus, setSelectedStatus] = useState('active'); 
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getSalary = async (page = currentPage) => {
    try {
      const response = await getAllSalary(page, 10, search);
      setSalary(response.data?.salary || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching all salaries:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const mySalary = async (page = currentPage) => {
    try {
      const response = await getmySalary(page, 10);
      setSalary(response.data?.salary || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching my salary:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await getAllEmployees(1, 1000, selectedStatus);
      setEmployee(response.data?.user || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const refreshSalaryData = async (page = currentPage) => {
    if (isAdmin) {
      await getSalary(page);
    } else {
      await mySalary(page);
    }
  };

  // ── Open Modal for Adding ───────────────────────────────────────
  const openAddModal = () => {
    setSelectedId(null);
    setFormData({
      userId: '',
      basicSalary: '',
      bonus: '',
      deduction: '',
      month: '',
      year: ''
    });
    setOpenModal(true);
  };

  // ── Open Modal for Editing ──────────────────────────────────────
  const openEditModal = (item) => {
    setSelectedId(item.id);
    setFormData({
      userId: item.userId || '',
      basicSalary: item.basicSalary || '',
      bonus: item.bonus || '',
      deduction: item.deduction || '',
      month: item.month || '',
      year: item.year || ''
    });
    setOpenModal(true);
  };

  // ── Single Unified Submit Handler (Add & Update) ────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId && !formData.userId) {
      toast.error('Please select an employee');
      return;
    }

    const basic = Number(formData.basicSalary) || 0;
    const bonus = Number(formData.bonus) || 0;
    const deduction = Number(formData.deduction) || 0;
    const netsalary = basic + bonus - deduction;

    const salaryPayload = {
      basicSalary: basic,
      bonus,
      deduction,
      netsalary,
      month: formData.month,
      year: formData.year
    };

    try {
      if (selectedId) {
        // ✏️ Edit Mode (Update existing salary record by selectedId)
        const response = await updateSalary(selectedId, salaryPayload);
        if (response.status === 200) {
          toast.success(response.data?.message || 'Salary updated successfully');
        }
      } else {
        // ➕ Add Mode (Create new salary record)
        const response = await addSalary({ ...salaryPayload, userId: formData.userId });
        if (response.status === 200 || response.status === 201) {
          toast.success(response.data?.message || 'Salary added successfully');
        }
      }

      setOpenModal(false);
      setSelectedId(null);
      await refreshSalaryData();
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getMe();
        const user = response.data?.user;
        setCurrentUser(user);

        const role = (user?.role || '').toLowerCase();
        if (
          role === 'admin' ||
          role === 'accountant' ||
          user?.roleId === 1 ||
          user?.roleId === 4
        ) {
          setIsAdmin(true);
          await getSalary();
          await fetchEmployee();
        } else {
          setIsAdmin(false);
          await mySalary();
        }
      } catch (error) {
        console.error('Error loading salary data:', error);
        await mySalary();
      }
    }

    loadData();
  }, []);

  // Jab bhi search ya currentPage badle, naya data fetch ho
  useEffect(() => {
    if (currentUser) {
      refreshSalaryData(currentPage);
    }
  }, [search, currentPage]);

  // Helper to find selected employee username when editing
  const selectedEmpName = selectedId
    ? salary.find((s) => s.id === selectedId)?.user?.username || `User #${formData.userId}`
    : '';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header section with Add Salary button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin
                ? 'Manage and view all employee salaries'
                : 'View your personal salary details and history'}
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
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer whitespace-nowrap"
              >
                <HiPlus className="text-lg" />
                Add Salary
              </button>
            )}
          </div>
        </div>

        {/* Salary Records Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4">Employee</th>
                <th className="text-left px-6 py-4">Period</th>
                <th className="text-left px-6 py-4">Basic Salary</th>
                <th className="text-left px-6 py-4">Bonus</th>
                <th className="text-left px-6 py-4">Deduction</th>
                <th className="text-left px-6 py-4">Net Salary</th>
                {isAdmin && <th className="text-center px-6 py-4">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {salary && salary.length > 0 ? (
                salary.map((item) => {
                  const name = item.user?.username || (currentUser && !isAdmin ? currentUser.username : `User #${item.userId}`);
                  const email = item.user?.email || (currentUser && !isAdmin ? currentUser.email : '');
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
                      <td className="px-6 py-4 text-gray-700">{item.month} {item.year}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">₹{item.basicSalary}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">+₹{item.bonus || 0}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">-₹{item.deduction || 0}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">₹{item.netsalary}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <HiPencil className="text-sm" />
                            Update
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-gray-400">
                    No salary records found
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

      {/* ── Single Unified Modal (Add & Update) ──────────────────────── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedId ? 'Update Salary Record' : 'Add Salary Record'}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedId
                    ? `Update salary details for ${selectedEmpName}`
                    : 'Create new salary record for an employee'}
                </p>
              </div>
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedId(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Employee Selection (Dropdown in Add Mode, Readonly in Edit Mode) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {selectedId ? 'Employee' : 'Select Employee'}
                </label>
                {selectedId ? (
                  <input
                    type="text"
                    readOnly
                    value={selectedEmpName}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employee &&
                      employee.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.username} ({emp.email})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Month and Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Basic Salary */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Basic Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  required
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bonus and Deduction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bonus (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deduction (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Net Salary Preview */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">Calculated Net Salary:</span>
                <span className="text-base font-bold text-indigo-700">
                  ₹{Math.max(0, (Number(formData.basicSalary) || 0) + (Number(formData.bonus) || 0) - (Number(formData.deduction) || 0))}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(false);
                    setSelectedId(null);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  {selectedId ? 'Update Salary' : 'Add Salary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salary;