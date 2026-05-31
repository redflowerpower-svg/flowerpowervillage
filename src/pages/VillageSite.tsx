import { useState, useEffect } from 'react';
import { useNavigate as useRRNavigate, useLocation } from 'react-router-dom';
import VillageNav from '../components/VillageNav';
import VillageFooter from '../components/VillageFooter';
import VillageHero from '../sections/VillageHero';
import VillageHighlights from '../sections/VillageHighlights';
import VillageBookingBanner from '../sections/VillageBookingBanner';
import AccommodationsSection from '../sections/AccommodationsSection';
import RestaurantSection from '../sections/RestaurantSection';
import SpaSection from '../sections/SpaSection';
import ActivitiesSection from '../sections/ActivitiesSection';
import GallerySection from '../sections/GallerySection';
import ContactSection from '../sections/ContactSection';

type Page = 'home' | 'accommodations' | 'restaurant' | 'spa' | 'activities' | 'gallery' | 'contact';

const subPathToPage: Record<string, Page> = {
  accommodations: 'accommodations',
  restaurant: 'restaurant',
  spa: 'spa',
  activities: 'activities',
  gallery: 'gallery',
  contact: 'contact',
};

export default function VillageSite() {
  const rrNavigate = useRRNavigate();
  const location = useLocation();

  const getPageFromPath = (): Page => {
    const sub = location.pathname.replace('/village', '').replace(/^\//, '');
    return subPathToPage[sub] ?? 'home';
  };

  const [activePage, setActivePage] = useState<Page>(getPageFromPath);

  useEffect(() => {
    setActivePage(getPageFromPath());
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigatePage = (page: string) => {
    const path = page === 'home' ? '/village' : `/village/${page}`;
    rrNavigate(path);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'accommodations': return <AccommodationsSection onNavigate={navigatePage} />;
      case 'restaurant': return <RestaurantSection />;
      case 'spa': return <SpaSection />;
      case 'activities': return <ActivitiesSection />;
      case 'gallery': return <GallerySection />;
      case 'contact': return <ContactSection />;
      default:
        return (
          <>
            <VillageHero onNavigate={navigatePage} />
            <VillageHighlights />
            <VillageBookingBanner onNavigate={navigatePage} />
            <AccommodationsSection onNavigate={navigatePage} />
            <RestaurantSection />
            <SpaSection />
            <ActivitiesSection />
            <GallerySection />
            <ContactSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <VillageNav activePage={activePage} onNavigate={navigatePage} />
      <main>{renderPage()}</main>
      <VillageFooter onNavigate={navigatePage} />
    </div>
  );
}
