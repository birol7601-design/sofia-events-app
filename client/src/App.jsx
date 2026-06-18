import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import Home        from './pages/Home';
import Feed        from './pages/Feed';
import EventDetail from './pages/EventDetail';
import Profile     from './pages/Profile';
import Saved       from './pages/Saved';
import Messages    from './pages/Messages';
import Auth        from './pages/Auth';
import Organizer   from './pages/Organizer';
import Onboarding        from './pages/Onboarding';
import ComponentsPreview from './pages/ComponentsPreview';

const HIDE_NAV = ['/auth', '/onboarding', '/event/'];

function AnimatedRoutes() {
  const location = useLocation();
  const showNav = !HIDE_NAV.some(p => location.pathname.startsWith(p));

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"            element={<Home />} />
          <Route path="/feed"        element={<Feed />} />
          <Route path="/event/:id"   element={<EventDetail />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/saved"       element={<Saved />} />
          <Route path="/messages"    element={<Messages />} />
          <Route path="/organizer"   element={<Organizer />} />
          <Route path="/auth"        element={<Auth />} />
          <Route path="/onboarding"        element={<Onboarding />} />
          <Route path="/components-preview" element={<ComponentsPreview />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
