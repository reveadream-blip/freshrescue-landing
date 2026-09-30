# -*- coding: utf-8 -*-
from pathlib import Path

new = "Des sites et des gens avec qui on avance, autour de la restauration locale."
repls = [
    ("Des sites et des gens avec qui on avance, côté bouffe locale.", new),
    ("Des sites et des gens avec qui on avance, côté cuisine locale.", new),
    ("autour de la bouffe de proximité", "autour de la restauration locale"),
    ("autour de la cuisine de proximité", "autour de la restauration locale"),
    ("bonne bouffe", "bonne cuisine"),
]
files = [
    Path(r"C:\Users\david\Desktop\freshrescue-landing\src\lib\i18n.js"),
    Path(r"C:\Users\david\Desktop\freshrescue-landing\src\lib\seoConfig.js"),
    Path(r"C:\Users\david\Desktop\freshrescue-landing\scripts\humanize-copy.py"),
]
for p in files:
    t = p.read_text(encoding="utf-8")
    n = t
    for a, b in repls:
        n = n.replace(a, b)
    if n != t:
        p.write_text(n, encoding="utf-8", newline="\n")
        print("updated", p)
    else:
        print("unchanged", p, "bouffe=", t.count("bouffe"))

root = Path(r"C:\Users\david\Desktop\freshrescue-landing")
hits = []
for p in root.rglob("*"):
    if any(x in p.parts for x in ("node_modules", ".git", "dist", ".wrangler")):
        continue
    if p.suffix.lower() not in {".js", ".jsx", ".ts", ".tsx", ".html", ".md", ".py", ".txt", ".json"}:
        continue
    try:
        txt = p.read_text(encoding="utf-8")
    except Exception:
        continue
    if "bouffe" in txt:
        hits.append(str(p.relative_to(root)))
print("remaining bouffe files:", hits or "none")
