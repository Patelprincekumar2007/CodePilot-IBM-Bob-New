import React from 'react';
import { InvestigationStage } from '../../types/investigation';
import { cn } from '../../lib/utils';
import {
  Search,
  Crosshair,
  GitFork,
  Wrench,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface WorkflowStepperProps {
  currentStage: InvestigationStage;
  stageProgress: Record<InvestigationStage, 'pending' | 'running' | 'completed' | 'failed'>;
  onSelectStage?: (stage: InvestigationStage) => void;
  className?: string;
}

export const STAGES: {
  id: InvestigationStage;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { id: 'analyze', label: 'Analyze', description: 'Repository & AST mapping', icon: Search },
  { id: 'diagnose', label: 'Diagnose', description: 'Root cause isolation', icon: Crosshair },
  { id: 'impact', label: 'Impact', description: 'Dependency graph & risk', icon: GitFork },
  { id: 'fix', label: 'Fix', description: 'Minimal patch proposal', icon: Wrench },
  { id: 'test', label: 'Test', description: 'Regression suite synthesis', icon: CheckCircle2 },
  { id: 'review', label: 'Review', description: 'Independent verification', icon: FileCheck2 },
  { id: 'verify', label: 'Verify', description: 'Full test suite sign-off', icon: ShieldCheck },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  stageProgress,
  onSelectStage,
  className,
}) => {
  return (
    <div className={cn('w-full py-4 px-2', className)}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

        {STAGES.map((stage, idx) => {
          const status = stageProgress[stage.id] || 'pending';
          const isCurrent = currentStage === stage.id;
          const isCompleted = status === 'completed';
          const isRunning = status === 'running';
          const Icon = stage.icon;

          let stateStyles = 'bg-background-elevated border-border text-console-dim';
          if (isCompleted) {
            stateStyles = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-glow-emerald';
          } else if (isRunning) {
            stateStyles = 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-4 ring-amber-500/20';
          } else if (isCurrent) {
            stateStyles = 'bg-accent-indigo/20 border-accent-indigo text-indigo-300 ring-4 ring-indigo-500/20';
          }

          return (
            <div
              key={stage.id}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => onSelectStage?.(stage.id)}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200',
                  stateStyles
                )}
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="mt-2 text-center select-none">
                <p
                  className={cn(
                    'text-xs font-mono font-semibold transition-colors',
                    isCurrent
                      ? 'text-white'
                      : isCompleted
                      ? 'text-emerald-300'
                      : 'text-console-dim group-hover:text-console-muted'
                  )}
                >
                  {stage.label}
                </p>
                <p className="hidden md:block text-[10px] font-mono text-console-dim max-w-[90px] truncate">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
