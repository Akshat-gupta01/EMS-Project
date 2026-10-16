import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Register from '../src/pages/Register'
import Login from '../src/pages/Login'
import Logout from '../src/pages/Logout'
import Verifyotp from '../src/pages/Verifyotp'
import Dashboard from '../src/Components/Dashboard'
import Pendingapproval from '../src/pages/Pendingapproval'
import Employee from '../src/Components/Employee'
import Department from '../src/Components/Department'
import Attendance from '../src/Components/Attendance'
import Salary from '../src/Components/Salary'
import Leave from '../src/Components/Leave'
import RolesPermissions from '../src/Components/RolesPermissions'
import Attendancereport from '../src/Components/Attendancereport'
import Task from '../src/Components/Task'
import Leavetypesetting from '../src/pages/Leavetypesetting'

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
        <Route path='/leave-type-settings' element={<Leavetypesetting/>}/>
        <Route path="/leave" element={<Leave/>}/>
        <Route path="/attendance-report" element={<Attendancereport/>}/>
        <Route path="/tasks" element={<Task/>}/>
    </Routes>
  )
}

export default Routing