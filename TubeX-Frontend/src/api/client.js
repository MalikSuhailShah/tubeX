import axios from "axios";

// One Axios instance keeps the API base URL and authentication logic in one place.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
});

// Before every request, attach the access token returned by the login endpoint.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tubeX_accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If an access token expires, use the refresh token once and retry the original request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/refresh-token") &&
      localStorage.getItem("tubeX_refreshToken")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/users/refresh-token`,
          { refreshToken: localStorage.getItem("tubeX_refreshToken") },
          { withCredentials: true }
        );

        const { accessToken, refreshToken } = refreshResponse.data.data;
        localStorage.setItem("tubeX_accessToken", accessToken);
        localStorage.setItem("tubeX_refreshToken", refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("tubeX_accessToken");
        localStorage.removeItem("tubeX_refreshToken");
        localStorage.removeItem("tubeX_user");
      }
    }

    return Promise.reject(error);
  }
);

// Backend errors are shaped as { message, ... }, so keep error extraction consistent.
export function getApiError(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong";
}
