import { EvidenceItem, EvidenceCategory } from '../types/evidence';
import { getStoredEvidence } from '../lib/storage';

export const evidenceApi = {
  getAll: async (filter?: {
    category?: EvidenceCategory;
    investigationId?: string;
    search?: string;
  }): Promise<EvidenceItem[]> => {
    let list = getStoredEvidence();

    if (filter?.category) {
      list = list.filter((item) => item.category === filter.category);
    }
    if (filter?.investigationId) {
      list = list.filter((item) => item.investigationId === filter.investigationId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          (item.file && item.file.toLowerCase().includes(q))
      );
    }

    return list;
  },

  getByInvestigationId: async (investigationId: string): Promise<EvidenceItem[]> => {
    const list = getStoredEvidence();
    return list.filter((item) => item.investigationId === investigationId);
  },
};
