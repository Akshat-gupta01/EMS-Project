import api from "../utils/axios";

export const register = async(userData) => {
    return api.post("/api/auth/register",userData);
}

export const login=async (userData)=>{
    return api.post("/api/auth/login",userData)
}

export const verify=async (userData)=>{
    return api.post("/api/auth/verify-otp",userData)
}

export const logout=async ()=>{
    return api.get("/api/auth/logout")
}

export const getMe = async () => {
    return api.get("/api/auth/me");
}

