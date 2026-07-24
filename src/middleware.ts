/**
 * Auto-logging middleware for OpenAI and Anthropic SDK clients.
 *
 * Wraps a client instance so every chat completion call is automatically
 * logged to ~/.aicost/usage.jsonl — no manual `aicost log` needed.
 *
 * Usage:
 *   import OpenAI from 'openai';
 *   import { track } from '@ozperium/aicost-tracker';
 *
 *   const openai = track(new OpenAI(), { project: 'myapp' });
 *   // All openai.chat.completions.create() calls now auto-logged.
 */

import { logUsage } from './store';

export interface TrackOptions {
  /** Project name to group usage under (default: 'default') */
  project?: string;
  /** Optional note attached to every logged entry */
  note?: string;
}

type AnyObject = Record<string, unknown>;

/**
 * Wrap an OpenAI or Anthropic client to auto-log every completion.
 * Returns the original client with chat.completions.create (OpenAI) or
 * messages.create (Anthropic) patched.
 */
export function track<T extends AnyObject>(client: T, options: TrackOptions = {}): T {
  const project = options.project ?? 'default';
  const note = options.note;

  // OpenAI-compatible client: client.chat.completions.create
  const chat = client['chat'] as AnyObject | undefined;
  if (chat) {
    const completions = chat['completions'] as AnyObject | undefined;
    if (completions && typeof completions['create'] === 'function') {
      const original = completions['create'].bind(completions) as (...args: unknown[]) => Promise<AnyObject>;
      completions['create'] = async (...args: unknown[]): Promise<AnyObject> => {
        const response = await original(...args);
        try {
          const req = (args[0] ?? {}) as AnyObject;
          const model = (req['model'] as string | undefined) ?? 'unknown';
          const usage = response['usage'] as AnyObject | undefined;
          if (usage) {
            const input_tokens = (usage['prompt_tokens'] as number | undefined) ?? 0;
            const output_tokens = (usage['completion_tokens'] as number | undefined) ?? 0;
            if (input_tokens > 0 || output_tokens > 0) {
              logUsage({ project, model, input_tokens, output_tokens, note });
            }
          }
        } catch {
          // Never let logging errors surface to the caller
        }
        return response;
      };
    }
  }

  // Anthropic-compatible client: client.messages.create
  const messages = client['messages'] as AnyObject | undefined;
  if (messages && typeof messages['create'] === 'function') {
    const original = messages['create'].bind(messages) as (...args: unknown[]) => Promise<AnyObject>;
    messages['create'] = async (...args: unknown[]): Promise<AnyObject> => {
      const response = await original(...args);
      try {
        const req = (args[0] ?? {}) as AnyObject;
        const model = (req['model'] as string | undefined) ?? 'unknown';
        const usage = response['usage'] as AnyObject | undefined;
        if (usage) {
          const input_tokens = (usage['input_tokens'] as number | undefined) ?? 0;
          const output_tokens = (usage['output_tokens'] as number | undefined) ?? 0;
          if (input_tokens > 0 || output_tokens > 0) {
            logUsage({ project, model, input_tokens, output_tokens, note });
          }
        }
      } catch {
        // Never let logging errors surface to the caller
      }
      return response;
    };
  }

  return client;
}
