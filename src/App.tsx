import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Play,
  Sparkles,
  BrainCircuit,
  Code2,
  Cpu,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { CURRICULUM_TRACKS, TrackId, Lesson } from './data/curriculum';
import { MotionVisualizer } from './components/MotionVisualizer';
import { BasicCourse } from './components/BasicCourse';
import { KimiTutor, TutorContext } from './components/KimiTutor';

const toTutorContext = (lesson: Lesson, trackTitle: string): TutorContext => ({
  title: `${lesson.title} (${trackTitle})`,
  detail: `Summary: ${lesson.summary}\n\nExample code:\n\`\`\`python\n${lesson.starterCode}\n\`\`\`\nExpected output:\n${lesson.expectedOutput}`,
});

export function App() {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>('basic');
  const currentTrack = CURRICULUM_TRACKS.find((t) => t.id === selectedTrackId)!;
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(currentTrack.lessons[0]);
  const [code, setCode] = useState<string>(currentTrack.lessons[0].starterCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [tutorContext, setTutorContext] = useState<TutorContext>(() =>
    toTutorContext(currentTrack.lessons[0], currentTrack.title),
  );

  const handleSelectTrack = (trackId: TrackId) => {
    setSelectedTrackId(trackId);
    const track = CURRICULUM_TRACKS.find((t) => t.id === trackId)!;
    const firstLesson = track.lessons[0];
    setSelectedLesson(firstLesson);
    setCode(firstLesson.starterCode);
    setOutput('');
    setTutorContext(toTutorContext(firstLesson, track.title));
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCode(lesson.starterCode);
    setOutput('');
    setTutorContext(toTutorContext(lesson, currentTrack.title));
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Loading example output (not code execution)...');
    setTimeout(() => {
      setOutput(code === selectedLesson.starterCode ? selectedLesson.expectedOutput : 'Code changed. This is an example viewer, not a Python runtime. Run edited code in Python 3 to see its actual output.');
      setIsRunning(false);
    }, 450);
  };

  const trackIcons: Record<TrackId, React.ReactNode> = {
    basic: <Code2 className="w-5 h-5" />,
    intermediate: <Cpu className="w-5 h-5" />,
    advanced: <BrainCircuit className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 neural-grid relative overflow-hidden">
      {/* Ambient 2050 Glows */}
      <div className="pointer-events-none fixed top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                PY<span className="text-cyan-400">-2050</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                NEURAL CODE LAB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              BASIC PYTHON • 20 GUIDED MODULES
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Hero Section */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
              Learn Python with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                2050 Motion Physics
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              From Basic Python to Intermediate Architecture and Advanced AI/ML—experience code
              through interactive motion graphics, live memory pods, and neural simulations.
            </p>
          </motion.div>
        </section>

        {/* 3-Tier Track Selector */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CURRICULUM_TRACKS.map((track) => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`text-left p-5 rounded-2xl transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'glass-panel border-cyan-400/50 glow-cyan bg-slate-900/80'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                      track.accentColor === 'cyan'
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : track.accentColor === 'violet'
                        ? 'bg-violet-500/15 text-violet-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {track.tier}
                  </span>
                  <div
                    className={`${
                      isSelected ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {trackIcons[track.id]}
                  </div>
                </div>
                <h2 className="font-display text-lg font-bold text-white mb-1">
                  {track.title}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2">{track.description}</p>
              </button>
            );
          })}
        </section>

        {selectedTrackId === 'basic' ? <BasicCourse onContextChange={setTutorContext} /> : <>
        {/* Main Interactive Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Lessons List */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-4 h-fit">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-300">
                {currentTrack.title} Modules
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {currentTrack.lessons.length} Lessons
              </span>
            </div>

            <div className="space-y-2">
              {currentTrack.lessons.map((lesson) => {
                const active = lesson.id === selectedLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer border flex items-start justify-between gap-3 ${
                      active
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium mb-1">{lesson.title}</div>
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> {lesson.duration}
                        </span>
                        {lesson.isContentReady ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> LIVE SIM
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400/80">
                            <Layers className="w-3 h-3" /> SLOT READY
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 mt-1 shrink-0 ${
                        active ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Code Lab + Motion Graphics Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLesson.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="glass-panel rounded-2xl p-5"
              >
                <div className="mb-4">
                  <h2 className="font-display text-xl font-bold text-white mb-1">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-sm text-slate-400">{selectedLesson.summary}</p>
                </div>

                {/* Motion Graphics Visualizer */}
                <div className="mb-6">
                  <MotionVisualizer
                    type={selectedLesson.visualizerType}
                    isRunning={isRunning}
                  />
                </div>

                {/* Interactive Code Editor & Terminal */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>interactive_lab.py</span>
                    </div>
                    <button
                      onClick={handleRunCode}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 font-mono text-xs font-bold hover:opacity-90 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Show example output
                    </button>
                  </div>

                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    rows={6}
                    className="w-full p-4 bg-slate-950 text-cyan-100 font-mono text-sm focus:outline-none resize-y"
                  />

                  {output && (
                    <div className="border-t border-white/10 bg-slate-900/60 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                        Example output • not live execution
                      </div>
                      <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                        {output}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
        </>}
      </main>

      <KimiTutor context={tutorContext} />
    </div>
  );
}

export default App;
