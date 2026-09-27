import React from 'react';
import { RepositorySelector } from './RepositorySelector';
import { Search, Sparkles, Activity, User, ShieldCheck } from 'lucide-react';
import { useBackendHealth } from '../../hooks/useBackendHealth';
import { Button } from '../ui/Button';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onNewInvestigation: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onNewInvestigation,
}) => {
  const { data: health } = useBackendHealth();

  return (
    <header className="h-14 px-4 bg-background-elevated border-b border-border flex items-center justify-between z-10 sticky top-0">
      {/* Left: Repositories & Branch Selectors */}
      <div className="flex items-center gap-4">
        <RepositorySelector />
      </div>

      {/* Center: Command Palette Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-background border border-border text-console-muted hover:border-console-muted hover:text-console-text transition-colors text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-console-dim" />
            <span>Search investigations, files, actions...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-background-elevated border border-border text-[10px] text-console-dim">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Actions, Backend Health & Profile */}
      <div className="flex items-center gap-3">
        {/* Backend API Health Indicator */}
        <div
          title={
            health?.isOnline
              ? 'FastAPI Backend Online on port 8000'
              : 'Backend disconnected / Offline mode'
          }
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-[11px] font-mono"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              health?.isOnline ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="text-console-muted">
            {health?.isOnline ? 'FastAPI :8000' : 'Adapter Mode'}
          </span>
        </div>

        {/* New Investigation Button */}
        <Button
          size="sm"
          onClick={onNewInvestigation}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          className="font-mono text-xs shadow-glow-indigo"
        >
          Investigate
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-accent-indigo/20 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold text-indigo-300">
            CP
          </div>
        </div>
      </div>
    </header>
  );
};
