# CodePilot — AI-Powered Autonomous Debugging & Repository Investigation Platform

> **AI Proposes. Evidence Proves. Humans Decide.**

CodePilot is an autonomous, AI-driven developer investigation platform built for rapid bug diagnosis, AST multi-layer tracing, fix proposal, regression test synthesis, and test verification.

---

## 🚀 Quickstart (Run on Local PC)

### 1. Prerequisites
* **Python**: `3.10+` (e.g. Python 3.11 / 3.12 / 3.14)
* **Node.js**: `v18+` or `v20+` (npm included)
* **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/Patelprincekumar2007/CodePilot-IBM-Bob.git
cd CodePilot-IBM-Bob
```

### 3. Backend Setup & Run
```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# (Optional) Add your AI keys to .env
cp .env.example .env
# Edit .env and add GEMINI_API_KEY=... or GROK_API_KEY=...

# Start FastAPI Backend Server
uvicorn src.main:app --reload --port 8000
```
Backend is live at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 4. Frontend Setup & Run (React + Vite + TypeScript)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend is live at: **[http://localhost:3000](http://localhost:3000)**.

### 5. Running Automated Tests
```bash
source venv/bin/activate
pytest
```
Verified result: **41 passed** across all test suites.

---

## 🧠 AI Provider Integration (Gemini & Grok)

CodePilot features a unified AI provider interface:

```text
React Frontend
      ↓
FastAPI Backend (src/api/)
      ↓
AIService (src/ai/service.py)
 ┌────────────┼────────────┐
 ↓            ↓            ↓
Gemini       Grok       IBM Bob AST
(Google)    (xAI)     (Local Engine)
```

### Supported Providers:
1. **Google Gemini (`gemini-1.5-flash` / `gemini-1.5-pro`)**: Deep AST code reasoning and fix formulation.
2. **xAI Grok (`grok-2-latest` / `grok-beta`)**: Autonomous defect investigation and regression test synthesis.
3. **IBM Bob 2.0 Local AST Engine**: High-fidelity zero-config local heuristics engine that operates without API keys for demo and offline environments.

### Environment Configuration (`.env`)
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROK_API_KEY=your_grok_api_key_here
DEFAULT_AI_PROVIDER=gemini
MAX_UPLOAD_SIZE_MB=100
MAX_FILE_SIZE_MB=2
REPOSITORY_STORAGE_PATH=./storage/repositories
```

---

## 📦 Repository Ingestion (ZIP Upload & Git Clones)

CodePilot allows you to analyze any codebase:
* **Upload ZIP**: Drag-and-drop or browse `.zip` archives. CodePilot extracts files into isolated storage, validates paths against directory traversal, and builds an interactive file tree.
* **Connect Git**: Enter a public/private Git repository URL and branch name. CodePilot shallow-clones the repo and parses AST structures.
* **TaskFlow Demo Repository**: Built-in testbed for instant evaluation of real bug scenarios.

---

## 🖥 Application Architecture & Routes

```text
CodePilot-IBM-Bob/
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind UI
│   ├── src/
│   │   ├── app/                  # React Router & QueryClient providers
│   │   ├── api/                  # Typed backend clients (repos, investigations, tests)
│   │   ├── components/
│   │   │   ├── layout/           # AppShell, Topbar, Sidebar, CommandPalette (⌘K)
│   │   │   ├── investigation/    # Stepper, FindingCard, MonacoCodeViewer, ApprovalPanel
│   │   │   ├── code/             # MonacoCodeViewer, MonacoDiffViewer, FileTreeExplorer
│   │   │   ├── review/           # Interactive ImpactGraph, ReviewPanel checklists
│   │   │   ├── tests/            # TestRunCard, regression test assertions
│   │   │   └── dashboard/        # IssueComposer, DemoScenarioSelector, Metrics
│   │   └── pages/                # Dashboard, Investigations, Detail, Repos, Evidence, Settings
├── src/                          # FastAPI Backend
│   ├── ai/                       # GeminiProvider, GrokProvider, AIService
│   ├── analysis/                 # RepositoryAnalyzer (languages, frameworks, entrypoints)
│   ├── services/                 # RepositoryIngestion, TaskService, ProjectService, UserService
│   ├── api/                      # RepositoriesRouter, InvestigationsRouter, TaskFlow Routers
│   └── main.py                   # FastAPI Application Entrypoint
├── tests/                        # Automated Pytest Suite (41 tests)
├── data/                         # Real Bug Reports JSON
└── docs/                         # Architecture & Frontend-Backend Contract
```

---

## 🔍 Demonstrated Bug Scenarios (TaskFlow API)

1. **Incorrect Project Progress Calculation (`INV-001`)**:
   - *Location*: `src/services/project_service.py:42`
   - *Defect*: `t.status != TaskStatus.DONE` inverted the percentage of completed tasks.
   - *Fix*: Replaced with `t.status == TaskStatus.DONE`.
   - *Regressions*: `test_progress_with_mixed_task_states`, `test_progress_with_no_completed_tasks`, `test_progress_with_all_completed_tasks`.

2. **Task Status Update Not Persisting (`INV-002`)**:
   - *Location*: `src/services/task_service.py:73`
   - *Defect*: Returned task without assigning `task.status = status`.
   - *Fix*: Added explicit `task.status = status` before persisting.
   - *Regressions*: `test_update_task_status_done`, `test_status_update_preserves_assignee`.

3. **Task Filter Arguments Swapped (`INV-003`)**:
   - *Location*: `src/api/tasks.py:34`
   - *Defect*: `status` and `assignee_id` query arguments were forwarded in inverted order.
   - *Fix*: Mapped `status=status` and `assignee_id=assignee_id`.
   - *Regressions*: `test_list_tasks_by_status`, `test_list_tasks_by_assignee`.

---

## 🏆 Key Features

* **Evidence-Backed Findings**: Every finding specifies exact file, line number, confidence score, observed vs expected behavior, and code snippet.
* **Monaco Code & Diff Viewer**: Side-by-side diffs with a *"Why this change?"* explanation.
* **Human-in-the-Loop Approval**: Strict verification gates where engineers inspect and approve diffs before patches are applied.
* **Interactive Impact Graph**: Visual topology of affected endpoints, services, schemas, and test suites.
* **Automated Pytest Execution**: One-click real test runner execution verifying all 41 unit & regression tests.
* **Command Palette (`Cmd/Ctrl + K`)**: Instant keyboard navigation across investigations, repositories, and tools.
