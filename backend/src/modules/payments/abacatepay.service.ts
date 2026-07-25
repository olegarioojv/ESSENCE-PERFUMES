import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE_URL = 'https://api.abacatepay.com/v2';

export interface AbacatePayCharge {
  id: string;
  amount: number;
  status: string;
  devMode: boolean;
  brCode: string;
  brCodeBase64: string;
  platformFee: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreatePixQrCodeParams {
  amount: number;
  expiresIn?: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
}

@Injectable()
export class AbacatePayService {
  constructor(private readonly configService: ConfigService) {}

  async createPixQrCode(
    params: CreatePixQrCodeParams,
  ): Promise<AbacatePayCharge> {
    return this.request<AbacatePayCharge>('POST', '/transparents/create', {
      method: 'PIX',
      data: params,
    });
  }

  async checkStatus(id: string): Promise<AbacatePayCharge> {
    return this.request<AbacatePayCharge>(
      'GET',
      `/transparents/check?id=${encodeURIComponent(id)}`,
    );
  }

  async simulatePayment(id: string): Promise<AbacatePayCharge> {
    return this.request<AbacatePayCharge>(
      'POST',
      `/transparents/simulate-payment?id=${encodeURIComponent(id)}`,
      {},
    );
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const apiKey = this.configService.getOrThrow<string>('ABACATEPAY_API_KEY');

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json()) as AbacatePayResponse<T>;

    if (!response.ok || payload.error || !payload.data) {
      throw new BadGatewayException(
        payload.error ?? 'Falha ao comunicar com o provedor de pagamento',
      );
    }

    return payload.data;
  }
}
