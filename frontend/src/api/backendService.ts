import { apiClient } from './client';

export interface HealthResponse {
  status: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  created_at: string;
  updated_at: string;
}

export interface ProjectProgressResponse {
  project_id: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percent: number;
}

export const backendService = {
  getHealth: async (): Promise<HealthResponse> => {
    return apiClient<HealthResponse>('/health');
  },

  getUsers: async (): Promise<UserResponse[]> => {
    return apiClient<UserResponse[]>('/users');
  },

  getProjects: async (): Promise<ProjectResponse[]> => {
    return apiClient<ProjectResponse[]>('/projects');
  },

  getProjectProgress: async (projectId: string): Promise<ProjectProgressResponse> => {
    return apiClient<ProjectProgressResponse>(`/projects/${projectId}/progress`);
  },

  getTasks: async (filters?: {
    projectId?: string;
    status?: string;
    assigneeId?: string;
  }): Promise<TaskResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('project_id', filters.projectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigneeId) params.append('assignee_id', filters.assigneeId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<TaskResponse[]>(`/tasks${query}`);
  },

  updateTaskStatus: async (
    taskId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
  ): Promise<TaskResponse> => {
    return apiClient<TaskResponse>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  assignTask: async (taskId: string, assigneeId: string): Promise<TaskResponse> => {
    return apiClient<TaskResponse>(`/tasks/${taskId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignee_id: assigneeId }),
    });
  },
};
