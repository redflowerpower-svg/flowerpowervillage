import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Loader2, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Sparkles, 
  UtensilsCrossed, 
  Wifi, 
  Globe, 
  CheckCircle2, 
  Laptop, 
  Smartphone, 
  LogOut 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { checkNetworkAccess, authorizePermanentDevice, type NetworkAccessCheckResult } from '../services/networkAuthService';
import { useLanguageStore } from '../store/languageStore';
import { SUPPORTED_LANGUAGES, type Language } from '../config/languages';
import { LanguageDropdown } from './LanguageDropdown';

const I18N_GATE: Record<Language, {
  gateTitle: string;
  gateSubtitle: string;
  gateDescWifi: string;
  gateDescExternal: string;
  wifiConnectedBadge: string;
  externalBadge: string;
  emailLabel: string;
  passwordLabel: string;
  unlockBtn: string;
  unlocking: string;
  devEnvironment: string;
  logoutDevice: string;
  authSuccess: string;
  invalidCreds: string;
  clientIpLabel: string;
  connectedRouterLabel: string;
}> = {
  IT: {
    gateTitle: 'Flower Power Dining',
    gateSubtitle: 'Controllo Accesso Rete Ristorante',
    gateDescWifi: 'Accesso consentito all\'interno del ristorante (Wi-Fi 2.4G/5G).',
    gateDescExternal: 'Rete esterna rilevata. Inserisci le credenziali Master Admin per sbloccare questo dispositivo in modo permanente.',
    wifiConnectedBadge: 'Rete Wi-Fi Ristorante Rilevata',
    externalBadge: 'Accesso Remoto Protetto',
    emailLabel: 'Email Amministratore',
    passwordLabel: 'Password Amministratore',
    unlockBtn: 'Sblocca Dispositivo in Modo Permanente',
    unlocking: 'Verifica credenziali in corso...',
    devEnvironment: 'Ambiente di Test / Sviluppo Autorizzato',
    logoutDevice: 'Blocca / Disconnetti Dispositivo',
    authSuccess: 'Dispositivo autorizzato con successo.',
    invalidCreds: 'Credenziali non valide. Inserisci email e password della dashboard amministratore.',
    clientIpLabel: 'Tuo Indirizzo IP:',
    connectedRouterLabel: 'Nodo Wi-Fi Collegato:'
  },
  EN: {
    gateTitle: 'Flower Power Dining',
    gateSubtitle: 'Restaurant Network Access Control',
    gateDescWifi: 'Access allowed inside the restaurant (Wi-Fi 2.4G/5G).',
    gateDescExternal: 'External network detected. Enter Master Admin credentials to permanently unlock this device.',
    wifiConnectedBadge: 'Restaurant Wi-Fi Network Detected',
    externalBadge: 'Protected Remote Access',
    emailLabel: 'Administrator Email',
    passwordLabel: 'Administrator Password',
    unlockBtn: 'Permanently Unlock Device',
    unlocking: 'Verifying credentials...',
    devEnvironment: 'Authorized Test / Development Environment',
    logoutDevice: 'Lock / Disconnect Device',
    authSuccess: 'Device authorized successfully.',
    invalidCreds: 'Invalid credentials. Enter the administrator dashboard email and password.',
    clientIpLabel: 'Your IP Address:',
    connectedRouterLabel: 'Connected Wi-Fi Node:'
  },
  TH: {
    gateTitle: 'Flower Power Dining',
    gateSubtitle: 'ระบบควบคุมการเข้าใช้เครือข่ายร้านอาหาร',
    gateDescWifi: 'อนุญาตให้เข้าใช้ภายในร้านอาหาร (Wi-Fi 2.4G/5G)',
    gateDescExternal: 'ตรวจพบเครือข่ายภายนอก กรุณากรอกข้อมูลเข้าสู่ระบบ Master Admin เพื่อปลดล็อกอุปกรณ์นี้อย่างถาวร',
    wifiConnectedBadge: 'ตรวจพบเครือข่าย Wi-Fi ของร้านอาหาร',
    externalBadge: 'การเข้าถึงระยะไกลที่ปลอดภัย',
    emailLabel: 'อีเมลผู้ดูแลระบบ',
    passwordLabel: 'รหัสผ่านผู้ดูแลระบบ',
    unlockBtn: 'ปลดล็อกอุปกรณ์อย่างถาวร',
    unlocking: 'กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...',
    devEnvironment: 'สภาพแวดล้อมทดสอบ / การพัฒนาที่ได้รับอนุญาต',
    logoutDevice: 'บล็อก / ตัดการเชื่อมต่ออุปกรณ์',
    authSuccess: 'อุปกรณ์ได้รับอนุญาตเรียบร้อยแล้ว',
    invalidCreds: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง กรุณากรอกอีเมลและรหัสผ่านของแดชบอร์ดผู้ดูแลระบบ',
    clientIpLabel: 'ที่อยู่ IP ของคุณ:',
    connectedRouterLabel: 'โหนด Wi-Fi ที่เชื่อมต่อ:'
  },
  DE: {
    gateTitle: 'Flower Power Dining',
    gateSubtitle: 'Netzwerkzugangskontrolle für das Restaurant',
    gateDescWifi: 'Zugang innerhalb des Restaurants gestattet (Wi-Fi 2,4G/5G).',
    gateDescExternal: 'Externes Netzwerk erkannt. Bitte Master-Admin-Zugangsdaten eingeben, um dieses Gerät dauerhaft freizuschalten.',
    wifiConnectedBadge: 'Restaurant-WLAN-Netzwerk erkannt',
    externalBadge: 'Geschützter Fernzugriff',
    emailLabel: 'Administrator-E-Mail',
    passwordLabel: 'Administrator-Passwort',
    unlockBtn: 'Gerät dauerhaft freischalten',
    unlocking: 'Anmeldedaten werden überprüft...',
    devEnvironment: 'Testumgebung / Autorisierte Entwicklung',
    logoutDevice: 'Gerät sperren / trennen',
    authSuccess: 'Gerät erfolgreich autorisiert.',
    invalidCreds: 'Ungültige Anmeldedaten. Bitte E-Mail und Passwort des Admin-Dashboards eingeben.',
    clientIpLabel: 'Ihre IP-Adresse:',
    connectedRouterLabel: 'Verbundenes WLAN-Node:'
  },
  MM: {
    gateTitle: 'Flower Power Dining',
    gateSubtitle: 'စားသောက်ဆိုင် ကွန်ရက်ဝင်ရောက်ခွင့် ထိန်းချုပ်မှု',
    gateDescWifi: 'စားသောက်ဆိုင်အတွင်း ဝင်ရောက်ခွင့်ပြုထားသည် (Wi-Fi 2.4G/5G)။',
    gateDescExternal: 'ပြင်ပကွန်ရက် တွေ့ရှိသည်။ ဤစက်ပစ္စည်းကို အမြဲတမ်းလော့ခ်ဖွင့်ရန် Master Admin အထောက်အထားများ ထည့်သွင်းပါ။',
    wifiConnectedBadge: 'စားသောက်ဆိုင် Wi-Fi ကွန်ရက် တွေ့ရှိသည်',
    externalBadge: 'အဝေးမှ ဝင်ရောက်မှု ကာကွယ်ထားသည်',
    emailLabel: 'အက်ဒမင် အီးမေးလ်',
    passwordLabel: 'အက်ဒမင် စကားဝှက်',
    unlockBtn: 'စက်ပစ္စည်းကို အမြဲတမ်း လော့ခ်ဖွင့်ပါ',
    unlocking: 'အထောက်အထားများ စစ်ဆေးနေသည်...',
    devEnvironment: 'စမ်းသပ်မှု / ဖွံ့ဖြိုးရေး ပတ်ဝန်းကျင် ခွင့်ပြုထားသည်',
    logoutDevice: 'စက်ပစ္စည်းကို လော့ခ် / ချိတ်ဆက်မှု ဖြုတ်ပါ',
    authSuccess: 'စက်ပစ္စည်းကို အောင်မြင်စွာ ခွင့်ပြုလိုက်ပါပြီ။',
    invalidCreds: 'အထောက်အထားများ မမှန်ကန်ပါ။ အက်ဒမင် ဒက်ရှ်ဘုတ်၏ အီးမေးလ်နှင့် စကားဝှက် ထည့်သွင်းပါ။',
    clientIpLabel: 'သင့် အိုင်ပီ လိပ်စာ:',
    connectedRouterLabel: 'ချိတ်ဆက်ထားသော ဝိုင်ဖိုင် နေရာ:'
  }
};

