import { useQuery } from '@tanstack/react-query';
import { repositoryApi } from '../api/repositories';

export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: () => repositoryApi.getAll(),
    staleTime: 1000 * 60,
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoryApi.getById(id),
    staleTime: 1000 * 60,
  });
}
