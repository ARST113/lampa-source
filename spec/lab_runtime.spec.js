import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');

describe('Codespaces full-stack lab runtime', () => {
  it('forwards only Lampac port 9118 and starts the lab on Codespace start', () => {
    const config = JSON.parse(read('.devcontainer/devcontainer.json'));
    expect(config.forwardPorts).toEqual([9118]);
    expect(config.portsAttributes['9118'].label).toBe('Lampac Full Stack Lab');
    expect(config.postStartCommand).toContain('.devcontainer/start-lab.sh');
  });

  it('runs one Lampac service using the published NextGen image', () => {
    const compose = read('.devcontainer/lab.compose.yml');
    expect(compose).toContain('ghcr.io/lampac-nextgen/lampac');
    expect(compose).toContain('9118:9118');
    expect(compose).not.toContain('8090:8090');
  });

  it('does not overlay Lampac writable database/cache directories with root-owned named volumes', () => {
    const compose = read('.devcontainer/lab.compose.yml');
    expect(compose).not.toContain('/lampac/data');
    expect(compose).not.toContain('/lampac/cache');
    expect(compose).not.toContain('lampac-lab-data');
    expect(compose).not.toContain('lampac-lab-cache');
  });

  it('runs smoke checks through bash so git-reset file modes cannot break startup', () => {
    const start = read('.devcontainer/start-lab.sh');
    expect(start).toContain('exec bash "$ROOT/.devcontainer/smoke-lab.sh"');
    expect(start).not.toContain('exec "$ROOT/.devcontainer/smoke-lab.sh"');
  });

  it('renders the Codespaces public host into Lampac runtime configuration', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lampa-lab-conf-'));
    const output = path.join(dir, 'init.conf');

    try {
      const result = spawnSync('python3', [
        '.devcontainer/render-lab-init.py',
        '--input', '.devcontainer/lab.init.conf',
        '--output', output,
      ], {
        encoding: 'utf8',
        env: { ...process.env, CODESPACE_NAME: 'silver-space-123' },
      });

      expect(result.status, result.stderr || result.stdout).toBe(0);
      const config = JSON.parse(read(output));
      expect(config.listen.host).toBe('silver-space-123-9118.app.github.dev');
      expect(config.listen.scheme).toBe('https');

      const compose = read('.devcontainer/lab.compose.yml');
      const start = read('.devcontainer/start-lab.sh');
      expect(compose).toContain('LAB_INIT_CONF');
      expect(start).toContain('render-lab-init.py');
    }
    finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('enables the required Lampac modules without access DB or WAF', () => {
    const conf = read('.devcontainer/lab.init.conf');
    for (const key of ['"jacred": true', '"tmdbProxy": true', '"online": true', '"torrserver": true']) {
      expect(conf).toContain(key);
    }
    expect(conf).toContain('"accsdb"');
    expect(conf).toContain('"enable": false');
  });
});
