import React, { useState } from 'react';
import { useEvidence } from '../hooks/useEvidence';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { BobEvidenceCard } from '../components/evidence/BobEvidenceCard';
import { EvidenceCategory } from '../types/evidence';
import { ShieldCheck, Search, Filter, Cpu } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const Evidence: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: evidence, isLoading } = useEvidence();

  const categories = ['all', 'Root Cause', 'Execution', 'Tests', 'IBM Bob'];

  const filtered = (evidence || []).filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !item.details.toLowerCase().includes(search.toLowerCase()) &&
      !(item.file && item.file.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-indigo" />
          <span>Evidence Center</span>
        </h1>
        <p className="mt-1 text-xs text-console-muted font-sans">
          Immutable audit trails, breakpoint captures, execution proofs, AST findings, and IBM Bob 2.0 session logs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-background-elevated border border-border">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors shrink-0 uppercase ${
                categoryFilter === cat
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'bg-background text-console-muted hover:text-white border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-console-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence traces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-background border border-border text-console-text placeholder:text-console-dim focus:outline-none focus:border-accent-indigo text-xs"
          />
        </div>
      </div>

      {/* Bob Session Overview */}
      <BobEvidenceCard />

      {/* Evidence Cards Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider px-1">
          Structured Proof Artifacts ({filtered.length})
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-6 h-6" />}
            title="No evidence found"
            description="Try selecting another category or clear your search query."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <EvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
