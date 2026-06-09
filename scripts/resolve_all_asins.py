#!/usr/bin/env python3
"""
Resuelve ASIN de Amazon para todo el catálogo vía búsqueda en amazon.es (Playwright).
Escribe data/direct-asins.json y data/asin-resolve-progress.json
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

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
    "extra-products-6.json",
    "extra-products-7.json",
    "extra-products-8.json",
    "extra-products-9.json",
    "catalog-monetized.json",
]

ASIN_RE = re.compile(r"^[A-Z0-9]{10}$")
DP_RE = re.compile(r"/dp/([A-Z0-9]{10})", re.I)


def load_json(name: str) -> dict:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def search_term(name: str) -> str:
    return name.split("—")[0].split("-")[0].strip()[:120]


def extract_asin_from_page(page) -> str | None:
    asins: list[str] = []
    for sel in (
        '[data-component-type="s-search-result"][data-asin]',
        '[data-asin]:not([data-asin=""])',
    ):
        try:
            loc = page.locator(sel)
            count = min(loc.count(), 12)
            for i in range(count):
                a = loc.nth(i).get_attribute("data-asin")
                if a and ASIN_RE.match(a.upper()) and a != "0000000000":
                    asins.append(a.upper())
        except Exception:
            pass
    if not asins:
        html = page.content()
        for m in DP_RE.finditer(html):
            asins.append(m.group(1).upper())
    # dedupe preserve order
    seen: set[str] = set()
    for a in asins:
        if a not in seen:
            seen.add(a)
            return a
    return None


def accept_cookies(page) -> None:
    for sel in (
        "#sp-cc-accept",
        'input[name="accept"]',
        'button:has-text("Aceptar")',
        'button:has-text("Accept")',
    ):
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=1500):
                btn.click(timeout=2000)
                page.wait_for_timeout(400)
                return
        except Exception:
            continue


def load_catalog_ids() -> dict[str, str]:
    ids: dict[str, str] = {}
    for f in FILES:
        data = load_json(f)
        for p in data.get("products") or []:
            if p["id"] not in ids:
                ids[p["id"]] = p["name"]
    return ids


def load_direct_map() -> dict:
    p = DATA / "direct-asins.json"
    m = json.loads(p.read_text(encoding="utf-8"))
    m.pop("_comment", None)
    return m


def load_progress() -> dict:
    p = DATA / "asin-resolve-progress.json"
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {"resolved": {}, "failed": []}


def save_progress(prog: dict) -> None:
    (DATA / "asin-resolve-progress.json").write_text(
        json.dumps(prog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def save_direct_map(m: dict) -> None:
    out = {
        "_comment": "ASIN / URL directa por producto. Generado por resolve_all_asins.py",
        **m,
    }
    (DATA / "direct-asins.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> None:
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    delay_ms = int(sys.argv[2]) if len(sys.argv) > 2 else 1400
    prefix = sys.argv[3] if len(sys.argv) > 3 else ""
    retry_failed = len(sys.argv) > 4 and sys.argv[4] == "retry"
    if prefix and re.match(r"^c\d$", prefix):
        prefix = f"{prefix}-"

    catalog = load_catalog_ids()
    direct = load_direct_map()
    prog = load_progress()

    todo: list[tuple[str, str]] = []
    for pid, name in catalog.items():
        if prefix and not (pid == prefix or pid.startswith(prefix)):
            continue
        cur = direct.get(pid)
        existing = cur.get("amazon") if isinstance(cur, dict) else cur
        if existing and ASIN_RE.match(str(existing).upper()):
            continue
        if pid in prog["resolved"]:
            direct[pid] = {"amazon": prog["resolved"][pid]}
            continue
        if pid in prog.get("failed", []) and not retry_failed:
            continue
        todo.append((pid, name))

    if limit > 0:
        todo = todo[:limit]

    label = f" prefijo={prefix}" if prefix else ""
    print(f"Catálogo: {len(catalog)} productos | Pendientes{label}: {len(todo)} | Ya mapeados: {len(direct)}")

    if not todo:
        save_direct_map(direct)
        print("Nada pendiente.")
        return

    resolved_n = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            locale="es-ES",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        try:
            page.goto("https://www.amazon.es/", wait_until="domcontentloaded", timeout=45000)
            accept_cookies(page)
        except Exception as e:
            print("Aviso: cookies/home:", e)

        for i, (pid, name) in enumerate(todo, 1):
            q = search_term(name)
            asin: str | None = None
            try:
                from urllib.parse import quote

                url = f"https://www.amazon.es/s?k={quote(q)}"
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(800)
                if "validateCaptcha" in page.url or "ap/signin" in page.url:
                    print(f"  [{i}] CAPTCHA/login — pausa {pid}")
                    prog.setdefault("failed", []).append(pid)
                    save_progress(prog)
                    time.sleep(5)
                    continue
                accept_cookies(page)
                try:
                    page.wait_for_selector(
                        '[data-component-type="s-search-result"], .s-result-item',
                        timeout=12000,
                    )
                except PlaywrightTimeout:
                    pass
                asin = extract_asin_from_page(page)
            except Exception as e:
                print(f"  [{i}] error {pid}: {e}")
                prog.setdefault("failed", []).append(pid)
                save_progress(prog)
                continue

            if asin:
                direct[pid] = {"amazon": asin}
                prog["resolved"][pid] = asin
                resolved_n += 1
                print(f"  [{i}/{len(todo)}] OK {pid} -> {asin}")
            else:
                prog.setdefault("failed", []).append(pid)
                print(f"  [{i}/{len(todo)}] FAIL {pid} ({q[:50]})")

            if i % 5 == 0:
                save_direct_map(direct)
                save_progress(prog)

            page.wait_for_timeout(delay_ms)

        browser.close()

    save_direct_map(direct)
    save_progress(prog)
    print(f"\nHecho: +{resolved_n} ASINs | Total mapa: {len(direct)} | Fallos: {len(prog.get('failed', []))}")


if __name__ == "__main__":
    main()
