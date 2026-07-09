import { useState, useEffect } from 'react';
import { useNavigate as useRRNavigate, useLocation } from 'react-router-dom';
import VillageNav from '../components/VillageNav';
import VillageFooter from '../components/VillageFooter';
import PageLayout from '../components/PageLayout';
import BookingEngine from '../booking/components/booking-engine';
import RestaurantSection from '../sections/RestaurantSection';
import SpaSection from '../sections/SpaSection';
import DirectionsSection from '../sections/DirectionsSection';
import GallerySection from '../sections/GallerySection';
import ContactSection from '../sections/ContactSection';

type Page = 'accommodations' | 'restaurant' | 'spa' | 'gallery' | 'directions' | 'contact';

const subPathToPage: Record<string, Page> = {
  '': 'accommodations',
  'accommodations': 'accommodations',
  'restaurant': 'restaurant',
  'restaurant-pizzeria': 'restaurant',
  'spa': 'spa',
  'gallery': 'gallery',
  'directions': 'directions',
  'how-to-get-here': 'directions',
  'contact': 'contact',
  'contacts': 'contact',
};

export default function VillageSite() {
  const rrNavigate = useRRNavigate();
  const location = useLocation();

  const getPageFromPath = (): Page => {
    const sub = location.pathname.replace('/village', '').replace(/^\//, '');
    return subPathToPage[sub] ?? 'accommodations';
  };

  const [activePage, setActivePage] = useState<Page>(getPageFromPath);

  useEffect(() => {
    setActivePage(getPageFromPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const navigatePage = (page: string) => {
    let target = page;
    if (page === 'accommodations') target = '';
    else if (page === 'restaurant') target = 'restaurant-pizzeria';
    else if (page === 'directions') target = 'how-to-get-here';
    else if (page === 'contact') target = 'contacts';

    const path = target ? `/village/${target}` : '/village';
    rrNavigate(path);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'accommodations':
        return <BookingEngine />;
      case 'restaurant':
        return (
          <PageLayout>
            <RestaurantSection />
          </PageLayout>
        );
      case 'spa':
        return (
          <PageLayout>
            <SpaSection />
          </PageLayout>
        );
      case 'gallery':
        return (
          <PageLayout>
            <GallerySection />
          </PageLayout>
        );
      case 'directions':
        return (
          <PageLayout>
            <DirectionsSection />
          </PageLayout>
        );
      case 'contact':
        return (
          <PageLayout>
            <ContactSection />
          </PageLayout>
        );
      default:
        return <BookingEngine />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e7e5e4]">
      <VillageNav activePage={activePage} onNavigate={navigatePage} />
      <main>{renderPage()}</main>
      <VillageFooter onNavigate={navigatePage} />
    </div>
  );
}


