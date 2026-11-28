import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Settings, Trash2, X, Send, KeyRound, AlertTriangle, Bot, User, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import {
  ChatMessage,
  CheckStep,
  KimiConfig,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  loadConfig,
  saveConfig,
  streamChat,
  testConnection,
} from '../lib/kimi';

export interface TutorContext {
  title: string;
  detail: string;
}

const QUICK_PROMPTS = [
  'এই lesson-টা সহজ ভাষায় ব্যাখ্যা করো',
  'Output কী হবে? আগে ধাপে ধাপে hint দাও',
  'Practice challenge-এর জন্য গাইড করো',
  'Common mistake গুলো বলো',
];

function buildSystem(context: TutorContext): ChatMessage {
  return {
    role: 'system',
    content:
      'You are "Kimi", the AI tutor inside PY-2050 Python Learning Lab — an interactive site that teaches Python with Bangla explanations, step-through traces, practice challenges and quizzes.\n' +
      'Teaching rules:\n' +
      '- Reply in the same language the learner uses. For Bangla or Banglish (Bangla in Latin letters) input, write natural, easy Bangla (Roman script is fine if they use it). For English input, use English.\n' +
      '- Teach like a friendly tutor: short steps, one idea at a time. Let the learner predict before revealing answers; give hints before full solutions.\n' +
      '- For code, show small ```python examples and explain line by line when useful.\n' +
      '- You are not a live Python runtime; when predicting output, reason carefully and state the output clearly.\n' +
      '- Keep answers compact (a few short paragraphs or bullet points) unless the learner asks for detail.\n' +
      `Current lesson context: ${context.title}\n${context.detail}`,
  };
}

/* ---------- lightweight rich text (code fences + inline code/bold) ---------- */

function inlineNodes(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={key++} className="text-white">
          {m[1]}
        </strong>,
      );
    } else {
      out.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10 text-cyan-200 text-[12px]">
          {m[2]}
        </code>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const fence = /```([a-zA-Z0-9+#-]*)\n([\s\S]*?)(?:\n```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = fence.exec(text))) {
    if (m.index > last) {
      const prose = text.slice(last, m.index);
      parts.push(
        <p key={key++} className="text-sm leading-7 whitespace-pre-wrap">
          {inlineNodes(prose)}
        </p>,
      );
    }
    parts.push(
      <pre key={key++} className="overflow-x-auto rounded-xl p-3 bg-slate-950 border border-white/10 text-cyan-100 text-xs leading-6">
        <code>{m[2]}</code>
      </pre>,
    );
    last = fence.lastIndex;
  }
  if (last < text.length) {
    parts.push(
      <p key={key++} className="text-sm leading-7 whitespace-pre-wrap">
        {inlineNodes(text.slice(last))}
      </p>,
    );
  }
  return <div className="space-y-2">{parts}</div>;
}

/* --------------------------------- panel --------------------------------- */

