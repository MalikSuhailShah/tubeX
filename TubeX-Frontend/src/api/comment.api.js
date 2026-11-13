import { api } from "./client";

export async function getComments(videoId, params = { page: 1, limit: 20 }) {
  const response = await api.get(`/comments/${videoId}`, { params });
  return response.data;
}

export async function addComment(videoId, content) {
  const response = await api.post(`/comments/${videoId}`, { content });
  return response.data;
}

export async function updateComment(commentId, content) {
  const response = await api.patch(`/comments/c/${commentId}`, { content });
  return response.data;
}

export async function deleteComment(commentId) {
  const response = await api.delete(`/comments/c/${commentId}`);
  return response.data;
}
