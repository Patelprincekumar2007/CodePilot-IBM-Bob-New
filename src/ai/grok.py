"""
CodePilot — Grok AI Universal Provider
Uses xAI Grok (grok-2-latest) for universal codebase reasoning, architecture mapping, debugging, and test synthesis.
"""

import json
import os
from typing import Any, Dict, List, Optional
import httpx

from src.ai.base import (
    AIProvider,
    UniversalAnalysisResult,
    FindingItem,
    RootCauseFinding,
    EvidenceItemModel,
)


class GrokProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
        self.model = os.getenv("GROK_MODEL", "grok-2-latest")

    @property
    def name(self) -> str:
        return "grok"

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
            raise ValueError("GROK_API_KEY / XAI_API_KEY is not configured in backend environment.")

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

        prompt = f"""You are CodePilot's autonomous AI Software Engineer powered by Grok.

REPOSITORY:
Name: {repo_context.get('name', 'repository')}
Languages: {repo_context.get('languages', ['Python'])}
Frameworks: {repo_context.get('frameworks', ['FastAPI'])}
Files: {json.dumps(repo_context.get('all_files', [])[:50])}

USER REQUEST:
"{request_text}"

INTENT: {intent} (Depth: {depth})
{history_summary}

SOURCE CODE:
{files_summary}

Respond in pure valid JSON conforming to this schema:
{{
  "intent": "{intent}",
  "summary": "Concise 1-2 sentence executive summary",
  "answer": "Comprehensive Markdown-formatted technical response.",
  "execution_flow": ["Step 1", "Step 2", "Step 3"],
  "root_cause": {{
    "file": "path/to/file.py",
    "function": "func_name",
    "line": 42,
    "line_end": 44,
    "title": "Bug Title",
    "explanation": "Detailed explanation",
    "confidence": 0.98,
    "severity": "high",
    "code_snippet": "buggy code",
    "fixed_snippet": "fixed code"
  }},
  "findings": [
    {{
      "title": "Finding Title",
      "type": "bug",
      "file": "path/to/file.py",
      "line": 42,
      "severity": "high",
      "confidence": 0.95,
      "description": "Details",
      "code_snippet": "snippet",
      "fixed_snippet": "fix"
    }}
  ],
  "relevant_files": ["path/to/file.py"],
  "evidence": [
    {{
      "category": "Root Cause",
      "title": "Evidence Title",
      "file": "path/to/file.py",
      "line": 42,
      "observed": "Observed state",
      "expected": "Expected state",
      "details": "Technical detail"
    }}
  ],
  "impact": ["Component A", "Component B"],
  "recommended_fix": {{
    "summary": "Fix explanation",
    "files": ["path/to/file.py"]
  }},
  "suggested_tests": ["test_case_1", "test_case_2"]
}}"""

        raw_resp = await self._call_grok(prompt)
        parsed = self._extract_json(raw_resp)

        rc_data = parsed.get("root_cause")
        root_cause_obj = RootCauseFinding(**rc_data) if rc_data and rc_data.get("file") else None

        findings_list = []
        for f in parsed.get("findings", []):
            try:
                findings_list.append(FindingItem(**f))
            except Exception:
                pass

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
            provider="grok",
            is_live_ai=True,
            intent=parsed.get("intent", intent),
            depth=depth,
            plan=repo_context.get("plan", []),
            summary=parsed.get("summary", "Analysis complete."),
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

    async def _call_grok(self, prompt: str) -> str:
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a senior software engineer that responds in pure valid JSON."},
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
