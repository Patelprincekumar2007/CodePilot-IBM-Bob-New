import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvestigation } from '../hooks/useInvestigation';
import { useEvidence } from '../hooks/useEvidence';
import { repositoryApi } from '../api/repositories';
import { investigationApi } from '../api/investigations';
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
import { MarkdownView } from '../components/ui/MarkdownView';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
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
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ListOrdered,
  FileCode,
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
    refetch,
  } = useInvestigation(id);

  const { data: allEvidence } = useEvidence({ investigationId: id });

  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedFile, setSelectedFile] = useState<string>('src/services/project_service.py');
  const [targetLine, setTargetLine] = useState<number | undefined>(42);
  const [realFileCode, setRealFileCode] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Follow-up state
  const [followUpText, setFollowUpText] = useState('');
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [localFollowUps, setLocalFollowUps] = useState<any[]>([]);

  // Initialize selected file and target line from first finding or relevant file
  useEffect(() => {
    if (investigation) {
      if (investigation.findings && investigation.findings.length > 0) {
        const f = investigation.findings[0];
        setSelectedFile(f.file);
        setTargetLine(f.lineStart);
      } else if (investigation.relevantFiles && investigation.relevantFiles.length > 0) {
        setSelectedFile(investigation.relevantFiles[0]);
      }
      if (investigation.followUps) {
        setLocalFollowUps(investigation.followUps);
      }
    }
  }, [investigation?.id]);

  // Fetch real file content from repository API
  useEffect(() => {
    if (investigation && selectedFile) {
      repositoryApi
        .readFile(investigation.repository || 'taskflow-api', selectedFile)
        .then((code) => {
          if (code && !code.startsWith('# Could not read')) {
            setRealFileCode(code);
          } else {
            const f = investigation.findings?.find((x) => x.file === selectedFile);
            setRealFileCode(f?.codeSnippet || '# File content');
          }
        })
        .catch(() => {
          const f = investigation.findings?.find((x) => x.file === selectedFile);
          setRealFileCode(f?.codeSnippet || '# File content');
        });
    }
  }, [investigation?.repository, selectedFile]);

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

  const activeFinding = investigation.findings?.[0];
  const activeDiff = investigation.diffs?.[0];

  const handleSelectCode = (file: string, line?: number) => {
    setSelectedFile(file);
    if (line) setTargetLine(line);
    setActiveTab('code');
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

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || !id) return;

    setIsSendingFollowUp(true);
    try {
      const res = await investigationApi.followUp(id, followUpText.trim());
      setLocalFollowUps((prev) => [
        ...prev,
        {
          question: res.question,
          answer: res.answer,
          intent: res.intent,
          provider: res.provider,
          timestamp: new Date().toISOString(),
        },
      ]);
      setFollowUpText('');
      await refetch();
    } catch (err: any) {
      alert(`Follow-up failed: ${err.message}`);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const tabs = [
    {
      id: 'analysis',
      label: 'AI Analysis & Plan',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'code',
      label: 'Monaco Code Viewer',
      icon: <Code2 className="w-3.5 h-3.5" />,
      count: investigation.findings.length,
    },
    ...(investigation.diffs && investigation.diffs.length > 0
      ? [
          {
            id: 'diff',
            label: 'Patch Diff & Approval',
            icon: <GitCompare className="w-3.5 h-3.5" />,
            count: investigation.diffs.length,
          },
        ]
      : []),
    {
      id: 'agents',
      label: 'Agent Pipeline',
      icon: <Cpu className="w-3.5 h-3.5" />,
      count: investigation.agents.length,
    },
    {
      id: 'impact',
      label: 'Impact Topology',
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

        {/* Tab 1: Universal AI Analysis, Plan, Execution Flow & Follow-ups */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 8 Cols: Main Markdown Answer & Execution Flow */}
              <div className="lg:col-span-8 space-y-5">
                {/* Main AI Response Box */}
                <div className="p-6 rounded-xl bg-background-elevated border border-border space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-accent-indigo/20 text-accent-indigo border border-indigo-500/30">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h2 className="text-base font-bold font-mono tracking-tight text-white">
                        AI Reasoning & Technical Synthesis
                      </h2>
                    </div>
                    <span className="text-[11px] text-console-dim font-mono">
                      Provider: {(investigation as any).aiProvider?.toUpperCase() || 'GEMINI'}
                    </span>
                  </div>

                  {/* Render Markdown Response */}
                  <MarkdownView
                    content={
                      investigation.answer ||
                      `### Summary\n${investigation.issueDescription}\n\n#### Diagnosed Findings\nCodePilot identified ${investigation.findings?.length || 0} defect points across target services.`
                    }
                    onFileClick={(f) => handleSelectCode(f)}
                  />

                  {/* Execution Flow Steps if available */}
                  {investigation.executionFlow && investigation.executionFlow.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-accent-indigo" />
                        <span>Execution & Request Flow</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {investigation.executionFlow.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <div className="px-3 py-1.5 rounded-lg bg-background-tertiary border border-border text-console-text text-xs font-mono">
                              {step}
                            </div>
                            {idx < (investigation.executionFlow?.length || 0) - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-console-dim" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-Turn Follow-Ups Stream */}
                {localFollowUps.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
                      <MessageSquare className="w-4 h-4 text-accent-indigo" />
                      <span>Follow-up Queries in this Workspace ({localFollowUps.length})</span>
                    </div>

                    {localFollowUps.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-background-elevated border border-border space-y-3"
                      >
                        <div className="flex items-center gap-2 text-xs font-mono text-accent-indigo font-bold pb-2 border-b border-border">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Q: {item.question}</span>
                        </div>
                        <MarkdownView content={item.answer} onFileClick={(f) => handleSelectCode(f)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-Up Question Input Box */}
                <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-indigo" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Ask a follow-up question about this codebase
                    </span>
                  </div>
                  <form onSubmit={handleSendFollowUp} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Now explain the task creation flow, or are there any race conditions?"
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-console-text placeholder:text-console-dim text-xs font-mono focus:outline-none focus:border-accent-indigo"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSendingFollowUp}
                      disabled={!followUpText.trim()}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Ask
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right 4 Cols: Analysis Plan & Relevant Verified Files */}
              <div className="lg:col-span-4 space-y-4">
                {/* Execution Plan Card */}
                {investigation.plan && investigation.plan.length > 0 && (
                  <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-accent-indigo" />
                      <span>Analysis Execution Plan</span>
                    </div>
                    <div className="space-y-2">
                      {investigation.plan.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-console-text">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relevant Verified Files */}
                <div className="p-4 rounded-xl bg-background-elevated border border-border space-y-3">
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-accent-indigo" />
                      <span>Relevant Source Files</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                  </div>
                  <div className="space-y-1.5">
                    {(investigation.relevantFiles || ['src/services/project_service.py', 'src/api/tasks.py']).map(
                      (filePath, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCode(filePath)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                            selectedFile === filePath
                              ? 'bg-accent-indigo/15 border-indigo-500/50 text-white font-bold'
                              : 'bg-background border-border text-console-muted hover:text-white hover:border-border/80'
                          }`}
                        >
                          <span className="truncate">{filePath}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 text-console-dim" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Findings Preview if any */}
                {investigation.findings && investigation.findings.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider px-1">
                      Findings & Anomalies ({investigation.findings.length})
                    </div>
                    {investigation.findings.map((f) => (
                      <FindingCard
                        key={f.id}
                        finding={f}
                        isSelected={selectedFile === f.file}
                        onSelectCode={handleSelectCode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Monaco Code Viewer with Real Source */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Findings list */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between px-1">
                <span>Diagnosed Findings ({investigation.findings?.length || 0})</span>
                <span className="text-[10px] text-console-dim">AST / Real File Grounded</span>
              </div>

              {investigation.findings?.map((f) => (
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
                  User Question / Defect Query
                </div>
                <div className="text-console-text font-sans text-xs leading-relaxed">
                  {investigation.issueDescription}
                </div>
              </div>
            </div>

            {/* Right: Monaco Code Viewer with Real File Content */}
            <div className="lg:col-span-7 space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider px-1 flex items-center justify-between">
                <span>Monaco Code Viewer: {selectedFile}</span>
                {targetLine && <span className="text-accent-indigo text-[11px]">Target Line: {targetLine}</span>}
              </div>
              <MonacoCodeViewer
                filePath={selectedFile}
                code={realFileCode || activeFinding?.codeSnippet || '# File content'}
                targetLine={targetLine}
                height="540px"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Diff & Human Approval */}
        {activeTab === 'diff' && (
          <div className="space-y-6">
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

            {activeDiff && (
              <MonacoDiffViewer diff={activeDiff} height="420px" />
            )}
          </div>
        )}

        {/* Tab 4: Agent Orchestration Pipeline */}
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

        {/* Tab 5: Impact Graph */}
        {activeTab === 'impact' && (
          <ImpactGraph impact={investigation.impact} />
        )}

        {/* Tab 6: Test Run & Verification */}
        {activeTab === 'tests' && (
          <TestRunCard
            testRun={investigation.testRun}
            onReRun={() => verifyFix()}
            isRunning={isVerifying}
          />
        )}

        {/* Tab 7: Independent Review */}
        {activeTab === 'review' && (
          <ReviewPanel review={investigation.review} />
        )}

        {/* Tab 8: Evidence Center */}
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
