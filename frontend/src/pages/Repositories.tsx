import React, { useState } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { FileTreeExplorer } from '../components/code/FileTreeExplorer';
import { MonacoCodeViewer } from '../components/code/MonacoCodeViewer';
import { Badge } from '../components/ui/Badge';
import { FolderGit2, GitBranch, ShieldCheck, RefreshCw, FileCode } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const Repositories: React.FC = () => {
  const { data: repos, isLoading } = useRepositories();
  const repo = repos?.[0];
  const [selectedFile, setSelectedFile] = useState<string>('src/services/project_service.py');

  const fileContents: Record<string, string> = {
    'src/services/project_service.py': `from typing import List, Optional
from fastapi import HTTPException
from src.models.project import Project
from src.models.task import TaskStatus
from src.schemas.project import ProjectCreate, ProjectProgress
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository

class ProjectService:
    def __init__(self, project_repo: ProjectRepository, task_repo: TaskRepository):
        self.project_repo = project_repo
        self.task_repo = task_repo

    def get_progress(self, project_id: str) -> ProjectProgress:
        project = self.project_repo.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        tasks = self.task_repo.list_by_project(project_id)
        if not tasks:
            return ProjectProgress(project_id=project_id, total_tasks=0, completed_tasks=0, progress_percent=0.0)
        completed = sum(1 for t in tasks if t.status == TaskStatus.DONE)
        percent = round((completed / len(tasks)) * 100, 1)
        return ProjectProgress(
            project_id=project_id,
            total_tasks=len(tasks),
            completed_tasks=completed,
            progress_percent=percent,
        )`,
    'src/services/task_service.py': `from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from src.models.task import Task, TaskStatus
from src.repositories.task_repository import TaskRepository

class TaskService:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    def update_status(self, task_id: str, status: TaskStatus) -> Task:
        task = self.task_repo.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.status = status
        task.updated_at = datetime.utcnow()
        return task`,
    'src/api/tasks.py': `from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from src.schemas.task import TaskCreate, TaskResponse, TaskStatusUpdate, TaskAssign
from src.models.task import TaskStatus
from src.services.task_service import TaskService
from src.dependencies import get_task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[str] = None,
    status: Optional[TaskStatus] = None,
    assignee_id: Optional[str] = None,
    task_service: TaskService = Depends(get_task_service),
):
    return task_service.list_tasks(project_id=project_id, status=status, assignee_id=assignee_id)`,
  };

  const currentCode = fileContents[selectedFile] || `# File: ${selectedFile}\n# Click a file from tree to view code`;

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-accent-indigo" />
          <span>Repository Explorer</span>
        </h1>
        <p className="mt-1 text-xs text-console-muted font-sans">
          Live workspace tree, syntax index, AST parsing status, and synced branches.
        </p>
      </div>

      {repo && (
        <Card className="border-border bg-background-elevated p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-background-card border border-border text-accent-indigo">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{repo.name}</span>
                  <Badge variant="success" size="sm">
                    {repo.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-[11px] text-console-muted font-sans">
                  {repo.fullName} • Language: {repo.language} • {repo.totalFiles} files indexed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-console-dim text-[11px]">
              <span>Last Synced: {formatDate(repo.lastSyncedAt)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Tree */}
        <div className="lg:col-span-4">
          <Card className="border-border bg-background-card">
            <CardHeader className="py-2.5 px-3 bg-background-elevated/70">
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-white uppercase text-xs">File Explorer</span>
                <span className="text-[10px] text-console-dim">taskflow-api</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {repo?.tree && (
                <FileTreeExplorer
                  nodes={repo.tree}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 space-y-2">
          <MonacoCodeViewer
            filePath={selectedFile}
            code={currentCode}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};
