#!/usr/bin/env python3
"""
Solicita unión a programas Awin en ui.awin.com (Playwright).
Requiere sesión Awin: AWIN_EMAIL + AWIN_PASSWORD en .env.local
o modo manual: python scripts/awin-join-programs.py --pause-login
"""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

ROOT = Path(__file__).resolve().parent.parent
PROGRAMS = json.loads((ROOT / "data" / "awin-programs-es.json").read_text(encoding="utf-8"))[
    "programs"
]

PROMO_MESSAGE = (
    "DealsHub — comparador de precios en España. "
    "Tráfico orgánico + SEO producto. dealshub-iota.vercel.app"
)


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    env_file = ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    for k in ("AWIN_EMAIL", "AWIN_PASSWORD", "NEXT_PUBLIC_AWIN_PUBLISHER_ID"):
        if os.environ.get(k):
            env[k] = os.environ[k]
    return env


def login(page, email: str, password: str) -> bool:
    page.goto("https://ui.awin.com/", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1500)
    try:
        page.get_by_role("link", name="Iniciar sesión").click(timeout=3000)
    except Exception:
        try:
            page.get_by_role("link", name="Login").click(timeout=3000)
        except Exception:
            pass
    page.wait_for_timeout(1000)
    try:
        page.fill('input[type="email"], input[name="email"]', email, timeout=8000)
        page.fill('input[type="password"]', password, timeout=8000)
        page.get_by_role("button", name="Iniciar sesión").click(timeout=5000)
    except Exception:
        try:
            page.get_by_role("button", name="Login").click(timeout=5000)
        except Exception:
            return False
    page.wait_for_timeout(3000)
    return "awin.com" in page.url and "login" not in page.url.lower()


def join_program(page, prog: dict) -> str:
    mid = prog["merchantId"]
    name = prog["name"]
    url = f"https://ui.awin.com/user/affiliate-signup/join/merchant/{mid}"
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(2000)
    except Exception:
        return "error_nav"

    body = page.content().lower()
    if "already joined" in body or "ya formas parte" in body or "joined" in body:
        return "already_joined"
    if "pending" in body and "application" in body:
        return "pending"

    for sel in (
        'button:has-text("Unirme")',
        'button:has-text("Join")',
        'button:has-text("Join programme")',
        'button:has-text("Unirme al programa")',
        'input[type="submit"][value*="Join"]',
    ):
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click(timeout=3000)
                page.wait_for_timeout(1500)
                break
        except Exception:
            continue

    for sel in ('textarea', 'input[type="text"][name*="message"]'):
        try:
            field = page.locator(sel).first
            if field.is_visible(timeout=1500):
                field.fill(PROMO_MESSAGE[:150])
                break
        except Exception:
            pass

    for sel in (
        'input[type="checkbox"]',
        'label:has-text("términos")',
        'label:has-text("terms")',
    ):
        try:
            box = page.locator(sel).first
            if box.is_visible(timeout=1500):
                box.click(timeout=2000)
                break
        except Exception:
            continue

    for sel in (
        'button:has-text("Unirme")',
        'button:has-text("Join")',
        'button:has-text("Confirm")',
        'button:has-text("Enviar")',
    ):
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click(timeout=3000)
                page.wait_for_timeout(2500)
                break
        except Exception:
            continue

    after = page.content().lower()
    if "pending" in after or "pendiente" in after or "solicitud" in after:
        return "applied_pending"
    if "joined" in after or "unido" in after:
        return "joined"
    return "attempted"


def main() -> None:
    pause_login = "--pause-login" in sys.argv
    env = load_env()
    email = env.get("AWIN_EMAIL", "")
    password = env.get("AWIN_PASSWORD", "")

    results: dict[str, str] = {}
    stats = {"joined": 0, "pending": 0, "failed": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False if pause_login else True)
        page = browser.new_page(locale="es-ES")

        if pause_login:
            page.goto("https://ui.awin.com/", wait_until="domcontentloaded")
            print("Inicia sesión en Awin en la ventana del navegador y pulsa Enter aquí…")
            input()
        elif email and password:
            if not login(page, email, password):
                print("Login fallido — usa AWIN_EMAIL/AWIN_PASSWORD o --pause-login")
                browser.close()
                sys.exit(1)
        else:
            print("Sin credenciales Awin. Añade AWIN_EMAIL y AWIN_PASSWORD a .env.local")
            print("O ejecuta: python scripts/awin-join-programs.py --pause-login")
            browser.close()
            sys.exit(1)

        for i, prog in enumerate(PROGRAMS, 1):
            store = prog.get("storeId", prog["id"])
            print(f"[{i}/{len(PROGRAMS)}] {prog['name']} ({store})…", flush=True)
            status = join_program(page, prog)
            results[store] = status
            print(f"  → {status}")
            if status in ("joined", "already_joined"):
                stats["joined"] += 1
            elif status in ("applied_pending", "pending"):
                stats["pending"] += 1
            else:
                stats["failed"] += 1
            time.sleep(2)

        browser.close()

    out = ROOT / "data" / "awin-join-results.json"
    out.write_text(
        json.dumps({"results": results, "stats": stats}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nResultado: joined={stats['joined']} pending={stats['pending']} failed={stats['failed']}")
    print(f"Guardado en {out}")


if __name__ == "__main__":
    main()
