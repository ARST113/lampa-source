import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');

function renderWithEnv(env) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lampa-lab-conf-'));
  const output = path.join(dir, 'init.conf');

  try {
    const result = spawnSync('bash', [
      '.devcontainer/render-lab-init.sh',
      '--input', '.devcontainer/lab.init.conf',
      '--output', output,
    ], {
      encoding: 'utf8',
      env: { ...process.env, CODESPACE_NAME: '', GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: '', ...env },
    });

    expect(result.status, result.stderr || result.stdout).toBe(0);
    return JSON.parse(read(output));
  }
  finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('Codespaces full-stack lab runtime', () => {
  it('keeps one public Codespaces port and starts the lab on Codespace start', () => {
    const config = JSON.parse(read('.devcontainer/devcontainer.json'));
    expect(config.forwardPorts).toEqual([9118]);
    expect(config.portsAttributes['9118'].label).toBe('Lampac Full Stack Lab');
    expect(config.postStartCommand).toContain('.devcontainer/start-lab.sh');
  });

  it('routes the public 9118 gateway to Lampac and a dedicated current TorrServer sidecar', () => {
    const compose = read('.devcontainer/lab.compose.yml');
    const gateway = read('.devcontainer/lab.nginx.conf');
    expect(compose).toContain('ghcr.io/lampac-nextgen/lampac');
    expect(compose).toContain('ghcr.io/yourok/torrserver@sha256:4bf54fbd0cc095cdca8d854f95afee4223072ab7fdf378d0da50e5bb86dd8e77');
    expect(compose).toContain('nginx:');
    expect(compose).toContain('9118:9118');
    expect(compose).not.toContain('8090:8090');
    expect(gateway).toContain('proxy_pass http://lampac:9118');
    expect(gateway).toContain('proxy_pass http://torrserver:8090');
    expect(gateway).toContain('location = /ts');
    expect(gateway).toContain('location ^~ /ts/');
  });

  it('persists TorrServer state and enables TrackTimecode without mutating unrelated settings', () => {
    const compose = read('.devcontainer/lab.compose.yml');
    const configure = read('.devcontainer/configure-torrserver.sh');
    const start = read('.devcontainer/start-lab.sh');
    expect(compose).toContain('torrserver-data:/opt/ts');
    expect(compose).toContain('torrserver-data:');
    expect(configure).toContain('"TrackTimecode":false');
    expect(configure).toContain('"TrackTimecode":true');
    expect(configure).toContain('"action":"set","sets"');
    expect(start).toContain('configure-torrserver.sh');
  });

  it('smokes TrackTimecode through the same /ts gateway contract consumed by Lampa', () => {
    const smoke = read('.devcontainer/smoke-lab.sh');
    expect(smoke).toContain('/ts/echo');
    expect(smoke).toContain('/ts/settings');
    expect(smoke).toContain('/ts/viewed');
    expect(smoke).toContain('"timecode":17');
    expect(smoke).toContain('TRACK_TIMECODE');
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

  it('renders the Codespaces public host without requiring Python in the Codespace', () => {
    const config = renderWithEnv({ CODESPACE_NAME: 'silver-space-123' });
    expect(config.listen.host).toBe('silver-space-123-9118.app.github.dev');
    expect(config.listen.scheme).toBe('https');

    const compose = read('.devcontainer/lab.compose.yml');
    const start = read('.devcontainer/start-lab.sh');
    expect(compose).toContain('LAB_INIT_CONF');
    expect(start).toContain('render-lab-init.sh');
    expect(start).not.toContain('python3');
  });

  it('prefers an explicit LAB_PUBLIC_HOST when Codespaces SSH does not expose its environment', () => {
    const config = renderWithEnv({
      LAB_PUBLIC_HOST: 'silver-space-123-9118.app.github.dev',
      CODESPACE_NAME: '',
    });
    expect(config.listen.host).toBe('silver-space-123-9118.app.github.dev');
    expect(config.listen.scheme).toBe('https');
  });

  it('updates an existing runtime config in place so Docker bind mounts keep the same inode', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lampa-lab-inode-'));
    const output = path.join(dir, 'init.conf');
    fs.copyFileSync('.devcontainer/lab.init.conf', output);
    const before = fs.statSync(output).ino;

    try {
      const result = spawnSync('bash', [
        '.devcontainer/render-lab-init.sh',
        '--input', '.devcontainer/lab.init.conf',
        '--output', output,
      ], {
        encoding: 'utf8',
        env: {
          ...process.env,
          CODESPACE_NAME: '',
          GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: '',
          LAB_PUBLIC_HOST: 'silver-space-123-9118.app.github.dev',
        },
      });

      expect(result.status, result.stderr || result.stdout).toBe(0);
      expect(fs.statSync(output).ino).toBe(before);
      expect(JSON.parse(read(output)).listen.host).toBe('silver-space-123-9118.app.github.dev');
    }
    finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('repairs a stale bind mount without restarting an unchanged healthy lab', () => {
    const start = read('.devcontainer/start-lab.sh');
    expect(start).toContain('container_conf');
    expect(start).toContain('cmp -s "$RUNTIME_CONF" "$container_conf"');
    expect(start).toContain('--force-recreate');
    expect(start).toContain('config_changed');
    expect(start).toContain('restart lampac');
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
