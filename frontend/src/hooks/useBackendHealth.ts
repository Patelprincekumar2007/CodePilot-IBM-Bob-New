import { useQuery } from '@tanstack/react-query';
import { backendService } from '../api/backendService';

export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: async () => {
      try {
        const res = await backendService.getHealth();
        return { isOnline: res.status === 'ok', status: res.status };
      } catch {
        return { isOnline: false, status: 'offline' };
      }
    },
    refetchInterval: 10000,
    retry: 1,
  });
}
