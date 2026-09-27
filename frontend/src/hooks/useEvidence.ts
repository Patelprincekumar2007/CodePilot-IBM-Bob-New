import { useQuery } from '@tanstack/react-query';
import { evidenceApi } from '../api/evidence';
import { EvidenceCategory } from '../types/evidence';

export function useEvidence(filter?: {
  category?: EvidenceCategory;
  investigationId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['evidence', filter],
    queryFn: () => evidenceApi.getAll(filter),
    staleTime: 1000 * 5,
  });
}
