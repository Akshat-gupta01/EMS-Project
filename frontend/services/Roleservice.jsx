import api from "../utils/axios"

export const getAllRoles=async()=>{
    return api.get("/api/role/roles")
}

export const getAllPermissions=async()=>{
    return api.get("/api/role/permissions")
}

export const createRole=async(data)=>{
    return api.post("/api/role/create-role",data)
}

export const updatePermission=async(id,data)=>{
    return api.patch(`/api/role/edit-role/${id}/permissions`,data)
}