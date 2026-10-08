import api from "../utils/axios";

export const markattendance=async(userData)=>{
    return api.post("/api/attendance/mark",userData)
}

export const updateAttendance=async(id,userData)=>{
    return api.patch(`/api/attendance/attendance/${id}`,userData)
}

export const getAllAttendance=async()=>{
    return api.get(`/api/attendance/get-attendance`)
}

export const getAttendanceReport = async (params) => {
    return api.get("/api/attendance/attendance-report", { params });
}