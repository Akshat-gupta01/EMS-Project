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

export const uploadProfileImage = async (file, userId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    if (userId) {
        formData.append('userId', userId);
    }
    return await api.post('/api/auth/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
