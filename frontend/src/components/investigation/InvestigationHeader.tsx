import React from 'react';
import { Investigation } from '../../types/investigation';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import {
  FolderGit2,
  GitBranch,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { formatDuration, formatDate } from '../../lib/utils';

interface InvestigationHeaderProps {
  investigation: Investigation;
  onOpenReport?: () => void;
  onAdvanceStage?: () => void;
  isAdvancing?: boolean;
}

export const InvestigationHeader: React.FC<InvestigationHeaderProps> = ({
  investigation,
  onOpenReport,
  onAdvanceStage,
  isAdvancing,
}) => {
  return (
    <div className="p-5 rounded-xl bg-background-elevated border border-border">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left ID & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-accent-indigo/20 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300">
              {investigation.id}
            </span>
            <StatusBadge status={investigation.status} />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-background-tertiary text-xs font-mono text-console-muted">
              <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
              <span>{investigation.repository}</span>
              <span className="text-console-dim">/</span>
              <GitBranch className="w-3 h-3 text-console-dim" />
              <span>{investigation.branch}</span>
            </div>
            {investigation.isDemoScenario && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300">
                ★ Seeded Scenario
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold font-mono tracking-tight text-white">
            {investigation.title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-console-muted pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-console-dim" />
              <span>Duration: {formatDuration(investigation.durationSeconds)}</span>
            </div>
            <span>•</span>
            <span>Created: {formatDate(investigation.createdAt)}</span>
            {investigation.issueUrl && (
              <>
                <span>•</span>
                <a
                  href={investigation.issueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-accent-blue hover:underline"
                >
                  <span>Issue Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {investigation.status === 'running' && onAdvanceStage && (
            <Button
              size="sm"
              variant="secondary"
              isLoading={isAdvancing}
              onClick={onAdvanceStage}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-accent-indigo" />}
              className="font-mono text-xs"
            >
              Step Next Agent
            </Button>
          )}

          {investigation.status === 'verified' && onOpenReport && (
            <Button
              size="sm"
              variant="primary"
              onClick={onOpenReport}
              leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
              className="font-mono text-xs shadow-glow-indigo"
            >
              View Verification Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
