# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(r"C:\Users\david\Desktop\Easy travel\index.html")
t = p.read_text(encoding="utf-8", errors="replace")
# Normalize broken title variants
for bad in (
    "Lieux � d�couvrir autour de vous",
    "Lieux a decouvrir autour de vous",
):
    t = t.replace(bad, "Lieux à découvrir autour de vous")
# Also regex-ish replace any mojibake between Lieux and autour
import re

t = re.sub(
    r"Lieux .{0,12}autour de vous",
    "Lieux à découvrir autour de vous",
    t,
)
p.write_text(t, encoding="utf-8", newline="\n")
print("easy:", "à découvrir" in t)

root = Path(r"C:\Users\david\Desktop\AppliManagement")
for html in root.glob("*.html"):
    text = html.read_text(encoding="utf-8", errors="replace")
    new = text.replace(
        "banniere%20applimanagement.png", "banniere-applimanagement.png"
    ).replace("banniere applimanagement.png", "banniere-applimanagement.png")
    if html.name == "plugins-extensions.html":
        new = new.replace(
            'hreflang="x-default" href="https://applimanagement.com/plugins-extensions-en"',
            'hreflang="x-default" href="https://applimanagement.com/plugins-extensions"',
        )
    if new != text:
        html.write_text(new, encoding="utf-8", newline="\n")
        print("fixed", html.name)

for name, can in (
    ("privacy.html", "https://applimanagement.com/privacy"),
    ("sos-applimanagement.html", "https://applimanagement.com/sos-applimanagement"),
):
    path = root / name
    if not path.exists():
        print("skip", name)
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    if 'rel="canonical"' in text:
        continue
    if "</head>" not in text:
        continue
    inj = (
        f'    <link rel="canonical" href="{can}">\n'
        '    <meta name="robots" content="index, follow">\n'
    )
    path.write_text(text.replace("</head>", inj + "</head>", 1), encoding="utf-8", newline="\n")
    print("canonical", name)
