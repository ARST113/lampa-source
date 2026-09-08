import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

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

  it('enables the required Lampac modules without access DB or WAF', () => {
    const conf = read('.devcontainer/lab.init.conf');
    for (const key of ['"jacred": true', '"tmdbProxy": true', '"online": true', '"torrserver": true']) {
      expect(conf).toContain(key);
    }
    expect(conf).toContain('"accsdb"');
    expect(conf).toContain('"enable": false');
  });
});
