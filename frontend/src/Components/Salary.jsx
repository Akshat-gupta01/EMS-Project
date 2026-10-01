import React, { useState, useEffect } from 'react';
import { getAllSalary, updateSalary, getmySalary, addSalary } from '../../services/Salaryservice';
import { getAllEmployees } from '../../services/Userservice';
import { getMe } from '../../services/Authservice';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';

function Salary() {
  const [currentUser, setCurrentUser] = useState(null); // identify the role of the user
  const [isAdmin, setIsAdmin] = useState(false);  //  check it is admin or not
  const [isEditing, setIsEditing] = useState(false); // react mode on editing or non-editing
  const [selectedId, setSelectedId] = useState(null);
  const [salary, setSalary] = useState([]); // salary data
  const [employee, setEmployee] = useState([]); // employee data
  const [formData, setFormData] = useState({  // form data state
    userId: "",
    basicSalary: "",
    bonus: "",
    deduction: "",
    netsalary: "",
    month: "",
    year: ""
  });

  const getSalary = async () => {
    try {
      const response = await getAllSalary();
      setSalary(response.data?.salary || []);
    } catch (error) {
      console.error("Error fetching all salaries:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const mySalary = async () => {
    try {
      const response = await getmySalary();
      setSalary(response.data?.salary || []);
    } catch (error) {
      console.error("Error fetching my salary:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await getAllEmployees();
      setEmployee(response.data?.user || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const refreshSalaryData = async (adminFlag) => {
    if (adminFlag ?? isAdmin) {
      await getSalary();
    } else {
      await mySalary();
    }
  };

  const salaryUpdate = async (id, salaryPayload) => {
    try {
      const response = await updateSalary(id, salaryPayload);
      if (response.status === 200) {
        toast.success(response.data?.message || "Salary updated successfully");
        await refreshSalaryData();
        cancelEditing();
      }
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const Salaryadd = async (salaryPayload) => {
    try {
      const response = await addSalary(salaryPayload);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || "Salary added successfully");
        await refreshSalaryData();
        setFormData({
          userId: "",
          basicSalary: "",
          bonus: "",
          deduction: "",
          netsalary: "",
          month: "",
          year: ""
        });
      }
    } catch (error) {
      console.error("Error adding salary:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error("Please select an employee");
      return;
    }

    const basic = Number(formData.basicSalary) || 0;
    const bonus = Number(formData.bonus) || 0;
    const deduction = Number(formData.deduction) || 0;
    const netsalary = basic + bonus - deduction;

    const salaryPayload = {
      ...formData,
      basicSalary: basic,
      bonus: bonus,
      deduction: deduction,
      netsalary: netsalary
    };

    if (isEditing) {
      salaryUpdate(selectedId, salaryPayload);
    } else {
      Salaryadd(salaryPayload);
    }
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setSelectedId(item.id);
    setFormData({
      userId: item.userId || "",
      basicSalary: item.basicSalary || "",
      bonus: item.bonus || "",
      deduction: item.deduction || "",
      netsalary: item.netsalary || "",
      month: item.month || "",
      year: item.year || ""
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      userId: "",
      basicSalary: "",
      bonus: "",
      deduction: "",
      netsalary: "",
      month: "",
      year: ""
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getMe();
        const user = response.data?.user;

        // 1. User state set karo taaki Header par Role badge dikhe
        setCurrentUser(user);

        // 2. Admin ya Accountant check
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
        console.error("Error loading salary data:", error);
        await mySalary();
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin
                ? "Manage and view all employee salaries"
                : "View your personal salary details and history"}
            </p>
          </div>
          {currentUser && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
              Role: {currentUser.role || 'Employee'}
            </span>
          )}
        </div>

        {/* Add/Edit Salary Form (Admin Only) */}
        {isAdmin && (
          <div className="mb-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              {isEditing ? '✏️ Edit Salary Record' : '➕ Add New Salary Record'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
              >
                <option value="">Select Employee</option>
                {employee && employee.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.username} ({emp.email})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Basic Salary"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                required
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
              />

              <input
                type="number"
                placeholder="Bonus"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
              />

              <input
                type="number"
                placeholder="Deduction"
                value={formData.deduction}
                onChange={(e) => setFormData({ ...formData, deduction: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
              />

              <input
                type="number"
                placeholder="Net Salary"
                value={
                  formData.basicSalary
                    ? (Number(formData.basicSalary) || 0) + (Number(formData.bonus) || 0) - (Number(formData.deduction) || 0)
                    : ""
                }
                readOnly
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 font-bold text-indigo-700 outline-none w-28 cursor-not-allowed"
                title="Automatically calculated: Basic + Bonus - Deduction"
              />
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>

              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
              >
                {isEditing ? 'Update Salary' : 'Add Salary'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        )}

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
                {isAdmin && <th className="text-left px-6 py-4">Action</th>}
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
                      <td className="px-6 py-4 text-gray-900">₹{item.basicSalary}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">+₹{item.bonus}</td>
                      <td className="px-6 py-4 text-red-500 font-medium">-₹{item.deduction}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">₹{item.netsalary}</td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            Edit
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
        </div>
      </div>
    </div>
  );
}

export default Salary;