interface DiningAdminAuthProps {
  children: (session: Session | null, handleLogout: () => Promise<void>) => React.ReactNode;
}

export function DiningAdminAuth({ children }: DiningAdminAuthProps) {
  const { language: lang, setLanguage } = useLanguageStore();
  const t = I18N_GATE[lang] || I18N_GATE.IT;

  const [session, setSession] = useState<Session | null>(null);
  const [networkCheck, setNetworkCheck] = useState<NetworkAccessCheckResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initial Verification
  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        // 1. Check local session
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(s);

        const localUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('fp_dining_tablet_unlocked') === 'true';
        const deviceToken = typeof localStorage !== 'undefined' ? localStorage.getItem('fp_dining_device_token') || '' : '';

        // 2. Perform Network Check
        const netResult = await checkNetworkAccess(deviceToken);
        if (!isMounted) return;
        setNetworkCheck(netResult);

        // Check if incoming request is a guest scanning a table QR code
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const guestTable = searchParams?.get('table');
        const guestToken = searchParams?.get('token');

        if (guestTable && guestToken) {
          // Guest with QR session token -> automatically allow entry for table ordering
          setIsUnlocked(true);
          setLoading(false);
          return;
        }

        // If local admin session exists OR local token/unlock is valid OR network IP is allowed
        if (s || localUnlocked || netResult.allowed) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } catch (err) {
        console.warn('[DiningAdminAuth] Error during verification:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setIsUnlocked(true);
        try {
          localStorage.setItem('fp_dining_tablet_unlocked', 'true');
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError || !data.session) {
        setError(t.invalidCreds);
        setSubmitting(false);
        return;
      }

      setSession(data.session);

      // Issue permanent device token
      const deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser';
      const deviceName = `Admin Remote (${userAgent})`;

      await authorizePermanentDevice(deviceId, deviceName, email || 'admin');

      try {
        localStorage.setItem('fp_dining_device_token', deviceId);
        localStorage.setItem('fp_dining_tablet_unlocked', 'true');
      } catch {}

      setIsUnlocked(true);
      setSubmitting(false);
    } catch (err: any) {
      setError(err?.message || t.invalidCreds);
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setIsUnlocked(false);
    try {
      localStorage.removeItem('fp_dining_tablet_unlocked');
      localStorage.removeItem('fp_dining_device_token');
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1917] text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-amber-400 animate-spin" />
          <p className="text-stone-300 text-xs tracking-widest uppercase font-bold">
            Verifica Connessione Rete Ristorante...
          </p>
        </div>
      </div>
    );
  }

  // If unlocked (Wi-Fi matched OR localhost dev OR permanent admin token) -> Render Dining Tablet Site!
  if (isUnlocked) {
    return <>{children(session, handleLogout)}</>;
  }

  // If External Network Detected and not unlocked -> Show Sleek Admin Remote Unlock Gate
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#141210] via-[#1c1917] to-[#0f0e0d] px-4 py-8 antialiased text-stone-100 selection:bg-amber-500 selection:text-stone-950" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      
      {/* Top Language Switcher Dropdown */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageDropdown
          currentLang={lang}
          onSelect={setLanguage}
          variant="dining-dark"
          align="right"
        />
      </div>

      <div className="w-full max-w-md bg-stone-900/95 border-2 border-amber-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#8B1E1E] to-[#5a1111] border-2 border-amber-400/40 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-black/50 relative">
            <UtensilsCrossed className="w-8 h-8 text-amber-300" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-stone-900 border border-amber-400/60 flex items-center justify-center">
              <Lock className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t.gateTitle}
          </h1>

          {/* Network Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.externalBadge}</span>
          </div>

          <p className="text-stone-400 text-xs leading-relaxed max-w-xs mx-auto pt-1">
            {t.gateDescExternal}
          </p>
        </div>

        {/* IP Info Box */}
        {networkCheck?.clientIp && (
          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-stone-400 font-medium">{t.clientIpLabel}</span>
            <code className="text-amber-400 font-mono font-bold">{networkCheck.clientIp}</code>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
              {t.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flowerpower.com"
                className="w-full bg-stone-950/90 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-950/90 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-2.5 text-red-200 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.unlocking}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.unlockBtn}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-stone-800/80 flex flex-col items-center gap-1">
          <span className="text-[11px] text-stone-500 font-medium">
            Ranong, Thailand • Wi-Fi 2.4G / 5G Protected Gate
          </span>
        </div>
      </div>
    </div>
  );
}
