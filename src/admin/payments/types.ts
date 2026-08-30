export type PrimaryGateway = 'ksher' | 'stripe' | 'omise';

export type GatewayMode = 'test' | 'live' | 'sandbox';

export interface StripeConfig {
  target: 'TEST' | 'IT' | 'TH' | 'CUSTOM';
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  accountName?: string;
}

export interface KsherConfig {
  appId: string;
  secretKey: string;
  merchantName: string;
  mode: GatewayMode;
  supportPromptPay: boolean;
  supportCard: boolean;
  supportWechatAlipay: boolean;
}

export interface OmiseConfig {
  publicKey: string;
  secretKey: string;
  mode: GatewayMode;
  supportPromptPay: boolean;
  supportCard: boolean;
  supportTrueMoney: boolean;
}

export interface PayPalConfig {
  enabled: boolean;
  receiverEmail: string;
  clientId: string;
  clientSecret: string;
  mode: GatewayMode;
  surchargePercent: number; // e.g. 10% fee
}

export interface PaymentSettings {
  id: string;
  active_primary_gateway: PrimaryGateway;
  paypal_enabled: boolean;
  stripe_config: StripeConfig;
  ksher_config: KsherConfig;
  omise_config: OmiseConfig;
  paypal_config: PayPalConfig;
  updated_at?: string;
}

export interface TestTransactionRequest {
  gateway: PrimaryGateway | 'paypal';
  amount: number; // in THB
  paymentChannel?: 'promptpay' | 'card' | 'wallet';
  customerName: string;
  customerEmail: string;
  description: string;
}

export interface TestTransactionResponse {
  success: boolean;
  gateway: string;
  transactionId?: string;
  checkoutUrl?: string;
  qrCodeUrl?: string;
  qrPayload?: string;
  status: 'pending' | 'success' | 'failed' | 'simulated';
  message: string;
  details?: any;
  timestamp: string;
}
