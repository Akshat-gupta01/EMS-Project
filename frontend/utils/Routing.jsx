import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Register from '../src/Components/Register'
import Login from '../src/Components/Login'
import Logout from '../src/Components/Logout'
import Verifyotp from '../src/Components/Verifyotp'
import Dashboard from '../src/Components/Dashboard'
import Pendingapproval from '../src/Components/Pendingapproval'
import Employee from '../src/Components/Employee'
import Department from '../src/Components/Department'
import Attendance from '../src/Components/Attendance'
import Salary from '../src/Components/Salary'
import Leave from '../src/Components/Leave'
import RolesPermissions from '../src/Components/RolesPermissions'
import Attendancereport from '../src/Components/Attendancereport'

function Routing() {
  return (
    <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path='/verifyotp' element={<Verifyotp/>}/>
        <Route path='/logout' element={<Logout/>}/>
        <Route path='/pendingapproval' element={<Pendingapproval/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/employees" element={<Employee/>}/>
        <Route path="/department" element={<Department/>}/>
        <Route path="/roles-permissions" element={<RolesPermissions/>}/>
        <Route path="/attendance" element={<Attendance/>}/>
        <Route path="/salary" element={<Salary/>}/>
        <Route path="/leave" element={<Leave/>}/>
        <Route path="/attendance-report" element={<Attendancereport/>}/>
    </Routes>
  )
}

export default Routing