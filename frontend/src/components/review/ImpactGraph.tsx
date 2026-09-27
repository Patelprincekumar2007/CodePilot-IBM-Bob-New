import React, { useState } from 'react';
import { ImpactGraphData, ImpactNode } from '../../types/investigation';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { RiskBadge } from '../ui/RiskBadge';
import { GitFork, ShieldAlert, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface ImpactGraphProps {
  impact?: ImpactGraphData;
}

export const ImpactGraph: React.FC<ImpactGraphProps> = ({ impact }) => {
  const [selectedNode, setSelectedNode] = useState<ImpactNode | null>(
    impact?.nodes.find((n) => n.isDirectTarget) || impact?.nodes[0] || null
  );

  if (!impact) {
    return (
      <div className="p-8 text-center text-xs font-mono text-console-dim">
        Impact assessment pending agent execution
      </div>
    );
  }

  const nodes = impact.nodes;

  return (
    <Card className="border-border bg-background-card font-mono text-xs">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-white">
              Interactive Impact & Dependency Topology
            </span>
          </div>
          <RiskBadge level={impact.riskAssessment.level} />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Visual Graph Layout */}
        <div className="p-6 rounded-xl bg-[#090C12] border border-border flex flex-col items-center justify-center space-y-6">
          {/* Target Layer (Center) */}
          <div className="w-full flex items-center justify-center">
            {nodes
              .filter((n) => n.isDirectTarget)
              .map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-center max-w-sm w-full ${
                    selectedNode?.id === node.id
                      ? 'border-accent-indigo bg-indigo-950/40 shadow-glow-indigo'
                      : 'border-indigo-500/40 bg-background-card hover:border-accent-indigo'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-indigo-300 font-bold text-xs uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-accent-indigo animate-ping" />
                    <span>DIRECT PATCH TARGET</span>
                  </div>
                  <div className="text-white font-bold text-sm truncate">{node.name}</div>
                  <div className="text-[10px] text-console-muted mt-1 truncate">{node.file}</div>
                </div>
              ))}
          </div>

          {/* Flow Indicator */}
          <div className="flex items-center gap-2 text-console-dim text-xs">
            <div className="h-4 w-0.5 bg-border" />
          </div>

          {/* Connected Downstream & Upstream Nodes */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nodes
              .filter((n) => !n.isDirectTarget)
              .map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-accent-indigo bg-indigo-950/20 shadow-glow-indigo'
                        : 'border-border bg-background-elevated hover:border-console-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-console-dim uppercase font-semibold mb-1">
                      <span>{node.type}</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-white font-bold truncate">{node.name}</div>
                    <div className="text-[10px] text-console-dim mt-0.5 truncate">{node.file}</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="p-3.5 rounded-lg bg-background-elevated border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-indigo" />
                <span className="font-bold text-white">{selectedNode.name}</span>
                <span className="text-[10px] text-console-dim">({selectedNode.type})</span>
              </div>
              <span className="text-[11px] text-console-muted truncate">{selectedNode.file}</span>
            </div>

            {selectedNode.affectedCallers.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="text-console-dim text-[11px]">Affected Callers / Dependencies:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedNode.affectedCallers.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-background text-[11px] text-console-muted border border-border"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rationale */}
        <div className="text-xs text-console-muted font-sans leading-relaxed">
          <span className="font-mono font-semibold text-white">Risk Rationale: </span>
          {impact.riskAssessment.rationale}
        </div>
      </CardContent>
    </Card>
  );
};
