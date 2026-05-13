'use client';

import { Filters } from '@/lib/useCosts';

interface Props {
  filters:   Filters;
  onChange:  (f: Filters) => void;
  options:   any;
}

const DAY_OPTIONS = [
  { label: '7 days',  value: '7'  },
  { label: '30 days', value: '30' },
  { label: '60 days', value: '60' },
  { label: '90 days', value: '90' },
];

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[32.5]"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onChange, options }: Props) {
  const set = (key: keyof Filters) => (val: string) =>
    onChange({ ...filters, [key]: val });

  const reset = () => onChange({ days: '30', team: '', service: '', project: '', provider: '' });

  const hasActive = Object.entries(filters).some(
    ([k, v]) => k !== 'days' && v !== ''
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-4">

        {/* Period */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Period</label>
          <div className="flex gap-1">
            {DAY_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => set('days')(value)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  filters.days === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Select label="Team"     value={filters.team}     onChange={set('team')}     options={options.teams    ?? []} />
        <Select label="Service"  value={filters.service}  onChange={set('service')}  options={options.services ?? []} />
        <Select label="Project"  value={filters.project}  onChange={set('project')}  options={options.projects ?? []} />
        <Select label="Provider" value={filters.provider} onChange={set('provider')} options={options.providers ?? []} />

        {hasActive && (
          <button
            onClick={reset}
            className="text-sm text-gray-400 hover:text-white underline pb-2 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}