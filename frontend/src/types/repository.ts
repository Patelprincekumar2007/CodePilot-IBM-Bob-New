export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
  language?: string;
}

export interface RepositoryInfo {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  branches: string[];
  totalFiles: number;
  language: string;
  lastSyncedAt: string;
  status: 'healthy' | 'syncing' | 'error';
  tree: FileTreeNode[];
}
