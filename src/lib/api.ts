import axios from "axios";
import { getAuth } from "firebase/auth";

const redirectToLogin = () => {
  localStorage.removeItem("token");
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};

const url =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/"
    : "https://smartchatai-fastapi.onrender.com/";

const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use Firebase SDK to refresh token since user is signed in
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          if (window.location.pathname.includes("/login")) {
            return Promise.reject(error);
          }
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // No user signed in, redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
