import api from "../utils/axios";

export const getAllEmployees = async (page = 1, limit = 10, status,search) => {
  if (typeof page === 'string') {
    return api.get("/api/user/get-all-users", { params: { status: page } });
  }
  return api.get("/api/user/get-all-users", {
    params: { page, limit, status,search }
  });
};

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

export const createEmployee=async(data)=>{
    return api.post("/api/user/create-employee",data)
}

export const updateStatus = async (id, data) => {
  return api.patch(`/api/user/update-status/${id}`, data);
};

export const getEmployeeStatusStats = async () => {
  return api.get("/api/user/employee-status-stats");
  
};
