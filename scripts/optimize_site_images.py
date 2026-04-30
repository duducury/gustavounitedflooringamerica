"""
Optimise JPG/PNG originals in images/unitedflooringamerica/ (JPEG re-encode + resize caps).
pip install pillow
"""
from __future__ import annotations

import io
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "images" / "unitedflooringamerica"


def backup_once(path: Path) -> None:
    bak = path.with_suffix(path.suffix + ".bak-before-opt")
    if not path.exists():
        return
    if not bak.exists():
        bak.write_bytes(path.read_bytes())


def save_jpeg(img: Image.Image, path: Path, quality: int, max_edge: int | None = None) -> int:
    im = ImageOps.exif_transpose(img)
    rgb = im.convert("RGB") if im.mode not in ("RGB", "L") else im.convert("RGB")
    w, h = rgb.size
    if max_edge and max(w, h) > max_edge:
        scale = max_edge / max(w, h)
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        rgb = rgb.resize((nw, nh), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    rgb.save(
        buf,
        format="JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling=2,
    )
    backup_once(path)
    path.write_bytes(buf.getvalue())
    return buf.getbuffer().nbytes


def optimise_hero_banners_from_png() -> tuple[str | None, str | None]:
    """Produce baner0.1-hero.jpg (+ mobile) replacing multi-MB PNGs in markup."""
    out_desktop = IMG_DIR / "baner0.1-hero.jpg"
    out_mobile = IMG_DIR / "baner0.1-hero-mobile.jpg"
    d = m = None
    src_wide = IMG_DIR / "baner0.1.png"
    src_tel = IMG_DIR / "baner0.1tel.png"
    if src_wide.exists():
        sz = save_jpeg(Image.open(src_wide), out_desktop, 85, 1920)
        d = f"{sz // 1024}KB"
        print(f"[banner] baner0.1.png -> baner0.1-hero.jpg (~{d})")
    if src_tel.exists():
        sz = save_jpeg(Image.open(src_tel), out_mobile, 86, 1000)
        m = f"{sz // 1024}KB"
        print(f"[banner] baner0.1tel.png -> baner0.1-hero-mobile.jpg (~{m})")
    return d, m


def optimise_logo_static() -> None:
    lg = IMG_DIR / "logo.jpg"
    if lg.exists():
        im = Image.open(lg)
        before = lg.stat().st_size
        n = save_jpeg(im, lg, 88, max_edge=520 if max(im.size) > 520 else None)
        print(f"[logo] {before // 1024}KB -> {n // 1024}KB (max edge 520)")

    for name in ("static1.jpeg",):
        p = IMG_DIR / name
        if not p.exists():
            continue
        before = p.stat().st_size
        n = save_jpeg(Image.open(p), p, 84, max_edge=2200)
        print(f"[bg] {name} {before // 1024}KB -> {n // 1024}KB")


def optimise_large_site_jpegs() -> None:
    """Re-smooth large gallery/site JPEG originals."""
    skipped = {"baner0.1.jpg", "baner2.jpg", "baner3.jpg", "baner.jpg"}
    skip_names = frozenset(("static1.jpeg",))
    for path in IMG_DIR.glob("*.jpeg"):
        if path.name in skip_names:
            continue
        if path.stat().st_size < 280_000:
            continue
        im = Image.open(path)
        w, _ = im.size
        edge = 1600 if w > 1650 else None
        n = save_jpeg(im, path, 84, max_edge=edge)
        print(f"[jpeg] {path.name} -> {n // 1024}KB (cap={edge})")

    for path in IMG_DIR.glob("*.jpg"):
        if path.name.startswith("baner0.1"):
            continue  # originals like baner0.1.jpg not used vs new hero JPGs
        if path.stat().st_size < 280_000:
            continue
        if path.name in skipped:
            continue
        im = Image.open(path)
        w, _ = im.size
        edge = 1600 if w > 1650 else None
        n = save_jpeg(im, path, 84, max_edge=edge)
        print(f"[jpg] {path.name} -> {n // 1024}KB (cap={edge})")


def main() -> None:
    print("IMAGE_DIR=", IMG_DIR)
    optimise_hero_banners_from_png()
    optimise_large_site_jpegs()
    optimise_logo_static()
    print("done.")


if __name__ == "__main__":
    main()
