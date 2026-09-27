import { Investigation } from '../types/investigation';
import { EvidenceItem } from '../types/evidence';
import { RepositoryInfo } from '../types/repository';

export const INITIAL_REPOSITORIES: RepositoryInfo[] = [
  {
    id: 'repo-1',
    name: 'taskflow-api',
    fullName: 'Patelprincekumar2007/CodePilot-IBM-Bob',
    defaultBranch: 'main',
    branches: ['main', 'feature/frontend-react-ui', 'fix/progress-calculation'],
    totalFiles: 47,
    language: 'Python',
    lastSyncedAt: new Date().toISOString(),
    status: 'healthy',
    tree: [
      {
        id: '1',
        name: 'src',
        path: 'src',
        type: 'directory',
        children: [
          { id: '1-1', name: 'main.py', path: 'src/main.py', type: 'file', language: 'python' },
          { id: '1-2', name: 'dependencies.py', path: 'src/dependencies.py', type: 'file', language: 'python' },
          {
            id: '1-3',
            name: 'api',
            path: 'src/api',
            type: 'directory',
            children: [
              { id: '1-3-1', name: 'tasks.py', path: 'src/api/tasks.py', type: 'file', language: 'python' },
              { id: '1-3-2', name: 'projects.py', path: 'src/api/projects.py', type: 'file', language: 'python' },
              { id: '1-3-3', name: 'users.py', path: 'src/api/users.py', type: 'file', language: 'python' },
            ],
          },
          {
            id: '1-4',
            name: 'services',
            path: 'src/services',
            type: 'directory',
            children: [
              { id: '1-4-1', name: 'project_service.py', path: 'src/services/project_service.py', type: 'file', language: 'python' },
              { id: '1-4-2', name: 'task_service.py', path: 'src/services/task_service.py', type: 'file', language: 'python' },
              { id: '1-4-3', name: 'user_service.py', path: 'src/services/user_service.py', type: 'file', language: 'python' },
            ],
          },
          {
            id: '1-5',
            name: 'models',
            path: 'src/models',
            type: 'directory',
            children: [
              { id: '1-5-1', name: 'task.py', path: 'src/models/task.py', type: 'file', language: 'python' },
              { id: '1-5-2', name: 'project.py', path: 'src/models/project.py', type: 'file', language: 'python' },
              { id: '1-5-3', name: 'user.py', path: 'src/models/user.py', type: 'file', language: 'python' },
            ],
          },
        ],
      },
      {
        id: '2',
        name: 'tests',
        path: 'tests',
        type: 'directory',
        children: [
          { id: '2-1', name: 'test_progress.py', path: 'tests/test_progress.py', type: 'file', language: 'python' },
          { id: '2-2', name: 'test_tasks.py', path: 'tests/test_tasks.py', type: 'file', language: 'python' },
          { id: '2-3', name: 'test_projects.py', path: 'tests/test_projects.py', type: 'file', language: 'python' },
          { id: '2-4', name: 'test_users.py', path: 'tests/test_users.py', type: 'file', language: 'python' },
        ],
      },
      { id: '3', name: 'requirements.txt', path: 'requirements.txt', type: 'file', language: 'plaintext' },
      { id: '4', name: 'README.md', path: 'README.md', type: 'file', language: 'markdown' },
    ],
  },
];

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-001',
    title: 'Incorrect project progress calculation',
    issueDescription:
      'Project progress percentage is wrong when a project contains both completed and incomplete tasks. Tasks that are NOT done are counted as completed, producing an inverted percentage.',
    expectedBehavior:
      'GET /projects/{id}/progress should return ratio of DONE tasks to total tasks. For 2 completed and 3 incomplete tasks the result must be 40.0%.',
    actualBehavior:
      'The endpoint returns 60.0% instead of 40.0% because tasks with status != DONE were counted as completed.',
    reproductionSteps:
      '1. Create project with 5 tasks.\n2. Mark 2 tasks as DONE, 3 as TODO.\n3. Request GET /projects/{id}/progress.\n4. Observe returned progress is 60.0% instead of 40.0%.',
    issueUrl: 'https://github.com/Patelprincekumar2007/CodePilot-IBM-Bob/issues/1',
    repository: 'taskflow-api',
    branch: 'main',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'verified',
    currentStage: 'verify',
    stageProgress: {
      analyze: 'completed',
      diagnose: 'completed',
      impact: 'completed',
      fix: 'completed',
      test: 'completed',
      review: 'completed',
      verify: 'completed',
    },
    durationSeconds: 142.4,
    isDemoScenario: true,
    demoKey: 'progress_calculation',
    agents: [
      {
        id: 'ag-1',
        agentType: 'repository',
        name: 'Repository Agent',
        status: 'completed',
        summary: 'Mapped 47 repository files and traced HTTP GET /projects/{id}/progress through service and repository layers.',
        durationSeconds: 14.2,
        filesAnalyzed: 47,
        logs: [
          'Scanning AST for repository: taskflow-api',
          'Identified FastAPI endpoint in src/api/projects.py:get_project_progress',
          'Traced service handler to src/services/project_service.py:get_progress',
          'Extracted in-memory task repository queries',
        ],
      },
      {
        id: 'ag-2',
        agentType: 'debug',
        name: 'Debug Agent',
        status: 'completed',
        summary: 'Root cause pinpointed in src/services/project_service.py line 42. Inverted conditional predicate.',
        durationSeconds: 22.8,
        logs: [
          'Reproduced scenario with 2 DONE, 3 TODO tasks',
          'Calculated completion predicate: t.status != TaskStatus.DONE',
          'Predicate evaluates to True for non-DONE tasks',
          'Confidence score: 98.4%',
        ],
      },
      {
        id: 'ag-3',
        agentType: 'impact',
        name: 'Impact Agent',
        status: 'completed',
        summary: 'Low collateral risk. Impact isolated to ProjectService.get_progress and GET /projects/{id}/progress.',
        durationSeconds: 11.5,
        logs: [
          'Analyzing downstream callers of ProjectService.get_progress',
          'Checked dependencies in dashboard metrics & reports router',
          'Zero schema modifications required',
        ],
      },
      {
        id: 'ag-4',
        agentType: 'test',
        name: 'Test Agent',
        status: 'completed',
        summary: 'Created 3 regression tests covering zero-task, all-complete, and mixed-state projects.',
        durationSeconds: 31.0,
        logs: [
          'Generated test_progress_with_mixed_task_states',
          'Generated test_progress_with_no_completed_tasks',
          'Generated test_progress_with_all_completed_tasks',
          'Verified all 41 test cases pass in 0.59s',
        ],
      },
      {
        id: 'ag-5',
        agentType: 'review',
        name: 'Review Agent',
        status: 'completed',
        summary: 'Independent code review approved. Minimal 1-line patch with 100% regression coverage.',
        durationSeconds: 18.2,
        logs: [
          'Verifying patch cleanliness and zero unrelated changes',
          'Checking Pydantic schema validation parity',
          'Checklist verified: 5/5 rules passed',
        ],
      },
      {
        id: 'ag-6',
        agentType: 'bob',
        name: 'IBM Bob 2.0 Agent',
        status: 'completed',
        summary: 'IBM Bob 2.0 orchestration verified and signed off. Artifact evidence logged in bob_sessions/',
        durationSeconds: 44.7,
        logs: [
          'Bob session connected: 01_progress_investigation.png',
          'Bob session verified: 02_progress_fix_verification.png',
          'Full-suite pytest execution returned 41 passed',
        ],
      },
    ],
    findings: [
      {
        id: 'f-1',
        type: 'root_cause',
        title: 'Inverted completion status predicate in get_progress',
        description: 'The list comprehension used `!= TaskStatus.DONE` instead of `== TaskStatus.DONE`. This counted every non-completed task as completed, inverting the percentage calculation.',
        file: 'src/services/project_service.py',
        functionName: 'get_progress',
        lineStart: 38,
        lineEnd: 46,
        confidence: 0.98,
        severity: 'high',
        evidenceId: 'EVD-001',
        codeSnippet: `def get_progress(self, project_id: str) -> ProjectProgress:
    project = self.project_repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = self.task_repo.list_by_project(project_id)
    if not tasks:
        return ProjectProgress(project_id=project_id, total_tasks=0, completed_tasks=0, progress_percent=0.0)
    
    completed = sum(1 for t in tasks if t.status != TaskStatus.DONE)
    percent = round((completed / len(tasks)) * 100, 1)
    return ProjectProgress(project_id=project_id, total_tasks=len(tasks), completed_tasks=completed, progress_percent=percent)`,
        fixedSnippet: `def get_progress(self, project_id: str) -> ProjectProgress:
    project = self.project_repo.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = self.task_repo.list_by_project(project_id)
    if not tasks:
        return ProjectProgress(project_id=project_id, total_tasks=0, completed_tasks=0, progress_percent=0.0)
    
    completed = sum(1 for t in tasks if t.status == TaskStatus.DONE)
    percent = round((completed / len(tasks)) * 100, 1)
    return ProjectProgress(project_id=project_id, total_tasks=len(tasks), completed_tasks=completed, progress_percent=percent)`,
        relatedTests: ['tests/test_progress.py::test_progress_with_mixed_tasks'],
      },
    ],
    diffs: [
      {
        file: 'src/services/project_service.py',
        status: 'modified',
        lineStart: 41,
        lineEnd: 43,
        originalCode: '    completed = sum(1 for t in tasks if t.status != TaskStatus.DONE)',
        modifiedCode: '    completed = sum(1 for t in tasks if t.status == TaskStatus.DONE)',
        explanation: 'Replace inequality check != with equality check == to only count tasks whose status is DONE.',
      },
    ],
    impact: {
      nodes: [
        { id: '1', name: 'get_project_progress (API)', type: 'endpoint', file: 'src/api/projects.py', affectedCallers: ['External Clients', 'Frontend Dashboard'] },
        { id: '2', name: 'ProjectService.get_progress', type: 'service', file: 'src/services/project_service.py', isDirectTarget: true, affectedCallers: ['src/api/projects.py'] },
        { id: '3', name: 'TaskRepository.list_by_project', type: 'function', file: 'src/repositories/task_repository.py', affectedCallers: ['ProjectService.get_progress'] },
        { id: '4', name: 'ProjectProgress (Schema)', type: 'model', file: 'src/schemas/project.py', affectedCallers: ['src/services/project_service.py'] },
        { id: '5', name: 'tests/test_progress.py', type: 'test', file: 'tests/test_progress.py', affectedCallers: ['CI Test Suite'] },
      ],
      edges: [
        { source: '1', target: '2', relationship: 'calls' },
        { source: '2', target: '3', relationship: 'queries' },
        { source: '2', target: '4', relationship: 'returns schema' },
        { source: '5', target: '2', relationship: 'validates' },
      ],
      riskAssessment: {
        level: 'low',
        rationale: 'Self-contained calculation change within single method. No database migrations, API contract changes, or external service dependencies.',
        affectedEndpoints: ['GET /projects/{id}/progress'],
        affectedServices: ['ProjectService'],
      },
    },
    approval: {
      required: true,
      status: 'approved',
      approvedBy: 'lead-engineer@codepilot.ai',
      approvedAt: new Date(Date.now() - 3600000 * 1.6).toISOString(),
      comment: 'Verified root cause in ProjectService. Patch is minimal and all 41 test cases pass cleanly.',
    },
    testRun: {
      id: 'tr-001',
      totalTests: 41,
      passed: 41,
      failed: 0,
      skipped: 0,
      durationSeconds: 0.59,
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      regressionCoverage: {
        addedCount: 3,
        tests: [
          'test_progress_with_mixed_task_states',
          'test_progress_with_no_completed_tasks',
          'test_progress_with_all_completed_tasks',
        ],
      },
      results: [
        { id: 't1', name: 'test_progress_with_mixed_task_states', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 12, isRegressionTest: true },
        { id: 't2', name: 'test_progress_with_no_completed_tasks', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 9, isRegressionTest: true },
        { id: 't3', name: 'test_progress_with_all_completed_tasks', suite: 'test_progress', file: 'tests/test_progress.py', status: 'passed', durationMs: 11, isRegressionTest: true },
        { id: 't4', name: 'test_create_user', suite: 'test_users', file: 'tests/test_users.py', status: 'passed', durationMs: 8 },
        { id: 't5', name: 'test_create_duplicate_email', suite: 'test_users', file: 'tests/test_users.py', status: 'passed', durationMs: 7 },
        { id: 't6', name: 'test_assign_task', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 14 },
        { id: 't7', name: 'test_update_task_status', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 10 },
      ],
    },
    review: {
      id: 'rev-001',
      reviewer: 'Review Agent & IBM Bob 2.0',
      status: 'approved',
      summary: 'Patch directly addresses the inverted boolean check. Zero unrelated modifications detected. Regression coverage is comprehensive.',
      completedAt: new Date(Date.now() - 3600000 * 1.55).toISOString(),
      checklists: [
        { id: 'c1', title: 'Root cause matches patch', description: 'Patch strictly targets the inequality comparison.', status: 'passed', isBlocking: true },
        { id: 'c2', title: 'Minimal diff footprint', description: '1 line modified across 1 file.', status: 'passed', isBlocking: true },
        { id: 'c3', title: 'Regression test coverage added', description: '3 new regression tests created and validated.', status: 'passed', isBlocking: true },
        { id: 'c4', title: 'Zero breaking API changes', description: 'ProjectProgress response schema remains completely unchanged.', status: 'passed', isBlocking: true },
        { id: 'c5', title: 'Full test suite passing', description: 'All 41 existing and new test cases pass.', status: 'passed', isBlocking: true },
      ],
    },
  },
  {
    id: 'INV-002',
    title: 'Task status update not persisting',
    issueDescription:
      'PATCH /tasks/{id}/status accepts the request and returns 200, but the task always retains its original status — the new value is never applied.',
    expectedBehavior:
      'After a successful PATCH /tasks/{id}/status request the task status field must reflect the new value.',
    actualBehavior:
      'The response returns 200 OK but task.status remains untouched.',
    reproductionSteps:
      '1. Create task with status TODO.\n2. Call PATCH /tasks/{id}/status with {"status": "DONE"}.\n3. Call GET /tasks/{id}.\n4. Observe status is still TODO.',
    issueUrl: 'https://github.com/Patelprincekumar2007/CodePilot-IBM-Bob/issues/2',
    repository: 'taskflow-api',
    branch: 'main',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    status: 'verified',
    currentStage: 'verify',
    stageProgress: {
      analyze: 'completed',
      diagnose: 'completed',
      impact: 'completed',
      fix: 'completed',
      test: 'completed',
      review: 'completed',
      verify: 'completed',
    },
    durationSeconds: 168.2,
    isDemoScenario: true,
    demoKey: 'status_update',
    agents: [
      {
        id: 'ag-201',
        agentType: 'repository',
        name: 'Repository Agent',
        status: 'completed',
        summary: 'Scanned TaskService and TaskRepository data persistence flows.',
        durationSeconds: 15.0,
        filesAnalyzed: 47,
        logs: ['Traced PATCH /tasks/{id}/status to task_service.py:update_status'],
      },
      {
        id: 'ag-202',
        agentType: 'debug',
        name: 'Debug Agent',
        status: 'completed',
        summary: 'Discovered missing mutation: update_status returned task without setting task.status = status.',
        durationSeconds: 24.1,
        logs: ['Found task_service.py:73 returns task without applying requested status parameter'],
      },
      {
        id: 'ag-203',
        agentType: 'impact',
        name: 'Impact Agent',
        status: 'completed',
        summary: 'Low risk. Affects task lifecycle updates and assignee retention.',
        durationSeconds: 12.4,
        logs: ['Verified preserve-assignee logic during status transitions'],
      },
      {
        id: 'ag-204',
        agentType: 'test',
        name: 'Test Agent',
        status: 'completed',
        summary: 'Added 4 regression test cases in test_tasks.py for all status transitions.',
        durationSeconds: 28.5,
        logs: ['Added test_update_status_to_done', 'Added test_status_update_preserves_assignee'],
      },
      {
        id: 'ag-205',
        agentType: 'review',
        name: 'Review Agent',
        status: 'completed',
        summary: 'Review passed. Correct mutation applied with updated_at timestamp.',
        durationSeconds: 16.0,
        logs: ['Checklist verified: 5/5 rules passed'],
      },
      {
        id: 'ag-206',
        agentType: 'bob',
        name: 'IBM Bob 2.0 Agent',
        status: 'completed',
        summary: 'Bob session verified: 03_status_investigation.png recorded and verified.',
        durationSeconds: 42.0,
        logs: ['pytest test_tasks.py passed 22/22 items'],
      },
    ],
    findings: [
      {
        id: 'f-201',
        type: 'root_cause',
        title: 'Missing status assignment in TaskService.update_status',
        description: 'The service method retrieved the task from repository but omitted the assignment `task.status = status` before persisting/returning.',
        file: 'src/services/task_service.py',
        functionName: 'update_status',
        lineStart: 68,
        lineEnd: 79,
        confidence: 0.99,
        severity: 'high',
        evidenceId: 'EVD-002',
        codeSnippet: `def update_status(self, task_id: str, status: TaskStatus) -> Task:
    task = self.task_repo.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.updated_at = datetime.utcnow()
    return task`,
        fixedSnippet: `def update_status(self, task_id: str, status: TaskStatus) -> Task:
    task = self.task_repo.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    task.updated_at = datetime.utcnow()
    return task`,
        relatedTests: ['tests/test_tasks.py::test_update_task_status'],
      },
    ],
    diffs: [
      {
        file: 'src/services/task_service.py',
        status: 'modified',
        lineStart: 72,
        lineEnd: 74,
        originalCode: '    task.updated_at = datetime.utcnow()',
        modifiedCode: '    task.status = status\n    task.updated_at = datetime.utcnow()',
        explanation: 'Assign the requested status to the task instance before updating timestamp and returning.',
      },
    ],
    approval: {
      required: true,
      status: 'approved',
      approvedBy: 'lead-engineer@codepilot.ai',
      approvedAt: new Date(Date.now() - 3600000 * 4.6).toISOString(),
      comment: 'Approved fix.',
    },
    testRun: {
      id: 'tr-002',
      totalTests: 41,
      passed: 41,
      failed: 0,
      skipped: 0,
      durationSeconds: 0.58,
      timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      regressionCoverage: {
        addedCount: 2,
        tests: ['test_status_update_preserves_assignee', 'test_update_task_status_done'],
      },
      results: [
        { id: 't201', name: 'test_update_task_status_done', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 14, isRegressionTest: true },
        { id: 't202', name: 'test_status_update_preserves_assignee', suite: 'test_tasks', file: 'tests/test_tasks.py', status: 'passed', durationMs: 12, isRegressionTest: true },
      ],
    },
  },
  {
    id: 'INV-003',
    title: 'Task filter arguments swapped',
    issueDescription:
      'GET /tasks?status=DONE filters by assignee_id instead, and GET /tasks?assignee_id=<id> applies a status filter. The two query parameters behave as each other.',
    expectedBehavior:
      'GET /tasks?status=DONE should return only tasks whose status is DONE. GET /tasks?assignee_id=<id> should return only tasks assigned to that user.',
    actualBehavior:
      'Query parameters were mapped in reverse order in the API router call to task_service.list_tasks.',
    reproductionSteps:
      '1. Create tasks with different assignees and statuses.\n2. Query GET /tasks?status=DONE.\n3. Observe 500/empty results because status string was matched against assignee UUID.',
    issueUrl: 'https://github.com/Patelprincekumar2007/CodePilot-IBM-Bob/issues/3',
    repository: 'taskflow-api',
    branch: 'main',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 7.5).toISOString(),
    status: 'verified',
    currentStage: 'verify',
    stageProgress: {
      analyze: 'completed',
      diagnose: 'completed',
      impact: 'completed',
      fix: 'completed',
      test: 'completed',
      review: 'completed',
      verify: 'completed',
    },
    durationSeconds: 118.5,
    isDemoScenario: true,
    demoKey: 'filter_swapped',
    agents: [
      {
        id: 'ag-301',
        agentType: 'repository',
        name: 'Repository Agent',
        status: 'completed',
        summary: 'Inspected src/api/tasks.py list_tasks router parameter mapping.',
        durationSeconds: 12.0,
        filesAnalyzed: 47,
        logs: ['Inspected router signature for GET /tasks'],
      },
      {
        id: 'ag-302',
        agentType: 'debug',
        name: 'Debug Agent',
        status: 'completed',
        summary: 'Root cause identified: positional argument inversion in task_service.list_tasks(project_id, assignee_id, status).',
        durationSeconds: 18.2,
        logs: ['Router forwarded status to assignee_id argument and assignee_id to status argument'],
      },
      {
        id: 'ag-303',
        agentType: 'test',
        name: 'Test Agent',
        status: 'completed',
        summary: 'Added combined status & assignee filtering tests.',
        durationSeconds: 22.0,
        logs: ['Generated test_list_tasks_by_status', 'Generated test_list_tasks_by_assignee'],
      },
    ],
    findings: [
      {
        id: 'f-301',
        type: 'root_cause',
        title: 'Swapped positional parameters in API router',
        description: 'In src/api/tasks.py list_tasks endpoint, status and assignee_id arguments were passed in inverted order to task_service.list_tasks.',
        file: 'src/api/tasks.py',
        functionName: 'list_tasks',
        lineStart: 30,
        lineEnd: 38,
        confidence: 0.99,
        severity: 'medium',
        evidenceId: 'EVD-003',
        codeSnippet: `@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[str] = None,
    status: Optional[TaskStatus] = None,
    assignee_id: Optional[str] = None,
    task_service: TaskService = Depends(get_task_service),
):
    return task_service.list_tasks(project_id=project_id, status=assignee_id, assignee_id=status)`,
        fixedSnippet: `@router.get("", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[str] = None,
    status: Optional[TaskStatus] = None,
    assignee_id: Optional[str] = None,
    task_service: TaskService = Depends(get_task_service),
):
    return task_service.list_tasks(project_id=project_id, status=status, assignee_id=assignee_id)`,
        relatedTests: ['tests/test_tasks.py::test_list_tasks_by_status', 'tests/test_tasks.py::test_list_tasks_by_assignee'],
      },
    ],
    diffs: [
      {
        file: 'src/api/tasks.py',
        status: 'modified',
        lineStart: 36,
        lineEnd: 37,
        originalCode: '    return task_service.list_tasks(project_id=project_id, status=assignee_id, assignee_id=status)',
        modifiedCode: '    return task_service.list_tasks(project_id=project_id, status=status, assignee_id=assignee_id)',
        explanation: 'Correct keyword argument mapping so status maps to status and assignee_id maps to assignee_id.',
      },
    ],
    approval: {
      required: true,
      status: 'approved',
      approvedBy: 'lead-engineer@codepilot.ai',
      approvedAt: new Date(Date.now() - 3600000 * 7.6).toISOString(),
    },
    testRun: {
      id: 'tr-003',
      totalTests: 41,
      passed: 41,
      failed: 0,
      skipped: 0,
      durationSeconds: 0.59,
      timestamp: new Date(Date.now() - 3600000 * 7.5).toISOString(),
      regressionCoverage: {
        addedCount: 2,
        tests: ['test_list_tasks_by_status', 'test_list_tasks_by_assignee'],
      },
      results: [],
    },
  },
];

