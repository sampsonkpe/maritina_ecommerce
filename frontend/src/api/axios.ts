import axios from "axios";

import { getAccessToken } from "../utils/auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  const publicRoutes = [
    "/auth/login/",
    "/auth/register/",
  ];

  const isPublic = publicRoutes.some((route) =>
    config.url?.startsWith(route)
  );

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;