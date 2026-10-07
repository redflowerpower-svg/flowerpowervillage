import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplitScreen from './pages/SplitScreen';
import VillageSite from './pages/VillageSite';
import PizzaSite from './pages/PizzaSite';
import AdminMain from './admin/AdminMain';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import DocumentReaderPage from './pages/DocumentReaderPage';
import { KitchenTabletKDS } from './admin/pizza/components/KitchenTabletKDS';
import DiningTabletSite from './pizza/pages/DiningTabletSite';

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
          <h2 style={{ color: '#ef4444', fontSize: '18px', marginBottom: '12px' }}>Qualcosa è andato storto nel caricamento della pagina</h2>
          <pre style={{ background: '#292524', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: '13px', lineHeight: '1.4' }}>
            <strong>{this.state.error?.name}: {this.state.error?.message}</strong>
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/dining';
            }}
            style={{ marginTop: 16, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Riprova Caricamento
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
    const isDining = pathname.startsWith('/dining') || pathname.startsWith('/dining-tablet') || pathname.startsWith('/tavoli') || pathname.startsWith('/table');
    const isKitchen = pathname.startsWith('/kitchen') || pathname.startsWith('/kds');
    const isPizza = host.includes('flowerpowerpizza.com') || pathname.startsWith('/pizza') || isKitchen || isDining;
    const isVillage = host.includes('flowerpowervillage.com') || pathname.startsWith('/village') || pathname.startsWith('/rooms');

    const metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
    const ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    const manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    const appleTitle = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-title']");
    const themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");

    if (isKitchen) {
      document.title = 'Flower Power Pizza — Kitchen KDS';
      if (manifestLink) manifestLink.href = '/manifest-kitchen.json';
      if (appleTitle) appleTitle.content = 'FP Kitchen';
      if (themeColor) themeColor.content = '#8b1e1e';
    } else if (isDining) {
      document.title = 'Flower Power Dining — Tablet Sala & Tavoli';
      if (manifestLink) manifestLink.href = '/manifest-dining.json';
      if (appleTitle) appleTitle.content = 'FP Dining';
      if (themeColor) themeColor.content = '#d97706';
    } else if (isPizza) {
      document.title = 'Flower Power Pizza Ranong · Authentic Italian Pizza & Homemade Fresh Pasta';
      if (manifestLink) manifestLink.href = '/manifest.json';
      if (metaDesc) {
        metaDesc.content = 'Flower Power Pizza Ranong — Authentic Italian pizza (48h slow-fermented crust, 100% Italian flour), homemade fresh pasta, artisan sausage, and fine wines in a tropical oasis with a private waterfall near Raksawarin Hot Springs. Fast delivery in Ranong.';
      }
      if (ogImage) {
        ogImage.content = '/flower-power-pizza-emblem.png';
      }
    } else if (isVillage) {
      document.title = 'Flower Power · Farm Village & Spa · Koh Phayam';
      if (manifestLink) manifestLink.href = '/manifest.json';
      if (metaDesc) {
        metaDesc.content = "Flower Power Farm Village & Spa on Koh Phayam, Thailand — eco-resort bungalows, villas, pool club, wellness spa, and authentic restaurant on Thailand's tropical island paradise.";
      }
      if (ogImage) {
        ogImage.content = '/FP_04_-_LOGO_OFFICIAL_HD.png';
      }
    } else {
      document.title = 'Flower Power · Farm Village & Spa · Pizza Ranong';
      if (manifestLink) manifestLink.href = '/manifest.json';
      if (metaDesc) {
        metaDesc.content = 'Flower Power — Koh Phayam Eco Resort & Spa and Authentic Italian Pizzeria in Ranong, Thailand.';
      }
    }
  }, []);

  return null;
}


function RedirectToExternal({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
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
          <Route path="/dining" element={<DiningTabletSite />} />
          <Route path="/dining-tablet" element={<DiningTabletSite />} />
          <Route path="/tavoli" element={<DiningTabletSite />} />
          <Route path="/table" element={<DiningTabletSite />} />
          <Route path="/kitchen" element={<KitchenTabletKDS />} />
          <Route path="/kds" element={<Navigate to="/kitchen" replace />} />
          <Route path="/rooms/:slug" element={<AccommodationDetailPage />} />
          <Route path="/read/:token" element={<DocumentReaderPage />} />
          <Route path="/read/:token/page/:pageNum" element={<DocumentReaderPage />} />
          <Route path="/flowerpowerpizzaranong/*" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          <Route path="/flowerpowerpizzaranong" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          {/* Legacy hash-based admin redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
