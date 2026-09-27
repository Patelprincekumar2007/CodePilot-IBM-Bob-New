import {
  Investigation,
  CreateInvestigationInput,
  InvestigationStage,
  AgentActivity,
  Finding,
  DiffChange,
  TestRunSummary,
  IndependentReview,
} from '../types/investigation';
import {
  getStoredInvestigations,
  saveStoredInvestigations,
  getStoredEvidence,
  saveStoredEvidence,
} from '../lib/storage';
import { EvidenceItem } from '../types/evidence';

// Helper for asynchronous delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const investigationApi = {
  getAll: async (): Promise<Investigation[]> => {
    await delay(50);
    return getStoredInvestigations();
  },

  getById: async (id: string): Promise<Investigation> => {
    await delay(50);
    const list = getStoredInvestigations();
    const found = list.find((inv) => inv.id === id);
    if (!found) {
      throw new Error(`Investigation ${id} not found`);
    }
    return found;
  },

  create: async (input: CreateInvestigationInput): Promise<Investigation> => {
    await delay(200);
    const list = getStoredInvestigations();
    const nextNumber = list.length + 1;
    const paddedId = `INV-${String(nextNumber).padStart(3, '0')}`;

    // Infer findings and code based on description or create realistic dynamic investigation
    const isProgressBug = input.issue.toLowerCase().includes('progress');
    const isStatusBug = input.issue.toLowerCase().includes('status');
    const isFilterBug = input.issue.toLowerCase().includes('filter') || input.issue.toLowerCase().includes('assignee');

    let file = 'src/services/project_service.py';
    let func = 'get_progress';
    let lineStart = 38;
    let lineEnd = 46;
    let originalSnippet = 'completed = sum(1 for t in tasks if t.status != TaskStatus.DONE)';
    let fixedSnippet = 'completed = sum(1 for t in tasks if t.status == TaskStatus.DONE)';
    let findingTitle = 'Inverted completion condition predicate';
    let desc = 'The logic counts non-DONE tasks as completed.';

    if (isStatusBug) {
      file = 'src/services/task_service.py';
      func = 'update_status';
      lineStart = 68;
      lineEnd = 79;
      originalSnippet = 'task.updated_at = datetime.utcnow()';
      fixedSnippet = 'task.status = status\ntask.updated_at = datetime.utcnow()';
      findingTitle = 'Missing task status assignment';
      desc = 'TaskService.update_status omits assigning task.status = status before returning.';
    } else if (isFilterBug) {
      file = 'src/api/tasks.py';
      func = 'list_tasks';
      lineStart = 30;
      lineEnd = 38;
      originalSnippet = 'return task_service.list_tasks(project_id=project_id, status=assignee_id, assignee_id=status)';
      fixedSnippet = 'return task_service.list_tasks(project_id=project_id, status=status, assignee_id=assignee_id)';
      findingTitle = 'Swapped positional parameters in API router';
      desc = 'The router forwards status and assignee_id to the wrong service parameters.';
    }

    const newAgents: AgentActivity[] = [
      {
        id: `ag-1-${Date.now()}`,
        agentType: 'repository',
        name: 'Repository Agent',
        status: 'running',
        summary: `Scanning ${input.repository} AST and entry points...`,
        startedAt: new Date().toISOString(),
        logs: [
          `Initializing repository index for ${input.repository}`,
          `Branch: ${input.branch}`,
          `Parsing syntax tree for route handlers...`,
        ],
      },
      {
        id: `ag-2-${Date.now()}`,
        agentType: 'debug',
        name: 'Debug Agent',
        status: 'waiting',
        summary: 'Waiting for repository mapping...',
        logs: [],
      },
      {
        id: `ag-3-${Date.now()}`,
        agentType: 'impact',
        name: 'Impact Agent',
        status: 'waiting',
        summary: 'Waiting for root-cause diagnosis...',
        logs: [],
      },
      {
        id: `ag-4-${Date.now()}`,
        agentType: 'test',
        name: 'Test Agent',
        status: 'waiting',
        summary: 'Waiting for fix proposal...',
        logs: [],
      },
      {
        id: `ag-5-${Date.now()}`,
        agentType: 'review',
        name: 'Review Agent',
        status: 'waiting',
        summary: 'Waiting for regression test generation...',
        logs: [],
      },
      {
        id: `ag-6-${Date.now()}`,
        agentType: 'bob',
        name: 'IBM Bob 2.0 Agent',
        status: 'waiting',
        summary: 'Awaiting execution artifacts...',
        logs: [],
      },
    ];

    const findings: Finding[] = [
      {
        id: `f-${Date.now()}`,
        type: 'root_cause',
        title: findingTitle,
        description: desc,
        file,
        functionName: func,
        lineStart,
        lineEnd,
        confidence: 0.98,
        severity: 'high',
        evidenceId: `EVD-${paddedId}`,
        codeSnippet: originalSnippet,
        fixedSnippet,
        relatedTests: [`tests/test_${file.includes('project') ? 'progress' : 'tasks'}.py`],
      },
    ];

    const diffs: DiffChange[] = [
      {
        file,
        status: 'modified',
        lineStart,
        lineEnd,
        originalCode: originalSnippet,
        modifiedCode: fixedSnippet,
        explanation: `Fix identified root-cause in ${func} to ensure expected behavior.`,
      },
    ];

    const newInvestigation: Investigation = {
      id: paddedId,
      title: input.issue.length > 60 ? `${input.issue.slice(0, 57)}...` : input.issue,
      issueDescription: input.issue,
      expectedBehavior: input.expectedBehavior || 'Expected accurate deterministic response.',
      actualBehavior: input.actualBehavior || 'Encountered unexpected behavior during execution.',
      reproductionSteps: input.reproductionSteps || '1. Call endpoint\n2. Observe discrepancy',
      issueUrl: input.issueUrl,
      repository: input.repository,
      branch: input.branch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'running',
      currentStage: 'analyze',
      stageProgress: {
        analyze: 'running',
        diagnose: 'pending',
        impact: 'pending',
        fix: 'pending',
        test: 'pending',
        review: 'pending',
        verify: 'pending',
      },
      durationSeconds: 12.0,
      agents: newAgents,
      findings,
      diffs,
      approval: {
        required: true,
        status: 'pending',
      },
    };

    list.unshift(newInvestigation);
    saveStoredInvestigations(list);

    // Save corresponding evidence item
    const evidenceList = getStoredEvidence();
    const newEvidence: EvidenceItem = {
      id: `EVD-${paddedId}`,
      investigationId: paddedId,
      category: 'Root Cause',
      title: `${findingTitle} in ${file}:${lineStart}`,
      sourceAgent: 'Debug Agent',
      file,
      lineNumber: lineStart,
      snippet: originalSnippet,
      details: desc,
      timestamp: new Date().toISOString(),
      verifiedByBob: true,
    };
    evidenceList.unshift(newEvidence);
    saveStoredEvidence(evidenceList);

    return newInvestigation;
  },

  advanceStage: async (id: string, targetStage: InvestigationStage): Promise<Investigation> => {
    await delay(100);
    const list = getStoredInvestigations();
    const index = list.findIndex((inv) => inv.id === id);
    if (index === -1) throw new Error(`Investigation ${id} not found`);

    const inv = { ...list[index] };
    const stages: InvestigationStage[] = ['analyze', 'diagnose', 'impact', 'fix', 'test', 'review', 'verify'];
    const currentIndex = stages.indexOf(inv.currentStage);
    const targetIndex = stages.indexOf(targetStage);

    if (targetIndex > currentIndex) {
      // Mark preceding stages completed
      for (let i = 0; i <= targetIndex; i++) {
        const s = stages[i];
        if (i < targetIndex) {
          inv.stageProgress[s] = 'completed';
        } else {
          inv.stageProgress[s] = targetStage === 'verify' ? 'completed' : 'running';
        }
      }
      inv.currentStage = targetStage;
      inv.updatedAt = new Date().toISOString();

      // Update agent statuses
      inv.agents = inv.agents.map((ag) => {
        if (targetStage === 'verify' || targetIndex >= 5) {
          return { ...ag, status: 'completed' };
        }
        return ag;
      });

      if (targetStage === 'verify') {
        inv.status = 'verified';
        inv.testRun = {
          id: `tr-${id}`,
          totalTests: 41,
          passed: 41,
          failed: 0,
          skipped: 0,
          durationSeconds: 0.59,
          timestamp: new Date().toISOString(),
          regressionCoverage: {
            addedCount: 3,
            tests: [
              'test_progress_with_mixed_task_states',
              'test_progress_with_no_completed_tasks',
              'test_progress_with_all_completed_tasks',
            ],
          },
          results: [
            { id: '1', name: 'test_regression_scenario', suite: 'regression', file: 'tests/test_progress.py', status: 'passed', durationMs: 12, isRegressionTest: true },
            { id: '2', name: 'test_users_suite', suite: 'users', file: 'tests/test_users.py', status: 'passed', durationMs: 8 },
            { id: '3', name: 'test_tasks_suite', suite: 'tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 14 },
          ],
        };

        inv.review = {
          id: `rev-${id}`,
          reviewer: 'Review Agent & IBM Bob 2.0',
          status: 'approved',
          summary: 'Patch verified against full test suite. 0 regressions detected.',
          completedAt: new Date().toISOString(),
          checklists: [
            { id: '1', title: 'Root cause verified', description: 'Patch strictly addresses diagnosed fault.', status: 'passed', isBlocking: true },
            { id: '2', title: 'Minimal diff footprint', description: 'Zero unrelated changes.', status: 'passed', isBlocking: true },
            { id: '3', title: 'Regression tests added', description: '3 test cases validating boundary conditions.', status: 'passed', isBlocking: true },
            { id: '4', title: 'Full test suite passing', description: '41 / 41 test cases pass cleanly.', status: 'passed', isBlocking: true },
          ],
        };
      }

      list[index] = inv;
      saveStoredInvestigations(list);
    }
    return inv;
  },

  approveFix: async (id: string, decision: 'approved' | 'rejected', comment?: string): Promise<Investigation> => {
    await delay(150);
    const list = getStoredInvestigations();
    const index = list.findIndex((inv) => inv.id === id);
    if (index === -1) throw new Error(`Investigation ${id} not found`);

    const inv = { ...list[index] };
    inv.approval = {
      required: true,
      status: decision,
      approvedBy: 'lead-engineer@codepilot.ai',
      approvedAt: new Date().toISOString(),
      comment: comment || (decision === 'approved' ? 'Approved patch for deployment' : 'Rejected patch'),
    };

    if (decision === 'approved') {
      inv.currentStage = 'verify';
      inv.stageProgress = {
        analyze: 'completed',
        diagnose: 'completed',
        impact: 'completed',
        fix: 'completed',
        test: 'completed',
        review: 'completed',
        verify: 'completed',
      };
      inv.status = 'verified';
      inv.testRun = {
        id: `tr-${id}`,
        totalTests: 41,
        passed: 41,
        failed: 0,
        skipped: 0,
        durationSeconds: 0.59,
        timestamp: new Date().toISOString(),
        regressionCoverage: {
          addedCount: 3,
          tests: [
            'test_progress_with_mixed_task_states',
            'test_progress_with_no_completed_tasks',
            'test_progress_with_all_completed_tasks',
          ],
        },
        results: [],
      };
    } else {
      inv.status = 'rejected';
    }

    list[index] = inv;
    saveStoredInvestigations(list);
    return inv;
  },

  runVerificationTests: async (id: string): Promise<TestRunSummary> => {
    await delay(400);
    const testRun: TestRunSummary = {
      id: `tr-run-${Date.now()}`,
      totalTests: 41,
      passed: 41,
      failed: 0,
      skipped: 0,
      durationSeconds: 0.59,
      timestamp: new Date().toISOString(),
      regressionCoverage: {
        addedCount: 3,
        tests: [
          'test_progress_with_mixed_task_states',
          'test_progress_with_no_completed_tasks',
          'test_progress_with_all_completed_tasks',
        ],
      },
      results: [
        { id: '1', name: 'test_progress_with_mixed_task_states', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 12, isRegressionTest: true },
        { id: '2', name: 'test_progress_with_no_completed_tasks', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 9, isRegressionTest: true },
        { id: '3', name: 'test_progress_with_all_completed_tasks', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 11, isRegressionTest: true },
        { id: '4', name: 'test_update_task_status', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 10 },
        { id: '5', name: 'test_assign_task', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 14 },
      ],
    };

    // Update in stored investigations
    const list = getStoredInvestigations();
    const index = list.findIndex((inv) => inv.id === id);
    if (index !== -1) {
      list[index].testRun = testRun;
      list[index].status = 'verified';
      saveStoredInvestigations(list);
    }

    return testRun;
  },
};
