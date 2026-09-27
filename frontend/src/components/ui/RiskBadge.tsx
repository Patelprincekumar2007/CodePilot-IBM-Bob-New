import React from 'react';
import { RiskLevel } from '../../types/investigation';
import { cn } from '../../lib/utils';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className }) => {
  const configs: Record<
    RiskLevel,
    { label: string; icon: React.ReactNode; styles: string }
  > = {
    low: {
      label: 'Low Risk',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      styles: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    medium: {
      label: 'Medium Risk',
      icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
      styles: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    high: {
      label: 'High Risk',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      styles: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    },
  };

  const config = configs[level] || configs.medium;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium border',
        config.styles,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
