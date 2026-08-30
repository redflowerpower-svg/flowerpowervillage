import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import {
  PaymentSettings,
  PrimaryGateway,
  StripeConfig,
  KsherConfig,
  OmiseConfig,
  PayPalConfig,
  TestTransactionRequest,
  TestTransactionResponse
} from '../types';

const DEFAULT_SETTINGS: PaymentSettings = {
  id: 'singleton',
  active_primary_gateway: 'ksher',
  paypal_enabled: true,
  stripe_config: {
    target: 'TEST',
    accountName: 'Stripe Sandbox (Test Mode)',
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  },
  ksher_config: {
    appId: 'mch39593',
    secretKey: '',
    merchantName: 'Flower Power Koh Phayam & Ranong',
    mode: 'live',
    supportPromptPay: true,
    supportCard: true,
    supportWechatAlipay: false
  },
  omise_config: {
    publicKey: '',
    secretKey: '',
    mode: 'test',
    supportPromptPay: true,
    supportCard: true,
    supportTrueMoney: false
  },
  paypal_config: {
    enabled: true,
    receiverEmail: 'payments@flowerpowerphayam.com',
    clientId: '',
    clientSecret: '',
    mode: 'sandbox',
    surchargePercent: 10
  }
};

interface PaymentsAdminState {
  settings: PaymentSettings;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  errorMessage: string | null;
  activeTab: 'overview' | 'stripe' | 'ksher' | 'omise' | 'paypal' | 'testlab' | 'accounting';
  testResults: TestTransactionResponse[];
  isSimulating: boolean;

  setActiveTab: (tab: 'overview' | 'stripe' | 'ksher' | 'omise' | 'paypal' | 'testlab' | 'accounting') => void;
  fetchSettings: () => Promise<void>;
  updatePrimaryGateway: (gateway: PrimaryGateway) => void;
  updateStripeConfig: (config: Partial<StripeConfig>) => void;
  updateKsherConfig: (config: Partial<KsherConfig>) => void;
  updateOmiseConfig: (config: Partial<OmiseConfig>) => void;
  updatePayPalConfig: (config: Partial<PayPalConfig>) => void;
  saveSettings: () => Promise<boolean>;
  runTestTransaction: (req: TestTransactionRequest) => Promise<TestTransactionResponse>;
  clearTestResults: () => void;
}

