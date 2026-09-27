import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('p-4 relative overflow-hidden bg-background-card/90', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono font-medium text-console-muted uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-mono text-console-dim">{subValue}</span>
            )}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-mono">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend.value}
              </span>
              <span className="text-console-dim">vs manual</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-background-elevated border border-border text-console-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
