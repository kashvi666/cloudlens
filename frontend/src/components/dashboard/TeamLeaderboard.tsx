'use client';

const TEAM_COLORS: Record<string, string> = {
  frontend: 'bg-blue-500',
  backend:  'bg-purple-500',
  data:     'bg-cyan-500',
  devops:   'bg-green-500',
  ml:       'bg-red-500',
};

interface Props { data: any[]; }

export default function TeamLeaderboard({ data }: Props) {
  const max = data[0]?.total || 1;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-white font-semibold text-lg mb-1">By Team</h2>
      <p className="text-gray-400 text-sm mb-6">Spend breakdown per team</p>

      <div className="space-y-4">
        {data.map(({ team, total }) => (
          <div key={team}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-300 capitalize font-medium">{team}</span>
              <span className="text-white font-semibold">${total.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${TEAM_COLORS[team] ?? 'bg-gray-500'}`}
                style={{ width: `${(total / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}