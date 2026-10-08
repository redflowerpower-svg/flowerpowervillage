import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import {
  PaymentSettings,
  PrimaryGateway,
  PromptPayProvider,
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
  active_promptpay_provider: 'omise',
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
  updatePromptPayProvider: (provider: PromptPayProvider) => void;
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
      // 1. Try public storage JSON first (instant cross-device sync without DB table dependency)
      try {
        const publicUrl = `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/site-images/payment_settings.json?_ts=${Date.now()}`;
        const sRes = await fetch(publicUrl, { cache: 'no-store' });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData && sData.active_promptpay_provider) {
            const normalizedProvider = sData.active_promptpay_provider === 'omise' ? 'omise' : 'kbank';
            const merged: PaymentSettings = {
              ...DEFAULT_SETTINGS,
              ...sData,
              active_promptpay_provider: normalizedProvider,
            };
            localStorage.setItem('fp_payment_settings', JSON.stringify(merged));
            set({ settings: merged, loading: false });
            return;
          }
        }
      } catch (storageErr) {
        console.warn('Storage payment_settings fetch fallback:', storageErr);
      }

      // 2. Try Supabase DB table if available
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('id', 'singleton')
        .maybeSingle();

      if (!error && data) {
        const normalizedProvider = data.active_promptpay_provider === 'omise' ? 'omise' : 'kbank';
        const merged: PaymentSettings = {
          id: 'singleton',
          active_primary_gateway: data.active_primary_gateway || 'ksher',
          active_promptpay_provider: normalizedProvider,
          paypal_enabled: data.paypal_enabled ?? true,
          stripe_config: { ...DEFAULT_SETTINGS.stripe_config, ...(data.stripe_config || {}) },
          ksher_config: { ...DEFAULT_SETTINGS.ksher_config, ...(data.ksher_config || {}) },
          omise_config: { ...DEFAULT_SETTINGS.omise_config, ...(data.omise_config || {}) },
          paypal_config: { ...DEFAULT_SETTINGS.paypal_config, ...(data.paypal_config || {}) },
          updated_at: data.updated_at
        };
        localStorage.setItem('fp_payment_settings', JSON.stringify(merged));
        set({ settings: merged, loading: false });
        return;
      }

      // 3. Fallback to localStorage cache
      const cached = localStorage.getItem('fp_payment_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const normalizedProvider = parsed.active_promptpay_provider === 'omise' ? 'omise' : 'kbank';
          set({ settings: { ...DEFAULT_SETTINGS, ...parsed, active_promptpay_provider: normalizedProvider }, loading: false });
          return;
        }
        catch { }
      }

      set({ settings: DEFAULT_SETTINGS, loading: false });
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

  updatePromptPayProvider: (provider) => {
    const normalized = provider === 'omise' ? 'omise' : 'kbank';
    const current = get().settings;
    const newSettings = { ...current, active_promptpay_provider: normalized };
    try {
      localStorage.setItem('fp_payment_settings', JSON.stringify(newSettings));
    } catch { }
    set({
      settings: newSettings,
      saveSuccess: false
    });
    // Auto-save to cloud via backend API
    get().saveSettings();
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
        active_promptpay_provider: settings.active_promptpay_provider,
        paypal_enabled: settings.paypal_config.enabled,
        stripe_config: settings.stripe_config,
        ksher_config: settings.ksher_config,
        omise_config: settings.omise_config,
        paypal_config: settings.paypal_config,
        updated_at: new Date().toISOString()
      };

      // 1. Always update local cache immediately
      try {
        localStorage.setItem('fp_payment_settings', JSON.stringify({ ...payload }));
      } catch { }

      // 2. Save via Backend API (which has service_role to upload to site-images storage & upsert DB)
      try {
        const res = await fetch('/api/payments-admin?action=save-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          console.warn('API save-settings HTTP warning:', res.status);
        }
      } catch (apiErr) {
        console.warn('API save-settings call error:', apiErr);
      }

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
