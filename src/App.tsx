import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplitScreen from './pages/SplitScreen';
import VillageSite from './pages/VillageSite';
import PizzaSite from './pages/PizzaSite';
import AdminDashboard from './pizza/pages/AdminDashboard';
import AccommodationDetailPage from './pages/AccommodationDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplitScreen />} />
        <Route path="/village/*" element={<VillageSite />} />
        <Route path="/pizza/*" element={<PizzaSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/rooms/:slug" element={<AccommodationDetailPage />} />
        {/* Legacy hash-based admin redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
