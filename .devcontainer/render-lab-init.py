#!/usr/bin/env python3
import argparse
import json
import os
import re
from pathlib import Path


def public_host(codespace_name: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9-]+", codespace_name):
        raise ValueError("CODESPACE_NAME contains unsupported characters")

    domain = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev").strip(".")
    if not re.fullmatch(r"[A-Za-z0-9.-]+", domain):
        raise ValueError("Codespaces forwarding domain contains unsupported characters")

    return f"{codespace_name}-9118.{domain}"


def render(source: Path, output: Path) -> None:
    config = json.loads(source.read_text(encoding="utf-8"))
    codespace_name = os.environ.get("CODESPACE_NAME", "").strip()

    if codespace_name:
        listen = config.setdefault("listen", {})
        listen["host"] = public_host(codespace_name)
        listen["scheme"] = "https"

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(config, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Render Lampac Full Stack Lab runtime configuration")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    render(args.input, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
