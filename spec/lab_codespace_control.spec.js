import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';

describe('Codespaces lifecycle controller', () => {
  it('passes its Python unit-test contract', () => {
    const result = spawnSync('python3', ['-m', 'unittest', 'scripts.lab.test_codespace_control', '-v'], {
      encoding: 'utf8',
    });

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  }, 10_000);
});
