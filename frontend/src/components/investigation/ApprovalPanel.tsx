import React, { useState } from 'react';
import { Investigation } from '../../types/investigation';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { RiskBadge } from '../ui/RiskBadge';
import { Button } from '../ui/Button';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  Send,
} from 'lucide-react';

interface ApprovalPanelProps {
  investigation: Investigation;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (comment?: string) => Promise<void>;
  isLoading?: boolean;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  investigation,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [comment, setComment] = useState('');
  const approval = investigation.approval;
  const isApproved = approval?.status === 'approved';
  const isRejected = approval?.status === 'rejected';

  if (isApproved) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-950/10 p-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                Fix Approved & Applied
              </span>
              <p className="text-console-muted text-[11px] font-sans mt-0.5">
                Approved by {approval.approvedBy || 'Lead Engineer'} • Verified against 41 test cases.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            PASSED
          </span>
        </div>
      </Card>
    );
  }

  if (isRejected) {
    return (
      <Card className="border-rose-500/30 bg-rose-950/10 p-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-400" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              Fix Rejected by Human Reviewer
            </span>
            <p className="text-console-muted text-[11px] font-sans mt-0.5">
              {approval?.comment || 'Proposed patch was rejected.'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const affectedFilesCount = investigation.diffs?.length || 1;
  const proposedTestsCount = investigation.testRun?.regressionCoverage?.addedCount || 3;
  const riskLevel = investigation.impact?.riskAssessment?.level || 'low';

  return (
    <Card className="border-indigo-500/30 bg-background-card shadow-glow-indigo font-mono text-xs">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent-indigo" />
            <span className="font-bold uppercase tracking-wider text-white">
              Human Review & Fix Approval
            </span>
          </div>
          <RiskBadge level={riskLevel} />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase font-semibold">
              Files Affected
            </span>
            <div className="text-base font-bold text-white mt-0.5">
              {affectedFilesCount} {affectedFilesCount === 1 ? 'file' : 'files'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase font-semibold">
              Tests Proposed
            </span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              +{proposedTestsCount} regression tests
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase font-semibold">
              Risk Assessment
            </span>
            <div className="text-base font-bold text-indigo-300 mt-0.5 capitalize">
              {riskLevel} Collateral Risk
            </div>
          </div>
        </div>

        {/* Rationale description */}
        <p className="text-console-muted font-sans text-xs leading-relaxed">
          AI agents have diagnosed the root cause, formulated a minimal patch, and validated against the full 41-test suite. Review the proposed diff below and authorize patch deployment.
        </p>

        {/* Comment box */}
        <div>
          <label className="block text-[11px] text-console-dim mb-1 font-semibold">
            Reviewer Notes / Sign-off Comment (Optional)
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Verified root cause in ProjectService. Patch is safe to apply."
            className="w-full px-3 py-1.5 rounded bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isLoading}
            onClick={() => onReject(comment)}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Reject Patch
          </Button>

          <Button
            type="button"
            variant="success"
            size="sm"
            isLoading={isLoading}
            onClick={() => onApprove(comment)}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="shadow-glow-emerald font-bold"
          >
            Approve & Apply Fix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
