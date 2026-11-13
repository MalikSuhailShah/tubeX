import { api } from "./client.js";

export async function createPlaylist(data) {
  const response = await api.post("/playlist", data);
  return response.data;
}

export async function getUserPlaylists(userId) {
  const response = await api.get(`/playlist/user/${userId}`);
  return response.data;
}

export async function getPlaylist(playlistId) {
  const response = await api.get(`/playlist/${playlistId}`);
  return response.data;
}

export async function updatePlaylist(playlistId, data) {
  const response = await api.patch(`/playlist/${playlistId}`, data);
  return response.data;
}

export async function deletePlaylist(playlistId) {
  const response = await api.delete(`/playlist/${playlistId}`);
  return response.data;
}

export async function addVideoToPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
  return response.data;
}

export async function removeVideoFromPlaylist(videoId, playlistId) {
  const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
  return response.data;
}
