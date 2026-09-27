import React, { useState } from 'react';
import { useInvestigations } from '../hooks/useInvestigations';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { History as HistoryIcon, Search, Download, ArrowRight, Clock } from 'lucide-react';
import { formatDuration, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
  const { data: investigations } = useInvestigations();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = (investigations || []).filter(
    (inv) =>
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.repository.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-accent-indigo" />
          <span>Investigation History & Audit Trail</span>
        </h1>
        <p className="mt-1 text-xs text-console-muted font-sans">
          Permanent log of all debugging workflows, verified patches, and agent decision matrices.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-background-elevated border border-border">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-console-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search investigation logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo text-xs"
          />
        </div>
        <span className="text-console-dim text-[11px]">
          {filtered.length} Historical Records
        </span>
      </div>

      {/* History Table */}
      <Card className="border-border bg-background-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-background-elevated text-console-dim uppercase text-[10px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Repository / Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/investigations/${inv.id}`)}
                  className="hover:bg-background-elevated/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-indigo-300">{inv.id}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-white font-medium">
                    {inv.title}
                  </td>
                  <td className="py-3 px-4 text-console-muted">
                    {inv.repository} / {inv.branch}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 px-4 text-console-dim">
                    {formatDuration(inv.durationSeconds)}
                  </td>
                  <td className="py-3 px-4 text-console-dim">{formatDate(inv.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-accent-indigo hover:text-indigo-300 font-bold inline-flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
