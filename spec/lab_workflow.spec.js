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

  it('runs the live backend Playwright suite only for full lab tests', () => {
    const workflow = read('.github/workflows/lab-control.yml');

    expect(workflow).toContain("steps.route.outputs.action == 'full'");
    expect(workflow).toContain('LAMPA_TEST_LAMPAC_URL');
    expect(workflow).toContain('npm run test:e2e:backend');
    expect(workflow).toContain('bash scripts/lab/run-with-heartbeat.sh');
    expect(workflow).toContain('playwright-report-live');
  });

  it('runs a real Codespace-to-Pages browser integration check during bootstrap', () => {
    const workflow = read('.github/workflows/lab-bootstrap.yml');

    for (const marker of [
      'actions/setup-node@v7',
      'npm install --no-audit --no-fund',
      'npx playwright install --with-deps chromium',
      "json.load(open('lab-artifacts/status.json'))['backend']",
      'LAMPA_TEST_LAMPAC_URL',
      'npm run test:e2e:backend',
      'playwright-report-live',
    ]) {
      expect(workflow, `bootstrap missing ${marker}`).toContain(marker);
    }
  });

  it('preserves the public Codespace host when bootstrap retries start-lab over SSH', () => {
    const workflow = read('.github/workflows/lab-bootstrap.yml');
    expect(workflow).toContain(
      'LAB_PUBLIC_HOST="${name}-9118.app.github.dev" bash .devcontainer/start-lab.sh',
    );
  });

  it('keeps lifecycle-free controller and heartbeat self-tests in normal CI', () => {
    const workflow = read('.github/workflows/lampa-test-stand.yml');

    expect(workflow).toContain('python3 -m unittest scripts.lab.test_codespace_control -v');
    expect(workflow).toContain('bash scripts/lab/test-run-with-heartbeat.sh');
    expect(workflow).not.toContain('codespace_control.py ensure');
    expect(workflow).not.toContain('codespace_control.py start');
  });
});
