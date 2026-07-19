import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface UsageEntry {
  id: string;
  timestamp: string;       // ISO
  project: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  note?: string;
}

const DATA_DIR = path.join(os.homedir(), '.aicost');
const DATA_FILE = path.join(DATA_DIR, 'usage.jsonl');

export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function logUsage(entry: Omit<UsageEntry, 'id' | 'timestamp' | 'cost_usd'> & { cost_usd?: number }): UsageEntry {
  ensureDataDir();
  const { calculateCost } = require('./pricing');
  const cost = entry.cost_usd ?? calculateCost(entry.model, entry.input_tokens, entry.output_tokens);
  const full: UsageEntry = {
    id: Math.random().toString(36).substring(2, 12),
    timestamp: new Date().toISOString(),
    project: entry.project,
    model: entry.model,
    input_tokens: entry.input_tokens,
    output_tokens: entry.output_tokens,
    cost_usd: cost,
    note: entry.note,
  };
  fs.appendFileSync(DATA_FILE, JSON.stringify(full) + '\n');
  return full;
}

export function readAllUsage(): UsageEntry[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const lines = fs.readFileSync(DATA_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  return lines.map(line => JSON.parse(line) as UsageEntry);
}

export function readUsageByProject(project: string): UsageEntry[] {
  return readAllUsage().filter(e => e.project === project);
}

export function clearUsage(project?: string): number {
  if (!fs.existsSync(DATA_FILE)) return 0;
  const all = readAllUsage();
  const remaining = project ? all.filter(e => e.project !== project) : [];
  if (project) {
    fs.writeFileSync(DATA_FILE, remaining.map(e => JSON.stringify(e)).join('\n') + '\n');
    return all.length - remaining.length;
  } else {
    fs.writeFileSync(DATA_FILE, '');
    return all.length;
  }
}