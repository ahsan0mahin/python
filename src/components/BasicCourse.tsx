import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BASIC_MODULES } from '../data/basic';

type Progress = Record<string, { completed: boolean; due: number; reviews: number }>;
const KEY = 'py2050-basic-progress-v1';
function load(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v && typeof v === 'object' && typeof (v as {completed: unknown}).completed === 'boolean' && Number.isFinite((v as {due: unknown}).due) && Number.isFinite((v as {reviews: unknown}).reviews))) as Progress;
  } catch { return {}; }
}
const button = 'rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed';
export function BasicCourse() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(load);
  const [storageError, setStorageError] = useState(false);
  const lesson = BASIC_MODULES[index];
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(progress)); setStorageError(false); } catch { setStorageError(true); } }, [progress]);
  const done = BASIC_MODULES.filter(l => progress[l.id]?.completed).length;
  const due = BASIC_MODULES.filter(l => progress[l.id]?.completed && progress[l.id].due <= Date.now());
  function complete() {
    setProgress(old => {
      const reviews = (old[lesson.id]?.reviews || 0) + 1;
      const days = [1, 3, 7, 14, 30][Math.min(reviews - 1, 4)];
      return { ...old, [lesson.id]: { completed: true, reviews, due: Date.now() + days * 86400000 } };
    });
  }
  return <section aria-label="Basic Python course" className="space-y-6">
    <div className="glass-panel rounded-2xl p-5 space-y-3">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">Basic Python • শিখি, করি, মনে রাখি</h2><span>{done}/{BASIC_MODULES.length} completed</span></div>
      <progress className="w-full h-3 accent-cyan-400" value={done} max={BASIC_MODULES.length} aria-label="Course progress" />
      <p className="text-sm text-slate-400">প্রতিদিন ১–২ module। আগে output অনুমান করো, trace দেখো, নিজে code লেখো, তারপর hints/solution। Quiz পাস ও practice confirm করলে complete হবে।</p>
      <div className="flex gap-3 flex-wrap items-center"><button className={button} disabled={!due.length} onClick={() => setIndex(BASIC_MODULES.findIndex(l => l.id === due[0].id))}>Review due ({due.length})</button><span className="text-xs text-slate-400">Review interval: 1 → 3 → 7 → 14 → 30 দিন। প্রতিবার quiz ও practice আবার করো।</span></div>
      {storageError && <p role="alert">Browser storage unavailable — progress শুধু এই session-এ থাকবে।</p>}
    </div>
    <div className="grid lg:grid-cols-12 gap-6 items-start">
      <nav aria-label="Basic modules" className="lg:col-span-4 glass-panel rounded-2xl p-3 lg:max-h-[80vh] overflow-auto lg:sticky lg:top-20">
        {BASIC_MODULES.map((l, i) => <button key={l.id} aria-current={index === i ? 'step' : undefined} onClick={() => setIndex(i)} className={`block w-full text-left p-3 my-1 rounded-lg border text-sm ${index === i ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}><span aria-label={progress[l.id]?.completed ? 'Completed' : 'Not completed'}>{progress[l.id]?.completed ? '✓' : '○'}</span> {l.title}</button>)}
      </nav>
      <div className="lg:col-span-8"><Lesson key={lesson.id} index={index} onComplete={complete} progress={progress[lesson.id]} onNext={() => setIndex(Math.min(index + 1, BASIC_MODULES.length - 1))} onPrevious={() => setIndex(Math.max(index - 1, 0))}/></div>
    </div>
  </section>;
}
function Lesson({index, onComplete, progress, onNext, onPrevious}: {index: number; onComplete: () => void; progress?: Progress[string]; onNext: () => void; onPrevious: () => void}) {
  const lesson = BASIC_MODULES[index];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hints, setHints] = useState(0);
  const [code, setCode] = useState('');
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [practiced, setPracticed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [solution, setSolution] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep(s => {
      if (s >= lesson.steps.length - 1) { setPlaying(false); return s; }
      return s + 1;
    }), 1600);
    return () => clearInterval(timer);
  }, [playing, lesson]);
  return <article className="space-y-5">
    <div className="glass-panel rounded-2xl p-5 space-y-4"><p className="text-xs text-cyan-300">MODULE {index + 1} / {BASIC_MODULES.length} • 20–40 min with practice</p><h2 className="text-2xl font-bold">{lesson.title}</h2><p lang="bn" className="leading-8 text-slate-300">{lesson.concept}</p><aside className="p-4 bg-cyan-500/10 rounded-xl"><strong>মনে রাখো</strong><p className="mt-2">{lesson.remember}</p></aside><aside className="p-4 bg-amber-500/10 text-amber-200 rounded-xl"><strong>Common mistake</strong><p className="mt-2">{lesson.mistake}</p></aside></div>
    <div className="glass-panel rounded-2xl p-5 space-y-4"><h3 className="text-lg font-bold">1. Predict → trace → explain</h3><pre className="overflow-x-auto rounded-xl p-4 bg-slate-950 text-cyan-100 text-sm"><code>{lesson.code}</code></pre><label className="block text-sm" htmlFor="prediction">Output কী হবে? আগে নিজের অনুমান লেখো (self-check)</label><textarea id="prediction" value={prediction} onChange={e => setPrediction(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" rows={2}/>
      <div className="flex gap-2 flex-wrap"><button className={button} onClick={() => { setStep(0); setPlaying(true); }}>▶ Play trace</button><button className={button} disabled={step === 0} onClick={() => { setPlaying(false); setStep(s => s - 1); }}>← Step</button><button className={button} disabled={step === lesson.steps.length - 1} onClick={() => { setPlaying(false); setStep(s => s + 1); }}>Step →</button><button className={button} onClick={() => { setPlaying(false); setStep(0); }}>Reset / pause</button></div>
      <p className="text-xs text-slate-400">Illustrated walkthrough of the example above — not a live Python runtime.</p>
      <div className="flex gap-2" aria-hidden="true">{lesson.steps.map((_, i) => <div key={i} className={`h-2 flex-1 rounded ${i <= step ? 'bg-cyan-400' : 'bg-slate-800'}`}/>)}</div>
      <motion.div key={step} initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} className="p-5 border border-cyan-400/40 bg-cyan-500/5 rounded-xl min-h-32" aria-live="polite"><span className="text-xs text-slate-400">STEP {step + 1}/{lesson.steps.length}</span><div className="font-mono text-cyan-200 my-3 break-words">{lesson.steps[step][0]}</div><p>{lesson.steps[step][1]}</p></motion.div>
      <button className={button} onClick={() => setShowOutput(v => !v)}>{showOutput ? 'Hide' : 'Reveal'} example output</button>{showOutput && <pre className="bg-slate-950 p-4 rounded-xl whitespace-pre-wrap text-emerald-300">{lesson.output}</pre>}
    </div>
    <div className="glass-panel rounded-2xl p-5 space-y-4"><h3 className="text-lg font-bold">2. Practice without looking</h3><p>{lesson.challenge}</p><label htmlFor="practice-code" className="text-sm text-slate-400 block">তোমার Python code (scratchpad — not executed here)</label><textarea id="practice-code" value={code} onChange={e => {setCode(e.target.value); setSaved(false);}} spellCheck={false} rows={8} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm" placeholder="# Write your solution…"/><p className="text-xs text-slate-400">Local Python 3 / IDLE-এ code চালিয়ে output ও edge cases যাচাই করো। Module বদলালে scratchpad reset হয়; code আগে copy করো।</p>
      <button className={button} disabled={hints >= lesson.hints.length} onClick={() => setHints(h => h + 1)}>Hint {Math.min(hints + 1, lesson.hints.length)}/{lesson.hints.length}</button>{lesson.hints.slice(0, hints).map((h,i) => <p key={h} className="text-amber-200">{i+1}. {h}</p>)}
      <button className={`${button} block`} onClick={() => setSolution(v => !v)}>{solution ? 'Hide solution' : 'Show explained solution'}</button>{solution && <div className="space-y-3"><pre className="p-4 bg-slate-950 rounded-xl overflow-auto text-sm"><code>{lesson.solution}</code></pre><p className="text-slate-300">{lesson.explanation}</p><p className="text-cyan-300">এবার solution লুকিয়ে blank file-এ নিজে আবার লেখো। তারপর একটি input বদলে test করো।</p></div>}
      <label className="flex gap-3 items-start"><input type="checkbox" checked={practiced} onChange={e => setPracticed(e.target.checked)} className="mt-1"/>আমি নিজে code লিখেছি, Python-এ চালিয়েছি ও result বুঝে যাচাই করেছি।</label>
    </div>
    <div className="glass-panel rounded-2xl p-5 space-y-4"><h3 className="text-lg font-bold">3. Recall check</h3><fieldset><legend className="mb-3">{lesson.quiz.question}</legend>{lesson.quiz.options.map((option, i) => <label key={option} className="flex gap-3 p-3 border border-slate-700 rounded-lg mb-2 cursor-pointer"><input type="radio" name="quiz" checked={choice === i} onChange={() => {setChoice(i); setSubmitted(false); setSaved(false);}}/>{option}</label>)}</fieldset><button className={button} disabled={choice === null} onClick={() => setSubmitted(true)}>Check answer</button>{submitted && <p role="status" className={choice === lesson.quiz.answer ? 'text-emerald-300' : 'text-amber-200'}>{choice === lesson.quiz.answer ? '✓ ঠিক!' : 'আবার ভাবো।'} {lesson.quiz.why}</p>}
      {submitted && choice !== lesson.quiz.answer && <button className={button} onClick={() => setRevealedAnswer(true)}>Explain correct answer</button>}{revealedAnswer && <p>উত্তর: {lesson.quiz.options[lesson.quiz.answer]} — এখন ব্যাখ্যাটি নিজের ভাষায় বলো।</p>}
      <button className={`${button} block`} disabled={!practiced || !submitted || choice !== lesson.quiz.answer || saved} onClick={() => {onComplete(); setSaved(true);}}> {saved ? '✓ Progress saved' : progress?.completed ? 'Complete review & schedule next' : 'Complete module & schedule review'}</button>
      {progress?.completed && <p className="text-sm text-slate-400">Next review: {new Date(progress.due).toLocaleDateString()} • Completed checks: {progress.reviews}</p>}
    </div>
    <div className="flex justify-between gap-3"><button className={button} disabled={index === 0} onClick={onPrevious}>← Previous</button><button className={button} disabled={index === BASIC_MODULES.length - 1} onClick={onNext}>Next module →</button></div>
  </article>;
}
