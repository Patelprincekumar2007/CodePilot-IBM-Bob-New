import React, { useState, useEffect, useRef } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { repositoryApi } from '../api/repositories';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { FileTreeExplorer } from '../components/code/FileTreeExplorer';
import { MonacoCodeViewer } from '../components/code/MonacoCodeViewer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  FolderGit2,
  Upload,
  Globe,
  CheckCircle2,
  FileCode,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { FileTreeNode } from '../types/repository';

export const Repositories: React.FC = () => {
  const { data: repos, refetch, isLoading } = useRepositories();
  const [selectedRepoId, setSelectedRepoId] = useState<string>('taskflow-api');
  const [selectedFile, setSelectedFile] = useState<string>('src/services/project_service.py');
  const [fileContent, setFileContent] = useState<string>('# Select a file from tree');
  const [treeNodes, setTreeNodes] = useState<FileTreeNode[]>([]);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRepo = repos?.find((r) => r.id === selectedRepoId || r.name === selectedRepoId) || repos?.[0];

  // Load tree when selected repository changes
  useEffect(() => {
    if (activeRepo) {
      repositoryApi.getTree(activeRepo.id).then((nodes) => {
        setTreeNodes(nodes);
        // Select first available file
        if (nodes.length > 0) {
          const findFirst = (n: FileTreeNode[]): string | null => {
            for (const item of n) {
              if (item.type === 'file') return item.path;
              if (item.children) {
                const childRes = findFirst(item.children);
                if (childRes) return childRes;
              }
            }
            return null;
          };
          const first = findFirst(nodes);
          if (first) {
            setSelectedFile(first);
          }
        }
      });
    }
  }, [activeRepo?.id]);

  // Read file from backend when selectedFile changes
  useEffect(() => {
    if (activeRepo && selectedFile) {
      setIsReadingFile(true);
      repositoryApi
        .readFile(activeRepo.id, selectedFile)
        .then((content) => {
          setFileContent(content);
        })
        .finally(() => {
          setIsReadingFile(false);
        });
    }
  }, [activeRepo?.id, selectedFile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await repositoryApi.uploadZip(file);
      await refetch();
      setSelectedRepoId(uploaded.id);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-accent-indigo" />
            <span>Repository Explorer & Source Ingestion</span>
          </h1>
          <p className="mt-1 text-xs text-console-muted font-sans">
            Live workspace file tree, real-time file content reader, and multi-repository management.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".zip"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-3.5 h-3.5 text-accent-indigo" />}
          >
            Upload Repository ZIP
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Repository Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {repos?.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRepoId(r.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-bold text-xs transition-all ${
              activeRepo?.id === r.id
                ? 'bg-accent-indigo text-white border-indigo-500 shadow-glow-indigo'
                : 'bg-background-elevated border-border text-console-muted hover:text-white'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{r.name}</span>
            <span className="text-[10px] opacity-75 font-normal">({r.totalFiles} files)</span>
          </button>
        ))}
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Tree */}
        <div className="lg:col-span-4">
          <Card className="border-border bg-background-card">
            <CardHeader className="py-2.5 px-3 bg-background-elevated/70">
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-white uppercase text-xs">
                  {activeRepo?.name || 'File Explorer'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {activeRepo?.language || 'Python'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <FileTreeExplorer
                nodes={treeNodes.length > 0 ? treeNodes : activeRepo?.tree || []}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Real File Monaco Code Viewer */}
        <div className="lg:col-span-8 space-y-2">
          {isReadingFile && (
            <div className="flex items-center gap-2 text-console-dim text-[11px] px-1">
              <Loader2 className="w-3 h-3 animate-spin text-accent-indigo" />
              <span>Fetching {selectedFile} from server storage...</span>
            </div>
          )}
          <MonacoCodeViewer
            filePath={selectedFile}
            code={fileContent}
            height="520px"
          />
        </div>
      </div>
    </div>
  );
};
