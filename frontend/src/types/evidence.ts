export type EvidenceCategory =
  | 'Repository'
  | 'Execution'
  | 'Root Cause'
  | 'Tests'
  | 'Code Changes'
  | 'Review'
  | 'IBM Bob';

export interface EvidenceItem {
  id: string; // e.g. "EVD-012"
  investigationId: string;
  category: EvidenceCategory;
  title: string;
  sourceAgent: string;
  file?: string;
  lineNumber?: number;
  snippet?: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
  verifiedByBob?: boolean;
}
