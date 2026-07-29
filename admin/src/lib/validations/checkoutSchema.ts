import { z } from "zod";

/**
 * Delivery-step schema for the Checkout page. Follows the same convention as
 * loginSchema.ts — request-side validation only; posting to the real
 * `/orders` endpoint happens in Fase 18.
 */
export const checkoutDeliverySchema = z.object({
  fullName: z.string().min(1, "Informe seu nome completo"),
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().min(8, "Telefone inválido"),
  cep: z.string().min(8, "CEP inválido"),
  address: z.string().min(1, "Informe o endereço"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Informe o bairro"),
  city: z.string().min(1, "Informe a cidade"),
  state: z.string().min(2, "Informe o estado"),
});

export type CheckoutDeliveryValues = z.infer<typeof checkoutDeliverySchema>;
