"use client";

import { useState } from "react";
import styled from "styled-components";

const Wrap = styled.section`
  position: relative;
  margin: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: linear-gradient(120deg, #efe6d6 0%, #d9c9ab 60%, #b08d57 100%);
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Content = styled.div`
  max-width: 28rem;
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.goldDark};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Form = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 26rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Submit = styled.button`
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.success};
    cursor: default;
  }
`;

const Feedback = styled.p`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.success};
`;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <Wrap>
      <Content>
        <Eyebrow>Join Our Journey</Eyebrow>
        <Title>Be the First to Know</Title>
        <p>
          Subscribe to receive exclusive offers, early access to new
          collections, and the latest from Essence.
        </p>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            disabled={submitted}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="Email"
          />
          <Submit type="submit" disabled={submitted}>
            {submitted ? "Subscribed" : "Subscribe"}
          </Submit>
        </Form>
        {submitted && (
          <Feedback role="status">Thank you! You&apos;ve been subscribed.</Feedback>
        )}
      </Content>
    </Wrap>
  );
}
