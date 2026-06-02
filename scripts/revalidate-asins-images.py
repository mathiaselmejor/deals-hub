#!/usr/bin/env python3
"""
Revalida ASINs en amazon.es y extrae imagen real del producto.
Actualiza data/direct-asins.json con { amazon, imageUrl }.
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

FILES = [
    "products.json",
    "extra-products.json",
    "extra-products-2.json",
    "extra-products-3.json",
    "extra-products-4.json",
    "extra-products-5.json",
    "extra-products-aliexpress.json",
    "catalog-monetized.json",
]

ASIN_RE = re.compile(r"^[A-Z0-9]{10}$")
INVALID_TITLE = re.compile(
    r"documento no encontrado|page not found|no encontrado|dogs of amazon",
    re.I,
)
OG_IMAGE = re.compile(r'property="og:image"\s+content="([^"]+)"', re.I)


def load_json(name: str) -> dict:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def search_term(name: str) -> str:
    return name.split("—")[0].split("-")[0].strip()[:120]


def load_catalog() -> dict[str, str]:
    out: dict[str, str] = {}
    for f in FILES:
        data = load_json(f)
        for p in data.get("products") or []:
            out.setdefault(p["id"], p["name"])
    return out


def load_direct() -> dict:
    raw = json.loads((DATA / "direct-asins.json").read_text(encoding="utf-8"))
    raw.pop("_comment", None)
    return raw


def save_direct(m: dict) -> None:
    out = {
        "_comment": "ASIN + imagen real por producto. Revalidado en amazon.es.",
        **m,
    }
    (DATA / "direct-asins.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def accept_cookies(page) -> None:
    for sel in ("#sp-cc-accept", 'button:has-text("Aceptar")', 'button:has-text("Accept")'):
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=1200):
                btn.click(timeout=2000)
                page.wait_for_timeout(300)
                return
        except Exception:
            continue


def extract_og_image(page) -> str | None:
    html = page.content()
    m = OG_IMAGE.search(html)
    if not m:
        return None
    url = m.group(1).replace("&amp;", "&")
    if "unsplash" in url or "placeholder" in url:
        return None
    return url


def asin_from_search(page) -> str | None:
    for sel in ('[data-component-type="s-search-result"][data-asin]', '[data-asin]'):
        try:
            loc = page.locator(sel)
            for i in range(min(loc.count(), 8)):
                a = loc.nth(i).get_attribute("data-asin")
                if a and ASIN_RE.match(a.upper()) and a != "0000000000":
                    return a.upper()
        except Exception:
            pass
    return None


def validate_asin_page(page, asin: str) -> tuple[bool, str | None]:
    try:
        page.goto(
            f"https://www.amazon.es/dp/{asin}",
            wait_until="domcontentloaded",
            timeout=45000,
        )
        page.wait_for_timeout(700)
    except Exception:
        return False, None
    title = page.title() or ""
    if INVALID_TITLE.search(title):
        return False, None
    if "/dp/" not in page.url and "/gp/" not in page.url:
        return False, None
    img = extract_og_image(page)
    return True, img


def resolve_via_search(page, query: str) -> tuple[str | None, str | None]:
    try:
        page.goto(
            f"https://www.amazon.es/s?k={quote(query)}",
            wait_until="domcontentloaded",
            timeout=45000,
        )
        page.wait_for_timeout(900)
        accept_cookies(page)
        try:
            page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
        except PlaywrightTimeout:
            pass
        asin = asin_from_search(page)
        if not asin:
            return None, None
        ok, img = validate_asin_page(page, asin)
        if ok:
            return asin, img
        return asin, None
    except Exception:
        return None, None


def main() -> None:
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    delay_ms = int(sys.argv[2]) if len(sys.argv) > 2 else 1200
    force = "--force" in sys.argv
    skip_done = "--skip-done" in sys.argv

    catalog = load_catalog()
    direct = load_direct()
    ids = list(catalog.keys())
    if limit > 0:
        ids = ids[:limit]

    stats = {"ok": 0, "fixed": 0, "failed": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            locale="es-ES",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page.goto("https://www.amazon.es/", wait_until="domcontentloaded", timeout=45000)
        accept_cookies(page)

        for i, pid in enumerate(ids, 1):
            name = catalog[pid]
            cur = direct.get(pid)
            if skip_done and isinstance(cur, dict) and cur.get("amazon") and cur.get("imageUrl"):
                stats["ok"] += 1
                continue

            asin = None
            if isinstance(cur, dict):
                asin = cur.get("amazon")
            elif isinstance(cur, str):
                asin = cur

            asin = str(asin).upper() if asin and ASIN_RE.match(str(asin).upper()) else None
            img = None
            resolved = False

            if asin:
                ok, img = validate_asin_page(page, asin)
                if ok:
                    direct[pid] = {"amazon": asin, **({"imageUrl": img} if img else {})}
                    stats["ok"] += 1
                    resolved = True
                    if i % 20 == 0:
                        print(f"  [{i}/{len(ids)}] OK {pid} -> {asin}")

            if not resolved:
                q = search_term(name)
                new_asin, img = resolve_via_search(page, q)
                if new_asin:
                    entry: dict = {"amazon": new_asin}
                    if img:
                        entry["imageUrl"] = img
                    direct[pid] = entry
                    stats["fixed"] += 1
                    print(f"  [{i}/{len(ids)}] FIX {pid} -> {new_asin}")
                else:
                    stats["failed"] += 1
                    print(f"  [{i}/{len(ids)}] FAIL {pid}")

            if i % 5 == 0:
                save_direct(direct)

            page.wait_for_timeout(delay_ms)

        browser.close()

    save_direct(direct)
    print(f"\nRevalidación: ok={stats['ok']} fixed={stats['fixed']} failed={stats['failed']}")


if __name__ == "__main__":
    main()
