import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Settings as SettingsIcon,
  Cpu,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Key,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { getStoredSettings, saveStoredSettings, resetStoredData, AppSettings } from '../lib/storage';
import { investigationApi, AIProviderStatus } from '../api/investigations';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = () => {
    setIsRefreshing(true);
    investigationApi
      .getProviderStatus()
      .then((res) => setProviderStatus(res))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = () => {
    saveStoredSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo investigations and evidence to initial state?')) {
      resetStoredData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-accent-indigo" />
            <span>Platform Settings & AI Provider Diagnostics</span>
          </h1>
          <p className="mt-1 text-xs text-console-muted font-sans">
            Configure Gemini and Grok backend connections, autonomous reasoning models, and safety gates.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          isLoading={isRefreshing}
          onClick={fetchStatus}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Check AI Health
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: General Settings */}
        <div className="lg:col-span-8 space-y-5">
          {/* AI Providers Live Status Card */}
          <Card className="border-indigo-500/30 bg-background-card">
            <CardHeader className="py-3 px-4 bg-background-elevated/70">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-indigo" />
                  <CardTitle>AI Reasoning Providers (Backend Connected)</CardTitle>
                </div>
                <Badge
                  variant={
                    providerStatus?.active_provider !== 'demo-ast' ? 'success' : 'warning'
                  }
                  size="sm"
                >
                  ACTIVE: {providerStatus?.active_provider?.toUpperCase() || 'DEMO-AST'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Status List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gemini */}
                <div className="p-3 rounded-lg bg-background-elevated border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Google Gemini</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        providerStatus?.providers.gemini.configured
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-console-dim">
                    {providerStatus?.providers.gemini.configured
                      ? 'Live API Active'
                      : 'Add GEMINI_API_KEY in .env'}
                  </div>
                  <div className="text-[10px] text-indigo-300 font-mono">
                    {providerStatus?.providers.gemini.model}
                  </div>
                </div>

                {/* Grok */}
                <div className="p-3 rounded-lg bg-background-elevated border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">xAI Grok</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        providerStatus?.providers.grok.configured
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-console-dim">
                    {providerStatus?.providers.grok.configured
                      ? 'Live API Active'
                      : 'Add GROK_API_KEY in .env'}
                  </div>
                  <div className="text-[10px] text-indigo-300 font-mono">
                    {providerStatus?.providers.grok.model}
                  </div>
                </div>

                {/* IBM Bob AST */}
                <div className="p-3 rounded-lg bg-background-elevated border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">IBM Bob 2.0 AST</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold">Local Engine Ready</div>
                  <div className="text-[10px] text-console-dim font-mono">AST Heuristics</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-lg bg-background border border-border text-[11px] text-console-muted font-sans leading-relaxed">
                <span className="font-mono font-semibold text-white">To enable Live Gemini or Grok: </span>
                Add <code className="text-indigo-300 bg-background-elevated px-1 py-0.5 rounded">GEMINI_API_KEY=...</code> or <code className="text-indigo-300 bg-background-elevated px-1 py-0.5 rounded">GROK_API_KEY=...</code> to your <code className="text-indigo-300 bg-background-elevated px-1 py-0.5 rounded">.env</code> file. No keys are ever exposed in the frontend.
              </div>
            </CardContent>
          </Card>

          {/* Safety & Approval Policies */}
          <Card className="border-border bg-background-card">
            <CardHeader className="py-3 px-4 bg-background-elevated/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <CardTitle>Safety & Human-in-the-Loop Gates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded bg-background-elevated border border-border">
                <div>
                  <div className="font-bold text-white">Require Human Approval Before Applying Patches</div>
                  <div className="text-[11px] text-console-muted font-sans mt-0.5">
                    Ensures lead engineers inspect diffs and regression suites prior to code modification.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!settings.autoApproveLowRisk}
                  onChange={(e) => setSettings({ ...settings, autoApproveLowRisk: !e.target.checked })}
                  className="w-4 h-4 accent-accent-indigo rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background-elevated border border-border">
                <div>
                  <div className="font-bold text-white">Synthesize Boundary Regression Tests</div>
                  <div className="text-[11px] text-console-muted font-sans mt-0.5">
                    Automatically generate pytest cases for identified bug conditions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="w-4 h-4 accent-accent-indigo rounded cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-400" />}
              className="text-rose-400 hover:text-rose-300"
            >
              Reset Seeded Data
            </Button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </span>
              )}
              <Button size="sm" onClick={handleSave} className="shadow-glow-indigo font-bold">
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Environment Info */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border bg-background-card p-4 space-y-3">
            <span className="font-bold text-white uppercase text-xs">Runtime Diagnostics</span>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-console-dim">FastAPI Backend:</span>
                <span className="text-emerald-400 font-bold">localhost:8000 (Online)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-console-dim">Test Runner:</span>
                <span className="text-white font-bold">pytest 9.1.1 (41 tests)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-console-dim">Repository Store:</span>
                <span className="text-white font-bold">./storage/repositories</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-console-dim">Frontend:</span>
                <span className="text-accent-indigo font-bold">React 18 + Vite + TS</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
