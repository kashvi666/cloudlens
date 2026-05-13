'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: '📊' },
  { href: '/resources',  label: 'Resources',  icon: '🖥️' },
  { href: '/alerts',     label: 'Alerts',     icon: '🔔' },
  { href: '/admin',      label: 'Admin',      icon: '⚙️', adminOnly: true },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN:           'bg-red-900 text-red-300',
  BILLING_MANAGER: 'bg-yellow-900 text-yellow-300',
  VIEWER:          'bg-blue-900 text-blue-300',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname         = usePathname();

  const links = NAV_LINKS.filter(l => !l.adminOnly || user?.role === 'ADMIN');

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              <span className="text-white font-bold text-lg hidden sm:block">CloudLens</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block ${ROLE_BADGE[user?.role ?? 'VIEWER']}`}>
              {user?.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}