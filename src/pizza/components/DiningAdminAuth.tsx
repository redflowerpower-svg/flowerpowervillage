import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2, Lock, Mail, ShieldAlert, Sparkles, UtensilsCrossed, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DiningAdminAuthProps {
  children: (session: Session | null, handleLogout: () => Promise<void>) => React.ReactNode;
}

export function DiningAdminAuth({ children }: DiningAdminAuthProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isTabletUnlocked, setIsTabletUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fp_dining_tablet_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [sessionLoading, setSessionLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        setIsTabletUnlocked(true);
        try { localStorage.setItem('fp_dining_tablet_unlocked', 'true'); } catch {}
      }
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setIsTabletUnlocked(true);
        try { localStorage.setItem('fp_dining_tablet_unlocked', 'true'); } catch {}
      }
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Credenziali non valide. Inserisci email e password della dashboard amministratore.');
      setLoading(false);
    } else {
      setIsTabletUnlocked(true);
      try { localStorage.setItem('fp_dining_tablet_unlocked', 'true'); } catch {}
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsTabletUnlocked(false);
    try { localStorage.removeItem('fp_dining_tablet_unlocked'); } catch {}
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1917] text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-amber-400 animate-spin" />
          <p className="text-stone-300 text-xs tracking-widest uppercase font-bold">
            Attivazione Dining Tablet in corso...
          </p>
        </div>
      </div>
    );
  }

  // If not unlocked / not authenticated, show sleek Staff Activation Gate
  if (!isTabletUnlocked && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#141210] px-4 py-8 antialiased" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
        <div className="w-full max-w-md bg-stone-900/95 border-2 border-amber-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8B1E1E] to-[#5a1111] border-2 border-amber-400/40 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Flower Power Pizza
            </h1>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Attivazione Tablet Sala & Tavoli
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-xs mx-auto">
              Inserisci le credenziali di amministrazione per sbloccare la modalità ordinazione al tavolo con sconto 5%.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                Email Amministratore
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flowerpower.com"
                  className="w-full bg-stone-950/80 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-950/80 border border-stone-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifica credenziali...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sblocca Tablet Ristorante</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-800">
            <span className="text-[11px] text-stone-500 font-medium">
              Ranong, Thailand • Modalità Dining Privilege 5%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(session, handleLogout)}</>;
}
