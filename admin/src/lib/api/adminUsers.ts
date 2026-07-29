/**
 * Admin-facing users API — Fase 18 "Integração". Replaces the mock
 * `mockAdminUsers` data (frontend/src/lib/data/mockAdmin.ts) with real calls
 * against the NestJS `/users` endpoint, for the "Usuários" tab of the
 * Configurações page only.
 *
 * Known limitation: the backend has no "invite by e-mail" flow — `POST
 * /users` creates the account directly and requires a password up front.
 * Since this admin screen only wants to grant panel access, `createAdminUser`
 * generates a random temporary password that satisfies the backend's
 * validator (min 8 chars, at least one letter and one digit) and returns it
 * to the caller so it can be shown to the admin once, the same way the other
 * Configurações tabs already document their own backend gaps.
 */
import { apiClient, parseApiError } from "@/lib/api/client";

/** Matches the backend's real `Role` enum (`backend/src/modules/users/entities/role.enum.ts`) — there is no third role. */
export type UserRole = "admin" | "cliente";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Fetches every user and returns only those with panel access (`role === "admin"`). */
export async function fetchAdminUsers(): Promise<ApiUser[]> {
  const { data } = await apiClient.get<ApiUser[]>("/users");
  return data.filter((user) => user.role === "admin");
}

function generateTempPassword(): string {
  return `Temp${Math.random().toString(36).slice(2, 8)}1`;
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
}

export interface CreateAdminUserResult {
  user: ApiUser;
  temporaryPassword: string;
}

/** Creates a new user with `role: "admin"` and a generated temporary password (see module docs). */
export async function createAdminUser(input: CreateAdminUserInput): Promise<CreateAdminUserResult> {
  const temporaryPassword = generateTempPassword();
  const { data } = await apiClient.post<ApiUser>("/users", {
    name: input.name,
    email: input.email,
    password: temporaryPassword,
    role: "admin",
  });
  return { user: data, temporaryPassword };
}

export { parseApiError };
