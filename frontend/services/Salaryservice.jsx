import api from "../utils/axios";

export async function addSalary(salary) {
    return api.post("/api/salary/add-salary", salary);
}
export async function getAllSalary(page = 1, limit = 10, search) {
    return api.get("/api/salary/get-all-salary", { params: { page, limit, search } });
}
export async function updateSalary(id, salary) {
    return api.patch(`/api/salary/update-salary/${id}`, salary);
}
export async function getmySalary(page = 1, limit = 10) {
    return api.get("/api/salary/get-my-salary", { params: { page, limit } });
}