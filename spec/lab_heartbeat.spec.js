import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';

describe('Codespaces long-test heartbeat', () => {
  it('emits heartbeat output and preserves the child exit code', () => {
    const result = spawnSync('bash', ['scripts/lab/test-run-with-heartbeat.sh'], {
      encoding: 'utf8',
    });

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).toContain('heartbeat wrapper test passed');
  }, 10_000);
});
