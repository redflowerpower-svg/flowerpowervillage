import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplitScreen from './pages/SplitScreen';
import VillageSite from './pages/VillageSite';
import PizzaSite from './pages/PizzaSite';
import AdminMain from './admin/AdminMain';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import DocumentReaderPage from './pages/DocumentReaderPage';

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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplitScreen />} />
          <Route path="/village/*" element={<VillageSite />} />
          <Route path="/pizza/*" element={<PizzaSite />} />
          <Route path="/admin" element={<AdminMain />} />
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
