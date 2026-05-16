'use client';

import { useState } from 'react';

interface HeatCell {
  team:      string;
  service:   string;
  avgCpu:    number;
  avgMem:    number;
  avgCost:   number;
  totalCost: number;
  count:     number;
  idleCount: number;
  heatValue: number;
}

interface Props {
  data:    { cells: HeatCell[]; teams: string[]; services: string[] } | null;
  loading: boolean;
}

type Metric = 'cpu' | 'memory' | 'cost';

// ── Color scale: blue → green → yellow → orange → red ────────
function getHeatColor(value: number, metric: Metric): string {
  // Normalize to 0–100
  let pct = metric === 'cost' ? Math.min(value / 300, 1) * 100 : value;

  if (pct < 20)  return 'bg-blue-950  border-blue-900  text-blue-300';
  if (pct < 40)  return 'bg-green-950 border-green-900 text-green-300';
  if (pct < 60)  return 'bg-yellow-950 border-yellow-900 text-yellow-300';
  if (pct < 80)  return 'bg-orange-950 border-orange-900 text-orange-300';
  return                 'bg-red-950   border-red-900   text-red-300';
}

function getHeatIntensity(value: number): string {
  if (value < 20) return 'opacity-40';
  if (value < 40) return 'opacity-60';
  if (value < 60) return 'opacity-80';
  if (value < 80) return 'opacity-90';
  return 'opacity-100';
}

// ── Tooltip on hover ──────────────────────────────────────────
function CellTooltip({ cell }: { cell: HeatCell }) {
  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52
                    bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-2xl
                    pointer-events-none">
      <p className="text-white font-semibold text-sm mb-2">
        {cell.team} / {cell.service}
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Avg CPU</span>
          <span className={cell.avgCpu > 85 ? 'text-red-400 font-bold' : 'text-gray-200'}>
            {cell.avgCpu}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg Memory</span>
          <span className={cell.avgMem > 85 ? 'text-red-400 font-bold' : 'text-gray-200'}>
            {cell.avgMem}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Monthly Cost</span>
          <span className="text-gray-200">${cell.totalCost.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Resources</span>
          <span className="text-gray-200">{cell.count}</span>
        </div>
        {cell.idleCount > 0 && (
          <div className="flex justify-between pt-1 border-t border-gray-600">
            <span className="text-orange-400">Idle</span>
            <span className="text-orange-400 font-bold">{cell.idleCount} idle</span>
          </div>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4
                      border-transparent border-t-gray-600" />
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────
function Legend({ metric }: { metric: Metric }) {
  const steps = [
    { label: metric === 'cost' ? '$0'   : '0%',   color: 'bg-blue-950'   },
    { label: metric === 'cost' ? '$60'  : '20%',  color: 'bg-green-950'  },
    { label: metric === 'cost' ? '$120' : '40%',  color: 'bg-yellow-950' },
    { label: metric === 'cost' ? '$200' : '60%',  color: 'bg-orange-950' },
    { label: metric === 'cost' ? '$300+': '80%+', color: 'bg-red-950'    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-500 text-xs">Low</span>
      {steps.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1">
          <div className={`w-4 h-4 rounded border border-gray-700 ${color}`} />
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
      ))}
      <span className="text-gray-500 text-xs">High</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function HeatmapSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-1/4 mb-6" />
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ResourceHeatmap({ data, loading }: Props) {
  const [metric,      setMetric]      = useState<Metric>('cpu');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  if (loading) return <HeatmapSkeleton />;
  if (!data || data.cells.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-500">No resource data available</p>
      </div>
    );
  }

  const { cells, teams, services } = data;

  // Build lookup: "team|service" → cell
  const cellMap = new Map<string, HeatCell>(
    cells.map(c => [`${c.team}|${c.service}`, c])
  );

  function getCellValue(cell: HeatCell): number {
    if (metric === 'cpu')    return cell.avgCpu;
    if (metric === 'memory') return cell.avgMem;
    return cell.avgCost;
  }

  const METRIC_OPTIONS: { key: Metric; label: string; icon: string }[] = [
    { key: 'cpu',    label: 'CPU Usage',    icon: '⚡' },
    { key: 'memory', label: 'Memory Usage', icon: '🧠' },
    { key: 'cost',   label: 'Monthly Cost', icon: '💰' },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Resource Heatmap</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Usage intensity by team × service — hover a cell for details
          </p>
        </div>

        {/* Metric switcher */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {METRIC_OPTIONS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                metric === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">

          {/* Column headers = services */}
          <div
            className="grid gap-2 mb-2"
            style={{ gridTemplateColumns: `120px repeat(${services.length}, 110px)` }}
          >
            <div /> {/* empty top-left corner */}
            {services.map(svc => (
              <div key={svc} className="text-center text-xs text-gray-400 font-medium px-1 truncate">
                {svc}
              </div>
            ))}
          </div>

          {/* Rows = teams */}
          {teams.map(team => (
            <div
              key={team}
              className="grid gap-2 mb-2"
              style={{ gridTemplateColumns: `120px repeat(${services.length}, 110px)` }}
            >
              {/* Row header = team */}
              <div className="flex items-center">
                <span className="text-gray-300 text-sm font-medium capitalize">{team}</span>
              </div>

              {/* Cells */}
              {services.map(svc => {
                const cellKey = `${team}|${svc}`;
                const cell    = cellMap.get(cellKey);

                if (!cell) {
                  // No resources for this team/service combo
                  return (
                    <div
                      key={svc}
                      className="h-16 rounded-lg bg-gray-800 border border-gray-750 flex items-center justify-center"
                    >
                      <span className="text-gray-700 text-xs">—</span>
                    </div>
                  );
                }

                const value     = getCellValue(cell);
                const colorCls  = getHeatColor(value, metric);
                const intensity = getHeatIntensity(cell.heatValue);
                const cellId    = `${team}-${svc}`;
                const isHovered = hoveredCell === cellId;

                return (
                  <div
                    key={svc}
                    className={`relative h-16 rounded-lg border cursor-pointer
                                transition-all duration-200 flex flex-col items-center
                                justify-center gap-0.5 ${colorCls} ${intensity}
                                ${isHovered ? 'scale-105 shadow-lg z-10' : 'hover:scale-105'}`}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {/* Main value */}
                    <span className="text-sm font-bold">
                      {metric === 'cost' ? `$${value.toFixed(0)}` : `${value}%`}
                    </span>

                    {/* Resource count */}
                    <span className="text-[10px] opacity-70">
                      {cell.count} resource{cell.count !== 1 ? 's' : ''}
                    </span>

                    {/* Idle badge */}
                    {cell.idleCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white
                                       text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {cell.idleCount} idle
                      </span>
                    )}

                    {/* Tooltip */}
                    {isHovered && <CellTooltip cell={cell} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <Legend metric={metric} />
      </div>
    </div>
  );
}