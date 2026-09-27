import React, { useState, useRef, useEffect } from 'react';
import { GitBranch, FolderGit2, ChevronDown, Check } from 'lucide-react';
import { useRepositories } from '../../hooks/useRepositories';

export const RepositorySelector: React.FC = () => {
  const { data: repos } = useRepositories();
  const [selectedRepo, setSelectedRepo] = useState('taskflow-api');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isRepoOpen, setIsRepoOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const repoRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (repoRef.current && !repoRef.current.contains(e.target as Node)) {
        setIsRepoOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRepoObj = repos?.find((r) => r.name === selectedRepo) || repos?.[0];
  const branches = currentRepoObj?.branches || ['main', 'feature/frontend-react-ui'];

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      {/* Repository Picker */}
      <div className="relative" ref={repoRef}>
        <button
          onClick={() => setIsRepoOpen(!isRepoOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background-elevated hover:bg-background-tertiary border border-border text-console-text transition-colors"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
          <span className="font-semibold text-white">{selectedRepo}</span>
          <ChevronDown className="w-3 h-3 text-console-dim" />
        </button>

        {isRepoOpen && (
          <div className="absolute left-0 mt-1 w-56 rounded-md bg-background-card border border-border shadow-elevated z-50 py-1">
            <div className="px-3 py-1 text-[10px] text-console-dim uppercase tracking-wider font-semibold">
              Repositories
            </div>
            {repos?.map((repo) => (
              <button
                key={repo.id}
                onClick={() => {
                  setSelectedRepo(repo.name);
                  setIsRepoOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs text-console-muted hover:text-white hover:bg-background-tertiary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-accent-indigo" />
                  <span>{repo.name}</span>
                </div>
                {selectedRepo === repo.name && <Check className="w-3.5 h-3.5 text-accent-indigo" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="text-console-dim">/</span>

      {/* Branch Picker */}
      <div className="relative" ref={branchRef}>
        <button
          onClick={() => setIsBranchOpen(!isBranchOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background-elevated hover:bg-background-tertiary border border-border text-console-muted hover:text-console-text transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-console-dim" />
          <span>{selectedBranch}</span>
          <ChevronDown className="w-3 h-3 text-console-dim" />
        </button>

        {isBranchOpen && (
          <div className="absolute left-0 mt-1 w-64 rounded-md bg-background-card border border-border shadow-elevated z-50 py-1">
            <div className="px-3 py-1 text-[10px] text-console-dim uppercase tracking-wider font-semibold">
              Branches
            </div>
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => {
                  setSelectedBranch(branch);
                  setIsBranchOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs text-console-muted hover:text-white hover:bg-background-tertiary transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <GitBranch className="w-3.5 h-3.5 text-console-dim shrink-0" />
                  <span className="truncate">{branch}</span>
                </div>
                {selectedBranch === branch && <Check className="w-3.5 h-3.5 text-accent-indigo shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
