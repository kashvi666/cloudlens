'use client';

import { useState }        from 'react';
import ProtectedRoute      from '@/components/ProtectedRoute';
import Navbar              from '@/components/Navbar';
import FilterBar           from '@/components/dashboard/FilterBar';
import SummaryCards        from '@/components/dashboard/SummaryCards';
import CostTrendChart      from '@/components/dashboard/CostTrendChart';
import ServiceBreakdown    from '@/components/dashboard/ServiceBreakdown';
import TeamLeaderboard     from '@/components/dashboard/TeamLeaderboard';
import AnomalyBanner       from '@/components/dashboard/AnomalyBanner';
import {
  DEFAULT_FILTERS, Filters,
  useSummary, useDailyCosts, useByService, useByTeam, useFilterOptions,
} from '@/lib/useCosts';

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const { data: summary, loading: summaryLoading } = useSummary(filters);
  const { data: daily,   loading: dailyLoading   } = useDailyCosts(filters);
  const byService = useByService(filters);
  const byTeam    = useByTeam(filters);
  const options   = useFilterOptions();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">Cost Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Azure + multi-cloud usage and spend — last {filters.days} days
            </p>
          </div>

          {/* Anomaly Banner */}
          {summary?.anomalyDays?.length > 0 && (
            <AnomalyBanner anomalyDays={summary.anomalyDays} />
          )}

          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} options={options} />

          {/* Summary Cards */}
          <SummaryCards data={summary} loading={summaryLoading} />

          {/* Line Chart (full width) */}
          <CostTrendChart data={daily} loading={dailyLoading} />

          {/* Bar + Team side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServiceBreakdown data={byService} />
            <TeamLeaderboard  data={byTeam}    />
          </div>

          {/* Footer note */}
          <p className="text-center text-gray-600 text-xs pb-4">
            CloudLens — data is simulated for demo purposes · Built with Next.js + Azure
          </p>

        </main>
      </div>
    </ProtectedRoute>
  );
}