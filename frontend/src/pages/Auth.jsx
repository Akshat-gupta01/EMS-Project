import React, { useState, useEffect } from 'react'
import { getMe } from "../../services/Authservice";


function Auth() {
    const [currentUser, setCurrentUser] = useState(null);
    
  const fetchCurrentUser = async () => {
  try {
    const res = await getMe();
    if (res.data?.user) {
      setCurrentUser(res.data.user);
    }
  } catch (err) {
    console.error("Failed to fetch logged-in user:", err);
  }
};

const getRoleBadgeStyle = (roleName) => {
  const role = roleName?.toLowerCase() || '';

  switch (role) {
    case 'admin':
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700',
        dot: 'bg-purple-500',
        icon: '👑',
        label: 'Administrator'
      };
    case 'hr':
      return {
        bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700',
        dot: 'bg-emerald-500',
        icon: '📋',
        label: 'HR'
      };
    case 'manager':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
        dot: 'bg-blue-500',
        icon: '💼',
        label: 'Manager'
      };
    default:
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-700',
        dot: 'bg-emerald-500',
        icon: '👤',
        label: roleName || 'Employee'
      };
  }
};

    
useEffect(() => {
  fetchCurrentUser();
}, []);

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, <span className="font-semibold text-gray-800">{currentUser?.username || 'User'}</span>! 👋
        </p>
      </div>

      {/* Dynamic Role Badge Card */}
      {currentUser && (
        <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs">
          {/* User Initials Avatar */}
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Name and Email */}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {currentUser?.username}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentUser?.email}
            </p>
          </div>

          {/* Role Pill Badge */}
          {(() => {
            const badge = getRoleBadgeStyle(currentUser?.role);
            return (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                <span className="text-xs">{badge.icon}</span>
                <span className="capitalize">{badge.label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`}></span>
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Auth;