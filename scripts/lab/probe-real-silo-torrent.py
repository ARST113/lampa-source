#!/usr/bin/env python3
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

BACKEND = os.environ.get('BACKEND', '').rstrip('/')
HASH = '5980c336abd6e498afa5b5461b5af4be52039e63'
MAGNET = f'magnet:?xt=urn:btih:{HASH}&dn=Silo.S03.2160p.ATVP.WEB-DL.SDR.H.265'
OUT = Path('lab-artifacts/real-silo-torrent.json')
OUT.parent.mkdir(parents=True, exist_ok=True)

result = {
    'backend': BACKEND,
    'hash': HASH,
    'add_ok': False,
    'metadata_ok': False,
    'e01': None,
    'e10': None,
    'stream_ok': False,
    'stream_status': None,
    'stream_bytes': 0,
    'error': None,
}


def post(path, payload, timeout=30):
    req = urllib.request.Request(
        BACKEND + path,
        data=json.dumps(payload).encode('utf-8'),
        method='POST',
        headers={'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'lampa-resume-live-probe'},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        data = response.read()
        text = data.decode('utf-8', errors='replace') if data else ''
        try:
            return json.loads(text) if text else None
        except json.JSONDecodeError:
            return text


def item_index(item):
    for key in ('id', 'index', 'file_index'):
        try:
            if item.get(key) is not None:
                return int(item[key])
        except Exception:
            pass
    return None


def find_episode(files, episode):
    rx = re.compile(rf'(?i)(?:^|[^a-z0-9])s03[ ._-]*e{episode:02d}(?:[^a-z0-9]|$)')
    for item in files or []:
        path = str(item.get('path') or item.get('name') or '')
        if rx.search(path):
            return {
                'id': item_index(item),
                'path': path,
                'length': item.get('length'),
            }
    return None


try:
    if not BACKEND.startswith('http'):
        raise RuntimeError('BACKEND is missing')

    try:
        post('/ts/torrents', {'action': 'drop', 'hash': HASH}, timeout=10)
    except Exception:
        pass

    add_response = post('/ts/torrents', {
        'action': 'add',
        'link': MAGNET,
        'title': '[LIVE TEST] Silo S03',
        'poster': '',
        'data': '',
        'save_to_db': False,
        'category': 'tv',
    }, timeout=45)
    result['add_ok'] = True
    result['add_response_type'] = type(add_response).__name__
    print('REAL_SILO_ADD_OK', type(add_response).__name__)

    info = None
    for attempt in range(30):
        try:
            candidate = post('/ts/torrents', {'action': 'get', 'hash': HASH}, timeout=12)
        except Exception as exc:
            candidate = None
            print('REAL_SILO_METADATA_POLL_ERROR', attempt + 1, str(exc)[:200])

        if isinstance(candidate, dict) and isinstance(candidate.get('file_stats'), list) and candidate['file_stats']:
            info = candidate
            break
        time.sleep(2)

    if not info:
        print('REAL_SILO_METADATA_UNAVAILABLE')
    else:
        files = info.get('file_stats') or []
        result['metadata_ok'] = True
        result['file_count'] = len(files)
        result['e01'] = find_episode(files, 1)
        result['e10'] = find_episode(files, 10)
        print('REAL_SILO_METADATA_OK', 'files=', len(files), 'e01=', result['e01'], 'e10=', result['e10'])

        e01 = result['e01']
        if e01 and e01.get('id') is not None and e01.get('path'):
            filename = str(e01['path']).replace('\\', '/').split('/')[-1]
            stream_url = (
                BACKEND + '/ts/stream/' + urllib.parse.quote(filename, safe='')
                + '?link=' + urllib.parse.quote(HASH, safe='')
                + '&index=' + str(e01['id']) + '&play'
            )
            req = urllib.request.Request(
                stream_url,
                method='GET',
                headers={'Range': 'bytes=0-65535', 'User-Agent': 'lampa-resume-live-probe'},
            )
            try:
                with urllib.request.urlopen(req, timeout=35) as response:
                    chunk = response.read(65536)
                    result['stream_status'] = response.status
                    result['stream_bytes'] = len(chunk)
                    result['stream_ok'] = response.status in (200, 206) and len(chunk) > 0
                    print('REAL_SILO_STREAM', 'status=', response.status, 'bytes=', len(chunk))
            except Exception as exc:
                result['stream_error'] = str(exc)
                print('REAL_SILO_STREAM_UNAVAILABLE', str(exc)[:300])
except Exception as exc:
    result['error'] = str(exc)
    print('REAL_SILO_PROBE_ERROR', str(exc)[:500])
finally:
    try:
        post('/ts/torrents', {'action': 'drop', 'hash': HASH}, timeout=10)
    except Exception:
        pass
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')

# Live peer/metadata availability is external, so this diagnostic does not fail the Resume
# correctness gate. The JSON artifact records exactly how far the real torrent path progressed.
