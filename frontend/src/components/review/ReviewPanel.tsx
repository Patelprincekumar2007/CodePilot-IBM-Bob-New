import React from 'react';
import { IndependentReview } from '../../types/investigation';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FileCheck2, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface ReviewPanelProps {
  review?: IndependentReview;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ review }) => {
  if (!review) {
    return (
      <div className="p-8 text-center text-xs font-mono text-console-dim">
        Review pending agent and verification run
      </div>
    );
  }

  const isApproved = review.status === 'approved';

  return (
    <Card className="border-border bg-background-card font-mono text-xs">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-purple-400" />
            <span className="font-bold uppercase tracking-wider text-white">
              Independent Code Review & Safety Audit
            </span>
          </div>

          <Badge variant={isApproved ? 'success' : 'warning'} size="sm">
            {isApproved ? 'APPROVED' : 'CHANGES REQUESTED'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Reviewer & Summary */}
        <div className="p-3.5 rounded-lg bg-background-elevated border border-border flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">{review.reviewer}</span>
            </div>
            <p className="mt-1 text-console-muted font-sans text-xs">{review.summary}</p>
          </div>
          {review.completedAt && (
            <span className="text-[10px] text-console-dim shrink-0">
              {formatDate(review.completedAt)}
            </span>
          )}
        </div>

        {/* Verification Checklists */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-console-dim uppercase">
            Audit Checklist ({review.checklists.filter((c) => c.status === 'passed').length} /{' '}
            {review.checklists.length} Verified)
          </div>

          {review.checklists.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded bg-background-elevated border border-border flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                {item.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : item.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-console-muted font-sans mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              {item.isBlocking && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-background-tertiary text-console-dim border border-border shrink-0">
                  Blocking
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
