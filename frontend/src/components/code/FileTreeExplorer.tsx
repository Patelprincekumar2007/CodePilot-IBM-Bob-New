import React, { useState } from 'react';
import { FileTreeNode } from '../../types/repository';
import {
  Folder,
  FolderOpen,
  FileCode2,
  ChevronRight,
  ChevronDown,
  FileText,
} from 'lucide-react';

interface FileTreeExplorerProps {
  nodes: FileTreeNode[];
  selectedFile?: string;
  onSelectFile: (path: string) => void;
}

const TreeNode: React.FC<{
  node: FileTreeNode;
  depth: number;
  selectedFile?: string;
  onSelectFile: (path: string) => void;
}> = ({ node, depth, selectedFile, onSelectFile }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isDirectory = node.type === 'directory';
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded text-xs font-mono cursor-pointer transition-colors select-none ${
          isSelected
            ? 'bg-accent-indigo text-white font-semibold'
            : 'text-console-muted hover:text-white hover:bg-background-tertiary'
        }`}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-console-dim" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-console-dim" />
            )}
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-accent-indigo" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-accent-indigo" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileCode2
              className={`w-3.5 h-3.5 ${
                node.name.endsWith('.py')
                  ? 'text-accent-blue'
                  : node.name.endsWith('.md')
                  ? 'text-emerald-400'
                  : 'text-console-dim'
              }`}
            />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({
  nodes,
  selectedFile,
  onSelectFile,
}) => {
  return (
    <div className="p-2 space-y-0.5 overflow-y-auto max-h-[500px]">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
};
