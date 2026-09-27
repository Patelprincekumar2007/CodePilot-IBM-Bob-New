import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvestigations } from '../../hooks/useInvestigations';
import { useRepositories } from '../../hooks/useRepositories';
import { Button } from '../ui/Button';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, FileCode } from 'lucide-react';

const investigationSchema = z.object({
  repository: z.string().min(1, 'Repository is required'),
  branch: z.string().min(1, 'Branch is required'),
  issue: z.string().min(5, 'Issue description must be at least 5 characters'),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  reproductionSteps: z.string().optional(),
  issueUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof investigationSchema>;

interface NewInvestigationFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export const NewInvestigationForm: React.FC<NewInvestigationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { createInvestigation, isCreating } = useInvestigations();
  const { data: repos } = useRepositories();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(investigationSchema),
    defaultValues: {
      repository: 'taskflow-api',
      branch: 'main',
      issue: '',
      expectedBehavior: '',
      actualBehavior: '',
      reproductionSteps: '',
      issueUrl: '',
    },
  });

  const selectedRepo = watch('repository');
  const currentRepo = repos?.find((r) => r.name === selectedRepo) || repos?.[0];
  const branches = currentRepo?.branches || ['main', 'feature/frontend-react-ui'];

  const onSubmit = async (data: FormData) => {
    try {
      const created = await createInvestigation({
        repository: data.repository,
        branch: data.branch,
        issue: data.issue,
        expectedBehavior: data.expectedBehavior,
        actualBehavior: data.actualBehavior,
        reproductionSteps: data.reproductionSteps,
        issueUrl: data.issueUrl || undefined,
      });
      onSuccess(created.id);
    } catch (err) {
      console.error('Failed to create investigation', err);
    }
  };

  const setTemplate = (title: string, desc: string, exp: string, act: string) => {
    setValue('issue', desc);
    setValue('expectedBehavior', exp);
    setValue('actualBehavior', act);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono text-xs">
      {/* Quick Templates */}
      <div className="p-3 rounded-lg bg-background-elevated border border-border">
        <div className="flex items-center gap-1.5 text-console-dim text-[11px] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent-indigo" />
          <span>Quick Bug Templates:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setTemplate(
                'Progress Calculation Inversion',
                'Project progress is incorrect when a project contains both completed and incomplete tasks. Tasks that are NOT done are counted as completed.',
                '40% progress for 2/5 tasks completed',
                'Returns 60% progress (inverted condition)'
              )
            }
            className="px-2 py-1 rounded bg-background-card hover:bg-background-tertiary border border-border text-[11px] text-console-muted hover:text-white transition-colors"
          >
            1. Inverted Progress %
          </button>
          <button
            type="button"
            onClick={() =>
              setTemplate(
                'Task Status Update Discarded',
                'PATCH /tasks/{id}/status accepts the request and returns 200, but the task always retains its original status — new value is never applied.',
                'Task status field updated to DONE in storage',
                'Status remains unchanged at TODO'
              )
            }
            className="px-2 py-1 rounded bg-background-card hover:bg-background-tertiary border border-border text-[11px] text-console-muted hover:text-white transition-colors"
          >
            2. Status Update Dropped
          </button>
          <button
            type="button"
            onClick={() =>
              setTemplate(
                'Task Filter Parameters Swapped',
                'GET /tasks?status=DONE filters by assignee_id instead, and GET /tasks?assignee_id=<id> applies status filter. The query parameters are swapped.',
                'Status queries filter by status value',
                'Status parameter forwarded to assignee_id argument'
              )
            }
            className="px-2 py-1 rounded bg-background-card hover:bg-background-tertiary border border-border text-[11px] text-console-muted hover:text-white transition-colors"
          >
            3. Swapped Filter Args
          </button>
        </div>
      </div>

      {/* Target Repo & Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-console-muted mb-1 font-semibold">Repository</label>
          <select
            {...register('repository')}
            className="w-full px-3 py-2 rounded-md bg-background-elevated border border-border text-console-text focus:outline-none focus:border-accent-indigo"
          >
            {repos?.map((repo) => (
              <option key={repo.id} value={repo.name}>
                {repo.name} ({repo.fullName})
              </option>
            ))}
          </select>
          {errors.repository && (
            <p className="mt-1 text-red-400 text-[10px]">{errors.repository.message}</p>
          )}
        </div>

        <div>
          <label className="block text-console-muted mb-1 font-semibold">Branch</label>
          <select
            {...register('branch')}
            className="w-full px-3 py-2 rounded-md bg-background-elevated border border-border text-console-text focus:outline-none focus:border-accent-indigo"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errors.branch && (
            <p className="mt-1 text-red-400 text-[10px]">{errors.branch.message}</p>
          )}
        </div>
      </div>

      {/* Issue Description */}
      <div>
        <label className="block text-console-muted mb-1 font-semibold">
          What are you investigating? <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={3}
          {...register('issue')}
          placeholder="Describe the bug, broken endpoint, unexpected calculation or runtime failure..."
          className="w-full px-3 py-2 rounded-md bg-background-elevated border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
        />
        {errors.issue && (
          <p className="mt-1 text-red-400 text-[10px] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.issue.message}
          </p>
        )}
      </div>

      {/* Advanced Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-console-muted hover:text-white transition-colors text-[11px]"
      >
        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{showAdvanced ? 'Hide Advanced Context' : 'Add Expected vs Actual Behavior, Reproduction Steps'}</span>
      </button>

      {/* Advanced Context Fields */}
      {showAdvanced && (
        <div className="space-y-3 p-3 rounded-lg bg-background-elevated/50 border border-border animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-console-dim mb-1">Expected Behavior</label>
              <textarea
                rows={2}
                {...register('expectedBehavior')}
                placeholder="What should have happened..."
                className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
              />
            </div>
            <div>
              <label className="block text-console-dim mb-1">Actual Behavior</label>
              <textarea
                rows={2}
                {...register('actualBehavior')}
                placeholder="What actually occurred..."
                className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
              />
            </div>
          </div>

          <div>
            <label className="block text-console-dim mb-1">Reproduction Steps</label>
            <textarea
              rows={2}
              {...register('reproductionSteps')}
              placeholder="1. Call endpoint...\n2. Check response..."
              className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
            />
          </div>

          <div>
            <label className="block text-console-dim mb-1">Issue / Ticket URL (Optional)</label>
            <input
              type="text"
              {...register('issueUrl')}
              placeholder="https://github.com/organization/repo/issues/123"
              className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
            />
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          isLoading={isCreating}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          className="shadow-glow-indigo font-bold"
        >
          Start Investigation
        </Button>
      </div>
    </form>
  );
};
