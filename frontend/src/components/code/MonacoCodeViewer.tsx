import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { FileCode2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MonacoCodeViewerProps {
  filePath: string;
  code: string;
  language?: string;
  targetLine?: number;
  height?: string;
  className?: string;
}

export const MonacoCodeViewer: React.FC<MonacoCodeViewerProps> = ({
  filePath,
  code,
  language = 'python',
  targetLine,
  height = '360px',
  className,
}) => {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
    editorRef.current = editor;
    if (targetLine) {
      editor.revealLineInCenter(targetLine);
      editor.setPosition({ lineNumber: targetLine, column: 1 });
    }
  };

  useEffect(() => {
    if (editorRef.current && targetLine) {
      editorRef.current.revealLineInCenter(targetLine);
      editorRef.current.setPosition({ lineNumber: targetLine, column: 1 });
    }
  }, [targetLine]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg border border-border bg-[#0E1118] overflow-hidden ${className}`}>
      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background-elevated font-mono text-xs">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-accent-indigo" />
          <span className="font-semibold text-white">{filePath}</span>
          {targetLine && (
            <span className="px-1.5 py-0.2 rounded bg-accent-indigo/20 text-indigo-300 text-[10px]">
              Line {targetLine}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-console-muted hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Monaco Editor Container */}
      <Editor
        height={height}
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: 'all',
          cursorStyle: 'line',
          padding: { top: 8, bottom: 8 },
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
