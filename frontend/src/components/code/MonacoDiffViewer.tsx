import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { DiffChange } from '../../types/investigation';
import { GitCompare, Lightbulb, FileCode } from 'lucide-react';

interface MonacoDiffViewerProps {
  diff: DiffChange;
  height?: string;
  className?: string;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  diff,
  height = '280px',
  className,
}) => {
  return (
    <div className={`rounded-lg border border-border bg-[#0E1118] overflow-hidden ${className}`}>
      {/* Diff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 border-b border-border bg-background-elevated font-mono text-xs gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-accent-indigo" />
          <span className="font-semibold text-white">{diff.file}</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold">
            {diff.status}
          </span>
        </div>

        <div className="text-[11px] text-console-muted">
          Lines {diff.lineStart} - {diff.lineEnd}
        </div>
      </div>

      {/* Rationale Bar */}
      {diff.explanation && (
        <div className="px-4 py-2 bg-accent-indigo/10 border-b border-border flex items-start gap-2 text-xs font-sans text-indigo-200">
          <Lightbulb className="w-4 h-4 text-accent-indigo shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold font-mono text-white mr-1.5">Why this change?</span>
            <span>{diff.explanation}</span>
          </div>
        </div>
      )}

      {/* Monaco Diff Editor */}
      <DiffEditor
        height={height}
        language="python"
        original={diff.originalCode}
        modified={diff.modifiedCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderSideBySide: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
};
