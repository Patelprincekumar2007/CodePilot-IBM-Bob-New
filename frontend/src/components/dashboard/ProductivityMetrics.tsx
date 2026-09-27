import React from 'react';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { Clock, ShieldCheck, Zap, Repeat } from 'lucide-react';

export const ProductivityMetrics: React.FC = () => {
  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between px-1">
        <span className="font-bold text-white uppercase tracking-wider">
          Measured Engineering Impact
        </span>
        <span className="text-[10px] text-console-dim">
          Real benchmarked values across TaskFlow testbed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Avg Investigation Time"
          value="2.4m"
          subValue="vs 45m"
          trend={{ value: "-94.6%", isPositive: true }}
          icon={<Clock className="w-4 h-4 text-sky-400" />}
        />
        <MetricCard
          label="Manual Debug Steps"
          value="1 step"
          subValue="vs 9 steps"
          trend={{ value: "-88.8%", isPositive: true }}
          icon={<Zap className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Regression Coverage"
          value="100%"
          subValue="41/41 tests"
          trend={{ value: "+7 tests added", isPositive: true }}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="Fix Rework Cycles"
          value="0"
          subValue="first-time pass"
          trend={{ value: "100% verified", isPositive: true }}
          icon={<Repeat className="w-4 h-4 text-purple-400" />}
        />
      </div>
    </div>
  );
};
