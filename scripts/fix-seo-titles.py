# -*- coding: utf-8 -*-
from pathlib import Path
import re

p = Path("src/lib/seoConfig.js")
t = p.read_text(encoding="utf-8")
t = t.replace(
    "fr par défaut. marché francophone, multi-pays",
    "fr par défaut, marché francophone, multi-pays",
)
t = t.replace(
    "${BRAND}. App anti-gaspillage alimentaire",
    "${BRAND} : app anti-gaspillage alimentaire",
)
t = re.sub(r"\. \$\{BRAND\}`", " | ${BRAND}`", t)
t = t.replace("gastronomie responsable.", "gastronomie.")
t = t.replace(
    "partenariats commerçants et initiatives anti-gaspillage",
    "partenariats et anti-gaspillage",
)
t = t.replace("et rôle des commerçants", "et commerçants")
t = t.replace("Instructions commerçants & clients", "Instructions commerçants et clients")
p.write_text(t, encoding="utf-8", newline="\n")

for line in t.splitlines():
    if "title:" in line:
        print(line)
