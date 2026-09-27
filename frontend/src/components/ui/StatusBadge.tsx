import React from 'react';
import { InvestigationStatus } from '../../types/investigation';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Play } from 'lucide-react';

interface StatusBadgeProps {
  status: InvestigationStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const configs: Record<
    InvestigationStatus,
    { label: string; icon: React.ReactNode; styles: string; dotColor: string }
  > = {
    verified: {
      label: 'VERIFIED',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
    },
    running: {
      label: 'RUNNING',
      icon: <Play className="w-3.5 h-3.5 animate-pulse text-amber-400" />,
      styles: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dotColor: 'bg-amber-400 animate-ping',
    },
    waiting_approval: {
      label: 'NEEDS APPROVAL',
      icon: <Clock className="w-3.5 h-3.5" />,
      styles: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      dotColor: 'bg-indigo-400',
    },
    queued: {
      label: 'QUEUED',
      icon: <Clock className="w-3.5 h-3.5" />,
      styles: 'bg-background-tertiary text-console-muted border-border',
      dotColor: 'bg-slate-400',
    },
    failed: {
      label: 'FAILED',
      icon: <XCircle className="w-3.5 h-3.5" />,
      styles: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dotColor: 'bg-rose-400',
    },
    rejected: {
      label: 'REJECTED',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      styles: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dotColor: 'bg-orange-400',
    },
  };

  const config = configs[status] || configs.queued;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border uppercase tracking-wider',
        config.styles,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