export const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'EVD-001',
    investigationId: 'INV-001',
    category: 'Root Cause',
    title: 'Inverted completion condition discovered in AST inspection',
    sourceAgent: 'Debug Agent',
    file: 'src/services/project_service.py',
    lineNumber: 42,
    snippet: 'completed = sum(1 for t in tasks if t.status != TaskStatus.DONE)',
    details: 'The list comprehension filters on inequality (!=) instead of equality (==) with TaskStatus.DONE, directly inverting progress.',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    verifiedByBob: true,
  },
  {
    id: 'EVD-002',
    investigationId: 'INV-001',
    category: 'Execution',
    title: 'Endpoint reproduction response payload discrepancy',
    sourceAgent: 'Repository Agent',
    file: 'src/api/projects.py',
    lineNumber: 45,
    snippet: '{"project_id": "p1", "total_tasks": 5, "completed_tasks": 3, "progress_percent": 60.0}',
    details: 'Expected 2 completed tasks (40.0%), received 3 completed tasks (60.0%) for test dataset.',
    timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    verifiedByBob: true,
  },
  {
    id: 'EVD-003',
    investigationId: 'INV-001',
    category: 'IBM Bob',
    title: 'IBM Bob 2.0 session capture: 01_progress_investigation.png',
    sourceAgent: 'IBM Bob 2.0',
    file: 'bob_sessions/01_progress_investigation.png',
    details: 'Logged interactive Bob 2.0 investigation trace showing AST navigation and breakpoint verification.',
    timestamp: new Date(Date.now() - 3600000 * 1.7).toISOString(),
    verifiedByBob: true,
  },
  {
    id: 'EVD-004',
    investigationId: 'INV-001',
    category: 'Tests',
    title: 'Full Pytest execution: 41 passed in 0.59s',
    sourceAgent: 'Test Agent',
    file: 'tests/test_progress.py',
    details: '41 tests collected and passed across users, projects, tasks, and progress calculation suites.',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    verifiedByBob: true,
  },
  {
    id: 'EVD-005',
    investigationId: 'INV-002',
    category: 'Root Cause',
    title: 'Missing status assignment in TaskService.update_status',
    sourceAgent: 'Debug Agent',
    file: 'src/services/task_service.py',
    lineNumber: 73,
    snippet: 'task.updated_at = datetime.utcnow()',
    details: 'The assignment `task.status = status` was missing before returning the task entity.',
    timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(),
    verifiedByBob: true,
  },
  {
    id: 'EVD-006',
    investigationId: 'INV-002',
    category: 'IBM Bob',
    title: 'IBM Bob 2.0 session capture: 03_status_investigation.png',
    sourceAgent: 'IBM Bob 2.0',
    file: 'bob_sessions/03_status_investigation.png',
    details: 'Verified task status mutation and field preservation across persistence layers.',
    timestamp: new Date(Date.now() - 3600000 * 4.6).toISOString(),
    verifiedByBob: true,
  },
];
