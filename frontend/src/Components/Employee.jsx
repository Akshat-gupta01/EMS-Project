import React, { useEffect, useState } from 'react';
import { getAllEmployees, updateEmployee, deleteEmployee, getAllRoles, createEmployee } from '../../services/Userservice';
import { getAllDepartments } from '../../services/Departmentservice';
import { HiPencil, HiTrash } from 'react-icons/hi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';
import toast from 'react-hot-toast';

function Employee() {
  const [employees, setEmployees] = useState([]); // All employees list
  const [roles, setRoles] = useState([]); // Roles list for dropdown
  const [departments, setDepartments] = useState([]); // Departments list for dropdown
  const [openModal, setOpenModal] = useState(false); // Unified edit modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Employee selected for edit
  const [openCreateModal, setOpenCreateModal] = useState(false); // Create employee modal state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
    departmentId: ''
  });


  // Search State
  const [search, setSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchusers = async (page = currentPage) => {
    try {
      const response = await getAllEmployees(page, itemsPerPage,'',search);
      console.log(response);
      setEmployees(response.data?.user || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalCount(response.data?.totalCount || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditEmployee = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await updateEmployee(selectedEmployee.id, selectedEmployee);
      console.log(response);
      setOpenModal(false);
      fetchusers();
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error updating employee");
    }
  };

  const Deleteuser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await deleteEmployee(id);
      console.log(response);
      fetchusers();
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error deleting employee");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles();
      setRoles(response.data?.roles || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      setDepartments(response.data?.department || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateEmployee = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await createEmployee(formData);
      console.log(response);
      setOpenCreateModal(false);
      setFormData({ username: '', email: '', password: '', roleId: '', departmentId: '' });
      fetchusers();
      if (response.data?.message) {
        toast.success(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Error creating employee");
    }
  };


  useEffect(() => {
    fetchusers(currentPage);
  }, [search,currentPage]);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees Directory</h1>
            <p className="text-sm text-gray-500">Manage all registered company members</p>
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
              onClick={() => setOpenCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>+ Add Employee</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 text-left w-16">EMP ID</th>
                <th className="px-4 py-4 text-left w-28">EMPLOYEE NAME</th>
                <th className="px-4 py-4 text-left w-52">EMAIL</th>
                <th className="px-4 py-4 text-center w-36">ROLE</th>
                <th className="px-4 py-4 text-center w-36">DEPARTMENT</th>
                <th className="px-4 py-4 text-center w-24">STATUS</th>
                <th className="px-4 py-4 text-center w-20">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                    {/* Name & Email with Avatar */}
                   <td className="py-4 px-6 text-sm font-bold text-gray-400">
                        {emp.id}
                   </td>
                   <td className="py-4 px-6 text-sm font-bold text-gray-400">
                        {emp.username}
                   </td>
                   <td className="py-4 px-6 text-sm font-bold text-gray-400">
                        {emp.email}
                   </td>

                    {/* Role */}
                    <td className="py-4 px-6 text-center">
                      {emp.Role ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                          {emp.Role.name}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-6 text-sm text-gray-600 text-center">
                      {emp.department ? (
                        <span className="font-medium text-gray-800">{emp.department.departmentName}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          emp.status?.toLowerCase() === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : emp.status?.toLowerCase() === 'inactive'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.status?.toLowerCase() === 'active'
                              ? 'bg-emerald-500'
                              : emp.status?.toLowerCase() === 'inactive'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        {emp.status?.toLowerCase() || 'pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      {emp.roleId === 1 || emp.Role?.name?.toLowerCase() === 'admin' ? (
                        <div className="flex justify-center">
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            -
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setOpenModal(true);
                            }}
                            className="text-gray-400 hover:text-indigo-600 transition"
                            title="Edit Employee"
                          >
                            <HiPencil className="text-lg" />
                          </button>

                          <button
                            onClick={() => Deleteuser(emp.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Delete Employee"
                          >
                            <HiTrash className="text-lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
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

      {/* Unified Edit Employee Modal */}
      {openModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">Edit Employee</h2>
              <p className="text-xs text-gray-500">Update employee profile, role, department and status</p>
            </div>

            <form onSubmit={handleEditEmployee} className="space-y-3">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={selectedEmployee.username || ''}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      username: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={selectedEmployee.email || ''}
                  onChange={(e) =>
                    setSelectedEmployee({
                      ...selectedEmployee,
                      email: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Dropdown (Disabled for Admin) */}
              {selectedEmployee.roleId !== 1 ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={selectedEmployee.roleId || ''}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        roleId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <span className="text-xs text-gray-500 font-medium">Role: <strong className="text-indigo-600">Admin (Locked)</strong></span>
                </div>
              )}

              {/* Department Dropdown (Disabled for Admin) */}
              {selectedEmployee.roleId !== 1 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={selectedEmployee.departmentId || ''}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        departmentId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Dropdown (Disabled for Admin) */}
              {selectedEmployee.roleId !== 1 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedEmployee.status || 'pending'}
                    onChange={(e) =>
                      setSelectedEmployee({
                        ...selectedEmployee,
                        status: e.target.value,
                      })
                    }
                    className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
              <p className="text-xs text-gray-500">Create an employee account directly</p>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-md cursor-pointer"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employee;