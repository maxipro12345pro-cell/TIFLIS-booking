import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';

const BranchSelectPage = lazy(() => import('./pages/BranchSelectPage.jsx'));
const BookingPage = lazy(() => import('./pages/BookingPage.jsx'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage.jsx'));
const HostessLogin = lazy(() => import('./pages/HostessLogin.jsx'));
const HostessBranchSelect = lazy(() => import('./pages/HostessBranchSelect.jsx'));
const HostessDashboard = lazy(() => import('./pages/HostessDashboard.jsx'));
const FloorMap = lazy(() => import('./pages/FloorMap.jsx'));

function PageFallback() {
  return <div className="min-h-screen bg-[#171310]" aria-hidden="true" />;
}

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    globalThis.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      <LanguageSwitcher />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<BranchSelectPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/hostess" element={<HostessLogin />} />
          <Route path="/hostess/branches" element={<HostessBranchSelect />} />
          <Route path="/hostess/dashboard" element={<HostessDashboard />} />
          <Route path="/hostess/floor" element={<FloorMap />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}