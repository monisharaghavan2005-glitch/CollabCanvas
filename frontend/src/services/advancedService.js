import api from './api';
export const getDocumentVersions = async (id) => (await api.get(`/advanced/documents/${id}/versions`)).data;
export const getDocumentVersion = async (id, versionId) => (await api.get(`/advanced/documents/${id}/versions/${versionId}`)).data;
export const getComments = async (id) => (await api.get(`/advanced/documents/${id}/comments`)).data;
export const addComment = async (id, data) => (await api.post(`/advanced/documents/${id}/comments`, data)).data;
export const resolveComment = async (id) => (await api.patch(`/advanced/comments/${id}/resolve`)).data;
