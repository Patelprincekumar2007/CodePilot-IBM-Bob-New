import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestigations } from '../hooks/useInvestigations';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  SearchCode,
  PlusCircle,
  Search,
  Filter,
  FolderGit2,
  GitBranch,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatDuration, formatDate } from '../lib/utils';
import { InvestigationStatus } from '../types/investigation';

export const Investigations: React.FC = () => {
  const { data: investigations, isLoading } = useInvestigations();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = (investigations || []).filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (
      search &&
      !inv.title.toLowerCase().includes(search.toLowerCase()) &&
      !inv.id.toLowerCase().includes(search.toLowerCase()) &&
      !inv.issueDescription.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-accent-indigo" />
            <span>Investigations</span>
          </h1>
          <p className="mt-1 text-xs text-console-muted font-sans">
            Autonomous multi-agent code investigation runs, root-cause findings, and verification records.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-background-elevated border border-border">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'running', 'waiting_approval', 'verified', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors shrink-0 uppercase ${
                statusFilter === st
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'bg-background text-console-muted hover:text-white border border-border'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-console-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo text-xs"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchCode className="w-6 h-6" />}
          title="No investigations found"
          description="Try modifying your search or status filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const riskLevel = inv.impact?.riskAssessment?.level || 'low';
            return (
              <Card
                key={inv.id}
                onClick={() => navigate(`/investigations/${inv.id}`)}
                className="p-4 border-border bg-background-card/90 hover:border-accent-indigo hover:shadow-glow-indigo transition-all cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-indigo-300">{inv.id}</span>
                      <StatusBadge status={inv.status} />
                      <RiskBadge level={riskLevel} />
                      <div className="flex items-center gap-1 text-[11px] text-console-dim">
                        <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
                        <span>{inv.repository}</span>
                        <span>/</span>
                        <GitBranch className="w-3 h-3 text-console-dim" />
                        <span>{inv.branch}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {inv.title}
                    </h3>

                    <p className="text-console-muted font-sans text-xs line-clamp-2">
                      {inv.issueDescription}
                    </p>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border text-console-dim text-[11px] shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(inv.durationSeconds)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-accent-indigo font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
