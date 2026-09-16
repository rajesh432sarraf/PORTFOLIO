import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import Experience from './components/Experience.jsx';
import Achievements from './components/Achievements.jsx';
import Certifications from './components/Certifications.jsx';
import Profiles from './components/Profiles.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import NotFound from './components/NotFound.jsx';
import useLenis from './hooks/useLenis.js';

const AdminLogin = React.lazy(() => import('./admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard.jsx'));

const AdminFallback = () => (
  <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center text-white/50 font-mono text-xs tracking-widest uppercase">
    Loading Studio...
  </div>
);

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    Boolean(sessionStorage.getItem('rajesh_portfolio_admin_token'))
  );

  const isPublicPage = !currentPath.startsWith('/admin');

  // Initialize smooth scrolling globally for public pages only
  useLenis(isPublicPage);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setIsAdminAuthenticated(Boolean(sessionStorage.getItem('rajesh_portfolio_admin_token')));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Admin Login Route
  if (currentPath === '/admin/login') {
    return (
      <React.Suspense fallback={<AdminFallback />}>
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            window.history.pushState({}, '', '/admin');
            setCurrentPath('/admin');
          }}
        />
      </React.Suspense>
    );
  }

  // 2. Admin Dashboard Route (Protected)
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!isAdminAuthenticated) {
      return (
        <React.Suspense fallback={<AdminFallback />}>
          <AdminLogin
            onLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              window.history.pushState({}, '', '/admin');
              setCurrentPath('/admin');
            }}
          />
        </React.Suspense>
      );
    }
    return (
      <React.Suspense fallback={<AdminFallback />}>
        <AdminDashboard
          onLogout={() => {
            setIsAdminAuthenticated(false);
            window.history.pushState({}, '', '/admin/login');
            setCurrentPath('/admin/login');
          }}
        />
      </React.Suspense>
    );
  }

  // 3. 404 Route for unknown non-root paths (excluding hash links)
  if (currentPath !== '/' && currentPath !== '/index.html') {
    return <NotFound />;
  }

  // 4. Primary Public Developer Portfolio
  return (
    <div className="relative min-h-screen w-full bg-[#0C0C0C] text-[#D7E2EA] overflow-x-clip selection:bg-[#7621B0]/40 selection:text-white">
      {/* Global Top Navigation */}
      <Navbar />

      {/* Main Content Flow */}
      <main id="main-content" className="w-full">
        {/* 01: Hero */}
        <Hero />

        {/* 02: Technology Marquee */}
        <Marquee />

        {/* 03: About Me */}
        <About />

        {/* 04: Skills */}
        <Skills />

        {/* 05: Selected Projects (Sticky Stacking Showcase & Archive) */}
        <Projects />

        {/* 07: Work & Practical Experience */}
        <Experience />

        {/* 08: Hackathons & Recognition */}
        <Achievements />

        {/* 09: Technical Certifications */}
        <Certifications />

        {/* 10: Coding & Community Profiles */}
        <Profiles />

        {/* 11: Contact Form & Inquiry Channel */}
        <Contact />
      </main>

      {/* Section 12: Footer */}
      <Footer />

      {/* Floating Back to Top control */}
      <BackToTop />
    </div>
  );
}

export default App;
