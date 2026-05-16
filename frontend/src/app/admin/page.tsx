'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar         from '@/components/Navbar';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">
            RBAC is already working: only ADMIN role can reach this page.
          </p>
          <div className="mt-8 bg-green-950 border border-green-800 rounded-xl p-6">
            <p className="text-green-300 font-semibold">✅ RBAC is working correctly</p>
            <p className="text-green-500 text-sm mt-1">
              Viewer and Billing Manager roles will see the Access Denied screen instead of this page.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}