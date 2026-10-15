import api from "../utils/axios";

// 1. Employee creates personal task
export const addTask = async (data) => {
    return api.post('/api/task/create-task', data);
};

// 2. Admin/HR/Manager assigns task to employee
export const assignTask = async (data) => {
    return api.post('/api/task/assign-task', data);
};

// 3. Fetch tasks (GET request matching backend route /api/task/get-task)
export const getTasks = async (params) => {
    return api.get('/api/task/get-task', { params });
};

// 4. Update task details
export const updateTask = async (id, data) => {
    return api.patch(`/api/task/update-task/${id}`, data);
};

// 6. Delete task (Admin only)
export const deleteTask = async (id) => {
    return api.delete(`/api/task/delete-task/${id}`);
};

