import { api } from "./client";

export async function toggleVideoLike(videoId) {
  const response = await api.post(`/likes/toggle/v/${videoId}`);
  return response.data;
}

export async function toggleCommentLike(commentId) {
  const response = await api.post(`/likes/toggle/c/${commentId}`);
  return response.data;
}

export async function toggleTweetLike(tweetId) {
  const response = await api.post(`/likes/toggle/t/${tweetId}`);
  return response.data;
}

export async function getLikedVideos() {
  const response = await api.get("/likes/videos");
  return response.data;
}
