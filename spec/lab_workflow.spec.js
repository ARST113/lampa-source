import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('GitHub Full Stack Lab control workflow', () => {
  it('provides scheduled, manual, and issue-comment lifecycle control', () => {
    const workflow = read('.github/workflows/lab-control.yml');

    for (const marker of [
      'workflow_dispatch:',
      'issue_comment:',
      "cron: '17 */4 * * *'",
      'CODESPACES_PAT',
      'contents: read',
      'issues: write',
      'scripts/lab/codespace_control.py',
      'Lampa Full Stack Lab Control',
      '/lab ',
    ]) {
      expect(workflow, `missing ${marker}`).toContain(marker);
    }

    for (const action of ['status', 'ensure', 'start', 'stop', 'restart', 'smoke', 'full', 'logs']) {
      expect(workflow, `missing action ${action}`).toContain(action);
    }
  });

  it('keeps lifecycle-free controller and heartbeat self-tests in normal CI', () => {
    const workflow = read('.github/workflows/lampa-test-stand.yml');

    expect(workflow).toContain('python3 -m unittest scripts.lab.test_codespace_control -v');
    expect(workflow).toContain('bash scripts/lab/test-run-with-heartbeat.sh');
    expect(workflow).not.toContain('codespace_control.py ensure');
    expect(workflow).not.toContain('codespace_control.py start');
  });
});
