import axios from "axios";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Get the current domain if we're in a browser
const currentDomain = isBrowser
  ? window.location.origin
  : "https://testmyrussian.com";

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: currentDomain,
  withCredentials: true,
  timeout: 240000,
  headers: {
    Accept: "application/json",
    "Cache-Control": "no-cache",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the full URL being requested
    console.log("Making request to:", config.baseURL + config.url);
    console.log("Request config:", {
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? "FormData" : config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", {
      message: error.message,
      status: error?.response?.status,
      url: error?.config?.url,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
