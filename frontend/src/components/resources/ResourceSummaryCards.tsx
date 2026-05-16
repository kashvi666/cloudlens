'use client';

interface Props { data: any; loading: boolean; }

function Card({ label, value, sub, icon, color = 'text-white' }: {
  label: string; value: string | number; sub: string;
  icon: string; color?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold mb-1 ${color}`}>{value}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-4" />
      <div className="h-7 bg-gray-800 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-800 rounded w-2/3" />
    </div>
  );
}

export default function ResourceSummaryCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Resources" value={data.total}
        sub={`${data.running} running`} icon="🖥️"
      />
      <Card
        label="Idle Resources" value={data.idle}
        sub={`$${data.wastedCost}/mo wasted`}
        icon="💤" color={data.idle > 0 ? 'text-orange-400' : 'text-white'}
      />
      <Card
        label="High CPU (>85%)" value={data.highCpu}
        sub="Needs attention"
        icon="🔥" color={data.highCpu > 0 ? 'text-red-400' : 'text-white'}
      />
      <Card
        label="Monthly Cost" value={`$${data.totalMonthlyCost.toLocaleString()}`}
        sub={`Avg CPU: ${data.avgCpuUsage}%`} icon="💰"
      />
    </div>
  );
}