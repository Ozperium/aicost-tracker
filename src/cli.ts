#!/usr/bin/env node
import { logUsage, readAllUsage, readUsageByProject, clearUsage } from './store';
import { summarize, formatSummary } from './summary';
import { listModels } from './pricing';

function printHelp(): void {
  console.log(`
  aicost — Local-first AI cost tracker

  Usage:
    aicost log <project> <model> <input_tokens> <output_tokens> [note]
    aicost summary [--project <name>]
    aicost models
    aicost clear [--project <name>]
    aicost version

  Examples:
    aicost log myapp gpt-4o 1500 800 "generated README"
    aicost summary
    aicost summary --project myapp
    aicost models

  Data stored at: ~/.aicost/usage.jsonl
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  switch (command) {
    case 'log': {
      const project = args[1];
      const model = args[2];
      const inputTokens = parseInt(args[3], 10);
      const outputTokens = parseInt(args[4], 10);
      const note = args.slice(5).join(' ') || undefined;

      if (!project || !model || isNaN(inputTokens) || isNaN(outputTokens)) {
        console.error('Usage: aicost log <project> <model> <input_tokens> <output_tokens> [note]');
        process.exit(1);
      }

      const entry = logUsage({ project, model, input_tokens: inputTokens, output_tokens: outputTokens, note });
      console.log(`  ✓ Logged: ${entry.project}/${entry.model} — $${entry.cost_usd.toFixed(6)} (${entry.input_tokens}+${entry.output_tokens} tokens)`);
      break;
    }

    case 'summary': {
      let project: string | null = null;
      if (args[1] === '--project') project = args[2];

      const entries = project ? readUsageByProject(project) : readAllUsage();
      if (entries.length === 0) {
        console.log('  No usage data yet. Use "aicost log" to add entries.');
        return;
      }
      const summary = summarize(entries);
      console.log(formatSummary(summary));
      break;
    }

    case 'models': {
      const models = listModels();
      console.log('\n  Supported models:');
      for (const m of models) {
        console.log(`    ${m}`);
      }
      console.log('');
      break;
    }

    case 'clear': {
      let project: string | null = null;
      if (args[1] === '--project') project = args[2];
      const count = clearUsage(project || undefined);
      console.log(`  Cleared ${count} entries${project ? ` for project "${project}"` : ''}`);
      break;
    }

    case 'version': {
      console.log('aicost v0.1.0');
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(e => {
  console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});