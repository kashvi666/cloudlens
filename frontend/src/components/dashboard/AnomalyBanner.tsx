'use client';

interface Props { anomalyDays: { date: string; total: number }[]; }

export default function AnomalyBanner({ anomalyDays }: Props) {
  if (!anomalyDays?.length) return null;

  return (
    <div className="bg-yellow-950 border border-yellow-700 rounded-xl p-4 flex items-start gap-3">
      <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
      <div>
        <p className="text-yellow-300 font-semibold text-sm">
          {anomalyDays.length} cost spike{anomalyDays.length > 1 ? 's' : ''} detected
        </p>
        <p className="text-yellow-500 text-xs mt-0.5">
          Days exceeding 2× average:{' '}
          {anomalyDays.map(d => `${d.date} ($${d.total})`).join(', ')}
        </p>
      </div>
    </div>
  );
}