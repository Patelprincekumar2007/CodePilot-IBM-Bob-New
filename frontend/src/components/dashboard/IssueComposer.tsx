import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvestigations } from '../../hooks/useInvestigations';
import { useRepositories } from '../../hooks/useRepositories';
import { repositoryApi } from '../../api/repositories';
import { Button } from '../ui/Button';
import {
  Sparkles,
  FolderGit2,
  GitBranch,
  ArrowRight,
  Upload,
  Globe,
  CheckCircle2,
  Cpu,
  FileCode,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickSchema = z.object({
  repository: z.string().min(1),
  branch: z.string().min(1),
  issue: z.string().min(5, 'Please enter a bug or issue description to investigate'),
  ai_provider: z.string().default('auto'),
});

type QuickFormData = z.infer<typeof quickSchema>;

export const IssueComposer: React.FC = () => {
  const { createInvestigation, isCreating } = useInvestigations();
  const { data: repos, refetch: refetchRepos } = useRepositories();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<'existing' | 'upload' | 'git'>('existing');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickFormData>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      repository: 'taskflow-api',
      branch: 'main',
      issue: '',
      ai_provider: 'auto',
    },
  });

  const selectedRepo = watch('repository');
  const selectedProvider = watch('ai_provider');
  const currentRepo = repos?.find((r) => r.name === selectedRepo) || repos?.[0];
  const branches = currentRepo?.branches || ['main', 'feature/frontend-react-ui'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const uploaded = await repositoryApi.uploadZip(file);
      await refetchRepos();
      setValue('repository', uploaded.name);
      setUploadSuccess(`Uploaded ${uploaded.name} (${uploaded.totalFiles} files, ${uploaded.language})`);
      setInputMode('existing');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitConnect = async () => {
    if (!gitUrl) return;
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const cloned = await repositoryApi.connectGit(gitUrl, gitBranch);
      await refetchRepos();
      setValue('repository', cloned.name);
      setValue('branch', gitBranch);
      setUploadSuccess(`Connected ${cloned.name} (${cloned.totalFiles} files)`);
      setInputMode('existing');
    } catch (err: any) {
      alert(`Git connect failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: QuickFormData) => {
    try {
      const created = await createInvestigation({
        repository: data.repository,
        branch: data.branch,
        issue: data.issue,
        ai_provider: data.ai_provider,
      });
      navigate(`/investigations/${created.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card via-background-card/95 to-background-elevated border border-border shadow-elevated relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-accent-indigo/20 text-accent-indigo border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold font-mono tracking-tight text-white">
                What are you investigating?
              </h2>
            </div>
            <p className="mt-1 text-xs text-console-muted font-sans">
              Enter a defect, broken endpoint, error trace, or symptom to dispatch autonomous debugging agents.
            </p>
          </div>

          {/* Repository Source Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-background-elevated rounded-lg border border-border text-xs font-mono">
            <button
              type="button"
              onClick={() => setInputMode('existing')}
              className={`px-2.5 py-1 rounded transition-colors ${
                inputMode === 'existing'
                  ? 'bg-accent-indigo text-white font-bold'
                  : 'text-console-muted hover:text-white'
              }`}
            >
              Workspace
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                inputMode === 'upload'
                  ? 'bg-accent-indigo text-white font-bold'
                  : 'text-console-muted hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload ZIP</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('git')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                inputMode === 'git'
                  ? 'bg-accent-indigo text-white font-bold'
                  : 'text-console-muted hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Git Repo</span>
            </button>
          </div>
        </div>

        {/* Upload ZIP Dropzone if active */}
        {inputMode === 'upload' && (
          <div className="p-6 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/20 text-center space-y-3 font-mono text-xs">
            <input
              type="file"
              accept=".zip"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-accent-indigo mx-auto animate-bounce" />
            <div>
              <p className="font-bold text-white">Drop repository ZIP archive here</p>
              <p className="text-console-dim text-[11px] mt-0.5">
                Automatically extracts, indexes AST, and detects languages & frameworks
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Local ZIP
            </Button>
          </div>
        )}

        {/* Git Repo URL Form if active */}
        {inputMode === 'git' && (
          <div className="p-4 rounded-xl border border-border bg-background-elevated space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-console-dim mb-1">Git Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/organization/repo.git"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
                />
              </div>
              <div>
                <label className="block text-console-dim mb-1">Branch</label>
                <input
                  type="text"
                  placeholder="main"
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                isLoading={isUploading}
                onClick={handleGitConnect}
                disabled={!gitUrl}
              >
                Connect & Ingest
              </Button>
            </div>
          </div>
        )}

        {/* Upload feedback */}
        {uploadSuccess && (
          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Issue Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono text-xs">
          {/* Target Repo & AI Provider Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Repo */}
            <div>
              <label className="block text-console-muted mb-1 font-semibold flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
                <span>Target Repository</span>
              </label>
              <select
                {...register('repository')}
                className="w-full px-3 py-1.5 rounded bg-background-elevated border border-border text-console-text font-semibold focus:outline-none focus:border-accent-indigo"
              >
                {repos?.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-console-muted mb-1 font-semibold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-console-dim" />
                <span>Branch</span>
              </label>
              <select
                {...register('branch')}
                className="w-full px-3 py-1.5 rounded bg-background-elevated border border-border text-console-text focus:outline-none focus:border-accent-indigo"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Provider */}
            <div>
              <label className="block text-console-muted mb-1 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Reasoner</span>
              </label>
              <select
                {...register('ai_provider')}
                className="w-full px-3 py-1.5 rounded bg-background-elevated border border-border text-indigo-300 font-bold focus:outline-none focus:border-accent-indigo"
              >
                <option value="auto">Auto (Gemini / Grok / Local)</option>
                <option value="gemini">Google Gemini (GenAI)</option>
                <option value="grok">xAI Grok (grok-2)</option>
                <option value="demo-ast">IBM Bob 2.0 AST Engine</option>
              </select>
            </div>
          </div>

          {/* Issue Prompt Textarea */}
          <div className="relative">
            <textarea
              rows={3}
              {...register('issue')}
              placeholder="e.g. Project progress percentage is incorrect when a project contains both completed and incomplete tasks..."
              className="w-full p-4 rounded-xl bg-background/90 border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo text-sm font-sans focus:ring-1 focus:ring-accent-indigo resize-none"
            />
          </div>
          {errors.issue && (
            <p className="text-rose-400 text-xs">{errors.issue.message}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-console-dim">
              <span>⚡ AST & Multi-layer tracing</span>
              <span>•</span>
              <span>🛡️ Regression synthesis</span>
              <span>•</span>
              <span>🤖 Gemini / Grok / Bob connected</span>
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={isCreating}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shadow-glow-indigo font-bold text-xs"
            >
              Start Investigation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
