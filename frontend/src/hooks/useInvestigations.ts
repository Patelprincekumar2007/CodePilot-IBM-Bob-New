import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investigationApi } from '../api/investigations';
import { CreateInvestigationInput } from '../types/investigation';

export function useInvestigations() {
  const queryClient = useQueryClient();

  const investigationsQuery = useQuery({
    queryKey: ['investigations'],
    queryFn: () => investigationApi.getAll(),
    staleTime: 1000 * 5, // 5s
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateInvestigationInput) => investigationApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
  });

  return {
    ...investigationsQuery,
    createInvestigation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
