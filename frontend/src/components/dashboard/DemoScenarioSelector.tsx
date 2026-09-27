import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sparkles, ArrowRight, CheckCircle2, FileCode2, Crosshair } from 'lucide-react';

export const DemoScenarioSelector: React.FC = () => {
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 'INV-001',
      title: 'Inverted Project Progress Calculation',
      layer: 'Service Layer (project_service.py)',
      symptom: 'GET /projects/{id}/progress returns 60% instead of 40% when 2/5 tasks are complete.',
      rootCause: 't.status != TaskStatus.DONE used in summation comprehension.',
      tests: '3 regression tests',
      status: 'VERIFIED',
    },
    {
      id: 'INV-002',
      title: 'Task Status Update Not Persisting',
      layer: 'Service Layer (task_service.py)',
      symptom: 'PATCH /tasks/{id}/status returns 200 OK but task remains in original status TODO.',
      rootCause: 'Omitted task.status = status assignment before returning instance.',
      tests: '2 regression tests',
      status: 'VERIFIED',
    },
    {
      id: 'INV-003',
      title: 'Task Filter Arguments Swapped',
      layer: 'API Layer (api/tasks.py)',
      symptom: 'GET /tasks?status=DONE filters by assignee_id and vice versa in query router.',
      rootCause: 'Positional arguments status and assignee_id mapped in reverse.',
      tests: '2 regression tests',
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Seeded Bug Scenarios (TaskFlow API)
          </span>
        </div>
        <span className="text-[11px] text-console-dim">
          Click any scenario to explore full agent investigation & proof
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc) => (
          <Card
            key={sc.id}
            onClick={() => navigate(`/investigations/${sc.id}`)}
            className="p-4 border-border bg-background-card/90 hover:border-accent-indigo hover:shadow-glow-indigo transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-accent-indigo/20 text-indigo-300 font-bold text-[10px]">
                  {sc.id}
                </span>
                <Badge variant="success" size="sm">
                  {sc.status}
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                {sc.title}
              </h4>

              <div className="text-[11px] text-console-dim flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-accent-indigo shrink-0" />
                <span className="truncate">{sc.layer}</span>
              </div>

              <p className="text-console-muted font-sans text-xs leading-relaxed line-clamp-2">
                {sc.symptom}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-semibold">{sc.tests}</span>
              <span className="flex items-center gap-1 text-accent-indigo font-bold group-hover:translate-x-0.5 transition-transform">
                <span>View Proof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
