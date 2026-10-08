import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiPlus, HiCheck, HiShieldCheck } from 'react-icons/hi';
import Sidebar from './Sidebar';
import { getAllRoles,getAllPermissions,createRole,updatePermission,} from '../../services/Roleservice';

function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  
  // Modal for adding a new role
  const [openModal, setOpenModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRole = async () => {
    try {
      const res = await getAllRoles();
      const roleList = res.data?.roles || [];
      setRoles(roleList);

      // Agar backend se roles mile hain
      if (roleList.length > 0) {
        // Step A: Kaunsa role select karna hai?
        // Agar user ne pehle se koi role select kar rakha tha toh wahi rakho, warna 1st role le lo
        let activeRole = roleList[0];
        if (selectedRole) {
          const found = roleList.find((r) => r.id === selectedRole.id);
          if (found) activeRole = found;
        }

        // Step B: Active role ko state mein save karo
        setSelectedRole(activeRole);

        // Step C: Us role ki permissions ke IDs nikaal kar checkboxes ke liye save karo
        const permIds = (activeRole.Permissions || []).map((p) => p.id);
        setSelectedPermIds(permIds);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching roles");
    }
  };

  const fetchPermission = async () => {
    try {
      const res = await getAllPermissions();
      if (res?.data?.permissions) {
        setPermissions(res.data.permissions);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching permissions");
    }
  };

  // Page load par data fetch karo
  useEffect(() => {
    fetchRole();
    fetchPermission();
  }, []);

  // Jab user kisi role tab par click kare
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    // Us role ki assigned permissions ke IDs store karo
    const currentPermIds = (role.Permissions || []).map((p) => p.id);
    setSelectedPermIds(currentPermIds);
  };

  // Checkbox toggle karne par
  const handleCheckboxChange = (permId) => {
    if (selectedRole?.name?.toLowerCase() === 'admin') {
      toast.error('Admin has all permissions by default');
      return;
    }

    if (selectedPermIds.includes(permId)) {
      // Agar pehle se checked hai, toh remove karo
      setSelectedPermIds(selectedPermIds.filter((id) => id !== permId));
    } else {
      // Agar unchecked hai, toh add karo
      setSelectedPermIds([...selectedPermIds, permId]);
    }
  };

  // Permissions save karo
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      const response = await updatePermission(selectedRole.id, {
        permissions: selectedPermIds,
      });
      toast.success(response.data?.message || 'Permissions updated successfully');
      fetchRole(); // Roles list refresh karo
    } catch (error) {
      console.log(error);
      toast.error('Error saving permissions');
    }
  };

  // Naya Role create karo
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      return toast.error('Role name is required');
    }
    try {
      const response = await createRole({ name: newRoleName.trim() });
      toast.success(response.data?.message || 'Role created successfully');
      setNewRoleName('');
      setOpenModal(false);
      fetchRole(); // Refresh roles list
    } catch (error) {
      console.log(error);
      toast.error('Error creating role');
    }
  };

  const isAdmin = selectedRole?.name?.toLowerCase() === 'admin';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-sm text-gray-500">Manage user roles and assign permissions</p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <HiPlus /> Add New Role
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {role.name}
              </button>
            );
          })}
        </div>

        {/* Selected Role Permissions Card */}
        {selectedRole && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Top Bar inside Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                  <HiShieldCheck className="text-indigo-600 text-xl" />
                  {selectedRole.name} Role Permissions
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Check or uncheck the boxes below to grant or revoke access
                </p>
              </div>

              <button
                onClick={handleSavePermissions}
                disabled={isAdmin}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  isAdmin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                <HiCheck className="text-lg" />
                Save Changes
              </button>
            </div>

            {/* Permissions Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {permissions.map((perm) => {
                const isChecked = isAdmin || selectedPermIds.includes(perm.id);

                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium'
                        : 'bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isAdmin}
                      onChange={() => handleCheckboxChange(perm.id)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm capitalize font-medium">
                      {perm.name.replaceAll('_', ' ')}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add New Role Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Role</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                placeholder="e.g. Supervisor, Team Lead"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition cursor-pointer"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPermissions;
