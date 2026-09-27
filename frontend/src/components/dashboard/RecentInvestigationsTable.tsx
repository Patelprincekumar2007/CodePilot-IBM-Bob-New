import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Investigation } from '../../types/investigation';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDuration, formatDate } from '../../lib/utils';
import { FolderGit2, GitBranch, ArrowRight, SearchCode, Clock } from 'lucide-react';

interface RecentInvestigationsTableProps {
  investigations: Investigation[];
}

export const RecentInvestigationsTable: React.FC<RecentInvestigationsTableProps> = ({
  investigations,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-background-card font-mono text-xs">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <SearchCode className="w-4 h-4 text-accent-indigo" />
            <CardTitle>Recent Investigations</CardTitle>
          </div>
          <button
            onClick={() => navigate('/investigations')}
            className="text-xs text-accent-indigo hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All ({investigations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {investigations.slice(0, 5).map((inv) => (
            <div
              key={inv.id}
              onClick={() => navigate(`/investigations/${inv.id}`)}
              className="p-4 hover:bg-background-elevated/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-300">{inv.id}</span>
                  <StatusBadge status={inv.status} />
                  <div className="flex items-center gap-1 text-[11px] text-console-dim">
                    <FolderGit2 className="w-3 h-3 text-accent-indigo" />
                    <span>{inv.repository}</span>
                    <span>/</span>
                    <GitBranch className="w-3 h-3 text-console-dim" />
                    <span>{inv.branch}</span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {inv.title}
                </div>

                <div className="text-[11px] text-console-muted font-sans line-clamp-1">
                  {inv.issueDescription}
                </div>
              </div>

              <div className="flex items-center gap-4 text-console-dim text-[11px] shrink-0">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(inv.durationSeconds)}</span>
                </div>
                <span>{formatDate(inv.createdAt)}</span>
                <ArrowRight className="w-4 h-4 text-console-dim group-hover:text-accent-indigo group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
