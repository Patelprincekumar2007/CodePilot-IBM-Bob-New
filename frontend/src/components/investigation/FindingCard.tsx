import React from 'react';
import { Finding } from '../../types/investigation';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  AlertCircle,
  FileCode2,
  CheckCircle2,
  Code2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
  onSelectCode?: (file: string, line: number) => void;
  isSelected?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onSelectCode,
  isSelected = false,
}) => {
  const confidencePercent = Math.round(finding.confidence * 100);

  return (
    <Card
      className={`transition-all duration-150 border ${
        isSelected
          ? 'border-accent-indigo shadow-glow-indigo bg-background-card'
          : 'border-border hover:border-border-highlight bg-background-card/90'
      }`}
    >
      <CardHeader className="py-3 px-4 bg-background-elevated/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
              {finding.type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              {confidencePercent}% Confidence
            </Badge>
            <Badge
              variant={
                finding.severity === 'high' || finding.severity === 'critical'
                  ? 'danger'
                  : 'warning'
              }
              size="sm"
            >
              {finding.severity.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 font-mono text-xs">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {finding.title}
          </h4>
          <p className="mt-1 text-console-muted leading-relaxed font-sans text-xs">
            {finding.description}
          </p>
        </div>

        {/* Location & Navigation */}
        <div className="flex items-center justify-between p-2.5 rounded bg-background-elevated border border-border">
          <div className="flex items-center gap-2 truncate">
            <FileCode2 className="w-3.5 h-3.5 text-accent-indigo shrink-0" />
            <span className="text-console-text font-semibold truncate">
              {finding.file}
            </span>
            {finding.functionName && (
              <span className="text-console-dim truncate">→ {finding.functionName}()</span>
            )}
            <span className="text-indigo-400 font-bold shrink-0">
              :L{finding.lineStart}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCode?.(finding.file, finding.lineStart)}
            className="flex items-center gap-1 text-[11px] font-bold text-accent-indigo hover:text-indigo-300 hover:underline shrink-0 ml-2"
          >
            <span>Jump to Code</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Code Preview snippet */}
        {finding.codeSnippet && (
          <div className="rounded border border-border overflow-hidden">
            <div className="px-3 py-1 bg-background-elevated border-b border-border text-[10px] text-console-dim flex items-center justify-between">
              <span>Diagnosed snippet (L{finding.lineStart}-L{finding.lineEnd})</span>
              <span className="text-rose-400 font-bold">FAULT DETECTED</span>
            </div>
            <pre className="p-3 bg-[#0A0D14] text-[11px] text-rose-300 overflow-x-auto leading-5 font-mono">
              <code>{finding.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Related Tests */}
        {finding.relatedTests.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-console-dim">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Regression Suite:</span>
            <span className="text-console-muted truncate">
              {finding.relatedTests.join(', ')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
