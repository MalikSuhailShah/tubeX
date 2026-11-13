import { api } from "./client";

export async function getChannelStats() {
  const response = await api.get("/dashboard/stats");
  return response.data;
}

export async function getChannelVideos() {
  const response = await api.get("/dashboard/videos");
  return response.data;
}
