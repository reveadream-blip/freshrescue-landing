# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]

# index + manifest
index = root / "index.html"
t = index.read_text(encoding="utf-8")
t = t.replace(
    "<!-- Google tag (gtag.js) : avec Consent Mode v2 (RGPD UE) -->",
    "<!-- Google tag (gtag.js), Consent Mode v2 (RGPD UE) -->",
)
t = t.replace(
    "<title>FreshRescue : App anti-gaspillage alimentaire</title>",
    "<title>FreshRescue : app anti-gaspillage alimentaire</title>",
)
index.write_text(t, encoding="utf-8", newline="\n")

manifest = root / "public" / "manifest.json"
t = manifest.read_text(encoding="utf-8")
t = t.replace(
    '"name": "FreshRescue : Anti-gaspillage alimentaire"',
    '"name": "FreshRescue : anti-gaspillage alimentaire"',
)
manifest.write_text(t, encoding="utf-8", newline="\n")

# Posters: language labels FR : -> FR ·
for name in ("poster-offres.html", "poster-install-pwa.html"):
    p = root / "public" / name
    t = p.read_text(encoding="utf-8")
    t = t.replace(" : ", " · ")
    p.write_text(t, encoding="utf-8", newline="\n")
    print(name, "emdash left:", t.count("\u2014"))

# Code comments: soften em dashes (not user-facing, but keep scrub complete)
for p in (root / "src").rglob("*"):
    if p.suffix not in {".js", ".jsx"}:
        continue
    t = p.read_text(encoding="utf-8")
    if "\u2014" not in t:
        continue
    t2 = t.replace(" : ", " : ").replace(" - ", " - ")
    if t2 != t:
        p.write_text(t2, encoding="utf-8", newline="\n")
        print("src", p.relative_to(root), "cleaned")

print("ok")
