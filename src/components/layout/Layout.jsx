import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BackToTop from '../common/BackToTop';
import DemoBanner from '../common/DemoBanner';
import ImportBanner from './ImportBanner';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[80] focus:rounded focus:bg-gold focus:px-3 focus:py-2 focus:text-night">Skip to content</a>
      <DemoBanner />
      <Navbar />
      <ImportBanner />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
