"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import TrustBar from "@/components/home/TrustBar";
import FormField, { Input } from "@/components/form/FormField";
import { EyeIcon, EyeOffIcon } from "@/components/icons/Icons";
import { loginSchema } from "@/lib/validations/loginSchema";
import { apiClient, parseApiError } from "@/lib/api/client";
import { useAuthStore, type AuthSession } from "@/lib/store/useAuthStore";

const Wrap = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
`;

const Centered = styled.div`
  max-width: 480px;
  margin: 0 auto ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Rule = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.colors.gold};
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: left;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PasswordField = styled.div`
  position: relative;

  input {
    width: 100%;
    padding-right: 2.5rem;
  }
`;

const ToggleVisibility = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ForgotLink = styled(Link)`
  color: ${({ theme }) => theme.colors.gold};

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin: ${({ theme }) => theme.spacing.xs} 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.surface};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

const Feedback = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.success};
`;

const ErrorFeedback = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
`;

const CreateAccount = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  a {
    color: ${({ theme }) => theme.colors.gold};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    setApiError(null);
    setLoading(true);
    try {
      const { data } = await apiClient.post<AuthSession>("/auth/login", result.data);
      setSession(data);
      setSubmitted(true);
      router.push(data.user.role === "admin" ? "/dashboard" : "/conta");
    } catch (error) {
      setApiError(parseApiError(error, "Não foi possível entrar. Verifique suas credenciais."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrap>
      <Centered>
      <Title>Sign In to Your Account</Title>
      <Rule />
      <Subtitle>Access your account and discover an exclusive Essence experience.</Subtitle>

      <Card>
        <Form onSubmit={handleSubmit} noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" name="email" type="email" placeholder="Enter your email" $invalid={!!errors.email} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password}>
            <PasswordField>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                $invalid={!!errors.password}
              />
              <ToggleVisibility
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </ToggleVisibility>
            </PasswordField>
          </FormField>

          <OptionsRow>
            <RememberLabel>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((value) => !value)}
              />
              Remember me
            </RememberLabel>
            <ForgotLink href="/recuperar-senha">Forgot your password?</ForgotLink>
          </OptionsRow>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Sign In"}
          </SubmitButton>
          {submitted && <Feedback role="status">Login realizado com sucesso.</Feedback>}
          {apiError && <ErrorFeedback role="alert">{apiError}</ErrorFeedback>}

          <Divider>Or continue with</Divider>

          <SocialButton type="button">Continue with Google</SocialButton>
          <SocialButton type="button">Continue with Apple</SocialButton>
        </Form>
      </Card>

      <CreateAccount>
        Don&apos;t have an account? <Link href="/conta">Create Account</Link>
      </CreateAccount>
      </Centered>

      <TrustBar />
    </Wrap>
  );
}
