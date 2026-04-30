#!/usr/bin/env python3
"""Scan images/unitedflooringamerica/galeria/ for images; write manifest.json there for gallery.html."""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAL = ROOT / "images" / "unitedflooringamerica" / "galeria"
ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".heic", ".heif"}


def main() -> None:
    GAL.mkdir(parents=True, exist_ok=True)
    names: list[str] = []
    if GAL.is_dir():
        for p in sorted(GAL.iterdir()):
            if p.is_file() and p.name != "manifest.json" and p.suffix.lower() in ALLOWED:
                names.append(p.name)
    out = {"images": names}
    (GAL / "manifest.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    rel = "images/unitedflooringamerica/galeria/manifest.json"
    print(f"{rel} -> {len(names)} image(s)")


if __name__ == "__main__":
    main()
