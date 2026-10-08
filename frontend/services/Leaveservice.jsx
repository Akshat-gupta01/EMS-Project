import api from "../utils/axios";

export async function leaveCreate(data) {
    return api.post("/api/leave/apply", data);
}

export async function leaveUpdate(id, data) {
    return api.patch(`/api/leave/update/${id}`, data);
}

export async function leaveGetAll(page = 1, limit = 10,search) {
    return api.get("/api/leave/get-all-leave", {
        params: { page, limit,search }
    });
}


