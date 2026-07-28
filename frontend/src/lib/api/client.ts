import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Shared Axios instance for talking to the Essence Perfumes NestJS backend.
 *
 * The base URL defaults to the local backend (see backend/.env.example,
 * which runs on port 3000) and can be overridden via
 * NEXT_PUBLIC_API_URL at build/deploy time.
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
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Normalizes the backend's error envelope (`{statusCode, timestamp, path,
 * message}`, where `message` is a `string` for most errors but a `string[]`
 * for class-validator validation failures) into a single display string.
 */
export function parseApiError(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default apiClient;
