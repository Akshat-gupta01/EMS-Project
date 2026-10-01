import api from "../utils/axios";


export const addDepartment = async (data) => {
  return api.post("/api/department/add-department", data);
};

export const getAllDepartments = async () => {
  return api.get("/api/department/get-all-departments");
};

export const updateDepartment = async (id, data) => {
  return api.patch(`/api/department/update-department/${id}`, data);
};

export const deleteDepartment = async (id) => {
  return api.delete(`/api/department/delete-department/${id}`);
};


