import { api } from "./client";

export async function getVideos(params = {}) {
  const response = await api.get("/videos", { params });
  return response.data;
}

export async function getVideo(videoId) {
  const response = await api.get(`/videos/${videoId}`);
  return response.data;
}

export async function publishVideo({ title, description, video, thumbnail }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("video", video);
  formData.append("thumbnail", thumbnail);

  const response = await api.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateVideo(videoId, { title, description, thumbnail }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  if (thumbnail) formData.append("thumbnail", thumbnail);

  // The backend currently declares upload.single("req.file?.thumbnail"),
  // which does not match the normal "thumbnail" field. This function sends
  // the natural field name; fix the backend route to upload.single("thumbnail")
  // if thumbnail replacement is required.
  const response = await api.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteVideo(videoId) {
  const response = await api.delete(`/videos/${videoId}`);
  return response.data;
}

export async function togglePublish(videoId) {
  const response = await api.patch(`/videos/toggle/publish/${videoId}`);
  return response.data;
}
