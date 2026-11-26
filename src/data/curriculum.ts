export type TrackId = 'basic' | 'intermediate' | 'advanced';

export type VisualizerType = 'memory' | 'loop' | 'neural' | 'placeholder';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  summary: string;
  visualizerType: VisualizerType;
  starterCode: string;
  expectedOutput: string;
  isContentReady: boolean;
}

export interface Track {
  id: TrackId;
  tier: string;
  title: string;
  subtitle: string;
  accentColor: 'cyan' | 'violet' | 'emerald';
  description: string;
  lessons: Lesson[];
}

export const CURRICULUM_TRACKS: Track[] = [
  {
    id: 'basic',
    tier: 'TIER 01',
    title: 'Basic Python',
    subtitle: 'Core Foundations & Logic',
    accentColor: 'cyan',
    description:
      '20 guided modules: Bangla explanations, illustrated traces, challenges, hints, solutions, quizzes and spaced revision.',
    lessons: [
      {
        id: 'basic-variables',
        title: '01. Variables & Quantum Memory Boxes',
        duration: '5 min',
        summary:
          'See how Python binds names to values in memory—like glowing energy containers that dynamically adapt to data types.',
        visualizerType: 'memory',
        starterCode: `# Variables in Python act like labeled energy pods
energy = 100
name = "Ahsan"
is_online = True

print(f"Pilot {name} | Energy: {energy}% | Online: {is_online}")`,
        expectedOutput: 'Pilot Ahsan | Energy: 100% | Online: True',
        isContentReady: true,
      },
      {
        id: 'basic-loops',
        title: '02. Loops & Kinetic Flow',
        duration: '7 min',
        summary:
          'Watch a pulse travel through a for-loop step-by-step, just like a particle moving through a magnetic accelerator.',
        visualizerType: 'loop',
        starterCode: `# Kinetic Loop Simulation
for step in range(1, 6):
    velocity = step * 20
    print(f"Pulse #{step} -> Velocity: {velocity} km/s")`,
        expectedOutput: `Pulse #1 -> Velocity: 20 km/s
Pulse #2 -> Velocity: 40 km/s
Pulse #3 -> Velocity: 60 km/s
Pulse #4 -> Velocity: 80 km/s
Pulse #5 -> Velocity: 100 km/s`,
        isContentReady: true,
      },
      {
        id: 'basic-functions',
        title: '03. Functions & Modular Gates',
        duration: '6 min',
        summary:
          'Content slot ready — upload your custom explanation, interactive challenge, and motion-graphic parameters.',
        visualizerType: 'placeholder',
        starterCode: `def warp_jump(distance, speed=10):
    return distance / speed

print("Jump time:", warp_jump(500))`,
        expectedOutput: 'Jump time: 50.0',
        isContentReady: false,
      },
    ],
  },
  {
    id: 'intermediate',
    tier: 'TIER 02',
    title: 'Intermediate Python',
    subtitle: 'Architecture & Data Structures',
    accentColor: 'violet',
    description:
      'Level up with Lists, Dictionaries, OOP Blueprints, Decorators, and Async streams.',
    lessons: [
      {
        id: 'inter-oop',
        title: '01. Object-Oriented Blueprints',
        duration: '10 min',
        summary:
          'Content slot ready — visualize Classes as 2050 holographic blueprints spawning live object instances.',
        visualizerType: 'placeholder',
        starterCode: `class NeuralBot:
    def __init__(self, model):
        self.model = model

    def activate(self):
        return f"{self.model} online."

bot = NeuralBot("PY-2050")
print(bot.activate())`,
        expectedOutput: 'PY-2050 online.',
        isContentReady: false,
      },
      {
        id: 'inter-async',
        title: '02. Async & Parallel Streams',
        duration: '8 min',
        summary:
          'Content slot ready — watch concurrent coroutines race across non-blocking timelines.',
        visualizerType: 'placeholder',
        starterCode: `import asyncio

async def fetch_signal():
    return "Signal locked."

print("Async module ready")`,
        expectedOutput: 'Async module ready',
        isContentReady: false,
      },
    ],
  },
  {
    id: 'advanced',
    tier: 'TIER 03',
    title: 'Advanced Python (AI & ML)',
    subtitle: 'Tensors, Neural Nets & Gradient Descent',
    accentColor: 'emerald',
    description:
      'Understand Machine Learning & AI intuitively—watch gradients descend, weights update, and neural layers fire in real time.',
    lessons: [
      {
        id: 'adv-gradient',
        title: '01. Gradient Descent Physics',
        duration: '12 min',
        summary:
          'Just like a ball rolling down a valley in physics, watch an AI model minimize loss by adjusting weights step-by-step.',
        visualizerType: 'neural',
        starterCode: `# Gradient Descent Step Simulation
weight = 4.0
learning_rate = 0.2

for epoch in range(1, 5):
    gradient = 2 * weight  # derivative of w^2
    weight = weight - learning_rate * gradient
    print(f"Epoch {epoch} | Weight: {weight:.2f} | Loss: {weight**2:.2f}")`,
        expectedOutput: `Epoch 1 | Weight: 2.40 | Loss: 5.76
Epoch 2 | Weight: 1.44 | Loss: 2.07
Epoch 3 | Weight: 0.86 | Loss: 0.75
Epoch 4 | Weight: 0.52 | Loss: 0.27`,
        isContentReady: true,
      },
      {
        id: 'adv-tensors',
        title: '02. NumPy Tensors & Matrix Motion',
        duration: '10 min',
        summary:
          'Content slot ready — upload your NumPy & PyTorch tensor transformation lessons.',
        visualizerType: 'placeholder',
        starterCode: `# Tensor transformation slot
matrix = [[1, 2], [3, 4]]
print("Tensor shape: 2x2")`,
        expectedOutput: 'Tensor shape: 2x2',
        isContentReady: false,
      },
    ],
  },
];
