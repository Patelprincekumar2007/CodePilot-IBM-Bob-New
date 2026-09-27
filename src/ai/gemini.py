"""
CodePilot — Gemini AI Universal Provider
Uses Google Gemini (gemini-1.5-flash / gemini-1.5-pro) for universal codebase reasoning, architecture mapping, debugging, and test synthesis.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional
import httpx

from src.ai.base import (
    AIProvider,
    UniversalAnalysisResult,
    FindingItem,
    RootCauseFinding,
    EvidenceItemModel,
)


class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    @property
    def name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    async def analyze_universal(
        self,
        repo_context: Dict[str, Any],
        request_text: str,
        intent: str,
        depth: str,
        relevant_files: List[str],
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> UniversalAnalysisResult:
        if not self.is_configured():
            raise ValueError("GEMINI_API_KEY is not configured in backend environment.")

        # Build focused context of source files
        files_content = repo_context.get("files_content", {})
        files_summary = ""
        for file_path in relevant_files[:12]:
            if file_path in files_content:
                files_summary += f"\n--- FILE: {file_path} ---\n{files_content[file_path][:3000]}\n"

        history_summary = ""
        if conversation_history:
            history_summary = "PRIOR CONVERSATION CONTEXT:\n"
            for msg in conversation_history[-4:]:
                history_summary += f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}\n"

        prompt = f"""You are CodePilot's autonomous AI Software Engineer & Repository Reasoner powered by Gemini.

REPOSITORY METADATA:
Project Name: {repo_context.get('name', 'repository')}
Languages: {repo_context.get('languages', ['Python'])}
Frameworks: {repo_context.get('frameworks', ['FastAPI'])}
Test Framework: {repo_context.get('test_framework', 'pytest')}
All Verified Repository Files: {json.dumps(repo_context.get('all_files', [])[:50])}

USER REQUEST:
"{request_text}"

DETECTED INTENT: {intent} (Depth: {depth})
{history_summary}

RELEVANT SOURCE CODE:
{files_summary}

INSTRUCTIONS:
1. Provide a clear, thorough, human-friendly technical answer in Markdown formatting.
2. If this is a BUG_INVESTIGATION, DEBUGGING, or ERROR_ANALYSIS:
   - Isolate root cause with exact file and line number.
   - Explain what code condition is erroneous.
   - Provide original code snippet and recommended fixed replacement snippet.
   - Formulate structured evidence distinguishing observed vs expected behavior.
   - Trace the execution flow through routes, services, and repositories.
   - Suggest 2-3 regression tests.
3. If this is an OVERVIEW or ARCHITECTURE query:
   - Provide high-level system architecture, module boundaries, entry points, and request flows.
4. If this is a TEST_ANALYSIS query:
   - Contrast implementation logic with existing test files and identify untested edge cases.
5. If this is a CODE_EXPLANATION or API_ANALYSIS query:
   - Trace step-by-step logic and identify important functions.
6. CRITICAL: Reference ONLY verified files that exist in the repository list. Never hallucinate fake paths.

Return ONLY pure valid JSON in this exact schema:
{{
  "intent": "{intent}",
  "summary": "Short 1-2 sentence executive summary",
  "answer": "Detailed, high-quality Markdown formatted answer with technical breakdown, code snippets, and explanations.",
  "execution_flow": ["Step 1: POST /endpoint", "Step 2: Service call", "Step 3: Repository persistence"],
  "root_cause": {{
    "file": "exact/relative/file/path.py",
    "function": "function_name",
    "line": 42,
    "line_end": 44,
    "title": "Clear defect title",
    "explanation": "Root cause explanation",
    "confidence": 0.98,
    "severity": "high",
    "code_snippet": "buggy lines",
    "fixed_snippet": "fixed lines"
  }},
  "findings": [
    {{
      "title": "Finding or defect title",
      "type": "bug",
      "file": "exact/file/path.py",
      "line": 42,
      "severity": "high",
      "confidence": 0.95,
      "description": "Explanation",
      "code_snippet": "faulty snippet",
      "fixed_snippet": "fixed snippet"
    }}
  ],
  "relevant_files": ["exact/file1.py", "exact/file2.py"],
  "evidence": [
    {{
      "category": "Root Cause",
      "title": "Evidence title",
      "file": "exact/file.py",
      "line": 42,
      "observed": "Observed faulty condition",
      "expected": "Expected behavior",
      "details": "Technical detail"
    }}
  ],
  "impact": ["Affected API endpoint", "Affected Service"],
  "recommended_fix": {{
    "summary": "Fix summary",
    "files": ["exact/file.py"],
    "changes": "+1, -1"
  }},
  "suggested_tests": ["test_name_1", "test_name_2"]
}}"""

        raw_resp = await self._call_gemini(prompt)
        parsed = self._extract_json(raw_resp)

        # Parse root cause if present
        rc_data = parsed.get("root_cause")
        root_cause_obj = RootCauseFinding(**rc_data) if rc_data and rc_data.get("file") else None

        # Parse findings
        findings_list = []
        for f in parsed.get("findings", []):
            try:
                findings_list.append(FindingItem(**f))
            except Exception:
                pass

        # If we have root_cause but no findings, create a finding from root_cause
        if root_cause_obj and not findings_list:
            findings_list.append(
                FindingItem(
                    title=root_cause_obj.title,
                    type="bug",
                    file=root_cause_obj.file,
                    function_name=root_cause_obj.function,
                    line=root_cause_obj.line,
                    line_end=root_cause_obj.line_end,
                    severity=root_cause_obj.severity,
                    confidence=root_cause_obj.confidence,
                    code_snippet=root_cause_obj.code_snippet,
                    fixed_snippet=root_cause_obj.fixed_snippet,
                    description=root_cause_obj.explanation,
                )
            )

        evidence_list = []
        for ev in parsed.get("evidence", []):
            try:
                evidence_list.append(EvidenceItemModel(**ev))
            except Exception:
                pass

        return UniversalAnalysisResult(
            provider="gemini",
            is_live_ai=True,
            intent=parsed.get("intent", intent),
            depth=depth,
            plan=repo_context.get("plan", []),
            summary=parsed.get("summary", "Analysis completed successfully."),
            answer=parsed.get("answer", parsed.get("summary", "")),
            findings=findings_list,
            root_cause=root_cause_obj,
            relevant_files=parsed.get("relevant_files", relevant_files[:5]),
            evidence=evidence_list,
            impact=parsed.get("impact", []),
            recommended_fix=parsed.get("recommended_fix"),
            suggested_tests=parsed.get("suggested_tests", []),
            execution_flow=parsed.get("execution_flow", []),
        )

    async def _call_gemini(self, prompt: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self._api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("No candidate response returned by Gemini")
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise RuntimeError("Empty response parts from Gemini")
            return parts[0].get("text", "")

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)
