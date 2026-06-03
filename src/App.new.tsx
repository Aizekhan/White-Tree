/**
 * App - головний компонент з AppShell + роутингом
 * Джерело правди: White.html (структура шелу + навігація)
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import AppShell, { type Mode } from './components/AppShell';
import Login from './features/auth/components/Login';

// Pillars (в проекті)
import BookView from './features/book/BookView';
import UniverseView from './features/universe/UniverseView';
import DirectorView from './features/director/DirectorView';

// Sections (на головній)
import ProjectsView from './features/home/ProjectsView';
import KnowledgeBaseView from './features/home/KnowledgeBaseView';
import MarketplaceView from './features/home/MarketplaceView';

/**
 * Роути для pillars (в проекті)
 */
const PILLAR_ROUTES = {
  book: '/work/book',
  universe: '/work/universe',
  director: '/work/director',
} as const;

/**
 * Роути для sections (на головній)
 */
const SECTION_ROUTES = {
  narr: '/projects',
  kb: '/knowledge-base',
  market: '/marketplace',
} as const;

/**
 * AppContent - внутрішній контент з доступом до navigate
 */
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    console.log('[APP] Initializing auth listener');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('[AUTH] User state changed:', currentUser?.email || 'Not logged in');
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Визначаємо поточний mode з URL
  const getCurrentMode = (): Mode => {
    const path = location.pathname;

    // Pillars
    if (path.startsWith('/work/book')) return 'book';
    if (path.startsWith('/work/universe')) return 'universe';
    if (path.startsWith('/work/director')) return 'director';

    // Sections
    if (path.startsWith('/projects')) return 'narr';
    if (path.startsWith('/knowledge-base')) return 'kb';
    if (path.startsWith('/marketplace')) return 'market';

    // Home
    if (path === '/') return 'home';

    return null;
  };

  const mode = getCurrentMode();
  const inWork = mode === 'book' || mode === 'universe' || mode === 'director';

  // Handle mode change
  const handleModeChange = (newMode: Mode) => {
    console.log('[APP] Mode change:', mode, '→', newMode);

    if (!newMode) return;

    // Pillars
    if (newMode in PILLAR_ROUTES) {
      navigate(PILLAR_ROUTES[newMode as keyof typeof PILLAR_ROUTES]);
      return;
    }

    // Sections
    if (newMode in SECTION_ROUTES) {
      navigate(SECTION_ROUTES[newMode as keyof typeof SECTION_ROUTES]);
      return;
    }

    // Home
    if (newMode === 'home') {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-0)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '2px solid var(--gold-soft)',
            borderTopColor: 'var(--gold-lit)',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <AppShell
      mode={mode}
      inWork={inWork}
      isAuthenticated={!!user}
      tokens={1500} // TODO: отримувати з Firestore
      userEmail={user?.email || undefined}
      onModeChange={handleModeChange}
      onLogout={handleLogout}
      onGoHome={handleGoHome}
    >
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomeRedirect isAuthenticated={!!user} />} />

        {/* Sections */}
        <Route
          path="/projects"
          element={user ? <ProjectsView /> : <Navigate to="/" replace />}
        />
        <Route path="/knowledge-base" element={<KnowledgeBaseView />} />
        <Route path="/marketplace" element={<MarketplaceView />} />

        {/* Pillars (потребують проект) */}
        <Route
          path="/work/book"
          element={user ? <BookView /> : <Navigate to="/" replace />}
        />
        <Route
          path="/work/universe"
          element={user ? <UniverseView /> : <Navigate to="/" replace />}
        />
        <Route
          path="/work/director"
          element={user ? <DirectorView /> : <Navigate to="/" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

/**
 * Home redirect logic
 */
function HomeRedirect({ isAuthenticated }: { isAuthenticated: boolean }) {
  // Якщо залогінений → перекинути на проекти
  // Якщо ні → показати лендінг/логін
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  return <Login />;
}

/**
 * Main App with Router
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Keyframes для loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