export function KimiTutor({ context }: { context: TutorContext }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [config, setConfig] = useState<KimiConfig>(loadConfig);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testSteps, setTestSteps] = useState<CheckStep[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastUserRef = useRef('');

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    if (open && !settingsOpen) inputRef.current?.focus();
  }, [open, settingsOpen]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const cfg = loadConfig();
    setConfig(cfg);
    if (!cfg.apiKey) {
      setSettingsOpen(true);
      return;
    }
    lastUserRef.current = trimmed;
    const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(cfg, [buildSystem(context), ...history], {
        signal: controller.signal,
        onDelta: (delta) =>
          setMessages((prev) => {
            const next = [...prev];
            const lastMsg = next[next.length - 1];
            if (lastMsg?.role === 'assistant') {
              next[next.length - 1] = { ...lastMsg, content: lastMsg.content + delta };
            }
            return next;
          }),
      });
      setMessages((prev) => {
        const next = [...prev];
        const lastMsg = next[next.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.content === '') {
          next.pop();
        }
        return next;
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          const lastMsg = next[next.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.content === '') next.pop();
          return next;
        });
      } else {
        setError(err instanceof Error ? err.message : String(err));
        setMessages((prev) => {
          const next = [...prev];
          const lastMsg = next[next.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.content === '') next.pop();
          return next;
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  async function runTest(cfg?: KimiConfig) {
    const toTest = cfg ?? loadConfig();
    if (!toTest.apiKey || testing) return;
    setTesting(true);
    setTestSteps(null);
    try {
      setTestSteps(await testConnection(toTest));
    } finally {
      setTesting(false);
    }
  }

  const keyMissing = !config.apiKey;

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Kimi AI Tutor' : 'Open Kimi AI Tutor'}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 hover:opacity-90 transition cursor-pointer"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        <span className="text-sm">{open ? 'Close' : 'Kimi AI Tutor'}</span>
        {!open && keyMissing && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-950" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            aria-label="Kimi AI Tutor chat"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-4 z-50 w-[min(26rem,calc(100vw-2rem))] h-[min(36rem,calc(100vh-7rem))] glass-panel rounded-2xl flex flex-col overflow-hidden glow-cyan"
          >
            {/* header */}
            <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-950/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white truncate">Kimi 3.1 Pro Tutor</h2>
                <p className="text-[10px] font-mono text-cyan-300 truncate">{config.model}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-label="Tutor settings"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                aria-label="Clear conversation"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </header>

            {/* settings */}
            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 bg-slate-950/70 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <label className="block text-xs text-slate-400">
                      Kimi API key
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
                        placeholder="sk-..."
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-100 font-mono"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </label>
                    <label className="block text-xs text-slate-400">
                      Model
                      <input
                        list="kimi-models"
                        value={config.model}
                        onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-100 font-mono"
                        spellCheck={false}
                      />
                      <datalist id="kimi-models">
                        <option value={DEFAULT_MODEL} />
                        <option value="kimi-k3.1-pro-highspeed" />
                        <option value="kimi-k3" />
                      </datalist>
                    </label>
                    <label className="block text-xs text-slate-400">
                      Base URL
                      <input
                        value={config.baseUrl}
                        onChange={(e) => setConfig((c) => ({ ...c, baseUrl: e.target.value }))}
                        className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-100 font-mono"
                        spellCheck={false}
                      />
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const next = {
                            apiKey: config.apiKey.trim(),
                            baseUrl: config.baseUrl.trim() || DEFAULT_BASE_URL,
                            model: config.model.trim() || DEFAULT_MODEL,
                          };
                          saveConfig(next);
                          setConfig(next);
                          void runTest(next);
                        }}
                        disabled={testing}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50 transition cursor-pointer"
                      >
                        {testing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        {testing ? 'Testing…' : 'Save & test connection'}
                      </button>
                      <p className="text-[10px] text-slate-500 leading-4">
                        Key শুধু এই browser-এ (localStorage) থাকে — GitHub-এ commit হয় না।
                      </p>
                    </div>
                    {testSteps && (
                      <ul className="space-y-1.5 rounded-xl border border-white/10 bg-slate-950/50 p-3" aria-live="polite">
                        {testSteps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            {s.ok ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-slate-200">{s.label}</div>
                              <div className={s.ok ? 'text-slate-400 break-words' : 'text-amber-200 break-words'}>{s.detail}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && !error && (
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                    <div className="rounded-xl rounded-tl-sm bg-slate-900/80 border border-white/10 px-3.5 py-2.5">
                      {keyMissing ? (
                        <div className="text-sm text-slate-200 space-y-2">
                          <p>আমি Kimi, তোমার Python tutor! 🎓</p>
                          <p className="text-slate-400 text-xs leading-6">
                            শুরু করতে তোমার Kimi 3.1 Pro API key বসাও। Key তোমার browser-এই থাকে।
                          </p>
                          <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/30 transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> API key যোগ করো
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-200 space-y-1">
                          <p>আমি Kimi, তোমার Python tutor! 🎓</p>
                          <p className="text-slate-400 text-xs leading-6">
                            বর্তমান lesson: <span className="text-cyan-300">{context.title}</span>।
                            যেকোনো প্রশ্ন করো — ব্যাখ্যা, hint, output prediction বা debug।
                            API connect হয়েছে কিনা যাচাই করতে Settings ⚙️ → "Save & test connection" চাপো।
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void send(prompt)}
                      className="block w-full text-left text-xs rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-3.5 py-2.5 text-cyan-200 hover:bg-cyan-500/15 transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-violet-500/20 border-violet-400/30'
                        : 'bg-cyan-500/20 border-cyan-400/30'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-violet-300" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-violet-500/15 border border-violet-400/30 text-violet-100 text-sm leading-7 whitespace-pre-wrap rounded-tr-sm'
                        : 'bg-slate-900/80 border border-white/10 rounded-tl-sm text-slate-200'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : <RichText text={msg.content} />}
                  </div>
                </div>
              ))}

              {busy && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2.5" aria-live="polite">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-slate-900/80 border border-white/10 px-3.5 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* error */}
            {error && (
              <div role="alert" className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-amber-200 leading-5">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const last = lastUserRef.current;
                      setError(null);
                      if (last) void send(last);
                    }}
                    className="mt-1 text-xs text-amber-300 underline hover:text-amber-100 cursor-pointer"
                  >
                    আবার চেষ্টা করো
                  </button>
                </div>
              </div>
            )}

            {/* input */}
            <div className="border-t border-white/10 bg-slate-950/60 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={keyMissing ? 'শুরু করতে API key যোগ করো…' : 'প্রশ্ন লেখো… (Enter = send, Shift+Enter = newline)'}
                  aria-label="Message to Kimi tutor"
                  className="flex-1 resize-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/50 max-h-32"
                />
                <button
                  type="button"
                  onClick={() => void send(input)}
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-600 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

export default KimiTutor;
