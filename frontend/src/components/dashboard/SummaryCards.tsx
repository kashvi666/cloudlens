'use client';

interface Props { data: any; loading: boolean; }

function StatCard({
  label, value, sub, subColor = 'text-gray-400', icon,
}: {
  label: string; value: string; sub: string; subColor?: string; icon: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-800 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-800 rounded w-1/3" />
    </div>
  );
}

export default function SummaryCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!data) return null;

  const changeColor = data.changePercent > 0
    ? 'text-red-400'
    : data.changePercent < 0
    ? 'text-green-400'
    : 'text-gray-400';

  const changeArrow = data.changePercent > 0 ? '↑' : data.changePercent < 0 ? '↓' : '→';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        label="Total Spend"
        value={`$${data.totalCost.toLocaleString()}`}
        sub={`${changeArrow} ${Math.abs(data.changePercent)}% vs last period`}
        subColor={changeColor}
        icon="💰"
      />
      <StatCard
        label="Top Service"
        value={data.topService?.service || '—'}
        sub={`$${data.topService?.total?.toLocaleString() ?? 0} this period`}
        icon="🔧"
      />
      <StatCard
        label="Cost Anomalies"
        value={String(data.anomalyCount)}
        sub={
          data.anomalyCount > 0
            ? `Last: ${data.anomalyDays[0]?.date ?? '—'}`
            : 'No anomalies detected'
        }
        subColor={data.anomalyCount > 0 ? 'text-yellow-400' : 'text-green-400'}
        icon="⚠️"
      />
      <StatCard
        label="Idle Resources"
        value={String(data.idleResources)}
        sub="Resources with <5% CPU usage"
        subColor={data.idleResources > 0 ? 'text-orange-400' : 'text-green-400'}
        icon="💤"
      />
    </div>
  );
}