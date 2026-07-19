import { UsageEntry } from './store';

export interface Summary {
  total_entries: number;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  by_project: Record<string, { entries: number; cost: number; input_tokens: number; output_tokens: number }>;
  by_model: Record<string, { entries: number; cost: number; input_tokens: number; output_tokens: number }>;
  by_day: Record<string, { entries: number; cost: number }>;
}

export function summarize(entries: UsageEntry[]): Summary {
  const summary: Summary = {
    total_entries: entries.length,
    total_cost: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    by_project: {},
    by_model: {},
    by_day: {},
  };

  for (const e of entries) {
    summary.total_cost += e.cost_usd;
    summary.total_input_tokens += e.input_tokens;
    summary.total_output_tokens += e.output_tokens;

    // By project
    if (!summary.by_project[e.project]) {
      summary.by_project[e.project] = { entries: 0, cost: 0, input_tokens: 0, output_tokens: 0 };
    }
    summary.by_project[e.project].entries++;
    summary.by_project[e.project].cost += e.cost_usd;
    summary.by_project[e.project].input_tokens += e.input_tokens;
    summary.by_project[e.project].output_tokens += e.output_tokens;

    // By model
    if (!summary.by_model[e.model]) {
      summary.by_model[e.model] = { entries: 0, cost: 0, input_tokens: 0, output_tokens: 0 };
    }
    summary.by_model[e.model].entries++;
    summary.by_model[e.model].cost += e.cost_usd;
    summary.by_model[e.model].input_tokens += e.input_tokens;
    summary.by_model[e.model].output_tokens += e.output_tokens;

    // By day
    const day = e.timestamp.substring(0, 10);
    if (!summary.by_day[day]) {
      summary.by_day[day] = { entries: 0, cost: 0 };
    }
    summary.by_day[day].entries++;
    summary.by_day[day].cost += e.cost_usd;
  }

  return summary;
}

export function formatSummary(summary: Summary): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('  AI Cost Tracker — Summary');
  lines.push('  ' + '═'.repeat(50));
  lines.push(`  Total entries:    ${summary.total_entries}`);
  lines.push(`  Total cost:       $${summary.total_cost.toFixed(4)}`);
  lines.push(`  Input tokens:     ${summary.total_input_tokens.toLocaleString()}`);
  lines.push(`  Output tokens:    ${summary.total_output_tokens.toLocaleString()}`);
  lines.push('');

  if (Object.keys(summary.by_project).length > 0) {
    lines.push('  By Project:');
    lines.push('  ' + '─'.repeat(50));
    for (const [project, data] of Object.entries(summary.by_project).sort((a, b) => b[1].cost - a[1].cost)) {
      lines.push(`  ${project.padEnd(20)} $${data.cost.toFixed(4).padStart(10)}  ${data.entries} calls`);
    }
    lines.push('');
  }

  if (Object.keys(summary.by_model).length > 0) {
    lines.push('  By Model:');
    lines.push('  ' + '─'.repeat(50));
    for (const [model, data] of Object.entries(summary.by_model).sort((a, b) => b[1].cost - a[1].cost)) {
      lines.push(`  ${model.padEnd(20)} $${data.cost.toFixed(4).padStart(10)}  ${data.entries} calls`);
    }
    lines.push('');
  }

  if (Object.keys(summary.by_day).length > 0) {
    lines.push('  By Day:');
    lines.push('  ' + '─'.repeat(50));
    for (const [day, data] of Object.entries(summary.by_day).sort().reverse().slice(0, 7)) {
      lines.push(`  ${day}  $${data.cost.toFixed(4).padStart(10)}  ${data.entries} calls`);
    }
    lines.push('');
  }

  return lines.join('\n');
}