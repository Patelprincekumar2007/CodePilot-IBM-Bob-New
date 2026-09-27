import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../hooks/useInvestigation';
import { useEvidence } from '../hooks/useEvidence';
import { InvestigationHeader } from '../components/investigation/InvestigationHeader';
import { WorkflowStepper } from '../components/investigation/WorkflowStepper';
import { FindingCard } from '../components/investigation/FindingCard';
import { MonacoCodeViewer } from '../components/code/MonacoCodeViewer';
import { MonacoDiffViewer } from '../components/code/MonacoDiffViewer';
import { ApprovalPanel } from '../components/investigation/ApprovalPanel';
import { AgentTimeline } from '../components/agents/AgentTimeline';
import { ImpactGraph } from '../components/review/ImpactGraph';
import { ReviewPanel } from '../components/review/ReviewPanel';
import { TestRunCard } from '../components/tests/TestRunCard';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { BobEvidenceCard } from '../components/evidence/BobEvidenceCard';
import { FinalReportModal } from '../components/investigation/FinalReportModal';
import { Tabs } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Code2,
  GitCompare,
  Cpu,
  GitFork,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { InvestigationStage } from '../types/investigation';

export const InvestigationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    investigation,
    isLoading,
    advanceStage,
    isAdvancing,
    approveFix,
    isApproving,
    verifyFix,
    isVerifying,
  } = useInvestigation(id);

  const { data: allEvidence } = useEvidence({ investigationId: id });

  const [activeTab, setActiveTab] = useState('findings');
  const [selectedFile, setSelectedFile] = useState<string>('src/services/project_service.py');
  const [targetLine, setTargetLine] = useState<number | undefined>(42);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!investigation) {
    return (
      <EmptyState
        title="Investigation Not Found"
        description={`The requested investigation ID ${id} does not exist in the repository store.`}
        actionLabel="Back to Investigations"
        onAction={() => navigate('/investigations')}
      />
    );
  }

  // Active code representation
  const activeFinding = investigation.findings[0];
  const activeDiff = investigation.diffs[0];
  const currentCode =
    activeFinding?.fixedSnippet && investigation.status === 'verified'
      ? activeFinding.fixedSnippet
      : activeFinding?.codeSnippet || '# Code snippet';

  const handleSelectCode = (file: string, line?: number) => {
    setSelectedFile(file);
    if (line) setTargetLine(line);
    setActiveTab('findings');
  };

  const handleAdvanceNextStage = async () => {
    const stages: InvestigationStage[] = [
      'analyze',
      'diagnose',
      'impact',
      'fix',
      'test',
      'review',
      'verify',
    ];
    const currentIndex = stages.indexOf(investigation.currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      await advanceStage({ stage: nextStage });
    }
  };

  const tabs = [
    {
      id: 'findings',
      label: 'Findings & Code',
      icon: <Code2 className="w-3.5 h-3.5" />,
      count: investigation.findings.length,
    },
    {
      id: 'diff',
      label: 'Patch Diff & Approval',
      icon: <GitCompare className="w-3.5 h-3.5" />,
      count: investigation.diffs.length,
    },
    {
      id: 'agents',
      label: 'Agent Pipeline',
      icon: <Cpu className="w-3.5 h-3.5" />,
      count: investigation.agents.length,
    },
    {
      id: 'impact',
      label: 'Impact Graph',
      icon: <GitFork className="w-3.5 h-3.5" />,
    },
    {
      id: 'tests',
      label: 'Test Verification',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      count: investigation.testRun?.passed || 41,
    },
    {
      id: 'review',
      label: 'Independent Review',
      icon: <FileCheck2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'evidence',
      label: 'Evidence Center',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      count: allEvidence?.length || 0,
    },
  ];

  return (
    <div className="space-y-6 pb-16 font-mono text-xs">
      {/* Header */}
      <InvestigationHeader
        investigation={investigation}
        onOpenReport={() => setIsReportOpen(true)}
        onAdvanceStage={handleAdvanceNextStage}
        isAdvancing={isAdvancing}
      />

      {/* Workflow Stepper */}
      <div className="rounded-xl bg-background-elevated border border-border">
        <WorkflowStepper
          currentStage={investigation.currentStage}
          stageProgress={investigation.stageProgress}
          onSelectStage={(stage) => advanceStage({ stage })}
        />
      </div>

      {/* Primary Workspace Tabs */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Findings & Code */}
        {activeTab === 'findings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Findings list */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between px-1">
                <span>Diagnosed Findings ({investigation.findings.length})</span>
                <span className="text-[10px] text-console-dim">AST-Backed</span>
              </div>

              {investigation.findings.map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  isSelected={selectedFile === f.file}
                  onSelectCode={handleSelectCode}
                />
              ))}

              {/* Reproduction Context */}
              <div className="p-4 rounded-lg bg-background-elevated border border-border space-y-2">
                <div className="text-[11px] font-bold text-console-dim uppercase">
                  Reported Issue Context
                </div>
                <div className="text-console-text font-sans text-xs leading-relaxed">
                  {investigation.issueDescription}
                </div>
                {investigation.expectedBehavior && (
                  <div className="pt-2 border-t border-border/80">
                    <span className="text-[10px] text-console-dim uppercase font-semibold">
                      Expected vs Actual:
                    </span>
                    <div className="mt-1 text-[11px] text-emerald-300">
                      ✓ Expected: {investigation.expectedBehavior}
                    </div>
                    <div className="text-[11px] text-rose-300">
                      ✗ Actual: {investigation.actualBehavior}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Monaco Code Viewer */}
            <div className="lg:col-span-7 space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider px-1">
                Monaco Code Viewer
              </div>
              <MonacoCodeViewer
                filePath={selectedFile || activeFinding?.file || 'src/services/project_service.py'}
                code={currentCode}
                targetLine={targetLine}
                height="540px"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Diff & Human Approval */}
        {activeTab === 'diff' && (
          <div className="space-y-6">
            {/* Human in the loop Approval Panel */}
            <ApprovalPanel
              investigation={investigation}
              onApprove={async (comment) => {
                await approveFix({ decision: 'approved', comment });
              }}
              onReject={async (comment) => {
                await approveFix({ decision: 'rejected', comment });
              }}
              isLoading={isApproving}
            />

            {/* Monaco Diff Viewer */}
            {activeDiff && (
              <MonacoDiffViewer diff={activeDiff} height="420px" />
            )}
          </div>
        )}

        {/* Tab 3: Agent Orchestration Pipeline */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <AgentTimeline agents={investigation.agents} />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <BobEvidenceCard />
            </div>
          </div>
        )}

        {/* Tab 4: Impact Graph */}
        {activeTab === 'impact' && (
          <ImpactGraph impact={investigation.impact} />
        )}

        {/* Tab 5: Test Run & Verification */}
        {activeTab === 'tests' && (
          <TestRunCard
            testRun={investigation.testRun}
            onReRun={() => verifyFix()}
            isRunning={isVerifying}
          />
        )}

        {/* Tab 6: Independent Review */}
        {activeTab === 'review' && (
          <ReviewPanel review={investigation.review} />
        )}

        {/* Tab 7: Evidence Center */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(allEvidence || []).map((ev) => (
                <EvidenceCard
                  key={ev.id}
                  evidence={ev}
                  onSelectCode={handleSelectCode}
                />
              ))}
            </div>

            <BobEvidenceCard />
          </div>
        )}
      </div>

      {/* Verification Final Report Modal */}
      <FinalReportModal
        investigation={investigation}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onViewDiff={() => setActiveTab('diff')}
        onViewEvidence={() => setActiveTab('evidence')}
      />
    </div>
  );
};
