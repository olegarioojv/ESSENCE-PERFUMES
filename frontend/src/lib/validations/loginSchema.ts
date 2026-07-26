import { z } from "zod";

/**
 * Example/convention schema for Fase 17 scaffolding: request-side
 * validation for the login form. Lives under `lib/validations/` — the
 * agreed convention for all Zod schemas in this project (one file per
 * form/resource, named `<thing>Schema.ts`).
 *
 * Wired up to the placeholder login page (`app/(loja)/login/page.tsx`) so
 * this schema is proven to actually validate input, not just compile.
 */
export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
