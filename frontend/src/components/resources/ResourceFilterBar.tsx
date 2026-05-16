'use client';

import { ResourceFilters } from '@/lib/useResources';

interface Props {
  filters:  ResourceFilters;
  onChange: (f: ResourceFilters) => void;
  options:  any;
}

function Select({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-32.5"
      >
        <option value="">All</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function ResourceFilterBar({ filters, onChange, options }: Props) {
  const set    = (key: keyof ResourceFilters) => (val: string) =>
    onChange({ ...filters, [key]: val });
  const reset  = () => onChange({ team: '', type: '', status: '', project: '' });
  const active = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-4">
        <Select label="Team"    value={filters.team}    onChange={set('team')}    options={options.teams    ?? []} />
        <Select label="Type"    value={filters.type}    onChange={set('type')}    options={options.types    ?? []} />
        <Select label="Status"  value={filters.status}  onChange={set('status')}  options={options.statuses ?? []} />
        <Select label="Project" value={filters.project} onChange={set('project')} options={options.projects ?? []} />
        {active && (
          <button onClick={reset} className="text-sm text-gray-400 hover:text-white underline pb-2 transition-colors">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}