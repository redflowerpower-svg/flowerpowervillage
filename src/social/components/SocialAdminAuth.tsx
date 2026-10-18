import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Lock, Mail, ShieldAlert, Sparkles, Loader2, 
  Share2, ArrowRight, ShieldCheck, Laptop 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SocialAdminAuthProps {
  children: React.ReactNode;
}

export function SocialAdminAuth({ children }: SocialAdminAuthProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        // 1. Check existing Supabase Master Session (Dashboard Admin)
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(s);

        // 2. Check unified single sign-on from Kitchen / Dining / Social
        const kitchenUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('fp_kitchen_tablet_unlocked') === 'true';
        const diningUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('fp_dining_tablet_unlocked') === 'true';
        const socialUnlocked = typeof localStorage !== 'undefined' && localStorage.getItem('fp_social_studio_unlocked') === 'true';

        // 3. Official Production Domain (TikTok Reviewers bypass: must stay 100% open and unobstructed)
        const isOfficialProduction = typeof window !== 'undefined' && (
          window.location.hostname.toLowerCase().includes('flowerpowerpizza.com') ||
          window.location.hostname.toLowerCase().includes('flowerpowervillage.com')
        );

        // 4. Local development check
        const isLocal = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1'
        );

        // On official production domain (for TikTok review), or if already authenticated / unlocked in staging
        if (isOfficialProduction || s || kitchenUnlocked || diningUnlocked || socialUnlocked || isLocal) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } catch (err) {
        console.warn('[SocialAdminAuth] Session verification error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        setIsUnlocked(true);
        try {
          localStorage.setItem('fp_social_studio_unlocked', 'true');
        } catch {}
      }
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError || !data.session) {
        setError('Credenziali non valide. Inserisci la stessa email e password della dashboard.');
        setSubmitting(false);
        return;
      }

      setSession(data.session);
      setIsUnlocked(true);
      try {
        localStorage.setItem('fp_social_studio_unlocked', 'true');
      } catch {}
    } catch (err: any) {
      setError(err?.message || 'Errore durante l\'accesso.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] text-stone-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <p className="text-stone-400 text-xs tracking-widest uppercase font-bold">
            Verifica autorizzazione Social Studio...
          </p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] text-stone-100 p-4 font-sans relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/10 to-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 via-amber-500/20 to-stone-800 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Share2 className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Flower Power Social Studio
            </h1>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Accesso Riservato Staff & Amministrazione
            </p>
          </div>

          {/* Info pill */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5 text-xs text-stone-300 space-y-1.5">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Single Sign-On Unificato
            </p>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Se hai già effettuato l'accesso alla <strong className="text-stone-300">Dashboard</strong>, alla <strong className="text-stone-300">Cucina KDS</strong> o ai <strong className="text-stone-300">Tavoli</strong> su questo browser, entri automaticamente. Altrimenti inserisci le tue credenziali staff.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3 text-red-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Email Amministratore
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@flowerpower.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all placeholder:text-stone-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Password Amministratore
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all placeholder:text-stone-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Verifica in corso...
                </>
              ) : (
                <>
                  Sblocca Social Studio
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center pt-2 border-t border-stone-800/60 text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <Laptop className="w-3.5 h-3.5" />
            <span>Ambiente Protetto · Flower Power Village & Pizza</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
