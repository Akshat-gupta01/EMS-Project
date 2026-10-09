import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi';
import Sidebar from './Sidebar';
import { addDepartment, getAllDepartments, updateDepartment, deleteDepartment } from '../../services/Departmentservice';
import { getMe } from '../../services/Authservice';
import { hasPermission } from '../../utils/Permission';

function Department() {
  const [departments, setDepartments] = useState([]); // getall department
  const [openModal, setOpenModal] = useState(false);  // screen open karne ke liye
  const [selectedDept, setSelectedDept] = useState(null); // store current selected department data
  const [isEditing, setIsEditing] = useState(false); // for toggle edit and add
  const [search, setSearch] = useState('');

  // Permission State
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState('');
  
  // Initial load par user permissions fetch karein
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await getMe();
        setPermissions(response.data?.permissions || []);
        setRole(response.data?.user?.role || '');
      } catch (err) {
        console.error("Failed to fetch user permissions:", err);
      }
    };
    fetchUserPermissions();
  }, []);

  // Jab search badle, departments fetch karein
  useEffect(() => {
    getallDepts();
  }, [search]);

  const getallDepts = async () => {
    try {
      const response = await getAllDepartments(search);
      setDepartments(response.data?.department || []);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching departments");
    }
  };

  const handleSave = async () => {
    if (!selectedDept?.departmentName?.trim()) {
      return toast.error("Department name is required");
    }

    try {
      if (isEditing) {
        // UPDATE API CALL
        const response = await updateDepartment(selectedDept.id, { departmentName: selectedDept.departmentName });
        toast.success(response.data.message);
      } else {
        // ADD API CALL
        const response = await addDepartment({ departmentName: selectedDept.departmentName });
        toast.success(response.data.message);
      }
      setOpenModal(false); // kaam hone ke baad modal band
      getallDepts();       // list refresh
    } catch (error) {
      console.log(error);
      toast.error(`Error ${isEditing ? 'updating' : 'adding'} department`);
    }
  };

  const deleteDept = async (id) => {
    if(!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await deleteDepartment(id);
      toast.success(response.data.message);
      getallDepts();
    } catch (error) {
      console.log(error);
      toast.error("Error deleting department");
    }
  };

  // ─── MODAL OPEN FUNCTIONS ────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditing(false); // Mode = Add
    setSelectedDept({ departmentName: '' }); // Input field khali karo
    setOpenModal(true);
  };

  const openEditModal = (dept) => {
    setIsEditing(true); // Mode = Edit
    setSelectedDept(dept); // Us department ka data input field mein bhar do
    setOpenModal(true);
  };

  // ─── UI LIKEN TO EMPLOYEE.JSX ────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar (same as Employee.jsx) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments Directory</h1>
            <p className="text-sm text-gray-500">Manage company departments</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm w-full sm:w-64"
            />
            {hasPermission(permissions, 'create_department', role) && (
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap"
              >
                <HiPlus /> Add Department
              </button>
            )}
          </div>
        </div>

        {/* Table Card (Styled like Employee.jsx) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 text-left w-20">DEPT ID</th>
                <th className="px-4 py-4 text-left">DEPARTMENT NAME</th>
                <th className="px-4 py-4 text-center">ENROLLED EMPLOYEES</th>
                <th className="px-4 py-4 text-center w-28">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 text-sm font-bold text-gray-400">
                      #{dept.id}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">
                      {dept.departmentName}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {dept.employees?.length || 0} Employees
                      </span>
                    </td> 
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-3">
                        {hasPermission(permissions, 'update_department', role) && (
                          <button
                            onClick={() => openEditModal(dept)}
                            className="text-gray-400 hover:text-indigo-600 transition"
                            title="Edit"
                          >
                            <HiPencil className="text-lg" />
                          </button>
                        )}
                        {hasPermission(permissions, 'delete_department', role) && (
                          <button
                            onClick={() => deleteDept(dept.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <HiTrash className="text-lg" />
                          </button>
                        )}
                        {!hasPermission(permissions, 'update_department', role) &&
                          !hasPermission(permissions, 'delete_department', role) && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal (Single modal dono kaam karega) */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Edit Department' : 'Add New Department'}
            </h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                placeholder="e.g. Human Resources"
                value={selectedDept?.departmentName || ''}
                onChange={(e) =>
                  setSelectedDept({
                    ...selectedDept,
                    departmentName: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Department;