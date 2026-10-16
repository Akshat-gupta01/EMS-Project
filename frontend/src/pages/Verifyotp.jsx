import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { verify } from '../../services/Authservice'

function Verifyotp() {
  const navigate = useNavigate();
  const [verifyuser, setVerifyuser] = useState({ email: "", otp: "" })

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await verify(verifyuser);
      console.log(verifyuser);
      toast.success(response.data?.message || "Verified");
      navigate('/');
    }
    catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Verification Failed");
    }
  }

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center p-4"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-center mb-1.5 text-indigo-600 text-2xl sm:text-3xl font-bold">
          Verify OTP
        </h2>
        <p className="text-center text-gray-400 text-xs sm:text-sm mb-6">
          Enter OTP sent to your email
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="email"
              value={verifyuser.email}
              onChange={(e) => setVerifyuser({ ...verifyuser, email: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition duration-150"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-indigo-600 text-xs uppercase tracking-wider">
              OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={verifyuser.otp}
              onChange={(e) => setVerifyuser({ ...verifyuser, otp: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition duration-150"
            />
          </div>

          <button
            type="submit"
            className="py-3 text-white rounded-lg text-sm font-semibold mt-2 tracking-wide cursor-pointer border-none shadow-md hover:opacity-95 active:scale-[0.99] transition duration-150"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
          >
            Verify OTP
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already verified?{' '}
          <Link to="/" className="text-indigo-600 font-medium hover:underline cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Verifyotp