import { RepositoryInfo, FileTreeNode } from '../types/repository';
import { apiClient } from './client';
import { getStoredRepositories } from '../lib/storage';

export const repositoryApi = {
  getAll: async (): Promise<RepositoryInfo[]> => {
    try {
      const live = await apiClient<RepositoryInfo[]>('/api/repositories');
      if (live && live.length > 0) return live;
    } catch {
      // Fallback to stored repos
    }
    return getStoredRepositories();
  },

  getById: async (id: string): Promise<RepositoryInfo> => {
    try {
      return await apiClient<RepositoryInfo>(`/api/repositories/${id}`);
    } catch {
      const repos = getStoredRepositories();
      return repos.find((r) => r.id === id || r.name === id) || repos[0];
    }
  },

  getTree: async (repoId: string): Promise<FileTreeNode[]> => {
    try {
      return await apiClient<FileTreeNode[]>(`/api/repositories/${repoId}/tree`);
    } catch {
      const repos = getStoredRepositories();
      return (repos.find((r) => r.id === repoId)?.tree) || [];
    }
  },

  readFile: async (repoId: string, path: string): Promise<string> => {
    try {
      const res = await apiClient<{ path: string; content: string }>(
        `/api/repositories/${repoId}/files?path=${encodeURIComponent(path)}`
      );
      return res.content;
    } catch (e: any) {
      return `# Could not read file ${path}: ${e.message}`;
    }
  },

  uploadZip: async (file: File): Promise<RepositoryInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = import.meta.env.DEV ? '/api-backend' : '';
    const response = await fetch(`${baseUrl}/api/repositories/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Failed to upload repository ZIP');
    }

    return await response.json();
  },

  connectGit: async (url: string, branch: string = 'main'): Promise<RepositoryInfo> => {
    return apiClient<RepositoryInfo>('/api/repositories/git', {
      method: 'POST',
      body: JSON.stringify({ url, branch }),
    });
  },
};
