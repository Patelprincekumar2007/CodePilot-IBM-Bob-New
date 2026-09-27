"""
CodePilot — Gemini AI Provider
Uses Google Gemini API for deep code understanding, AST reasoning, and fix formulation.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional
import httpx

from src.ai.base import AIProvider, AIAnalysisResult, RootCauseFinding, EvidenceItemModel


class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    @property
    def name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    async def analyze_repository(self, repo_summary: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "architecture": ["API Layer", "Service Layer", "Repository Layer", "Model Layer"],
                "frameworks": ["FastAPI", "Pydantic"],
                "languages": ["Python"],
                "test_framework": "pytest",
            }

        prompt = f"""You are a principal software architect. Analyze this repository structure:
Repository Files: {json.dumps(repo_summary.get('file_list', [])[:60])}
Readme excerpt: {repo_summary.get('readme_excerpt', '')[:1000]}

Return pure JSON with keys: "languages" (list), "frameworks" (list), "architecture" (list), "entry_points" (list), "summary" (string)."""

        try:
            raw_resp = await self._call_gemini(prompt)
            data = self._extract_json(raw_resp)
            return data
        except Exception as e:
            return {
                "architecture": ["API Layer", "Service Layer", "Repository Layer"],
                "frameworks": ["FastAPI"],
                "languages": ["Python"],
                "error": str(e),
            }

    async def analyze_issue(
        self,
        repo_context: Dict[str, Any],
        issue: str,
        expected: Optional[str] = None,
        actual: Optional[str] = None,
        reproduction: Optional[str] = None,
    ) -> AIAnalysisResult:
        if not self.is_configured():
            raise ValueError("GEMINI_API_KEY is not configured in backend environment.")

        # Build prioritized context of important source files
        files_context = repo_context.get("files_content", {})
        files_summary = ""
        for file_path, content in list(files_context.items())[:15]:
            files_summary += f"\n--- FILE: {file_path} ---\n{content[:2500]}\n"

        prompt = f"""You are CodePilot's autonomous Debug & Root Cause Analysis Agent.
You are investigating a software defect in a real repository.

ISSUE REPORT:
Issue: {issue}
Expected: {expected or 'Not specified'}
Actual: {actual or 'Not specified'}
Reproduction: {reproduction or 'Not specified'}

REPOSITORY SOURCE CODE:
{files_summary}

TASK:
1. Identify the EXACT file and line number containing the root cause defect.
2. Formulate a precise explanation of the bug (what condition/code was wrong).
3. Provide the existing buggy code snippet and the exact fixed code snippet.
4. Provide structured evidence distinguishing observed vs expected behavior.
5. Identify affected downstream components and recommend 2-3 regression tests.

Return ONLY pure valid JSON in the following schema:
{{
  "summary": "Short 1-sentence summary of the defect",
  "root_cause": {{
    "file": "exact/relative/file/path.py",
    "function": "function_name",
    "line": 42,
    "line_end": 44,
    "title": "Clear concise defect title",
    "explanation": "Detailed root cause explanation",
    "confidence": 0.98,
    "severity": "high",
    "code_snippet": "original buggy lines",
    "fixed_snippet": "fixed replacement lines"
  }},
  "relevant_files": ["exact/file/path1.py", "exact/file/path2.py"],
  "evidence": [
    {{
      "category": "Root Cause",
      "title": "Evidence description",
      "file": "exact/file/path.py",
      "line": 42,
      "observed": "Observed faulty condition",
      "expected": "Expected correct behavior",
      "details": "Technical detail"
    }}
  ],
  "impact": ["Affected API endpoint", "Affected Service"],
  "recommended_fix": {{
    "summary": "Fix summary",
    "files": ["exact/file/path.py"],
    "changes": "+1, -1"
  }},
  "suggested_tests": ["test_name_1", "test_name_2"]
}}"""

        raw_resp = await self._call_gemini(prompt)
        parsed = self._extract_json(raw_resp)

        rc_data = parsed.get("root_cause", {})
        evidence_list = [
            EvidenceItemModel(**item) for item in parsed.get("evidence", [])
        ]

        return AIAnalysisResult(
            provider="gemini",
            is_live_ai=True,
            summary=parsed.get("summary", "Root cause identified"),
            root_cause=RootCauseFinding(**rc_data),
            relevant_files=parsed.get("relevant_files", []),
            evidence=evidence_list,
            impact=parsed.get("impact", []),
            recommended_fix=parsed.get("recommended_fix", {}),
            suggested_tests=parsed.get("suggested_tests", []),
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
