"""
CodePilot — Universal AI Provider Base Interface
Defines the standard contract for universal codebase understanding, debugging, architecture, and testing.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FindingItem(BaseModel):
    id: Optional[str] = None
    type: str = "bug"  # "bug", "architecture", "security", "performance", "test_gap", "style"
    title: str
    description: str
    file: Optional[str] = None
    function_name: Optional[str] = None
    line: Optional[int] = None
    line_end: Optional[int] = None
    severity: str = "medium"  # "critical", "high", "medium", "low", "info"
    confidence: float = 0.95
    code_snippet: Optional[str] = None
    fixed_snippet: Optional[str] = None
    explanation: Optional[str] = None


class EvidenceItemModel(BaseModel):
    category: str = "Root Cause"
    title: str
    file: Optional[str] = None
    line: Optional[int] = None
    details: str
    observed: Optional[str] = None
    expected: Optional[str] = None


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


class UniversalAnalysisResult(BaseModel):
    provider: str
    is_live_ai: bool = True
    intent: str = "OVERVIEW"  # OVERVIEW, ARCHITECTURE, CODE_EXPLANATION, BUG_INVESTIGATION, DEBUGGING, TEST_ANALYSIS, etc.
    depth: str = "standard"  # quick, standard, deep
    plan: List[str] = Field(default_factory=list)
    summary: str
    answer: str
    findings: List[FindingItem] = Field(default_factory=list)
    root_cause: Optional[RootCauseFinding] = None
    relevant_files: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItemModel] = Field(default_factory=list)
    impact: List[str] = Field(default_factory=list)
    recommended_fix: Optional[Dict[str, Any]] = None
    suggested_tests: List[str] = Field(default_factory=list)
    execution_flow: List[str] = Field(default_factory=list)


class AIProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider (e.g., 'gemini', 'grok')"""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required API key is present in backend environment."""
        pass

    @abstractmethod
    async def analyze_universal(
        self,
        repo_context: Dict[str, Any],
        request_text: str,
        intent: str,
        depth: str,
        relevant_files: List[str],
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> UniversalAnalysisResult:
        """Universal analysis reasoning across repository code for any query."""
        pass
