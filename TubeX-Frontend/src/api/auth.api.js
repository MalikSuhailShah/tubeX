import { api } from "./client";

export async function registerUser(formData) {
  const response = await api.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/users/login", credentials);
  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/users/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/users/current-user");
  return response.data;
}

export async function updateAccountDetails(data) {
  const response = await api.patch("/users/update-account", data);
  return response.data;
}

export async function changePassword(data) {
  const response = await api.post("/users/change-password", data);
  return response.data;
}

export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.patch("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateCoverImage(file) {
  const formData = new FormData();
  formData.append("coverImage", file);
  const response = await api.patch("/users/cover-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getChannelProfile(username) {
  const response = await api.get(`/users/c/${encodeURIComponent(username)}`);
  return response.data;
}

export async function getWatchHistory() {
  const response = await api.get("/users/history");
  return response.data;
}
