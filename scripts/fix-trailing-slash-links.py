# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(r"C:\Users\david\Desktop\freshrescue-landing\src")
repls = [
    ('to="/explore"', 'to="/explore/"'),
    ('to="/partenaires"', 'to="/partenaires/"'),
    ('to="/actualites"', 'to="/actualites/"'),
    ('to="/blog"', 'to="/blog/"'),
    ('to="/terms"', 'to="/terms/"'),
    ('to="/instructions"', 'to="/instructions/"'),
    ('to="/merchant"', 'to="/merchant/"'),
    ("to={'/explore'}", "to={'/explore/'}"),
    ("to={'/merchant'}", "to={'/merchant/'}"),
    ("to={'/partenaires'}", "to={'/partenaires/'}"),
    ("to={'/actualites'}", "to={'/actualites/'}"),
    ("to={'/blog'}", "to={'/blog/'}"),
    ("to={'/terms'}", "to={'/terms/'}"),
    ("to={'/instructions'}", "to={'/instructions/'}"),
    ("to={`/actualites/${item.id}`}", "to={`/actualites/${item.id}/`}"),
    ("to={`/blog/${a.slug}`}", "to={`/blog/${a.slug}/`}"),
    (
        "const NEWS_PATH = '/actualites/partenariat-restaurants-des-chefs';",
        "const NEWS_PATH = '/actualites/partenariat-restaurants-des-chefs/';",
    ),
    (
        "location.pathname === '/explore'",
        "(location.pathname === '/explore' || location.pathname === '/explore/')",
    ),
    (
        "location.pathname === '/partenaires'",
        "(location.pathname === '/partenaires' || location.pathname === '/partenaires/')",
    ),
    (
        "location.pathname === '/actualites'",
        "(location.pathname === '/actualites' || location.pathname === '/actualites/')",
    ),
]

skip = {"Navbar.jsx"}
changed = []
for p in root.rglob("*"):
    if p.suffix not in {".js", ".jsx"}:
        continue
    if p.name in skip:
        continue
    t = p.read_text(encoding="utf-8")
    n = t
    for a, b in repls:
        n = n.replace(a, b)
    # avoid double slashes from re-running
    n = n.replace('to="/explore//"', 'to="/explore/"')
    n = n.replace('to="/partenaires//"', 'to="/partenaires/"')
    n = n.replace('to="/actualites//"', 'to="/actualites/"')
    n = n.replace('to="/blog//"', 'to="/blog/"')
    n = n.replace('to="/terms//"', 'to="/terms/"')
    n = n.replace('to="/instructions//"', 'to="/instructions/"')
    n = n.replace('to="/merchant//"', 'to="/merchant/"')
    if n != t:
        p.write_text(n, encoding="utf-8", newline="\n")
        changed.append(str(p.relative_to(root)))

print("changed", len(changed))
for c in changed:
    print(" ", c)
