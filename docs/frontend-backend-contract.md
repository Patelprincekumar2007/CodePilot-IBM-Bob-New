# CodePilot Frontend-Backend Contract Specification

## Overview
This document specifies the communication contract between the CodePilot React Frontend (`frontend/`) and the Backend APIs / Investigation Agent Orchestration Layer.

---

## 1. Existing TaskFlow Core Endpoints (FastAPI)

Base URL: `http://localhost:8000`

### Health & Diagnostics
* `GET /health` → `{"status": "ok"}`

### Users
* `POST /users` → Create user (`{ name, email }` → `UserResponse`)
* `GET /users` → List all users (`UserResponse[]`)
* `GET /users/{id}` → Retrieve user by ID

### Projects
* `POST /projects` → Create project (`{ name, description, owner_id }`)
* `GET /projects` → List all projects
* `GET /projects/{id}` → Retrieve project by ID
* `POST /projects/{id}/members` → Add member (`{ user_id }`)
* `GET /projects/{id}/progress` → Retrieve project progress (`{ project_id, total_tasks, completed_tasks, progress_percent }`)

### Tasks
* `POST /tasks` → Create task (`{ title, description, project_id, assignee_id?, status? }`)
* `GET /tasks?project_id=&status=&assignee_id=` → Filter & list tasks
* `GET /tasks/{id}` → Retrieve task by ID
* `PATCH /tasks/{id}/status` → Update status (`{ status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED" }`)
* `PUT /tasks/{id}/assign` → Assign task (`{ assignee_id }`)

---

## 2. CodePilot Investigation & Agent Orchestration API Contract

These endpoints govern AI agent workflows, dynamic code investigation, automated root-cause discovery, impact graph generation, test suite execution, patch proposal, and human approval.

### 2.1 Investigation Lifecycle Endpoints

#### `POST /api/investigations`
Starts a new investigation.
* **Request**:
```json
{
  "repository": "taskflow-api",
  "branch": "main",
  "issue": "Project progress is incorrect when a project contains both completed and incomplete tasks.",
  "expected_behavior": "40% completion for 2/5 DONE tasks",
  "actual_behavior": "Returns 60% completion",
  "reproduction_steps": "1. Create project with 5 tasks. 2. Mark 2 tasks DONE. 3. Call GET /projects/{id}/progress",
  "issue_url": "https://github.com/Patelprincekumar2007/CodePilot-IBM-Bob/issues/1"
}
```
* **Response**: `Investigation` object with status `running` and active agent pipeline.

#### `GET /api/investigations`
Returns list of all investigations with summary stats, status, risk badges, and timestamps.

#### `GET /api/investigations/{id}`
Returns complete investigation model including:
- Workflow stage (`analyze` | `diagnose` | `impact` | `fix` | `test` | `review` | `verify`)
- Agent timeline & activity (`Repository Agent`, `Debug Agent`, `Impact Agent`, `Test Agent`, `Review Agent`, `IBM Bob 2.0 Agent`)
- Findings (root-cause location, file, line number, confidence, snippet)
- Impact analysis graph (affected services, callers, API routes)
- Proposed code diff (before / after / rationale)
- Verification test run (41 passed, duration, regression results)
- Independent review status & checklists
- Structured evidence references

#### `POST /api/investigations/{id}/approve`
Submits human approval decision for proposed fix patch.
* **Request**:
```json
{
  "decision": "approved", // or "rejected"
  "comment": "Verified root cause fix in project_service.py line 42",
  "applied_by": "lead-engineer"
}
```

#### `POST /api/investigations/{id}/verify`
Re-runs full automated test suite against the applied patch.
* **Response**:
```json
{
  "status": "passed",
  "total_tests": 41,
  "passed": 41,
  "failed": 0,
  "duration_seconds": 0.59,
  "regression_tests_passed": [
    "test_progress_with_mixed_task_states",
    "test_progress_with_no_completed_tasks",
    "test_progress_with_all_completed_tasks"
  ]
}
```

---

## 3. Frontend Architecture & Adapter Strategy

The React frontend includes a robust, strongly typed API layer in `src/api/` with an intelligent client architecture:
1. **Live Backend Connectivity**: Automatically queries live FastAPI backend endpoints (`/health`, `/tasks`, `/projects`, `/users`).
2. **Investigation Adapter & Simulator**: For investigation pipelines, it seamlessly connects to live backend state and provides realistic, step-by-step real-time agent execution with TanStack Query caching and WebSocket/SSE support.
