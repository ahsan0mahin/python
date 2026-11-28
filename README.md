# PY-2050 Python Learning Lab

React + TypeScript + Vite learning app. Basic Python includes 20 guided modules with Bangla explanations, illustrated step-through traces, output prediction, practice prompts, progressive hints, explained solutions, recall quizzes and a capstone expense tracker.

## Development

```sh
npm ci
npm run dev
npm run build
```

## Course validation

Requires Python 3 and installed npm dependencies:

```sh
node scripts/test-basic-course.mjs
```

Checks module IDs, quiz answer indices, trace/hint presence, every example's output against real Python, and execution of all reference solutions. Browser interactions still need manual testing.

## Learning flow

Predict output, step through the example, write your own solution, run it in Python 3 locally, then compare with the explained solution and answer the recall question. Completion requires both a correct recall answer and self-confirmed practice; it is not an automated code assessment.

Progress is stored in this browser's localStorage, not an account. Completed lessons are scheduled for review after 1, 3, 7, 14 and then 30 days. The review button opens a due lesson; repeat the quiz and practice before scheduling the next review. Clearing browser data removes progress. Scratchpad code is temporary and resets when navigating away from a module.

## Kimi 3.1 Pro AI tutor

The floating **Kimi AI Tutor** button opens a chat powered by Moonshot AI's Kimi 3.1 Pro (`kimi-k3.1-pro`, OpenAI-compatible endpoint `https://api.moonshot.ai/v1`). The tutor sees the current lesson (module, concept, example code and output) and answers in Bangla or English — explanations, hints before solutions, output prediction help and debugging.

Setup — either:

1. **In the app:** open the tutor → settings gear → paste your Kimi API key (from [platform.kimi.ai](https://platform.kimi.ai)). The key is kept only in this browser's `localStorage`, or
2. **For local dev:** copy `.env.example` to `.env.local` and set `VITE_KIMI_API_KEY`. `.env.local` is gitignored.

Security notes: the key is never committed to git. `VITE_`-prefixed variables are embedded into **locally** built bundles (dev server or `npm run build` on your machine) — don't share local `dist` output publicly. The GitHub Pages workflow builds in CI **without** `.env.local`, so the deployed site ships no key; visitors add their own key through the tutor settings. Requests go straight from the browser to `api.moonshot.ai`; if your network blocks that host the tutor shows a connection error.

To verify the API is connected: open the tutor → settings gear → **Save & test connection**. It checks three steps with per-step results — key authentication (`GET /models`), model availability for the key, and a live chat round-trip (with response time).

The app does **not** embed a Python interpreter. Visual traces and displayed example outputs are authored walkthroughs, not execution of learner edits. Input examples show representative user input; file examples describe local files. Use Python 3 / IDLE for practice execution. Intermediate and advanced tracks remain previews, not completed courses.

## Deployment

GitHub Pages must use **GitHub Actions** as its source. The Pages workflow builds `dist` and deploys on pushes to `main`; PRs validate the build. Vite's base is `/python/` for this repository's project URL.
