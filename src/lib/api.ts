import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const redirectToLogin = () => {
  localStorage.removeItem("token");
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
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
        const auth = getAuth();
        const user = await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribe();
            resolve(firebaseUser);
          });
        });

        if (window.location.pathname.includes("/login")) {
          return Promise.reject(error);
        }
        console.log(user, "user is null or undefined");
        if (!user) {
          redirectToLogin();
          return Promise.reject(error);
        }

        // Try to refresh the token
        try {
          const newToken = await user.getIdToken(true);
          localStorage.setItem("token", newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } catch (error) {
        if (!window.location.pathname.includes("/login")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
