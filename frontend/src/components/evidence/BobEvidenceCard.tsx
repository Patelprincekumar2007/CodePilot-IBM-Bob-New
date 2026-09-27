import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Cpu, CheckCircle2, FileImage, ExternalLink, ShieldCheck } from 'lucide-react';

export const BobEvidenceCard: React.FC = () => {
  const sessions = [
    {
      file: 'bob_sessions/01_progress_investigation.png',
      title: '01. Progress Bug Root-Cause Investigation',
      desc: 'AST inspection and breakpoint trace confirming completion comparison inversion.',
      status: 'Verified',
    },
    {
      file: 'bob_sessions/02_progress_fix_verification.png',
      title: '02. Progress Fix & Test Execution Sign-off',
      desc: 'Application of equality patch and 100% test pass confirmation.',
      status: 'Verified',
    },
    {
      file: 'bob_sessions/03_status_investigation.png',
      title: '03. Status Update Persistence Investigation',
      desc: 'Service layer update_status trace identifying missing mutation.',
      status: 'Verified',
    },
    {
      file: 'bob_sessions/03_assignee_investigation.png',
      title: '04. Assignee & Field Preservation Verification',
      desc: 'Verification of assignee ID preservation during status transitions.',
      status: 'Verified',
    },
    {
      file: 'bob_sessions/04_regression_tests.png',
      title: '05. Regression Test Analysis & Execution',
      desc: 'Test Agent analysis of missing edge cases and full pytest suite run.',
      status: 'Verified',
    },
  ];

  return (
    <Card className="border-indigo-500/30 bg-background-card/95 font-mono text-xs shadow-glow-indigo">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent-indigo" />
            <span className="font-bold uppercase tracking-wider text-white">
              IBM Bob 2.0 Development Agent Session Artifacts
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            5 SESSIONS RECORDED
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <p className="text-console-muted font-sans text-xs">
          CodePilot orchestrates IBM Bob 2.0 as an autonomous code reasoner. Every investigation step generates persistent session evidence stored in the repository.
        </p>

        <div className="space-y-2.5">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-background-elevated border border-border hover:border-indigo-500/40 transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 shrink-0 mt-0.5">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{session.title}</div>
                  <div className="text-[11px] text-console-muted font-sans mt-0.5">
                    {session.desc}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-1">
                    {session.file}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{session.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
