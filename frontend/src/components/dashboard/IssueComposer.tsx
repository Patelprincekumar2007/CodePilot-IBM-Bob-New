import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvestigations } from '../../hooks/useInvestigations';
import { useRepositories } from '../../hooks/useRepositories';
import { Button } from '../ui/Button';
import { Sparkles, FolderGit2, GitBranch, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quickSchema = z.object({
  repository: z.string().min(1),
  branch: z.string().min(1),
  issue: z.string().min(5, 'Please enter a bug or issue description to investigate'),
});

type QuickFormData = z.infer<typeof quickSchema>;

export const IssueComposer: React.FC = () => {
  const { createInvestigation, isCreating } = useInvestigations();
  const { data: repos } = useRepositories();
  const navigate = useNavigate();

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
    },
  });

  const selectedRepo = watch('repository');
  const currentRepo = repos?.find((r) => r.name === selectedRepo) || repos?.[0];
  const branches = currentRepo?.branches || ['main', 'feature/frontend-react-ui'];

  const onSubmit = async (data: QuickFormData) => {
    try {
      const created = await createInvestigation({
        repository: data.repository,
        branch: data.branch,
        issue: data.issue,
      });
      navigate(`/investigations/${created.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card via-background-card/95 to-background-elevated border border-border shadow-elevated relative overflow-hidden">
      {/* Background Accent glow */}
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

          {/* Repo / Branch pickers inline */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-background-elevated border border-border">
              <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
              <select
                {...register('repository')}
                className="bg-transparent text-console-text font-semibold focus:outline-none cursor-pointer"
              >
                {repos?.map((r) => (
                  <option key={r.id} value={r.name} className="bg-background-card">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-background-elevated border border-border">
              <GitBranch className="w-3.5 h-3.5 text-console-dim" />
              <select
                {...register('branch')}
                className="bg-transparent text-console-muted focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-background-card">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono text-xs">
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
              <span>🤖 IBM Bob 2.0 connected</span>
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
