import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Dashboard from '../../admin/components/Dashboard';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 p-6 text-stone-200" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
            <h2 className="text-[#fbbf24] font-bold text-lg">⚠️ Errore rilevato nel componente</h2>
            <p className="text-xs text-stone-400 font-medium">Si è verificato un problema imprevisto durante il rendering della Dashboard.</p>
            <div className="bg-stone-950/80 border border-stone-850 p-4 rounded-xl text-left overflow-auto max-h-[200px]">
              <code className="text-red-400 text-[10px] whitespace-pre-wrap break-words">
                {this.state.error?.toString() || 'Errore sconosciuto'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-stone-800 text-stone-200 border border-stone-700 hover:border-stone-500 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-all"
            >
              Ricarica la Pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0c0a09' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-white font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem' }}>
            Staff Dashboard
          </p>
          <p className="text-stone-500 text-xs tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            Flower Power Pizza · Ranong
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a572] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a572] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8B1E1E] text-white text-xs tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a09' }}>
        <Loader2 size={28} className="text-red-700 animate-spin" />
      </div>
    );
  }

  if (!session) return <LoginForm onLogin={() => {}} />;

  return (
    <ErrorBoundary>
      <Dashboard onLogout={handleLogout} />
    </ErrorBoundary>
  );
}
