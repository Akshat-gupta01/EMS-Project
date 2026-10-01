import api from "../utils/axios";

export async function addSalary(salary) {
    return api.post("/api/salary/add-salary", salary);
}
export async function getAllSalary() {
    return api.get("/api/salary/get-all-salary");
}
export async function updateSalary(id, salary) {
    return api.patch(`/api/salary/update-salary/${id}`, salary);
}
export async function getmySalary() {
    return api.get("/api/salary/get-my-salary");
}