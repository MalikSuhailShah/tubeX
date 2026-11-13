import { api } from "./client";

export async function toggleSubscription(channelId) {
  const response = await api.post(`/subscriptions/c/${channelId}`);
  return response.data;
}

export async function getChannelSubscribers(channelId) {
  const response = await api.get(`/subscriptions/c/${channelId}`);
  return response.data;
}

export async function getSubscribedChannels(subscriberId) {
  const response = await api.get(`/subscriptions/u/${subscriberId}`);
  return response.data;
}
