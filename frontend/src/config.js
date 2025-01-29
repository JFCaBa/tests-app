const isDevelopment = import.meta.env.MODE === "development";

export const config = {
  apiBaseUrl: isDevelopment
    ? "http://localhost:1999/api"
    : "https://testmyrussian.com/api",
  corsOrigins: isDevelopment
    ? ["http://localhost:5173"]
    : ["https://testmyrussian.com", "https://www.testmyrussian.com"],
};
