import { useState, useEffect, useCallback } from 'react';
import api from './api';

export interface ResourceFilters {
  team:    string;
  type:    string;
  status:  string;
  project: string;
}

export const DEFAULT_RESOURCE_FILTERS: ResourceFilters = {
  team: '', type: '', status: '', project: '',
};

export function useResourceSummary() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/resources/summary')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useHeatmap(filters: ResourceFilters) {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      );
      const res = await api.get(`/api/resources/heatmap?${params}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useResources(filters: ResourceFilters) {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      );
      const res = await api.get(`/api/resources?${params}`);
      setData(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useResourceFilterOptions() {
  const [options, setOptions] = useState<any>({
    types: [], teams: [], projects: [], statuses: [], regions: [],
  });
  useEffect(() => {
    api.get('/api/resources/filter-options').then(r => setOptions(r.data));
  }, []);
  return options;
}