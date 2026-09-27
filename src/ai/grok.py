"""
CodePilot — Grok AI Provider
Uses xAI Grok API for reasoning across repository structures and formulating patches.
"""

import json
import os
from typing import Any, Dict, List, Optional
import httpx

from src.ai.base import AIProvider, AIAnalysisResult, RootCauseFinding, EvidenceItemModel


class GrokProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
        self.model = os.getenv("GROK_MODEL", "grok-2-latest")

    @property
    def name(self) -> str:
        return "grok"

    def is_configured(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    async def analyze_repository(self, repo_summary: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "architecture": ["API Layer", "Service Layer", "Repository Layer"],
                "frameworks": ["FastAPI", "Pydantic"],
                "languages": ["Python"],
                "test_framework": "pytest",
            }

        prompt = f"""You are a senior software architect. Analyze this repository:
Files: {json.dumps(repo_summary.get('file_list', [])[:60])}
Readme: {repo_summary.get('readme_excerpt', '')[:1000]}

Return pure JSON with keys: "languages", "frameworks", "architecture", "entry_points", "summary"."""

        try:
            raw_resp = await self._call_grok(prompt)
            return self._extract_json(raw_resp)
        except Exception as e:
            return {
                "architecture": ["API Layer", "Service Layer"],
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
            raise ValueError("GROK_API_KEY / XAI_API_KEY is not configured in backend environment.")

        files_context = repo_context.get("files_content", {})
        files_summary = ""
        for file_path, content in list(files_context.items())[:15]:
            files_summary += f"\n--- FILE: {file_path} ---\n{content[:2500]}\n"

        prompt = f"""You are CodePilot's autonomous Debug & Root Cause Analysis Agent powered by Grok.
Investigate this defect in the repository:

ISSUE:
{issue}
Expected: {expected or 'N/A'}
Actual: {actual or 'N/A'}
Reproduction: {reproduction or 'N/A'}

SOURCE FILES:
{files_summary}

Respond with pure JSON following this exact structure:
{{
  "summary": "Summary of root cause",
  "root_cause": {{
    "file": "path/to/file.py",
    "function": "function_name",
    "line": 42,
    "line_end": 44,
    "title": "Title of bug",
    "explanation": "Detailed explanation",
    "confidence": 0.98,
    "severity": "high",
    "code_snippet": "buggy snippet",
    "fixed_snippet": "fixed snippet"
  }},
  "relevant_files": ["path/to/file.py"],
  "evidence": [
    {{
      "category": "Root Cause",
      "title": "Evidence title",
      "file": "path/to/file.py",
      "line": 42,
      "observed": "Observed faulty condition",
      "expected": "Expected behavior",
      "details": "Details"
    }}
  ],
  "impact": ["Endpoint 1", "Service 2"],
  "recommended_fix": {{
    "summary": "Fix explanation",
    "files": ["path/to/file.py"]
  }},
  "suggested_tests": ["test_case_1", "test_case_2"]
}}"""

        raw_resp = await self._call_grok(prompt)
        parsed = self._extract_json(raw_resp)

        rc_data = parsed.get("root_cause", {})
        evidence_list = [
            EvidenceItemModel(**item) for item in parsed.get("evidence", [])
        ]

        return AIAnalysisResult(
            provider="grok",
            is_live_ai=True,
            summary=parsed.get("summary", "Root cause identified by Grok"),
            root_cause=RootCauseFinding(**rc_data),
            relevant_files=parsed.get("relevant_files", []),
            evidence=evidence_list,
            impact=parsed.get("impact", []),
            recommended_fix=parsed.get("recommended_fix", {}),
            suggested_tests=parsed.get("suggested_tests", []),
        )

    async def _call_grok(self, prompt: str) -> str:
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a code debugging agent that always outputs valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Grok API returned status {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

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
