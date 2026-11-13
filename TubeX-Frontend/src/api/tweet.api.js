import { api } from "./client";

export async function createTweet(content) {
  const response = await api.post("/tweets", { content });
  return response.data;
}

export async function getUserTweets(userId) {
  const response = await api.get(`/tweets/user/${userId}`);
  return response.data;
}

export async function updateTweet(tweetId, content) {
  const response = await api.patch(`/tweets/${tweetId}`, { content });
  return response.data;
}

export async function deleteTweet(tweetId) {
  const response = await api.delete(`/tweets/${tweetId}`);
  return response.data;
}
