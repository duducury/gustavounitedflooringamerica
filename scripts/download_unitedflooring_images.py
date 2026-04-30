"""
Download canonical image assets from unitedflooringamerica.com CDNs (embedded in page HTML).
Preserves original filenames under images/unitedflooringamerica/
"""
from __future__ import annotations

import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "unitedflooringamerica"

# Unique source URLs extracted from current site HTML (not leadconnector resizer URLs)
SOURCES = [
    # filesafe — main hero + section assets
    "https://assets.cdn.filesafe.space/4aO5D4dK7ju2LOjhLWrH/media/6909d00c224326dcc056b9a6.jpeg",
    "https://assets.cdn.filesafe.space/4aO5D4dK7ju2LOjhLWrH/media/a04a0a44-83bc-4048-a334-c57de6ca8d4b.png",
    "https://assets.cdn.filesafe.space/4aO5D4dK7ju2LOjhLWrH/media/b949b614-bde8-47d8-a548-37f485ea1002.png",
    "https://assets.cdn.filesafe.space/4aO5D4dK7ju2LOjhLWrH/media/df1f9f1c-b92b-4626-add5-f277f0f142a5.png",
    "https://assets.cdn.filesafe.space/4aO5D4dK7ju2LOjhLWrH/media/feb966c5-a1f6-4e4c-8031-07fdbb1e709e.png",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69b177d5c2389c5bbb48815d.jpg",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69bbf9330be72abed4a547f2.webp",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69bbfebc2f5f65454c460c70.png",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69bbfebc8e66f16678ceb73c.png",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69bbfebc8e66f1ea12ceb73d.png",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69bbfebca37cc27014029e65.png",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69c2acb681b37410cda7433c.webp",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69c2acb688a0566ac60f9075.webp",
    "https://assets.cdn.filesafe.space/7JW4nDG2g9wP9xwF3uxM/media/69c2acb69728a17908b5dd42.webp",
    # portfolio — Google bucket used by page builder
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac7272398ef61a9c3773a.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac7272398ef72afc37739.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac72762a05f02017354cd.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac72762a05f3eb07354cb.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac72762a05f41277354cc.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac72762a05f64517354ce.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac72765b0eb2f25575bb7.jpeg",
    "https://storage.googleapis.com/msgsndr/5LAOzaPhH4jvu2ynkFwN/media/68bac727af0b9d8c8275d5cd.jpeg",
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ctx = ssl.create_default_context()
    for url in SOURCES:
        name = url.rsplit("/", 1)[-1]
        dest = OUT / name
        print("GET", url)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; UFA-mirror/1.0)"})
        with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
            dest.write_bytes(r.read())
        print(" ->", dest.relative_to(ROOT))
    print("Done:", len(SOURCES), "files")


if __name__ == "__main__":
    main()
