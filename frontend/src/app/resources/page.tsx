'use client';

import { useState }             from 'react';
import ProtectedRoute           from '@/components/ProtectedRoute';
import Navbar                   from '@/components/Navbar';
import ResourceSummaryCards     from '@/components/resources/ResourceSummaryCards';
import ResourceHeatmap          from '@/components/resources/ResourceHeatmap';
import ResourceTable            from '@/components/resources/ResourceTable';
import ResourceFilterBar        from '@/components/resources/ResourceFilterBar';
import {
  DEFAULT_RESOURCE_FILTERS, ResourceFilters,
  useResourceSummary, useHeatmap, useResources, useResourceFilterOptions,
} from '@/lib/useResources';

export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFilters>(DEFAULT_RESOURCE_FILTERS);
  const [view,    setView]    = useState<'heatmap' | 'table'>('heatmap');

  const { data: summary, loading: summaryLoading } = useResourceSummary();
  const { data: heatmap, loading: heatmapLoading  } = useHeatmap(filters);
  const { data: resources, loading: tableLoading  } = useResources(filters);
  const options = useResourceFilterOptions();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Resources</h1>
              <p className="text-gray-400 text-sm mt-1">
                Live usage, health scores, and cost per resource
              </p>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {(['heatmap', 'table'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    view === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v === 'heatmap' ? '🗺️ Heatmap' : '📋 Table'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <ResourceSummaryCards data={summary} loading={summaryLoading} />

          {/* Filters */}
          <ResourceFilterBar filters={filters} onChange={setFilters} options={options} />

          {/* Heatmap or Table */}
          {view === 'heatmap'
            ? <ResourceHeatmap  data={heatmap}   loading={heatmapLoading} />
            : <ResourceTable    data={resources}  loading={tableLoading}   />
          }

        </main>
      </div>
    </ProtectedRoute>
  );
}