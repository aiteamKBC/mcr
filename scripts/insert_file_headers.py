# MCR file header: scripts\insert_file_headers.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
extmap = {
    ".py": "#",
    ".ts": "//",
    ".tsx": "//",
    ".js": "//",
    ".jsx": "//",
    ".d.ts": "//",
}
changed = 0
skipped = 0
for path in sorted(root.rglob("*")):
    if not path.is_file():
        continue
    if path.suffix not in extmap and not path.name.endswith(".d.ts"):
        continue
    text = path.read_text(encoding="utf-8")
    first_lines = text.splitlines()[:5]
    if any("MCR file header:" in line for line in first_lines):
        skipped += 1
        continue
    prefix = extmap.get(path.suffix, "//")
    lines = text.splitlines(keepends=True)
    insert_at = 0
    if path.suffix == ".py":
        if lines and lines[0].startswith("#!"):
            insert_at = 1
        header = f"{prefix} MCR file header: {path.relative_to(root)}\n{prefix} This file is part of the MCR application source.\n\n"
    else:
        if lines and lines[0].strip() in ('"use client";', "'use client';", '"use strict";', "'use strict';"):
            insert_at = 1
        header = f"{prefix} MCR file header: {path.relative_to(root)}\n{prefix} This file is part of the MCR application source.\n\n"
    lines.insert(insert_at, header)
    path.write_text(''.join(lines), encoding="utf-8")
    changed += 1
print(f"Inserted header comments into {changed} files, skipped {skipped} files that already had headers.")
