import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './components/home/Home';
import { Journal } from './components/journal/Journal';
import { Consistency } from './components/consistency/Consistency';
import { Progress } from './components/progress/Progress';
import { Settings } from './components/settings/Settings';
import { Session } from './components/session/Session';
import { Onboarding } from './components/onboarding/Onboarding';
import { useAppStore } from './lib/store';

function AppRoutes() {
  const hasOnboarded = useAppStore(s => s.hasOnboarded);
  const location = useLocation();

  if (!hasOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/consistency" element={<Consistency />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/session/:id" element={<Session />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const theme = useAppStore(s => s.theme);
  const textSize = useAppStore(s => s.textSize);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (textSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [textSize]);

  return <AppRoutes />;
}
