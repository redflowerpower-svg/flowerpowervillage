import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// ⚡ Domain-Specific Lazy Loading: Pizza visitors never download Village booking engine, Village visitors never download Pizza cart!
const VillageSite = lazy(() => import('./pages/VillageSite'));
const PizzaSite = lazy(() => import('./pages/PizzaSite'));
const AccommodationDetailPage = lazy(() => import('./pages/AccommodationDetailPage'));
const VillageWineListPage = lazy(() => import('./pages/VillageWineListPage'));
const ResortPublicCalendarPage = lazy(() => import('./pages/ResortPublicCalendarPage'));
import { ACCOMMODATION_IDENTITIES } from './booking/resort/config/accommodations';

// ⚡ Lazy-loaded Staff, Backoffice and Isolated Heavy Studios (Preserves Public Mobile Web Speed)
const AdminMain = lazy(() => import('./admin/AdminMain'));
const DocumentReaderPage = lazy(() => import('./pages/DocumentReaderPage'));
const KitchenTabletKDS = lazy(() => import('./admin/pizza/components/KitchenTabletKDS').then((m) => ({ default: m.KitchenTabletKDS })));
const DiningTabletSite = lazy(() => import('./pizza/pages/DiningTabletSite'));
const SocialStudioPage = lazy(() => import('./social/pages/SocialStudioPage'));
const AutoCutStudioPage = lazy(() => import('./social/pages/AutoCutStudioPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase text-stone-400">Caricamento...</span>
    </div>
  </div>
);

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
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname.toLowerCase();
    const pathname = location.pathname.toLowerCase();
    const isDining = pathname.startsWith('/dining') || pathname.startsWith('/dining-tablet') || pathname.startsWith('/tavoli') || pathname.startsWith('/table');
    const isKitchen = pathname.startsWith('/kitchen') || pathname.startsWith('/kds');
    const isPizza = host.includes('flowerpowerpizza.com') || pathname.startsWith('/pizza') || pathname === '/order' || pathname === '/about' || pathname === '/contact' || isKitchen || isDining;
    const isFerry = pathname.startsWith('/ferry') || pathname.startsWith('/ferries') || pathname.startsWith('/boat') || pathname.startsWith('/boats') || pathname.startsWith('/directions') || pathname.startsWith('/how-to-get-here') || pathname.startsWith('/transport') || pathname.startsWith('/trasporti');
    const isCalendar = pathname.startsWith('/calendar') || pathname.startsWith('/village/calendar');
    const isWineList = pathname.startsWith('/wine-list') || pathname.startsWith('/village/wine-list');
    const isVillage = host.includes('flowerpowervillage.com') || pathname.startsWith('/village') || pathname.startsWith('/rooms');

    try {
      const metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
      const ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
      const manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
      const appleTitle = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-title']");
      const themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
      const isLegal = pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/legal') || pathname.startsWith('/policy');
      const isAdmin = pathname.startsWith('/admin');
      const isSocial = pathname.startsWith('/social') || pathname.startsWith('/autocut') || pathname.startsWith('/social-studio');

      // 🌐 Dynamic Canonical Tag & OpenGraph URL Management
      let canonicalLink = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }

      let canonicalUrl = 'https://www.flowerpowervillage.com/';
      if (host.includes('flowerpowerpizza.com') || pathname.startsWith('/pizza')) {
        const cleanPath = pathname === '/' || pathname === '/pizza' ? '/' : pathname;
        canonicalUrl = `https://www.flowerpowerpizza.com${cleanPath}`;
      } else if (isFerry) {
        canonicalUrl = 'https://www.flowerpowervillage.com/ferry';
      
      } else if (isCalendar) {
        canonicalUrl = 'https://www.flowerpowervillage.com/calendar';
      } else if (isWineList) {
        canonicalUrl = 'https://www.flowerpowervillage.com/wine-list';
      } else if (pathname.startsWith('/village')) {
        canonicalUrl = 'https://www.flowerpowervillage.com/village';
      } else if (pathname.startsWith('/rooms/')) {
        canonicalUrl = `https://www.flowerpowervillage.com${pathname}`;
      } else if (pathname.startsWith('/terms')) {
        canonicalUrl = 'https://www.flowerpowervillage.com/terms';
      } else if (pathname.startsWith('/privacy')) {
        canonicalUrl = 'https://www.flowerpowervillage.com/privacy';
      } else if (pathname.startsWith('/legal')) {
        canonicalUrl = 'https://www.flowerpowervillage.com/legal';
      } else {
        const cleanPath = pathname === '/' ? '/' : pathname;
        canonicalUrl = `https://www.flowerpowervillage.com${cleanPath}`;
      }

      canonicalLink.setAttribute('href', canonicalUrl);

      let ogUrl = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalUrl);

      if (isCalendar) {
        document.title = 'Flower Power Village · Calendario Disponibilità Live & Tariffe';
        if (manifestLink) manifestLink.href = '/manifest.json';
        if (appleTitle) appleTitle.content = 'FP Calendar';
        if (themeColor) themeColor.content = '#0c0a09';
        if (metaDesc) {
          metaDesc.content = 'Verifica la disponibilità delle camere in tempo reale a Flower Power Village (Koh Phayam, Thailandia). Prenota direttamente con il miglior prezzo garantito e risparmia il 10%.';
        }
        if (ogImage) ogImage.content = '/FP_04_-_LOGO_OFFICIAL_HD.png';
      } else if (isAdmin) {
        document.title = 'Admin FP — Flower Power Staff Portal';
        if (manifestLink) manifestLink.href = '/manifest.json';
        if (appleTitle) appleTitle.content = 'Admin FP';
        if (themeColor) themeColor.content = '#1c1917';
      } else if (isSocial) {
        document.title = 'Flower Power Social Studio — TikTok & Meta Publisher';
        if (manifestLink) manifestLink.href = '/manifest.json';
        if (metaDesc) {
          metaDesc.content = 'Flower Power Social Studio: Social media management platform designed for restaurants, culinary creators, and hospitality businesses to schedule and publish video content across TikTok, Instagram, and Facebook.';
        }
      } else if (isLegal) {
        document.title = 'Flower Power — Terms of Service & Privacy Policy';
        if (manifestLink) manifestLink.href = '/manifest.json';
        if (metaDesc) {
          metaDesc.content = 'Official Terms of Service, Privacy Policy (PDPA & GDPR), and TikTok Content Posting API compliance for Flower Power platform users, culinary creators, and hospitality guests.';
        }
      } else if (isKitchen) {
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
    } catch (e) {
      console.warn('DynamicHeadManager safe catch:', e);
    }
  }, [location.pathname, location.search]);

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
  return <VillageSite />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DynamicHeadManager />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
          <Route path="/" element={<RootRouter />} />
          <Route path="/calendar" element={<ResortPublicCalendarPage />} />
          <Route path="/calendar/*" element={<ResortPublicCalendarPage />} />
          <Route path="/village/calendar" element={<ResortPublicCalendarPage />} />
          <Route path="/village/calendar/*" element={<ResortPublicCalendarPage />} />
          <Route path="/wine-list" element={<VillageWineListPage />} />
          <Route path="/wine-list/*" element={<VillageWineListPage />} />
          <Route path="/village/wine-list" element={<VillageWineListPage />} />
          <Route path="/village/wine-list/*" element={<VillageWineListPage />} />
          <Route path="/ferry" element={<VillageSite />} />
          <Route path="/ferries" element={<Navigate to="/ferry" replace />} />
          <Route path="/boat" element={<Navigate to="/ferry" replace />} />
          <Route path="/boats" element={<Navigate to="/ferry" replace />} />
          <Route path="/directions" element={<Navigate to="/village/how-to-get-here" replace />} />
          <Route path="/how-to-get-here" element={<Navigate to="/village/how-to-get-here" replace />} />
          <Route path="/transport" element={<Navigate to="/village/how-to-get-here" replace />} />
          <Route path="/trasporti" element={<Navigate to="/village/how-to-get-here" replace />} />
          <Route path="/village/ferry" element={<Navigate to="/ferry" replace />} />
          <Route path="/village/ferries" element={<Navigate to="/ferry" replace />} />
          <Route path="/village/boat" element={<Navigate to="/ferry" replace />} />
          <Route path="/village/boats" element={<Navigate to="/ferry" replace />} />
          <Route path="/village/directions" element={<Navigate to="/village/how-to-get-here" replace />} />
          <Route path="/village/how-to-get-here" element={<VillageSite />} />
          <Route path="/village/*" element={<VillageSite />} />
          <Route path="/pizza/*" element={<PizzaSite />} />
          <Route path="/order" element={<PizzaSite />} />
          <Route path="/about" element={<PizzaSite />} />
          <Route path="/contact" element={<PizzaSite />} />
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
          <Route path="/terms" element={<LegalPage initialTab="terms" />} />
          <Route path="/privacy" element={<LegalPage initialTab="privacy" />} />
          <Route path="/legal" element={<LegalPage initialTab="all" />} />
          <Route path="/policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/policies" element={<Navigate to="/terms" replace />} />
          <Route path="/social" element={<SocialStudioPage />} />
          <Route path="/social/*" element={<SocialStudioPage />} />
          <Route path="/social-studio" element={<AutoCutStudioPage />} />
          <Route path="/social-studio/*" element={<AutoCutStudioPage />} />
          <Route path="/autocut" element={<AutoCutStudioPage />} />
          <Route path="/autocut/*" element={<AutoCutStudioPage />} />
          <Route path="/flowerpowerpizzaranong/*" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          <Route path="/flowerpowerpizzaranong" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          <Route path="/flowerpowerpizza/*" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          <Route path="/flowerpowerpizza" element={<RedirectToExternal url="https://www.flowerpowerpizza.com" />} />
          {/* 🏨 Link Diretti Permanenti ai 18 Alloggi (Legacy & Canonical URLs) */}
          {ACCOMMODATION_IDENTITIES.map((acc) => (
            <React.Fragment key={acc.legacySlug}>
              <Route path={`/${acc.legacySlug}`} element={<Navigate to={`/village?room=${acc.legacySlug}`} replace />} />
              <Route path={`/${acc.legacySlug}/*`} element={<Navigate to={`/village?room=${acc.legacySlug}`} replace />} />
              <Route path={`/${acc.canonicalSlug}`} element={<Navigate to={`/village?room=${acc.legacySlug}`} replace />} />
            </React.Fragment>
          ))}
          {/* 🔄 Alias Storico Room 6 da Volantino Cartaceo (ora Lodge 1) */}
          <Route path="/36-room-6" element={<Navigate to="/village" replace />} />
          <Route path="/36-room-6/*" element={<Navigate to="/village" replace />} />
          <Route path="/room-6" element={<Navigate to="/village" replace />} />
          {/* Legacy hash-based admin redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
