import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminAuthProps {
  children: (session: Session, handleLogout: () => Promise<void>) => React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
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
      setError('Credenziali non valide. Riprova con email e password corrette.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-amber-500 animate-spin" />
          <p className="text-stone-400 text-xs tracking-widest uppercase font-semibold">
            Caricamento sessione staff...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 font-black text-xl shadow-inner">
              FP
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Flower Power Staff
            </h1>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">
              Portale Amministrativo Unificato
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Email Utente
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
                Password
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

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Autenticazione in corso…
                </>
              ) : (
                'Accedi alla Dashboard'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="border-t border-stone-850 pt-4 text-center">
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
              Ranong (Pizzeria) & Koh Phayam (Resort)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(session, handleLogout)}</>;
}
