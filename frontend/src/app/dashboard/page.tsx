'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">

        {/* Navbar */}
        <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <span className="text-lg font-bold">CloudLens</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user?.name}
              <span className="ml-2 bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {user?.role}
              </span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </nav>

        {/* Placeholder content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-400 mb-8">
            Dashboard coming in Day 7. Auth is working perfectly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Cost (30d)', value: '$0.00', sub: 'Mock data loads Day 5' },
              { label: 'Active Alerts', value: '0', sub: 'Alert engine in Day 11' },
              { label: 'Resources', value: '0', sub: 'Resources page in Day 9' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-1">{label}</p>
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}