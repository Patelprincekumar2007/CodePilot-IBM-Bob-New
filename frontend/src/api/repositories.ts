import { RepositoryInfo } from '../types/repository';
import { getStoredRepositories } from '../lib/storage';

export const repositoryApi = {
  getAll: async (): Promise<RepositoryInfo[]> => {
    return getStoredRepositories();
  },

  getById: async (id: string): Promise<RepositoryInfo> => {
    const repos = getStoredRepositories();
    const found = repos.find((r) => r.id === id || r.name === id);
    if (!found) {
      return repos[0]; // fallback to primary repo
    }
    return found;
  },
};
