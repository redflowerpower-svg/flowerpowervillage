import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplitScreen from './pages/SplitScreen';
import VillageSite from './pages/VillageSite';
import PizzaSite from './pages/PizzaSite';
import AdminMain from './admin/AdminMain';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import DocumentReaderPage from './pages/DocumentReaderPage';
import { KitchenTabletKDS } from './admin/pizza/components/KitchenTabletKDS';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI Crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, background: '#1c1917', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Qualcosa è andato storto nel caricamento della pagina</h2>
          <pre style={{ background: '#292524', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Ricarica Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DynamicHeadManager() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const isPizza = host.includes('flowerpowerpizza.com') || pathname.startsWith('/pizza') || pathname.startsWith('/kitchen');
    const isVillage = host.includes('flowerpowervillage.com') || pathname.startsWith('/village') || pathname.startsWith('/rooms');

    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");

    if (isPizza) {
      document.title = 'Flower Power Pizza Ranong · Authentic Italian Pizza & Delivery';
      if (favicon) {
        favicon.href = '/flower-power-pizza-logo-256.png';
      }
    } else if (isVillage) {
      document.title = 'Flower Power · Farm Village & Spa · Koh Phayam';
      if (favicon) {
        favicon.href = '/FP_04_-_LOGO_OFFICIAL_HD.png';
      }
    } else {
      document.title = 'Flower Power · Farm Village & Spa · Pizza Ranong';
      if (favicon) {
        favicon.href = '/FP_04_-_LOGO_OFFICIAL_HD.png';
      }
    }
  }, []);

  return null;
}

function RootRouter() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('flowerpowerpizza.com')) {
      return <PizzaSite />;
    }
  }
  return <SplitScreen />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DynamicHeadManager />
        <Routes>
          <Route path="/" element={<RootRouter />} />
          <Route path="/village/*" element={<VillageSite />} />
          <Route path="/pizza/*" element={<PizzaSite />} />
          <Route path="/admin" element={<AdminMain />} />
          <Route path="/kitchen" element={<KitchenTabletKDS />} />
          <Route path="/kds" element={<Navigate to="/kitchen" replace />} />
          <Route path="/rooms/:slug" element={<AccommodationDetailPage />} />
          <Route path="/read/:token" element={<DocumentReaderPage />} />
          <Route path="/read/:token/page/:pageNum" element={<DocumentReaderPage />} />
          {/* Legacy hash-based admin redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