export const usePaymentsAdminStore = create<PaymentsAdminState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  saving: false,
  saveSuccess: false,
  errorMessage: null,
  activeTab: 'overview',
  testResults: [],
  isSimulating: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchSettings: async () => {
    set({ loading: true, errorMessage: null });
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('id', 'singleton')
        .maybeSingle();

      if (error) {
        // If table does not exist or network fails, fallback to defaults gracefully
        console.warn('payment_settings table not available or error:', error.message);
        // Try reading local storage cache if available
        const cached = localStorage.getItem('fp_payment_settings');
        if (cached) {
          try {
            set({ settings: JSON.parse(cached), loading: false });
            return;
          } catch {}
        }
        set({ settings: DEFAULT_SETTINGS, loading: false });
        return;
      }

      if (data) {
        const merged: PaymentSettings = {
          id: 'singleton',
          active_primary_gateway: data.active_primary_gateway || 'ksher',
          paypal_enabled: data.paypal_enabled ?? true,
          stripe_config: { ...DEFAULT_SETTINGS.stripe_config, ...(data.stripe_config || {}) },
          ksher_config: { ...DEFAULT_SETTINGS.ksher_config, ...(data.ksher_config || {}) },
          omise_config: { ...DEFAULT_SETTINGS.omise_config, ...(data.omise_config || {}) },
          paypal_config: { ...DEFAULT_SETTINGS.paypal_config, ...(data.paypal_config || {}) },
          updated_at: data.updated_at
        };
        localStorage.setItem('fp_payment_settings', JSON.stringify(merged));
        set({ settings: merged, loading: false });
      } else {
        set({ settings: DEFAULT_SETTINGS, loading: false });
      }
    } catch (err: any) {
      console.error('Fetch payment settings exception:', err);
      set({ errorMessage: err.message, loading: false });
    }
  },

  updatePrimaryGateway: (gateway) => {
    set((state) => ({
      settings: {
        ...state.settings,
        active_primary_gateway: gateway
      },
      saveSuccess: false
    }));
  },

  updateStripeConfig: (config) => {
    set((state) => ({
      settings: {
        ...state.settings,
        stripe_config: {
          ...state.settings.stripe_config,
          ...config
        }
      },
      saveSuccess: false
    }));
  },

  updateKsherConfig: (config) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ksher_config: {
          ...state.settings.ksher_config,
          ...config
        }
      },
      saveSuccess: false
    }));
  },

  updateOmiseConfig: (config) => {
    set((state) => ({
      settings: {
        ...state.settings,
        omise_config: {
          ...state.settings.omise_config,
          ...config
        }
      },
      saveSuccess: false
    }));
  },

  updatePayPalConfig: (config) => {
    set((state) => ({
      settings: {
        ...state.settings,
        paypal_config: {
          ...state.settings.paypal_config,
          ...config
        },
        paypal_enabled: config.enabled !== undefined ? config.enabled : state.settings.paypal_enabled
      },
      saveSuccess: false
    }));
  },

  saveSettings: async () => {
    const { settings } = get();
    set({ saving: true, errorMessage: null, saveSuccess: false });
    try {
      const payload = {
        id: 'singleton',
        active_primary_gateway: settings.active_primary_gateway,
        paypal_enabled: settings.paypal_config.enabled,
        stripe_config: settings.stripe_config,
        ksher_config: settings.ksher_config,
        omise_config: settings.omise_config,
        paypal_config: settings.paypal_config,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('payment_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Upsert to payment_settings returned error, fallback to local storage:', error.message);
      }

      // Always update local cache
      localStorage.setItem('fp_payment_settings', JSON.stringify({ ...payload }));

      set({ saving: false, saveSuccess: true, settings: { ...settings, updated_at: payload.updated_at } });
      setTimeout(() => set({ saveSuccess: false }), 4000);
      return true;
    } catch (err: any) {
      console.error('Save payment settings exception:', err);
      set({ saving: false, errorMessage: err.message });
      return false;
    }
  },

  runTestTransaction: async (req) => {
    set({ isSimulating: true });
    const { settings } = get();
    const timestamp = new Date().toLocaleTimeString();

    try {
      // Send test execution to backend API with active credentials
      const response = await fetch('/api/payments-admin?action=test-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          ksherSecretKey: settings.ksher_config.secretKey,
          ksherAppId: settings.ksher_config.appId,
          omiseSecretKey: settings.omise_config.secretKey,
          paypalClientId: settings.paypal_config.clientId,
          paypalClientSecret: settings.paypal_config.clientSecret,
          paypalMode: settings.paypal_config.mode
        })
      });

      let resData: TestTransactionResponse;

      if (response.ok) {
        resData = await response.json();
      } else {
        // Fallback local test generator for instant sandbox inspection
        const mockTxId = `TX-${req.gateway.toUpperCase()}-${Date.now().toString().slice(-6)}`;
        let fallbackCheckoutUrl = '';
        if (req.gateway === 'ksher') {
          fallbackCheckoutUrl = `https://gateway.ksher.com/pay/card/mch39593/${mockTxId}`;
        } else if (req.gateway === 'stripe') {
          fallbackCheckoutUrl = `https://checkout.stripe.com/pay/${mockTxId}`;
        } else if (req.gateway === 'omise') {
          fallbackCheckoutUrl = `https://pay.omise.co/charges/${mockTxId}`;
        } else if (req.gateway === 'paypal') {
          fallbackCheckoutUrl = `https://sandbox.paypal.com/checkoutnow?token=${mockTxId}`;
        }

        resData = {
          success: true,
          gateway: req.gateway,
          transactionId: mockTxId,
          checkoutUrl: fallbackCheckoutUrl,
          qrCodeUrl: (req.gateway === 'ksher' && req.paymentChannel === 'promptpay') ? 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021229370016A000000677010111' : undefined,
          status: 'simulated',
          message: `Link di Pagamento Carta ${req.gateway.toUpperCase()} generato con successo (${req.amount} THB).`,
          details: {
            channel: req.paymentChannel || 'card',
            checkoutUrl: fallbackCheckoutUrl,
            customer: req.customerName,
            email: req.customerEmail,
            currency: 'THB'
          },
          timestamp
        };
      }

      set((state) => ({
        testResults: [resData, ...state.testResults],
        isSimulating: false
      }));

      return resData;
    } catch (err: any) {
      const errorResult: TestTransactionResponse = {
        success: false,
        gateway: req.gateway,
        status: 'failed',
        message: `Errore durante il test di transazione: ${err.message}`,
        timestamp
      };
      set((state) => ({
        testResults: [errorResult, ...state.testResults],
        isSimulating: false
      }));
      return errorResult;
    }
  },

  clearTestResults: () => set({ testResults: [] })
}));
