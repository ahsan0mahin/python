/**
 * Kimi 3.1 Pro (Moonshot AI) client — OpenAI-compatible chat completions.
 * Runs in the browser: the API key never leaves the learner's machine except
 * for requests to the Kimi endpoint itself.
 */

export interface KimiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const CONFIG_KEY = 'py2050-kimi-config-v1';
export const DEFAULT_BASE_URL = 'https://api.moonshot.ai/v1';
export const DEFAULT_MODEL = 'kimi-k3.1-pro';

const env = import.meta.env as Record<string, string | undefined>;
const ENV_KEY = env.VITE_KIMI_API_KEY || '';
const ENV_BASE_URL = env.VITE_KIMI_BASE_URL || '';
const ENV_MODEL = env.VITE_KIMI_MODEL || '';

export function loadConfig(): KimiConfig {
  let saved: Partial<KimiConfig> = {};
  try {
    saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') || {};
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return {
    apiKey: typeof saved.apiKey === 'string' ? saved.apiKey : ENV_KEY,
    baseUrl:
      typeof saved.baseUrl === 'string' && saved.baseUrl.trim()
        ? saved.baseUrl.trim()
        : ENV_BASE_URL || DEFAULT_BASE_URL,
    model:
      typeof saved.model === 'string' && saved.model.trim()
        ? saved.model.trim()
        : ENV_MODEL || DEFAULT_MODEL,
  };
}

export function saveConfig(config: KimiConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* storage unavailable — session-only config */
  }
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

interface StatusError extends Error {
  status?: number;
}

function friendlyError(status: number, body: string): StatusError {
  let message: string;
  if (status === 401) {
    message = 'API key invalid বা unauthorized (401)। Settings থেকে সঠিক Kimi API key বসাও।';
  } else if (status === 403) {
    message = 'Access denied (403)। Key-এর plan/quota চেক করো।';
  } else if (status === 404) {
    message = 'Model বা endpoint পাওয়া যায়নি (404)। Settings-এ base URL ও model মিলিয়ে দেখো।';
  } else if (status === 429) {
    message = 'Rate limit বা credit শেষ (429)। একটু পরে আবার চেষ্টা করো।';
  } else {
    message = `API error ${status}: ${body.slice(0, 200)}`;
  }
  const err = new Error(message) as StatusError;
  err.status = status;
  return err;
}

async function sendRequest(
  endpoint: string,
  config: KimiConfig,
  messages: ChatMessage[],
  handlers: StreamHandlers,
  extra: Record<string, unknown>,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model: config.model, messages, stream: true, ...extra }),
      signal: handlers.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new Error(
      'Network/CORS error: browser থেকে Kimi API-তে পৌঁছানো যায়নি। Internet connection ও base URL চেক করো।',
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw friendlyError(res.status, text);
  }
  if (!res.body) throw new Error('Response stream পাওয়া যায়নি।');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':') || !trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) handlers.onDelta(delta);
      } catch {
        /* partial JSON chunk — ignore */
      }
    }
  }
}

/**
 * Stream a chat completion. Tries with `reasoning_effort: 'low'` first (snappy
 * tutor replies) and silently retries without it if a gateway rejects the param.
 */
export async function streamChat(
  config: KimiConfig,
  messages: ChatMessage[],
  handlers: StreamHandlers,
): Promise<void> {
  const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  try {
    await sendRequest(endpoint, config, messages, handlers, { reasoning_effort: 'low' });
  } catch (err) {
    if (err instanceof Error && (err as StatusError).status === 400) {
      await sendRequest(endpoint, config, messages, handlers, {});
      return;
    }
    throw err;
  }
}
