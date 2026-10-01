import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getMe } from '../../services/Authservice';
import toast from 'react-hot-toast';

function PendingApproval() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // Status check function
  const checkApprovalStatus = async (isAuto = false) => {
    try {
      setChecking(true);
      const response = await getMe();
      const currentUser = response.data?.user;

      if (currentUser && currentUser.roleId !== null) {
        toast.success(`Role Assigned (${currentUser.role || 'Employee'})! Redirecting to Dashboard...`);
        navigate('/dashboard');
      } else {
        if (!isAuto) {
          toast.error("Status: Pending. Admin has not assigned a role yet.");
        }
      }
    } catch (err) {
      console.log(err);
      if (!isAuto) {
        toast.error(err.response?.data?.message || "Failed to check status");
      }
    } finally {
      setChecking(false);
    }
  };

  // Mount hone par automatically check karo
  useEffect(() => {
    checkApprovalStatus(true);
  }, []);

  const handleLogout = async () => {
    // Cookie / Token clear karke login par bhej do
    try {
      const response = await logout();
      toast.success(response.data?.message || "Logout Successful");
      navigate('/login');
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Clock ya Sandglass Icon */}
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ⏳
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Waiting for Admin Approval
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Aapka email successfully verify ho gaya hai! 🎉<br />
          Admin aapki profile review kar raha hai. 
          Jaise hi Admin aapko <strong>Role & Department</strong> assign karega, 
          aapka dashboard activate ho jayega.
        </p>

        <div className="space-y-3">
          {/* Status refresh karne ke liye button */}
          <button 
            onClick={() => checkApprovalStatus(false)} 
            disabled={checking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
          >
            {checking ? "Checking..." : "Check Status"}
          </button>

          <button 
            onClick={handleLogout} 
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingApproval;