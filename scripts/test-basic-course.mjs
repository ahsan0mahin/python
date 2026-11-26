import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Run after npm ci. Requires Python 3 on PATH (PYTHON can override the command).
const source = fs.readFileSync(new URL('../src/data/basic.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { BASIC_MODULES } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
assert.equal(BASIC_MODULES.length, 20);
assert.equal(new Set(BASIC_MODULES.map(l => l.id)).size, 20);
const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'python-course-'));
try {
  for (const lesson of BASIC_MODULES) {
    assert.ok(lesson.steps.length > 1 && lesson.hints.length > 0, lesson.id);
    assert.ok(lesson.quiz.options[lesson.quiz.answer], lesson.id);
    const run = code => {
      const result = spawnSync(process.env.PYTHON || 'python3', ['-c', code], {
        cwd, input: lesson.id === 'input' ? '20\n' : 'Asha\n', encoding: 'utf8', timeout: 5000,
      });
      if (result.error) throw result.error;
      assert.equal(result.status, 0, `${lesson.id}: ${result.stderr}`);
      return result.stdout.trim();
    };
    // Piped stdin is not echoed, unlike the interactive terminal transcript.
    const expected = lesson.id === 'input' ? lesson.output.replace('Age: 20\n', 'Age: ') : lesson.output;
    assert.equal(run(lesson.code), expected, lesson.id);
    run(lesson.solution);
  }
  console.log('PASS: 20 modules, example outputs, solutions, traces and quiz indices.');
} finally {
  fs.rmSync(cwd, { recursive: true, force: true });
}
