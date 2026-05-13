'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

interface Props { data: any[]; loading: boolean; }

function Skeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-1/4 mb-6" />
      <div className="h-64 bg-gray-800 rounded" />
    </div>
  );
}

export default function CostTrendChart({ data, loading }: Props) {
  if (loading) return <Skeleton />;

  const labels  = data.map(d => d.date);
  const totals  = data.map(d => d.total);

  // Highlight anomaly days in red
  const avg     = totals.reduce((s, v) => s + v, 0) / (totals.length || 1);
  const pointColors = totals.map(v => v > avg * 2 ? '#f87171' : '#3b82f6');
  const pointRadius = totals.map(v => v > avg * 2 ? 6 : 3);

  const chartData = {
    labels,
    datasets: [
      {
        label:           'Daily Cost (USD)',
        data:            totals,
        borderColor:     '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        pointBackgroundColor: pointColors,
        pointBorderColor:     pointColors,
        pointRadius,
        pointHoverRadius: 7,
        fill:             true,
        tension:          0.4,
        borderWidth:      2,
      },
      {
        label:       'Average',
        data:        totals.map(() => parseFloat(avg.toFixed(2))),
        borderColor: 'rgba(156,163,175,0.4)',
        borderDash:  [6, 4],
        pointRadius: 0,
        fill:        false,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor:      '#f9fafb',
        bodyColor:       '#d1d5db',
        borderColor:     '#374151',
        borderWidth:     1,
        callbacks: {
          label: (ctx: any) => ` $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 10,
          font: { size: 11 },
        },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
      y: {
        ticks: {
          color: '#6b7280',
          font:  { size: 11 },
          callback: (v: any) => `$${v}`,
        },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
    },
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Cost Trend</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Daily spend — red dots are anomalies (2× average)
          </p>
        </div>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}