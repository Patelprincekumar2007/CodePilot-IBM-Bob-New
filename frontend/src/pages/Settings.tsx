import React, { useState } from 'react';
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
  Sliders,
  Bell,
  Database,
} from 'lucide-react';
import { getStoredSettings, saveStoredSettings, resetStoredData, AppSettings } from '../lib/storage';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [saved, setSaved] = useState(false);

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
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-accent-indigo" />
          <span>Platform Settings & Orchestration Config</span>
        </h1>
        <p className="mt-1 text-xs text-console-muted font-sans">
          Configure IBM Bob 2.0 connection, reasoning models, human approval gates, and telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: General Settings */}
        <div className="lg:col-span-8 space-y-5">
          {/* IBM Bob 2.0 Connection */}
          <Card className="border-indigo-500/30 bg-background-card">
            <CardHeader className="py-3 px-4 bg-background-elevated/70">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-indigo" />
                  <CardTitle>IBM Bob 2.0 Autonomous Engine</CardTitle>
                </div>
                <Badge variant="success" size="sm">
                  CONNECTED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-console-dim mb-1 font-semibold">Active Reasoner Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-background border border-border text-console-text focus:outline-none focus:border-accent-indigo font-mono text-xs"
                >
                  <option value="IBM Bob 2.0 (Deep Code Reasoner)">
                    IBM Bob 2.0 (Deep Code Reasoner) — Default
                  </option>
                  <option value="IBM Bob 2.0 Fast AST Engine">
                    IBM Bob 2.0 Fast AST Engine
                  </option>
                  <option value="IBM Bob 2.0 Extended Verification Engine">
                    IBM Bob 2.0 Extended Verification Engine
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-console-dim mb-1 font-semibold">API Session Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-console-dim absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 rounded bg-background border border-border text-console-text font-mono text-xs focus:outline-none focus:border-accent-indigo"
                  />
                </div>
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
                <span className="text-console-dim">Test Suite:</span>
                <span className="text-white font-bold">pytest 9.1.1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-console-dim">Repository:</span>
                <span className="text-white font-bold">Patelprincekumar2007/CodePilot-IBM-Bob</span>
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
