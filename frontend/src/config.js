const isDevelopment = import.meta.env.MODE_ENV === "development";

export const config = {
  // Using relative URL so it uses the same domain as the frontend
  apiBaseUrl: "/api",
  corsOrigins: ["https://testmyrussian.com", "https://www.testmyrussian.com"],
};
