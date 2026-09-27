export type InvestigationStage =
  | 'analyze'
  | 'diagnose'
  | 'impact'
  | 'fix'
  | 'test'
  | 'review'
  | 'verify';

export type InvestigationStatus =
  | 'queued'
  | 'running'
  | 'waiting_approval'
  | 'verified'
  | 'failed'
  | 'rejected'
  | 'completed';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface Finding {
  id: string;
  type: string; // 'root_cause' | 'defect' | 'side_effect' | 'bug' | 'architecture' | 'security' | 'performance' | 'test_gap'
  title: string;
  description: string;
  file: string;
  functionName?: string;
  lineStart: number;
  lineEnd: number;
  confidence: number; // 0.0 - 1.0
  severity: Severity;
  evidenceId?: string;
  codeSnippet: string;
  fixedSnippet?: string;
  relatedTests?: string[];
}

export interface DiffChange {
  file: string;
  status: 'modified' | 'added' | 'deleted';
  originalCode: string;
  modifiedCode: string;
  lineStart: number;
  lineEnd: number;
  explanation: string;
}

export interface AgentActivity {
  id: string;
  agentType: 'repository' | 'debug' | 'impact' | 'test' | 'review' | 'bob';
  name: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  summary: string;
  details?: string[];
  durationSeconds?: number;
  filesAnalyzed?: number;
  startedAt?: string;
  completedAt?: string;
  logs: string[];
}

export interface ImpactNode {
  id: string;
  name: string;
  type: 'function' | 'service' | 'endpoint' | 'model' | 'test';
  file: string;
  isDirectTarget?: boolean;
  affectedCallers: string[];
}

export interface ImpactGraphData {
  nodes: ImpactNode[];
  edges: { source: string; target: string; relationship: string }[];
  riskAssessment: {
    level: RiskLevel;
    rationale: string;
    affectedEndpoints: string[];
    affectedServices: string[];
  };
}

export interface TestResultItem {
  id: string;
  name: string;
  suite: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  isRegressionTest?: boolean;
  errorMessage?: string;
}

export interface TestRunSummary {
  id: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  durationSeconds: number;
  timestamp: string;
  results: TestResultItem[];
  regressionCoverage: {
    addedCount: number;
    tests: string[];
  };
}

export interface ReviewChecklist {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  isBlocking: boolean;
}

export interface IndependentReview {
  id: string;
  reviewer: string;
  status: 'approved' | 'changes_requested' | 'pending';
  summary: string;
  checklists: ReviewChecklist[];
  completedAt?: string;
}

export interface FollowUpItem {
  question: string;
  answer: string;
  intent?: string;
  provider?: string;
  timestamp: string;
  relevantFiles?: string[];
}

export interface Investigation {
  id: string; // e.g. "INV-001"
  title: string;
  issueDescription: string;
  intent?: string;
  depth?: string;
  plan?: string[];
  answer?: string;
  summary?: string;
  executionFlow?: string[];
  relevantFiles?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string;
  issueUrl?: string;
  repository: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  status: InvestigationStatus;
  currentStage: InvestigationStage;
  stageProgress: Record<InvestigationStage, 'pending' | 'running' | 'completed' | 'failed'>;
  durationSeconds: number;
  isDemoScenario?: boolean;
  demoKey?: string;

  // Agent Orchestration
  agents: AgentActivity[];

  // Findings & Code
  findings: Finding[];
  diffs: DiffChange[];

  // Impact
  impact?: ImpactGraphData;

  // Human in the Loop
  approval?: {
    required: boolean;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
    comment?: string;
  };

  // Evidence & AI Provider Metadata
  evidence?: any[];
  aiProvider?: string;
  isLiveAI?: boolean;

  // Validation & Reviews
  testRun?: TestRunSummary;
  review?: IndependentReview;

  // Multi-turn Follow-ups
  conversationId?: string;
  followUps?: FollowUpItem[];
}

export interface CreateInvestigationInput {
  repository: string;
  branch: string;
  issue: string;
  ai_provider?: string;
  conversation_id?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  reproductionSteps?: string;
  issueUrl?: string;
}
