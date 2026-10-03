import api from "./api";

export const getWorkspaceDocument = async (workspaceId) => (await api.get(`/documents/workspace/${workspaceId}`)).data;
export const createWorkspaceDocument = async (workspaceId, data = {}) => (await api.post(`/documents/workspace/${workspaceId}`, data)).data;
export const updateDocument = async (documentId, content) => (await api.put(`/documents/${documentId}`, { content })).data;
export const renameDocument = async (documentId, title) => (await api.patch(`/documents/${documentId}/title`, { title })).data;
