'use client';

import Link from 'next/link';

interface Props { requiredRole?: string; }

export default function AccessDenied({ requiredRole }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-gray-400 mb-2">
          You don&apos;t have permission to view this page.
        </p>
        {requiredRole && (
          <p className="text-gray-500 text-sm mb-8">
            Required role:{' '}
            <span className="text-blue-400 font-medium">{requiredRole}</span>
          </p>
        )}
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}