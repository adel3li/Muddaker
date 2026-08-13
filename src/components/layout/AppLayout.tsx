import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, CheckCircle, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const location = useLocation();
  const isSession = location.pathname.startsWith('/session');
  
  if (isSession) {
    return <Outlet />; // No bottom nav during session
  }

  const navItems = [
    { to: '/', icon: Home, label: 'الرئيسية' },
    { to: '/journal', icon: BookOpen, label: 'خواطري' },
    { to: '/consistency', icon: CheckCircle, label: 'المداومة' },
    { to: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-textPrimary pt-[env(safe-area-inset-top)]">
      <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 w-full bg-surface border-t border-accent/20 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <ul className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  className="flex flex-col items-center justify-center py-1 gap-1"
                >
                  <div className={cn(
                    "px-4 py-1 rounded-full transition-colors",
                    isActive ? "bg-quranBg text-accent" : "text-textSecondary hover:text-textPrimary"
                  )}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "fill-accent/20")} />
                  </div>
                  <span className={cn(
                    "text-[12px] transition-colors",
                    isActive ? "text-textPrimary font-medium" : "text-textSecondary"
                  )}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
