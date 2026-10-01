import React, { useEffect, useState } from 'react';
import { getAllEmployees,updateEmployee,deleteEmployee,updateRole,getAllRoles,updateUserDepartment } from '../../services/Userservice';
import { getAllDepartments } from '../../services/Departmentservice';
import { HiPencil, HiTrash } from 'react-icons/hi';
import Sidebar from './Sidebar';
import toast from 'react-hot-toast';

function Employee() {
  const [employees, setEmployees] = useState([]); // get all employees
  const [openModal, setOpenModal] = useState(false); //edit modal open hua hai
  const [selectedEmployee, setSelectedEmployee] = useState(null); // employee info rakhta hai
  const [roles, setRoles] = useState([]); // roles store karta hai
  const [openRoleModal, setOpenRoleModal] = useState(false); // role change modal open hua hai
  const [selectedRoleEmp, setSelectedRoleEmp] = useState(null); // employee role info rakhta hai
  const [departments, setDepartments] = useState([]); // departments list
  const [openDeptModal, setOpenDeptModal] = useState(false); // dept assign modal
  const [selectedDeptEmp, setSelectedDeptEmp] = useState(null); // employee for dept assign

  const fetchusers = async () => {
    try {
      const response = await getAllEmployees();
      console.log(response);
      setEmployees(response.data?.user || []);
    } catch (err) {
      console.log(err);
    }
  };

  const Updateuser = async () => {
    try{
      const response=await updateEmployee(selectedEmployee.id,selectedEmployee);
      console.log(response);
      setOpenModal(false);
      fetchusers();
      if (response.data.message) {
        toast.success(response.data.message);
      }
    }catch(err){
      console.log(err);
      toast.error("Error updating employee");
    }
  }


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

  // Department fetch karo (Department Assignment dropdown ke liye)
  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      setDepartments(response.data?.department || []);
    } catch (err) {
      console.log(err);
    }
  };

  const updaterole = async () => {
    try{
      const response=await updateRole(selectedRoleEmp.id, { roleId: selectedRoleEmp.roleId });
      console.log(response);
      setOpenRoleModal(false);
      fetchusers();
      if (response.data.message) {
        toast.success(response.data.message);
      }
    }catch(err){
      console.log(err);
      toast.error("Error updating role");
    }
  }

  // Department assign karne ka function (bilkul updaterole jaisa)
  const assignDepartment = async () => {
    try{
      const response = await updateUserDepartment(selectedDeptEmp.id, { departmentId: selectedDeptEmp.departmentId });
      setOpenDeptModal(false);
      fetchusers();
      if (response.data.message) {
        toast.success(response.data.message);
      }
    }catch(err){
      console.log(err);
      toast.error("Error assigning department");
    }
  }


  useEffect(() => {
    fetchusers();
    fetchRoles();
    fetchDepartments(); // Page load par departments bhi fetch karo
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
                      <div className="flex items-center justify-center gap-2">
                        {emp.Role ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                            {emp.Role.name}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            Pending Approval
                          </span>
                        )}

                        {/* Admin ko role assign nahi hoga */}
                        {emp.roleId !== 1 && (
                          <button
                            onClick={() => {
                              setSelectedRoleEmp(emp);
                              setOpenRoleModal(true);
                            }}
                            className="text-gray-400 hover:text-indigo-600"
                            title="Assign Role"
                          >
                            <HiPencil className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-6 text-sm text-gray-600 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {emp.department ? (
                          <span className="font-medium text-gray-800">{emp.department.departmentName}</span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not Assigned</span>
                        )}
                        {/* Admin ko department assign/edit nahi hoga */}
                        {emp.roleId !== 1 && (
                          <button
                            onClick={() => {
                              setSelectedDeptEmp(emp);
                              setOpenDeptModal(true);
                            }}
                            className="text-gray-400 hover:text-indigo-600"
                            title="Assign Department"
                          >
                            <HiPencil className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {emp.status || 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                        <button onClick={()=>{
                          setSelectedEmployee(emp);
                          setOpenModal(true);
                        }}  className="text-gray-400 hover:text-indigo-600">
                        <HiPencil className="text-lg" />
                        </button>

                        <button onClick={()=>Deleteuser(emp.id)} className="text-gray-400 hover:text-red-600">
                        <HiTrash className="text-lg" />
                        </button>
                    </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>

            <input
              type="text"
              value={selectedEmployee?.username}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  username: e.target.value,
                })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="email"
              value={selectedEmployee?.email}
              onChange={(e) =>
                setSelectedEmployee({
                  ...selectedEmployee,
                  email: e.target.value,
                })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button onClick={()=>Updateuser()} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assign Modal */}
      {openRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Assign Role</h2>
            <p className="text-sm text-gray-500 mb-3">{selectedRoleEmp?.username}</p>

            {/* Dropdown — sabhi roles */}
            <select
              value={selectedRoleEmp?.roleId || ''}
              onChange={(e) =>
                setSelectedRoleEmp({
                  ...selectedRoleEmp,
                  roleId: Number(e.target.value),
                })
              }
              className="border p-2 w-full mb-4 rounded"
            >
              <option value="">-- Select Role --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setOpenRoleModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => updaterole()}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Assign Modal (bilkul Role Modal jaisa) */}
      {openDeptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Assign Department</h2>
            <p className="text-sm text-gray-500 mb-3">{selectedDeptEmp?.username}</p>

            {/* Dropdown — saari departments */}
            <select
              value={selectedDeptEmp?.departmentId || ''}
              onChange={(e) =>
                setSelectedDeptEmp({
                  ...selectedDeptEmp,
                  departmentId: Number(e.target.value),
                })
              }
              className="border p-2 w-full mb-4 rounded"
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setOpenDeptModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => assignDepartment()}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employee;