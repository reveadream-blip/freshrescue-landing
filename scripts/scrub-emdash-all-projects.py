# -*- coding: utf-8 -*-
"""Retire : et : des projets Desktop sans entrer dans node_modules / .next."""
from __future__ import annotations

import os
from pathlib import Path

ROOTS = [
    Path(r"C:\Users\david\Desktop\AppliManagement"),
    Path(r"C:\Users\david\Desktop\Restaurants des chefs"),
    Path(r"C:\Users\david\Desktop\multisite-publisher"),
    Path(r"C:\Users\david\Desktop\thailandeservices"),
    Path(r"C:\Users\david\Desktop\ECOCONSO"),
    Path(r"C:\Users\david\Desktop\devenirautonome"),
    Path(r"C:\Users\david\Desktop\jlt-phuket"),
    Path(r"C:\Users\david\Desktop\batipro-crm"),
    Path(r"C:\Users\david\Desktop\Epicerie"),
    Path(r"C:\Users\david\Desktop\SEO"),
    Path(r"C:\Users\david\Desktop\freshrescue-landing"),
    Path(r"C:\Users\david\Desktop\Platform Farang-Thai"),
    Path(r"C:\Users\david\Desktop\Tunes"),
    Path(r"C:\Users\david\Desktop\comptes"),
    Path(r"C:\Users\david\Desktop\Easy travel"),
    Path(r"C:\Users\david\Desktop\JLT"),
    Path(r"C:\Users\david\Desktop\troc et survie"),
]

SKIP_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    ".turbo",
    "vendor",
    "__pycache__",
    ".venv",
    "venv",
    "target",
    ".dart_tool",
    ".wrangler",
    ".cache",
    "out",
    "ios",
    "android",
}

EXTS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".md",
    ".mdx",
    ".txt",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".php",
    ".dart",
    ".py",
    ".sql",
    ".svg",
    ".xml",
    ".csv",
}

MAX_BYTES = 5_000_000


def scrub_text(t: str) -> str:
    return (
        t.replace(" : ", " : ")
        .replace(" - ", " - ")
        .replace(" : ", " : ")
        .replace("-", "-")
    )


def iter_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            yield Path(dirpath) / name


def main() -> None:
    total = 0
    for root in ROOTS:
        if not root.exists():
            print("skip missing", root, flush=True)
            continue
        n = 0
        print("scan", root.name, flush=True)
        for p in iter_files(root):
            if p.suffix.lower() not in EXTS:
                continue
            try:
                size = p.stat().st_size
            except OSError:
                continue
            if size == 0 or size > MAX_BYTES:
                continue
            try:
                text = p.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError):
                continue
            if "\u2014" not in text and "\u2013" not in text:
                continue
            new = scrub_text(text)
            if new == text:
                continue
            p.write_text(new, encoding="utf-8", newline="\n")
            n += 1
            total += 1
        print(f"  -> {n} files", flush=True)
    print(f"TOTAL files: {total}", flush=True)


if __name__ == "__main__":
    main()
