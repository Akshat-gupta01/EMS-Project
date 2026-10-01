import api from "../utils/axios";

export const getAllEmployees=async()=>{
    return api.get("/api/user/get-all-users")
}

export const updateEmployee = async (id, data) => {
  return api.patch(`/api/user/update-employee/${id}`, data);
};

export const deleteEmployee = async (id) => {
  return api.delete(`/api/user/delete-employee/${id}`);
};

export const updateRole = async (id, data) => {
  return api.patch(`/api/user/update-role/${id}`, data);
};

export const getAllRoles = async () => {
  return api.get("/api/user/get-all-roles");
};

export const updateUserDepartment = async (id, data) => {
  return api.patch(`/api/user/update-department/${id}`, data);
};