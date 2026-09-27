import { Investigation } from '../types/investigation';
import { INITIAL_INVESTIGATIONS, INITIAL_EVIDENCE, INITIAL_REPOSITORIES } from '../api/mockData';
import { EvidenceItem } from '../types/evidence';
import { RepositoryInfo } from '../types/repository';

const INVESTIGATIONS_KEY = 'codepilot_investigations_v1';
const EVIDENCE_KEY = 'codepilot_evidence_v1';
const REPOS_KEY = 'codepilot_repos_v1';
const SETTINGS_KEY = 'codepilot_settings_v1';

export interface AppSettings {
  autoApproveLowRisk: boolean;
  telemetryEnabled: boolean;
  ibmbobConnected: boolean;
  apiKey: string;
  defaultModel: string;
  theme: 'dark' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  autoApproveLowRisk: false,
  telemetryEnabled: true,
  ibmbobConnected: true,
  apiKey: 'sk-bob-2.0-live-session',
  defaultModel: 'IBM Bob 2.0 (Deep Code Reasoner)',
  theme: 'dark',
};

export function getStoredInvestigations(): Investigation[] {
  try {
    const data = localStorage.getItem(INVESTIGATIONS_KEY);
    if (!data) {
      localStorage.setItem(INVESTIGATIONS_KEY, JSON.stringify(INITIAL_INVESTIGATIONS));
      return INITIAL_INVESTIGATIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_INVESTIGATIONS;
  }
}

export function saveStoredInvestigations(investigations: Investigation[]): void {
  try {
    localStorage.setItem(INVESTIGATIONS_KEY, JSON.stringify(investigations));
  } catch (err) {
    console.error('Failed to persist investigations', err);
  }
}

export function getStoredEvidence(): EvidenceItem[] {
  try {
    const data = localStorage.getItem(EVIDENCE_KEY);
    if (!data) {
      localStorage.setItem(EVIDENCE_KEY, JSON.stringify(INITIAL_EVIDENCE));
      return INITIAL_EVIDENCE;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_EVIDENCE;
  }
}

export function saveStoredEvidence(evidence: EvidenceItem[]): void {
  try {
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(evidence));
  } catch (err) {
    console.error('Failed to persist evidence', err);
  }
}

export function getStoredRepositories(): RepositoryInfo[] {
  try {
    const data = localStorage.getItem(REPOS_KEY);
    if (!data) {
      localStorage.setItem(REPOS_KEY, JSON.stringify(INITIAL_REPOSITORIES));
      return INITIAL_REPOSITORIES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REPOSITORIES;
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to persist settings', err);
  }
}

export function resetStoredData(): void {
  localStorage.setItem(INVESTIGATIONS_KEY, JSON.stringify(INITIAL_INVESTIGATIONS));
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(INITIAL_EVIDENCE));
  localStorage.setItem(REPOS_KEY, JSON.stringify(INITIAL_REPOSITORIES));
}
