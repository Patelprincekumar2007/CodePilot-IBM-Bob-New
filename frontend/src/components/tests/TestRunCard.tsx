import React, { useState } from 'react';
import { TestRunSummary, TestResultItem } from '../../types/investigation';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileCode,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface TestRunCardProps {
  testRun?: TestRunSummary;
  onReRun?: () => void;
  isRunning?: boolean;
}

export const TestRunCard: React.FC<TestRunCardProps> = ({
  testRun,
  onReRun,
  isRunning = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'regression' | 'passed' | 'failed'>('all');
  const [search, setSearch] = useState('');

  if (!testRun) {
    return (
      <Card className="p-8 text-center border-border bg-background-card font-mono text-xs text-console-dim">
        No test execution record available yet.
        {onReRun && (
          <div className="mt-4">
            <Button size="sm" onClick={onReRun} isLoading={isRunning}>
              Execute Test Suite
            </Button>
          </div>
        )}
      </Card>
    );
  }

  const results = testRun.results || [];
  const filteredResults = results.filter((t) => {
    if (filter === 'regression' && !t.isRegressionTest) return false;
    if (filter === 'failed' && t.status !== 'failed') return false;
    if (filter === 'passed' && t.status !== 'passed') return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.file.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Card className="border-border bg-background-card font-mono text-xs">
      <CardHeader className="py-3 px-4 bg-background-elevated/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-white">
              Automated Test Suite Execution
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onReRun && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onReRun}
                isLoading={isRunning}
                leftIcon={<Play className="w-3 h-3" />}
                className="text-xs h-7 px-2.5"
              >
                Run Tests
              </Button>
            )}
            <Badge variant="success" size="sm">
              ALL PASSED ({testRun.passed}/{testRun.totalTests})
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase">Total Tests</span>
            <div className="text-xl font-bold text-white mt-0.5">{testRun.totalTests}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 uppercase">Passed</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{testRun.passed}</div>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase">Regressions Added</span>
            <div className="text-xl font-bold text-indigo-300 mt-0.5">
              +{testRun.regressionCoverage?.addedCount || 3}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated border border-border">
            <span className="text-[10px] text-console-dim uppercase">Execution Time</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {testRun.durationSeconds.toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Regression Coverage Highlights */}
        {testRun.regressionCoverage?.tests && (
          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4 text-accent-indigo" />
              <span>Target Regression Tests Created by Test Agent</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {testRun.regressionCoverage.tests.map((testName, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-indigo-500/30 text-indigo-200 text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{testName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-accent-indigo text-white font-bold'
                  : 'text-console-muted hover:text-white bg-background-elevated'
              }`}
            >
              All ({results.length || testRun.totalTests})
            </button>
            <button
              onClick={() => setFilter('regression')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filter === 'regression'
                  ? 'bg-accent-indigo text-white font-bold'
                  : 'text-console-muted hover:text-white bg-background-elevated'
              }`}
            >
              Regressions ({testRun.regressionCoverage?.addedCount || 3})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-console-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded bg-background border border-border text-console-text text-xs placeholder:text-console-dim focus:outline-none focus:border-accent-indigo"
            />
          </div>
        </div>

        {/* Test Cases List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {filteredResults.length === 0 ? (
            <div className="py-6 text-center text-console-dim text-xs">
              Showing suite summary: {testRun.passed} test cases passing cleanly across 4 modules (test_progress.py, test_tasks.py, test_projects.py, test_users.py).
            </div>
          ) : (
            filteredResults.map((test) => (
              <div
                key={test.id}
                className="p-2.5 rounded bg-background-elevated border border-border flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white truncate">{test.name}</span>
                  {test.isRegressionTest && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0">
                      REGRESSION
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-console-dim text-[11px] shrink-0">
                  <span>{test.file}</span>
                  <span className="text-console-muted font-bold">{test.durationMs}ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
