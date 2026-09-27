import React from 'react';
import { useInvestigations } from '../hooks/useInvestigations';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FileCheck2, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';

export const Reviews: React.FC = () => {
  const { data: investigations } = useInvestigations();
  const navigate = useNavigate();

  const reviews = (investigations || [])
    .filter((inv) => inv.review || inv.approval)
    .map((inv) => ({
      investigationId: inv.id,
      title: inv.title,
      review: inv.review,
      approval: inv.approval,
      updatedAt: inv.updatedAt,
    }));

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-accent-indigo" />
          <span>Independent Code Reviews & Sign-offs</span>
        </h1>
        <p className="mt-1 text-xs text-console-muted font-sans">
          Automated safety review checklists, human lead engineer approvals, and non-blocking quality audits.
        </p>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((item) => (
          <Card
            key={item.investigationId}
            className="border-border bg-background-card hover:border-indigo-500/40 transition-all p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded bg-accent-indigo/20 text-indigo-300 font-bold">
                  {item.investigationId}
                </span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="success" size="sm">
                  AUDIT PASSED
                </Badge>
                <button
                  onClick={() => navigate(`/investigations/${item.investigationId}`)}
                  className="flex items-center gap-1 text-accent-indigo hover:text-indigo-300 font-bold"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Checklist summary */}
            {item.review && (
              <div className="space-y-2">
                <div className="text-[11px] text-console-dim font-bold uppercase">
                  Safety Audit Criteria ({item.review.checklists.length} Rules Checked)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.review.checklists.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded bg-background-elevated border border-border flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-xs">{c.title}</div>
                        <div className="text-[11px] text-console-muted font-sans mt-0.5">
                          {c.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human Sign-off info */}
            {item.approval && (
              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-accent-indigo" />
                  <span className="text-white font-bold">
                    Human Authorization: {item.approval.approvedBy || 'Lead Engineer'}
                  </span>
                </div>
                <span className="text-emerald-400 font-bold uppercase">
                  ✓ {item.approval.status}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
