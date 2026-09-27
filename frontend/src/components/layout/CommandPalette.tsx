import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  FolderGit2,
  FileCode,
  ShieldCheck,
  CheckCircle,
  History,
  Settings,
  X,
  Play,
  Terminal,
} from 'lucide-react';
import { useInvestigations } from '../../hooks/useInvestigations';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewInvestigation: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewInvestigation,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: investigations } = useInvestigations();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultActions = [
    {
      id: 'new_inv',
      title: 'New Investigation',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-accent-indigo" />,
      perform: () => {
        onClose();
        onNewInvestigation();
      },
    },
    {
      id: 'goto_dashboard',
      title: 'Open Dashboard',
      category: 'Navigation',
      icon: <Terminal className="w-4 h-4 text-accent-blue" />,
      perform: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'goto_investigations',
      title: 'View Investigations',
      category: 'Navigation',
      icon: <FolderGit2 className="w-4 h-4 text-accent-blue" />,
      perform: () => {
        navigate('/investigations');
        onClose();
      },
    },
    {
      id: 'goto_evidence',
      title: 'Open Evidence Center',
      category: 'Navigation',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        navigate('/evidence');
        onClose();
      },
    },
    {
      id: 'goto_tests',
      title: 'Run & View Tests',
      category: 'Navigation',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        navigate('/tests');
        onClose();
      },
    },
    {
      id: 'goto_history',
      title: 'Investigation History',
      category: 'Navigation',
      icon: <History className="w-4 h-4 text-purple-400" />,
      perform: () => {
        navigate('/history');
        onClose();
      },
    },
    {
      id: 'goto_settings',
      title: 'System Settings',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-console-muted" />,
      perform: () => {
        navigate('/settings');
        onClose();
      },
    },
  ];

  // Dynamic search matching
  const matchingInvestigations = (investigations || [])
    .filter(
      (inv) =>
        inv.title.toLowerCase().includes(query.toLowerCase()) ||
        inv.id.toLowerCase().includes(query.toLowerCase()) ||
        inv.issueDescription.toLowerCase().includes(query.toLowerCase())
    )
    .map((inv) => ({
      id: inv.id,
      title: `${inv.id}: ${inv.title}`,
      category: 'Investigations',
      icon: <FileCode className="w-4 h-4 text-accent-purple" />,
      perform: () => {
        navigate(`/investigations/${inv.id}`);
        onClose();
      },
    }));

  const allItems = [...defaultActions, ...matchingInvestigations].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].perform();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-xl bg-background-card border border-border shadow-elevated z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background-elevated">
          <Search className="w-5 h-5 text-console-muted" />
          <input
            type="text"
            placeholder="Type a command, investigation ID, or search files..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-transparent text-sm text-console-text placeholder:text-console-dim focus:outline-none font-mono"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-background-tertiary text-console-muted rounded border border-border">
            ESC
          </kbd>
          <button onClick={onClose} className="text-console-muted hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-console-dim">
              No matching commands or investigations found
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.perform}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors ${
                    isSelected
                      ? 'bg-accent-indigo text-white'
                      : 'text-console-text hover:bg-background-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isSelected ? 'text-white' : ''}>{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-background-tertiary text-console-dim'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background-elevated text-[11px] font-mono text-console-dim">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>CodePilot CLI Palette</span>
        </div>
      </div>
    </div>
  );
};
