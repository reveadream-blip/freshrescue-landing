# -*- coding: utf-8 -*-
from pathlib import Path
import os

SKIP = {"node_modules", ".git", "dist", "build", ".next", "coverage", ".turbo", "vendor", "__pycache__"}
ROOTS = [
    Path(r"C:\Users\david\Desktop\freshrescue-landing"),
    Path(r"C:\Users\david\Desktop\AppliManagement"),
    Path(r"C:\Users\david\Desktop\devenirautonome"),
    Path(r"C:\Users\david\Desktop\ECOCONSO"),
    Path(r"C:\Users\david\Desktop\jlt-phuket"),
    Path(r"C:\Users\david\Desktop\thailandeservices"),
    Path(r"C:\Users\david\Desktop\multisite-publisher"),
    Path(r"C:\Users\david\Desktop\batipro-crm"),
    Path(r"C:\Users\david\Desktop\Platform Farang-Thai"),
    Path(r"C:\Users\david\Desktop\Tunes"),
    Path(r"C:\Users\david\Desktop\Easy travel"),
    Path(r"C:\Users\david\Desktop\troc et survie"),
    Path(r"C:\Users\david\Desktop\SEO"),
    Path(r"C:\Users\david\Desktop\JLT"),
]

for root in ROOTS:
    if not root.exists():
        continue
    found = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP]
        for fn in fns:
            low = fn.lower()
            p = Path(dp) / fn
            rel = str(p.relative_to(root))
            if low in {"robots.txt", "sitemap.xml", "sitemap.xml.gz"} or "seo" in low:
                found.append(rel)
            elif low == "index.html" and p.parent == root:
                found.append(rel)
            elif low in {"layout.tsx", "layout.jsx", "layout.js"}:
                found.append(rel)
    print(root.name + ":")
    for f in found[:15]:
        print(" ", f)
    if len(found) > 15:
        print("  ...", len(found) - 15, "more")
