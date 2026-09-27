import React from 'react';
import { AgentActivity } from '../../types/investigation';
import { AgentCard } from './AgentCard';

interface AgentTimelineProps {
  agents: AgentActivity[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ agents }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono text-xs text-console-dim px-1">
        <span>Active Orchestration Pipeline</span>
        <span>{agents.filter((a) => a.status === 'completed').length} / {agents.length} Agents Complete</span>
      </div>

      <div className="space-y-2.5">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};
