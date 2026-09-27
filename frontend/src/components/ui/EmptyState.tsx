import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-background-elevated/30',
        className
      )}
    >
      {icon && (
        <div className="p-3 mb-4 rounded-xl bg-background-tertiary border border-border text-console-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-white font-mono">{title}</h3>
      <p className="mt-1 text-sm text-console-muted max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
