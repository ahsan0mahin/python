import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Sparkles, Cpu, Zap, Layers } from 'lucide-react';
import { VisualizerType } from '../data/curriculum';

interface MotionVisualizerProps {
  type: VisualizerType;
  isRunning: boolean;
}

export const MotionVisualizer: React.FC<MotionVisualizerProps> = ({ type, isRunning }) => {
  if (type === 'memory') return <MemoryVisualizer isRunning={isRunning} />;
  if (type === 'loop') return <LoopVisualizer isRunning={isRunning} />;
  if (type === 'neural') return <NeuralVisualizer isRunning={isRunning} />;
  return <PlaceholderVisualizer />;
};

const MemoryVisualizer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    if (isRunning) {
      setEnergy((prev) => (prev === 100 ? 85 : 100));
    }
  }, [isRunning]);

  const pods = [
    { name: 'energy', value: `${energy}`, type: 'int', color: 'cyan' },
    { name: 'name', value: '"Ahsan"', type: 'str', color: 'violet' },
    { name: 'is_online', value: 'True', type: 'bool', color: 'emerald' },
  ];

  return (
    <div className="relative h-full min-h-[260px] flex flex-col justify-between p-5 rounded-xl bg-slate-950/80 border border-cyan-500/20 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Cpu className="w-4 h-4" />
          <span>QUANTUM MEMORY ALLOCATION // LIVE</span>
        </div>
        <button
          onClick={() => setEnergy((e) => (e >= 100 ? 40 : e + 20))}
          className="px-2.5 py-1 text-xs font-mono rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
        >
          Mutate energy
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
        {pods.map((pod, idx) => (
          <motion.div
            key={pod.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="relative p-4 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col items-center text-center group"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.4 }}
              className={`absolute inset-0 rounded-xl pointer-events-none ${
                pod.color === 'cyan'
                  ? 'bg-cyan-500/5'
                  : pod.color === 'violet'
                  ? 'bg-violet-500/5'
                  : 'bg-emerald-500/5'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              &lt;{pod.type}&gt;
            </span>
            <div className="text-sm font-mono text-slate-300 mb-2">{pod.name}</div>
            <motion.div
              key={pod.value}
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-lg font-bold font-mono px-3 py-1 rounded-lg ${
                pod.color === 'cyan'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : pod.color === 'violet'
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {pod.value}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-4 font-mono">
        ↳ Python dynamically binds variable labels to typed memory pods.
      </p>
    </div>
  );
};

const LoopVisualizer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setActiveStep(0);
      setPlaying(true);
    }
  }, [isRunning]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 4) {
          setPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [playing]);

  const steps = [1, 2, 3, 4, 5];

  return (
    <div className="relative h-full min-h-[260px] flex flex-col justify-between p-5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Zap className="w-4 h-4" />
          <span>KINETIC LOOP ACCELERATOR</span>
        </div>
        <button
          onClick={() => {
            setActiveStep(0);
            setPlaying(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
        >
          <Play className="w-3 h-3" /> Pulse Loop
        </button>
      </div>

      <div className="my-auto py-6">
        <div className="relative flex items-center justify-between px-2">
          {/* Connecting track */}
          <div className="absolute left-6 right-6 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2" />
          <motion.div
            className="absolute left-6 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 top-1/2 -translate-y-1/2"
            animate={{ width: `${(activeStep / 4) * 88}%` }}
            transition={{ duration: 0.4 }}
          />

          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            const isPassed = idx < activeStep;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.25 : 1,
                    boxShadow: isActive ? '0 0 20px rgba(0, 245, 255, 0.7)' : 'none',
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border transition-colors ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                      : isPassed
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {step}
                </motion.div>
                <span className="mt-2 text-[11px] font-mono text-slate-400">
                  {step * 20} km/s
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 font-mono">
        ↳ Iteration {activeStep + 1}/5: <span className="text-cyan-300">velocity = {(activeStep + 1) * 20} km/s</span>
      </p>
    </div>
  );
};

const NeuralVisualizer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const [epoch, setEpoch] = useState(0);
  // weight starts at 4.0, lr = 0.2 -> w_{n+1} = w_n * 0.6
  const weights = [4.0, 2.4, 1.44, 0.86, 0.52];
  const currentWeight = weights[epoch];
  const loss = (currentWeight * currentWeight).toFixed(2);

  useEffect(() => {
    if (isRunning) {
      setEpoch((prev) => (prev < 4 ? prev + 1 : 0));
    }
  }, [isRunning]);

  // Map weight [0..4] to SVG x [150..270], y = 120 - (w^2 / 16) * 90
  const ballX = 150 + (currentWeight / 4) * 110;
  const ballY = 125 - ((currentWeight * currentWeight) / 16) * 90;

  return (
    <div className="relative h-full min-h-[260px] flex flex-col justify-between p-5 rounded-xl bg-slate-950/80 border border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>GRADIENT DESCENT PHYSICS // L(w) = w²</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEpoch((e) => (e < 4 ? e + 1 : 0))}
            className="px-2.5 py-1 text-xs font-mono rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
          >
            Step Epoch ({epoch}/4)
          </button>
          <button
            onClick={() => setEpoch(0)}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="my-auto flex flex-col items-center">
        <svg viewBox="0 0 300 140" className="w-full max-w-[320px] h-36 overflow-visible">
          {/* Parabola Loss Curve */}
          <path
            d="M 40 35 Q 150 215 260 35"
            fill="none"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth="2.5"
          />
          {/* Minimum target */}
          <circle cx="150" cy="125" r="3" fill="#10b981" opacity="0.5" />
          <text x="150" y="138" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
            Global Minimum (w=0)
          </text>

          {/* Animated Rolling AI Orb */}
          <motion.circle
            animate={{ cx: ballX, cy: ballY }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            r="8"
            fill="#10b981"
            style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.9))' }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5">
        <span>Epoch: <strong className="text-emerald-400">{epoch}</strong></span>
        <span>Weight: <strong className="text-cyan-300">{currentWeight.toFixed(2)}</strong></span>
        <span>Loss: <strong className="text-violet-300">{loss}</strong></span>
      </div>
    </div>
  );
};

const PlaceholderVisualizer: React.FC = () => (
  <div className="relative h-full min-h-[260px] flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-center">
    <Layers className="w-10 h-10 text-slate-600 mb-3" />
    <h4 className="text-sm font-mono font-semibold text-slate-300 mb-1">
      MOTION GRAPHIC SLOT READY
    </h4>
    <p className="text-xs text-slate-500 max-w-xs">
      Upload your lesson content &amp; parameters in <code className="text-cyan-400">src/data/curriculum.ts</code> to activate this interactive simulation.
    </p>
  </div>
);
