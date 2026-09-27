import React from 'react';

interface MarkdownViewProps {
  content: string;
  onFileClick?: (filePath: string) => void;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, onFileClick, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let codeBlockBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';

  lines.forEach((line, index) => {
    // Code block open/close
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBlockBuffer.join('\n');
        renderedElements.push(
          <div key={`code-${index}`} className="my-3 rounded-lg bg-background-tertiary border border-border p-3 overflow-x-auto font-mono text-xs text-emerald-400">
            {codeBlockLang && (
              <div className="text-[10px] text-console-dim font-bold uppercase mb-1 border-b border-border/50 pb-1">
                {codeBlockLang}
              </div>
            )}
            <pre className="whitespace-pre">{codeText}</pre>
          </div>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={index} className="text-sm font-bold text-white mt-4 mb-1 font-mono tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
          {formatInline(line.slice(5), onFileClick)}
        </h4>
      );
      return;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={index} className="text-base font-bold text-white mt-5 mb-2 font-mono tracking-tight pb-1 border-b border-border/60">
          {formatInline(line.slice(4), onFileClick)}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={index} className="text-lg font-bold text-white mt-6 mb-2 font-mono tracking-tight pb-1.5 border-b border-border">
          {formatInline(line.slice(3), onFileClick)}
        </h2>
      );
      return;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().slice(2);
      renderedElements.push(
        <li key={index} className="ml-4 list-disc text-console-text text-xs leading-relaxed my-1">
          {formatInline(text, onFileClick)}
        </li>
      );
      return;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderedElements.push(
        <div key={index} className="ml-2 flex items-start gap-2 my-1 text-xs text-console-text">
          <span className="font-mono text-accent-indigo font-bold shrink-0">{numMatch[1]}.</span>
          <div className="leading-relaxed">{formatInline(numMatch[2], onFileClick)}</div>
        </div>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      renderedElements.push(<div key={index} className="h-2" />);
      return;
    }

    // Regular paragraphs
    renderedElements.push(
      <p key={index} className="text-console-text text-xs leading-relaxed my-1.5">
        {formatInline(line, onFileClick)}
      </p>
    );
  });

  return <div className={`space-y-1 font-sans ${className}`}>{renderedElements}</div>;
};

function formatInline(text: string, onFileClick?: (file: string) => void): React.ReactNode {
  // Regex to match `code`, **bold**, [file](path)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Markdown Links [text](url) or [file](path)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // 2. Bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // 3. Inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find earliest match
    let earliestIndex = remaining.length;
    let matchType: 'link' | 'bold' | 'code' | null = null;
    let bestMatch: RegExpMatchArray | null = null;

    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < earliestIndex) {
      earliestIndex = linkMatch.index;
      matchType = 'link';
      bestMatch = linkMatch;
    }
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
      earliestIndex = boldMatch.index;
      matchType = 'bold';
      bestMatch = boldMatch;
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
      earliestIndex = codeMatch.index;
      matchType = 'code';
      bestMatch = codeMatch;
    }

    if (!bestMatch || earliestIndex === remaining.length) {
      parts.push(remaining);
      break;
    }

    // Push text before match
    if (earliestIndex > 0) {
      parts.push(remaining.substring(0, earliestIndex));
    }

    // Push matched element
    if (matchType === 'link') {
      const linkText = bestMatch[1];
      const linkTarget = bestMatch[2];
      const isLocalFile = linkTarget.includes('.py') || linkTarget.includes('.ts') || linkTarget.includes('.js') || linkTarget.startsWith('file://');
      
      parts.push(
        <button
          key={`inline-${keyIdx++}`}
          type="button"
          onClick={() => onFileClick?.(linkTarget.replace('file:///', '').replace('file://', ''))}
          className="text-accent-indigo hover:text-indigo-300 underline font-mono text-xs inline-flex items-center gap-0.5"
        >
          {linkText}
        </button>
      );
    } else if (matchType === 'bold') {
      parts.push(
        <strong key={`inline-${keyIdx++}`} className="font-bold text-white">
          {bestMatch[1]}
        </strong>
      );
    } else if (matchType === 'code') {
      const codeStr = bestMatch[1];
      const isFileLike = codeStr.includes('.py') || codeStr.includes('.ts') || codeStr.includes('.json') || codeStr.startsWith('src/');
      parts.push(
        <span
          key={`inline-${keyIdx++}`}
          onClick={() => isFileLike && onFileClick?.(codeStr)}
          className={`px-1.5 py-0.5 rounded bg-background-elevated border border-border text-console-text font-mono text-[11px] ${
            isFileLike ? 'cursor-pointer hover:border-accent-indigo hover:text-white' : ''
          }`}
        >
          {codeStr}
        </span>
      );
    }

    remaining = remaining.substring(earliestIndex + bestMatch[0].length);
  }

  return parts;
}
