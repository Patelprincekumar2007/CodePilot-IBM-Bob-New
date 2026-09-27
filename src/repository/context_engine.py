"""
CodePilot — Repository Context & Intent Engine
Selects targeted context, detects user intent, creates analysis plans, and validates file references.
"""

import re
from typing import Any, Dict, List, Optional, Tuple


INTENT_KEYWORDS = {
    "OVERVIEW": ["overview", "summary", "what is this", "what does this repo", "explain repo", "walkthrough", "introduction", "high level"],
    "ARCHITECTURE": ["architecture", "layers", "design", "structure", "data flow", "how is this built", "component", "diagram"],
    "CODE_EXPLANATION": ["explain", "how does", "how do", "understand", "what does", "trace", "workflow"],
    "BUG_INVESTIGATION": ["why is", "why does", "fix", "bug", "broken", "failing", "error", "exception", "incorrect", "wrong", "patch", "crash", "persist", "progress"],
    "DEBUGGING": ["find bugs", "find defect", "audit bugs", "detect bugs", "debug", "issues in project", "all bugs", "hunt bugs"],
    "TEST_ANALYSIS": ["test", "tests", "coverage", "missing test", "untested", "unit test", "integration test", "pytest"],
    "SECURITY_REVIEW": ["security", "vulnerability", "auth", "sanitize", "injection", "permission", "jwt", "token", "secret", "cve"],
    "PERFORMANCE_ANALYSIS": ["slow", "performance", "latency", "n+1", "bottleneck", "optimize", "memory", "speed", "fast"],
    "API_ANALYSIS": ["api", "endpoint", "route", "post /", "get /", "put /", "delete /", "patch /", "router"],
}


class ContextEngine:
    def classify_intent(self, request_text: str) -> Tuple[str, str, List[str]]:
        """Classifies user request into intent category, analysis depth, and execution plan."""
        req_lower = request_text.lower().strip()

        # Check explicit debugging commands first
        if "find bug" in req_lower or "detect bug" in req_lower or "all bug" in req_lower or "hunt bug" in req_lower or "audit bug" in req_lower:
            intent = "DEBUGGING"
            depth = "deep"
            plan = [
                "Index repository AST and module hierarchy",
                "Perform cross-layer syntax and condition audits",
                "Inspect API endpoint parameter bindings",
                "Trace service state mutations and persistence logic",
                "Synthesize evidence-backed defect findings",
            ]
            return intent, depth, plan

        # Check intent categories
        matched_intent = "CODE_EXPLANATION"
        max_score = 0

        for category, keywords in INTENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in req_lower)
            if score > max_score:
                max_score = score
                matched_intent = category

        # Refine intent
        if max_score == 0:
            if "?" in req_lower or "how" in req_lower or "what" in req_lower:
                matched_intent = "CODE_EXPLANATION"
            else:
                matched_intent = "OVERVIEW"

        # Determine depth and plan
        if matched_intent in ["BUG_INVESTIGATION", "DEBUGGING", "SECURITY_REVIEW"]:
            depth = "deep"
            plan = [
                "Index full repository structure and dependency graph",
                "Select target API routers, services, and repository layers",
                "Trace execution paths and state transitions",
                "Pinpoint anomalies against expected business logic",
                "Synthesize minimal patch and regression test specifications",
            ]
        elif matched_intent in ["ARCHITECTURE", "API_ANALYSIS", "TEST_ANALYSIS", "PERFORMANCE_ANALYSIS"]:
            depth = "standard"
            plan = [
                "Index repository architectural boundaries",
                "Inspect routes, middleware, services, and schemas",
                "Correlate implementation logic with test coverage",
                "Structure comprehensive flow and component breakdown",
            ]
        else:
            depth = "quick"
            plan = [
                "Read repository metadata, README, and configuration",
                "Identify primary entry points and key modules",
                "Synthesize architectural summary and module directory",
            ]

        return matched_intent, depth, plan

    def retrieve_relevant_files(self, repo_index: Dict[str, Any], request_text: str, max_files: int = 12) -> List[str]:
        """Scores and selects the most relevant source files for a given natural language query."""
        all_files = repo_index.get("all_files", [])
        files_content = repo_index.get("files_content", {})
        req_words = set(re.findall(r"\w+", request_text.lower()))

        scored_files: List[Tuple[float, str]] = []

        for file_path in all_files:
            if file_path not in files_content:
                continue

            score = 0.0
            path_lower = file_path.lower()
            content_lower = files_content[file_path].lower()

            # Direct file name mention in query
            file_name = file_path.split("/")[-1].lower()
            if file_name in request_text.lower():
                score += 50.0

            # Match words in file path
            for word in req_words:
                if len(word) < 3:
                    continue
                if word in path_lower:
                    score += 15.0
                if word in content_lower:
                    # Count occurrences with cap
                    count = min(content_lower.count(word), 10)
                    score += count * 2.0

            # Priority for core architectural files
            if "service" in path_lower:
                score += 5.0
            if "api" in path_lower or "route" in path_lower:
                score += 4.0
            if "model" in path_lower or "schema" in path_lower:
                score += 3.0
            if "main.py" in path_lower or "app.py" in path_lower:
                score += 3.0
            if "test" in path_lower and ("test" in request_text.lower() or "bug" in request_text.lower()):
                score += 6.0

            if score > 0:
                scored_files.append((score, file_path))

        # Sort by relevance score
        scored_files.sort(key=lambda x: x[0], reverse=True)
        selected = [f for _, f in scored_files[:max_files]]

        # Fallback if no specific files matched: pick primary entry points and services
        if not selected:
            for f in repo_index.get("entry_points", []) + repo_index.get("service_modules", []) + repo_index.get("api_modules", []):
                name = f if isinstance(f, str) else f.get("file")
                if name and name in all_files and name not in selected:
                    selected.append(name)
                if len(selected) >= 5:
                    break

        return selected or all_files[:5]

    def validate_and_filter_files(self, repo_index: Dict[str, Any], candidate_files: List[str]) -> List[str]:
        """Ensures all referenced files actually exist in the repository to prevent AI hallucinations."""
        all_files_set = set(repo_index.get("all_files", []))
        valid_files = []
        for cf in candidate_files:
            clean_path = cf.strip().lstrip("/")
            if clean_path in all_files_set:
                valid_files.append(clean_path)
            else:
                # Check basename match
                for real_file in all_files_set:
                    if real_file.endswith(clean_path) or real_file.split("/")[-1] == clean_path.split("/")[-1]:
                        if real_file not in valid_files:
                            valid_files.append(real_file)
                        break
        return valid_files
