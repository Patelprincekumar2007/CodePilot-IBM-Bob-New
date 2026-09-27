import React, { useState } from 'react';
import { AgentActivity } from '../../types/investigation';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Search,
  Crosshair,
  GitFork,
  CheckCircle2,
  FileCheck2,
  Cpu,
  Loader2,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

interface AgentCardProps {
  agent: AgentActivity;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [showLogs, setShowLogs] = useState(false);

  const iconMap: Record<string, React.ReactNode> = {
    repository: <Search className="w-4 h-4 text-sky-400" />,
    debug: <Crosshair className="w-4 h-4 text-rose-400" />,
    impact: <GitFork className="w-4 h-4 text-amber-400" />,
    test: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    review: <FileCheck2 className="w-4 h-4 text-purple-400" />,
    bob: <Cpu className="w-4 h-4 text-indigo-400" />,
  };

  const statusBadges: Record<
    string,
    { label: string; variant: 'success' | 'warning' | 'default' | 'danger'; icon?: React.ReactNode }
  > = {
    completed: { label: 'COMPLETED', variant: 'success', icon: <CheckCircle2 className="w-3 h-3" /> },
    running: { label: 'RUNNING', variant: 'warning', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    waiting: { label: 'WAITING', variant: 'default' },
    failed: { label: 'FAILED', variant: 'danger' },
  };

  const badgeConfig = statusBadges[agent.status] || statusBadges.waiting;

  return (
    <Card className="border-border bg-background-card/80 transition-all font-mono text-xs">
      <div className="p-3.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background-elevated border border-border shrink-0 mt-0.5">
            {iconMap[agent.agentType] || <Terminal className="w-4 h-4 text-accent-indigo" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">{agent.name}</span>
              {agent.filesAnalyzed !== undefined && (
                <span className="text-[10px] text-console-dim">
                  ({agent.filesAnalyzed} files parsed)
                </span>
              )}
            </div>
            <p className="mt-1 text-console-muted font-sans text-xs leading-relaxed">
              {agent.summary}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={badgeConfig.variant} size="sm" className="gap-1">
            {badgeConfig.icon}
            <span>{badgeConfig.label}</span>
          </Badge>
          {agent.durationSeconds && (
            <span className="text-[10px] text-console-dim">
              {agent.durationSeconds.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* Expandable Logs */}
      {agent.logs.length > 0 && (
        <div className="border-t border-border bg-background-elevated/40 px-3 py-1.5 flex flex-col">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center justify-between text-[11px] text-console-dim hover:text-console-text py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-accent-indigo" />
              <span>Activity Trace ({agent.logs.length} events)</span>
            </span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="py-2 space-y-1 text-[11px] text-console-muted font-mono bg-[#090C12] p-2.5 rounded border border-border/80 my-1 max-h-36 overflow-y-auto">
              {agent.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-console-dim select-none">{'>'}</span>
                  <span className="text-console-text">{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
