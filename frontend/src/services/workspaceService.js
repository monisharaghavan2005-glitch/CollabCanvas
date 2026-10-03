import api from "./api";

export const getWorkspaces = async () => (await api.get("/workspaces")).data;
export const getWorkspace = async (id) => (await api.get(`/workspaces/${id}`)).data;
export const createWorkspace = async (data) => (await api.post("/workspaces", data)).data;
export const getWorkspaceMembers = async (id) => (await api.get(`/workspaces/${id}/members`)).data;
export const getWorkspaceActivity = async (id) => (await api.get(`/workspaces/${id}/activity`)).data;
export const updateWorkspace = async (id, data) => (await api.patch(`/workspaces/${id}`, data)).data;
