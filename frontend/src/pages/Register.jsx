import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../../services/Authservice'
import { HiEye, HiEyeOff } from 'react-icons/hi'

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  
  // Beginner-friendly state: true means show password, false means hide password
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(user);
    try {
      const res = await register(user);
      toast.success(res.data?.message || "Registration Successful!");
      navigate('/Verifyotp');
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Registration Failed!");
    }
  }
  

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center p-4"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-center mb-1.5 text-indigo-600 text-2xl sm:text-3xl font-bold">
          Create Account
        </h2>
        <p className="text-center text-gray-400 text-xs sm:text-sm mb-6">
          Register to get started
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              autoComplete="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition duration-150"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition duration-150"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                autoComplete="new-password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm outline-none bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="py-3 text-white rounded-lg text-sm font-semibold mt-2 tracking-wide cursor-pointer border-none shadow-md hover:opacity-95 active:scale-[0.99] transition duration-150"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            Register
          </button>
        </form>
        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/" className="text-indigo-600 font-medium hover:underline cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
