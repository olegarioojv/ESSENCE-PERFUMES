import axios from "axios";

/**
 * Shared Axios instance for talking to the Essence Perfumes NestJS backend.
 *
 * The base URL defaults to the local backend (see backend/.env.example,
 * which runs on port 3000) and can be overridden via
 * NEXT_PUBLIC_API_URL at build/deploy time.
 *
 * The request interceptor below is a placeholder: real auth-token wiring
 * (reading the access token from the auth store/cookies, refresh-on-401,
 * etc.) is Fase 18 "Integração" work. For now it demonstrates the shape
 * future code will fill in.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Placeholder: wire this up to the real auth store once login (Fase 18)
  // is implemented. Left here so the interceptor plumbing is proven out.
  const token: string | null =
    typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
