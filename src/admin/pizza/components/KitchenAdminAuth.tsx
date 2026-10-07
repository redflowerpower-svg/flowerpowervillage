import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Loader2, 
  Lock, 
  Mail, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  Globe 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LanguageDropdown } from '../../../pizza/components/LanguageDropdown';

type Lang = 'th' | 'en' | 'it' | 'mm' | 'de';

const I18N_KITCHEN_GATE: Record<Lang, {
  kitchenGateTitle: string;
  kitchenGateSubtitle: string;
  kitchenGateDesc: string;
  emailLabel: string;
  passwordLabel: string;
  unlockBtn: string;
  unlocking: string;
  invalidCreds: string;
}> = {
  it: {
    kitchenGateTitle: 'Flower Power Pizza Ranong',
    kitchenGateSubtitle: 'Attivazione Monitor Cucina KDS',
    kitchenGateDesc: 'Inserisci le credenziali Master Admin per sbloccare e autorizzare in modo permanente questo tablet cucina.',
    emailLabel: 'Email Amministratore',
    passwordLabel: 'Password Amministratore',
    unlockBtn: 'Sblocca Monitor Cucina',
    unlocking: 'Verifica credenziali in corso...',
    invalidCreds: 'Credenziali non valide. Inserisci email e password della dashboard amministratore.'
  },
  en: {
    kitchenGateTitle: 'Flower Power Pizza Ranong',
    kitchenGateSubtitle: 'KDS Kitchen Monitor Activation',
    kitchenGateDesc: 'Enter the Master Admin credentials to unlock and permanently authorize this kitchen tablet.',
    emailLabel: 'Admin Email',
    passwordLabel: 'Admin Password',
    unlockBtn: 'Unlock Kitchen Monitor',
    unlocking: 'Verifying credentials...',
    invalidCreds: 'Invalid credentials. Please enter the admin dashboard email and password.'
  },
  th: {
    kitchenGateTitle: 'Flower Power Pizza ระนอง',
    kitchenGateSubtitle: 'การเปิดใช้งานจอครัว KDS',
    kitchenGateDesc: 'กรุณากรอกข้อมูลเข้าสู่ระบบของผู้ดูแลระบบหลักเพื่อปลดล็อกและอนุญาตแท็บเล็ตครัวนี้อย่างถาวร',
    emailLabel: 'อีเมลผู้ดูแลระบบ',
    passwordLabel: 'รหัสผ่านผู้ดูแลระบบ',
    unlockBtn: 'ปลดล็อกจอครัว',
    unlocking: 'กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...',
    invalidCreds: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง กรุณากรอกอีเมลและรหัสผ่านของแดชบอร์ดผู้ดูแลระบบ'
  },
  mm: {
    kitchenGateTitle: 'Flower Power Pizza Ranong',
    kitchenGateSubtitle: 'မီးဖိုချောင် မော်နီတာ KDS ကို ဖွင့်လှစ်ခြင်း',
    kitchenGateDesc: 'ဤမီးဖိုချောင် တက်ဘလက်ကို အမြဲတမ်း လော့ခ်ဖွင့်ရန်နှင့် ခွင့်ပြုရန် Master Admin အထောက်အထားများကို ထည့်သွင်းပါ။',
    emailLabel: 'အက်ဒမင် အီးမေးလ်',
    passwordLabel: 'အက်ဒမင် စကားဝှက်',
    unlockBtn: 'မီးဖိုချောင် မော်နီတာကို လော့ခ်ဖွင့်ပါ',
    unlocking: 'အထောက်အထားများကို စစ်ဆေးနေသည်...',
    invalidCreds: 'အထောက်အထားများ မမှန်ကန်ပါ။ အက်ဒမင် ဒက်ရှ်ဘုတ်၏ အီးမေးလ်နှင့် စကားဝှက်ကို ထည့်သွင်းပါ။'
  },
  de: {
    kitchenGateTitle: 'Flower Power Pizza Ranong',
    kitchenGateSubtitle: 'KDS-Küchenmonitor-Aktivierung',
    kitchenGateDesc: 'Geben Sie die Master-Admin-Zugangsdaten ein, um dieses Küchen-Tablet dauerhaft freizuschalten und zu autorisieren.',
    emailLabel: 'Administrator-E-Mail',
    passwordLabel: 'Administrator-Passwort',
    unlockBtn: 'Küchenmonitor freischalten',
    unlocking: 'Anmeldedaten werden überprüft...',
    invalidCreds: 'Ungültige Anmeldedaten. Bitte geben Sie E-Mail und Passwort des Admin-Dashboards ein.'
  }
};

interface KitchenAdminAuthProps {
  children: (session: Session | null, handleLogout: () => Promise<void>) => React.ReactNode;
}

export function KitchenAdminAuth({ children }: KitchenAdminAuthProps) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('kitchen_kds_lang');
      if (saved === 'th' || saved === 'en' || saved === 'mm') return saved;
    } catch {}
    return 'th';
  });

  const t = I18N_KITCHEN_GATE[lang] || I18N_KITCHEN_GATE.th;

  const [session, setSession] = useState<Session | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fp_kitchen_tablet_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        setIsUnlocked(true);
        try { localStorage.setItem('fp_kitchen_tablet_unlocked', 'true'); } catch {}
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        setIsUnlocked(true);
        try { localStorage.setItem('fp_kitchen_tablet_unlocked', 'true'); } catch {}
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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
      setIsUnlocked(true);
      try {
        localStorage.setItem('fp_kitchen_tablet_unlocked', 'true');
      } catch {}
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
      localStorage.removeItem('fp_kitchen_tablet_unlocked');
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-red-500 animate-spin" />
          <p className="text-stone-300 text-xs tracking-widest uppercase font-bold">
            Caricamento Kitchen KDS...
          </p>
        </div>
      </div>
    );
  }

  // If permanently unlocked or session exists -> render Kitchen KDS!
  if (isUnlocked) {
    return <>{children(session, handleLogout)}</>;
  }

  // If not unlocked -> show Kitchen Gate
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#120505] via-[#1a0a0a] to-[#0a0707] px-4 py-8 antialiased text-stone-100 selection:bg-red-500 selection:text-white" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
      
      {/* Top Language Switcher Dropdown */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageDropdown
          currentLang={lang}
          onSelect={(l) => {
            const lower = l.toLowerCase() as Lang;
            setLang(lower);
            try { localStorage.setItem('kitchen_kds_lang', lower); } catch {}
          }}
          variant="kitchen-dark"
          align="right"
        />
      </div>

      <div className="w-full max-w-md bg-stone-900/95 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400/50 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-red-950/60 relative">
            <Flame className="w-9 h-9 text-amber-300 animate-pulse" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-stone-900 border border-red-400/60 flex items-center justify-center">
              <Lock className="w-3 h-3 text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t.kitchenGateTitle}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-[11px] font-black uppercase tracking-wider">
            <span>{t.kitchenGateSubtitle}</span>
          </div>

          <p className="text-stone-400 text-xs leading-relaxed max-w-xs mx-auto pt-1">
            {t.kitchenGateDesc}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full bg-stone-950/90 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
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
                className="w-full bg-stone-950/90 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
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
            className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-950/60 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm uppercase tracking-wider active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.unlocking}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.unlockBtn}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-stone-800/80 flex flex-col items-center gap-1">
          <span className="text-[11px] text-stone-500 font-medium">
            Ranong, Thailand • Master Staff Kitchen Authorization
          </span>
        </div>
      </div>
    </div>
  );
}
