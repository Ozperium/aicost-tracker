# AICost Tracker

> Local-first CLI to track AI token usage and costs across projects

Know exactly how much you're spending on AI APIs. No cloud, no account, no telemetry. Just a simple CLI that logs your token usage and shows you the cost breakdown.

## Quick start

```bash
npm install -g @ozperium/aicost-tracker
```

Log an API call:

```bash
aicost log myapp gpt-4o 1500 800 "generated README"
```

See your costs:

```bash
aicost summary
```

Output:
```
  AI Cost Tracker — Summary
  ══════════════════════════════════════════════════
  Total entries:    3
  Total cost:       $0.0359
  Input tokens:     4,000
  Output tokens:    2,200

  By Project:
  ──────────────────────────────────────────────────
  myapp                $    0.0358  2 calls
  agentspec            $    0.0002  1 calls

  By Model:
  ──────────────────────────────────────────────────
  claude-3.5-sonnet    $    0.0240  1 calls
  gpt-4o               $    0.0118  1 calls
```

## Commands

```
aicost log <project> <model> <input_tokens> <output_tokens> [note]
aicost summary [--project <name>]
aicost models
aicost clear [--project <name>]
aicost version
```

## Supported models

Pricing data included for:
- **OpenAI:** gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo, o1, o1-mini
- **Anthropic:** claude-3.5-sonnet, claude-3.5-haiku, claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Google:** gemini-1.5-pro, gemini-1.5-flash
- **Local:** ollama, local (free)

## Data storage

All data is stored locally at `~/.aicost/usage.jsonl` — one JSON entry per line. Simple, portable, greppable.

## Why AICost?

- **Local-first** — no cloud, no account, no telemetry
- **Simple** — just a CLI, no dashboard to maintain
- **Multi-project** — track costs across all your projects
- **Multi-model** — supports OpenAI, Anthropic, Google, and local models
- **Portable data** — JSONL format, easy to export or analyze

## Part of the AI Dev Workflow Stack

AICostTracker is one tool in a three-part observability stack for AI development:

| Tool | What it does | Install |
|------|-------------|---------|
| **[AgentSpec](https://github.com/Ozperium/agentspec)** | Test AI agent behavior — catch regressions before production | `npm i -g @ozperium/agentspec` |
| **AICostTracker** | Track token usage and costs across projects | `npm i -g @ozperium/aicost-tracker` |
| **[quota](https://github.com/Ozperium/quota)** | Monitor AI rate limits — know what's left before it stops you | `npm i -g @ozperium/quota` |

## License

MIT