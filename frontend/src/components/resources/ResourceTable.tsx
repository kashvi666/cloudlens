'use client';

const STATUS_STYLES: Record<string, string> = {
  RUNNING:     'bg-green-900  text-green-300  border-green-800',
  IDLE:        'bg-orange-900 text-orange-300 border-orange-800',
  SCALED_DOWN: 'bg-gray-800   text-gray-400   border-gray-700',
  STOPPED:     'bg-red-900    text-red-300    border-red-800',
};

function HealthBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-400">{score}</span>
    </div>
  );
}

interface Props { data: any[]; loading: boolean; }

export default function ResourceTable({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-gray-800 rounded w-1/4 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Resource Inventory</h2>
          <p className="text-gray-400 text-sm">{data.length} resources</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              {['Name', 'Type', 'Team', 'Status', 'CPU', 'Memory', 'Cost/mo', 'Health'].map(h => (
                <th key={h} className="px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-gray-900'
                }`}
              >
                <td className="px-4 py-3 text-gray-200 font-mono text-xs">{r.name}</td>
                <td className="px-4 py-3 text-gray-300">{r.type}</td>
                <td className="px-4 py-3">
                  <span className="capitalize text-gray-300">{r.team}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[r.status] ?? ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={r.cpuUsage > 85 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                    {r.cpuUsage}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={r.memoryUsage > 85 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                    {r.memoryUsage}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">${r.monthlyCostUsd}</td>
                <td className="px-4 py-3"><HealthBar score={r.healthScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}