'use client';

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SERVICE_COLORS: Record<string, string> = {
  Compute:    '#3b82f6',
  Storage:    '#8b5cf6',
  Networking: '#06b6d4',
  Database:   '#10b981',
  Functions:  '#f59e0b',
  'AI/ML':    '#ef4444',
};

interface Props { data: any[]; }

export default function ServiceBreakdown({ data }: Props) {
  const chartData = {
    labels:   data.map(d => d.service),
    datasets: [{
      label:           'Cost (USD)',
      data:            data.map(d => d.total),
      backgroundColor: data.map(d => SERVICE_COLORS[d.service] || '#6b7280'),
      borderRadius:    6,
      borderWidth:     0,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor:      '#f9fafb',
        bodyColor:       '#d1d5db',
        callbacks: { label: (ctx: any) => ` $${ctx.parsed.y.toFixed(2)}` },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid:  { display: false },
      },
      y: {
        ticks: {
          color:    '#6b7280',
          font:     { size: 11 },
          callback: (v: any) => `$${v}`,
        },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
    },
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-white font-semibold text-lg mb-1">By Service</h2>
      <p className="text-gray-400 text-sm mb-6">Total cost per Azure service</p>
      <div className="h-52">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}