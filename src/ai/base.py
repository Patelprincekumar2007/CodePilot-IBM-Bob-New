"""
CodePilot — AI Provider Base Interface
Defines the standard abstraction for all generative reasoning models (Gemini, Grok, etc.).
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RootCauseFinding(BaseModel):
    file: str
    function: Optional[str] = None
    line: int
    line_end: Optional[int] = None
    title: str
    explanation: str
    confidence: float = 0.95
    severity: str = "high"
    code_snippet: Optional[str] = None
    fixed_snippet: Optional[str] = None


class EvidenceItemModel(BaseModel):
    category: str = "Root Cause"
    title: str
    file: Optional[str] = None
    line: Optional[int] = None
    details: str
    observed: Optional[str] = None
    expected: Optional[str] = None


class AIAnalysisResult(BaseModel):
    provider: str
    is_live_ai: bool = True
    summary: str
    root_cause: RootCauseFinding
    relevant_files: List[str]
    evidence: List[EvidenceItemModel]
    impact: List[str]
    recommended_fix: Dict[str, Any]
    suggested_tests: List[str]


class AIProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider (e.g., 'gemini', 'grok')"""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required API key is present in environment."""
        pass

    @abstractmethod
    async def analyze_repository(self, repo_summary: Dict[str, Any]) -> Dict[str, Any]:
        """Analyzes high-level repository architecture and key modules."""
        pass

    @abstractmethod
    async def analyze_issue(
        self,
        repo_context: Dict[str, Any],
        issue: str,
        expected: Optional[str] = None,
        actual: Optional[str] = None,
        reproduction: Optional[str] = None,
    ) -> AIAnalysisResult:
        """Analyzes a bug report or symptom against repository files and isolates root cause."""
        pass
