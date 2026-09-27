import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SearchCode,
  FolderGit2,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  History,
  Settings,
  Terminal,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useInvestigations } from '../../hooks/useInvestigations';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { data: investigations } = useInvestigations();

  const activeRunningCount =
    investigations?.filter((i) => i.status === 'running' || i.status === 'waiting_approval').length || 0;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/investigations',
      label: 'Investigations',
      icon: SearchCode,
      badge: activeRunningCount > 0 ? activeRunningCount : undefined,
    },
    {
      to: '/repositories',
      label: 'Repositories',
      icon: FolderGit2,
    },
    {
      to: '/evidence',
      label: 'Evidence',
      icon: ShieldCheck,
    },
    {
      to: '/tests',
      label: 'Tests',
      icon: CheckCircle,
    },
    {
      to: '/reviews',
      label: 'Reviews',
      icon: FileCheck2,
    },
    {
      to: '/history',
      label: 'History',
      icon: History,
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-background-elevated border-r border-border flex flex-col justify-between transition-all duration-200 select-none z-20',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 flex items-center gap-3 border-b border-border bg-background-elevated">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-indigo via-indigo-500 to-purple-500 flex items-center justify-center shadow-glow-indigo text-white font-bold font-mono">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider font-mono text-white">
                  CODEPILOT
                </span>
                <span className="text-[10px] px-1.5 py-0.2 font-mono bg-accent-indigo/20 text-accent-indigo rounded border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-console-dim font-mono truncate">
                AI Debugging Platform
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-console-dim">
            {!collapsed && 'Workspace'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono font-medium transition-all group relative',
                    isActive
                      ? 'bg-accent-indigo/15 text-white border border-indigo-500/30 shadow-sm'
                      : 'text-console-muted hover:text-white hover:bg-background-tertiary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-accent-indigo' : 'text-console-dim group-hover:text-console-muted'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.badge !== undefined && !collapsed && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / IBM Bob Connected Info */}
      <div className="p-2 border-t border-border space-y-2 bg-background-elevated">
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-background-card border border-border/80 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">IBM Bob 2.0</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="mt-1 text-[10px] text-console-dim truncate">
              Autonomous Agent Connected
            </p>
          </div>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-mono font-medium transition-colors',
              isActive
                ? 'bg-background-tertiary text-white'
                : 'text-console-muted hover:text-white hover:bg-background-tertiary'
            )
          }
        >
          <Settings className="w-4 h-4 text-console-dim" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
