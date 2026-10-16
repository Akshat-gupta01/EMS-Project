import api from "../utils/axios";

// 1. Create Leave Type
export async function createLeaveType(data) {
    return api.post("/api/leavetype/add-leavetype", data);
}

// 2. Get All Leave Types
export async function getAllLeaveTypes() {
    return api.get("/api/leavetype/get-all-leavetypes");
}

// 3. Update Leave Type
export async function updateLeaveType(id, data) {
    return api.patch(`/api/leavetype/update-leavetype/${id}`, data);
}

// 4. Archive / Unarchive Leave Type
export async function archiveLeaveType(id, data = {}) {
    return api.patch(`/api/leavetype/archive-leavetype/${id}`, data);
}

// 5. Delete Leave Type
export async function deleteLeaveType(id) {
    return api.delete(`/api/leavetype/delete-leavetype/${id}`);
}
