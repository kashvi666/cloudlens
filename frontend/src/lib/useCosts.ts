import { useState, useEffect, useCallback } from 'react';
import api from './api';

export interface Filters {
  days:     string;
  team:     string;
  service:  string;
  project:  string;
  provider: string;
}

export const DEFAULT_FILTERS: Filters = {
  days: '30', team: '', service: '', project: '', provider: '',
};

export function useSummary(filters: Filters) {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      );
      const res = await api.get(`/api/costs/summary?${params}`);
      setData(res.data);
    } catch {
      setError('Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useDailyCosts(filters: Filters) {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      );
      const res = await api.get(`/api/costs/daily?${params}`);
      setData(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading };
}

export function useByService(filters: Filters) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    );
    api.get(`/api/costs/by-service?${params}`).then(r => setData(r.data.data || []));
  }, [JSON.stringify(filters)]);
  return data;
}

export function useByTeam(filters: Filters) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    api.get('/api/costs/by-team').then(r => setData(r.data.data || []));
  }, []);
  return data;
}

export function useFilterOptions() {
  const [options, setOptions] = useState<any>({
    teams: [], services: [], projects: [], providers: [],
  });
  useEffect(() => {
    api.get('/api/costs/filter-options').then(r => setOptions(r.data));
  }, []);
  return options;
}