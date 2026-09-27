import React from 'react';
import { EvidenceItem } from '../../types/evidence';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  ShieldCheck,
  FileCode,
  Cpu,
  CheckCircle2,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  onSelectCode?: (file: string, line?: number) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  onSelectCode,
}) => {
  const categoryVariants: Record<string, 'default' | 'purple' | 'success' | 'warning' | 'blue'> = {
    'Root Cause': 'warning',
    'IBM Bob': 'purple',
    'Tests': 'success',
    'Execution': 'blue',
    'Repository': 'default',
  };

  return (
    <Card className="border-border bg-background-card/90 font-mono text-xs transition-all hover:border-border-highlight">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-background-elevated text-console-dim font-bold text-[10px] border border-border">
              {evidence.id}
            </span>
            <Badge variant={categoryVariants[evidence.category] || 'default'} size="sm">
              {evidence.category}
            </Badge>
            {evidence.verifiedByBob && (
              <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>Bob 2.0 Verified</span>
              </span>
            )}
          </div>

          <span className="text-[10px] text-console-dim">{formatDate(evidence.timestamp)}</span>
        </div>

        {/* Title & details */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">{evidence.title}</h4>
          <p className="mt-1 text-console-muted font-sans text-xs leading-relaxed">
            {evidence.details}
          </p>
        </div>

        {/* Source Agent & File */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-background-elevated border border-border text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-accent-indigo" />
            <span className="text-console-dim">Agent:</span>
            <span className="text-console-text font-bold">{evidence.sourceAgent}</span>
          </div>

          {evidence.file && (
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-console-dim" />
              <span className="text-console-muted truncate">{evidence.file}</span>
              {evidence.lineNumber && (
                <span className="text-indigo-400 font-bold">:L{evidence.lineNumber}</span>
              )}
              {onSelectCode && (
                <button
                  type="button"
                  onClick={() => onSelectCode(evidence.file!, evidence.lineNumber)}
                  className="text-accent-indigo hover:text-indigo-300 font-bold ml-1 hover:underline"
                >
                  View
                </button>
              )}
            </div>
          )}
        </div>

        {/* Code Snippet if present */}
        {evidence.snippet && (
          <pre className="p-2.5 rounded bg-[#0A0D14] border border-border text-[11px] text-indigo-200 overflow-x-auto font-mono">
            <code>{evidence.snippet}</code>
          </pre>
        )}
      </div>
    </Card>
  );
};
