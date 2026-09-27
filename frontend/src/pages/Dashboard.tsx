import React from 'react';
import { useInvestigations } from '../hooks/useInvestigations';
import { IssueComposer } from '../components/dashboard/IssueComposer';
import { DemoScenarioSelector } from '../components/dashboard/DemoScenarioSelector';
import { ProductivityMetrics } from '../components/dashboard/ProductivityMetrics';
import { RecentInvestigationsTable } from '../components/dashboard/RecentInvestigationsTable';
import { Skeleton } from '../components/ui/Skeleton';

export const Dashboard: React.FC = () => {
  const { data: investigations, isLoading } = useInvestigations();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Issue Composer */}
      <IssueComposer />

      {/* Seeded Bug Scenarios */}
      <DemoScenarioSelector />

      {/* Measured Engineering Productivity Metrics */}
      <ProductivityMetrics />

      {/* Recent Investigations */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <RecentInvestigationsTable investigations={investigations || []} />
      )}
    </div>
  );
};
