"use client";

import { useState, type FormEvent } from "react";
import { loginSchema } from "@/lib/validations/loginSchema";

/**
 * Placeholder Login page. Demonstrates the intended pattern for forms in
 * this project: parse with a Zod schema, surface field errors, and (later,
 * Fase 18) call the backend auth endpoint via `apiClient`. No real
 * authentication happens yet.
 */
export default function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);
    // Real submission (POST /auth/login via apiClient) lands in Fase 18.
  }

  return (
    <section style={{ padding: "3rem 2rem", maxWidth: 360, margin: "0 auto" }}>
      <h1>Login (em construção)</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" style={{ display: "block", width: "100%" }} />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" style={{ display: "block", width: "100%" }} />
          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>
        <button type="submit">Entrar</button>
        {submitted && <p>Dados válidos (integração real na Fase 18).</p>}
      </form>
    </section>
  );
}
