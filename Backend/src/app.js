const express = require('express');
const cookieParser=require('cookie-parser');
const authRoutes = require('./Routes/auth.routes');
const userRoutes=require('./Routes/user.routes');
const departmentroutes=require('./Routes/department.routes');
const attendenceRoutes=require('./Routes/attendance.routes')
const salaryRoutes = require('./Routes/salary.routes');
const leaveRoutes = require('./Routes/leave.routes');
const roleRoutes=require('./Routes/role.routes');

const cors=require('cors')

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://192.168.1.113:5173",
    credentials:true,
}));


app.use('/api/auth',authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/department',departmentroutes)
app.use('/api/attendance', attendenceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/role', roleRoutes);

module.exports = app;

