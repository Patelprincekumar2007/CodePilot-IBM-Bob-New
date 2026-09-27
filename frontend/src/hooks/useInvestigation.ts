import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investigationApi } from '../api/investigations';
import { InvestigationStage } from '../types/investigation';

export function useInvestigation(id: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => (id ? investigationApi.getById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 2,
    refetchInterval: (query) => {
      // If investigation is running, poll every 3 seconds for live agent updates
      const data = query.state.data;
      if (data && data.status === 'running') {
        return 3000;
      }
      return false;
    },
  });

  const advanceStageMutation = useMutation({
    mutationFn: ({ stage }: { stage: InvestigationStage }) => {
      if (!id) throw new Error('No investigation ID');
      return investigationApi.advanceStage(id, stage);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['investigation', id], updated);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ decision, comment }: { decision: 'approved' | 'rejected'; comment?: string }) => {
      if (!id) throw new Error('No investigation ID');
      return investigationApi.approveFix(id, decision, comment);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['investigation', id], updated);
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No investigation ID');
      return investigationApi.runVerificationTests(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigation', id] });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });

  return {
    ...query,
    investigation: query.data,
    advanceStage: advanceStageMutation.mutateAsync,
    isAdvancing: advanceStageMutation.isPending,
    approveFix: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    verifyFix: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
}
