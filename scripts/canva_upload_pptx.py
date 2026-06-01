# -*- coding: utf-8 -*-
"""Upload PPTX to Canva using a dedicated Edge window (CDP)."""
from pathlib import Path
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

PPTX = Path(r"c:\Users\mathi\Downloads\Truth-Behind-the-Image-Canva.pptx")
PROFILE = Path(r"c:\Users\mathi\Downloads\.canva-edge-upload")
SHOT = Path(r"c:\Users\mathi\Downloads\canva-upload-result.png")
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
CDP = "http://127.0.0.1:9223"
LOGIN_WAIT_S = 300


def log(msg: str) -> None:
    print(msg.encode("ascii", errors="replace").decode())


def start_edge() -> subprocess.Popen | None:
    if not EDGE.exists():
        log("Edge not found")
        return None
    PROFILE.mkdir(parents=True, exist_ok=True)
    return subprocess.Popen(
        [
            str(EDGE),
            f"--remote-debugging-port=9223",
            f"--user-data-dir={PROFILE}",
            "--no-first-run",
            "--no-default-browser-check",
            "https://www.canva.com/login",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def wait_logged_in(page) -> bool:
    log("Inicia sesion en la ventana de Edge que se abrio (Google).")
    log(f"Tienes {LOGIN_WAIT_S // 60} minutos...")
    deadline = time.time() + LOGIN_WAIT_S
    while time.time() < deadline:
        url = page.url.lower()
        if "canva.com" in url and "login" not in url and "signup" not in url:
            return True
        page.wait_for_timeout(2000)
        try:
            page.goto("https://www.canva.com/projects", wait_until="domcontentloaded", timeout=15000)
        except Exception:
            pass
    return False


def import_pptx(page) -> bool:
    page.goto("https://www.canva.com/", wait_until="networkidle", timeout=120000)
    page.wait_for_timeout(4000)

    for label in ["Create a design", "Crear un diseño"]:
        b = page.get_by_role("button", name=label)
        if b.count():
            b.first.click()
            page.wait_for_timeout(2000)
            break

    for label in ["Import file", "Importar archivo"]:
        t = page.get_by_text(label, exact=False)
        if t.count():
            with page.expect_file_chooser(timeout=30000) as fc:
                t.first.click()
            fc.value.set_files(str(PPTX))
            log("PowerPoint subido. Esperando conversion...")
            page.wait_for_timeout(50000)
            return True
    return False


def main() -> None:
    if not PPTX.exists():
        log("MISSING_PPTX")
        sys.exit(1)

    proc = start_edge()
    time.sleep(4)

    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(CDP)
        except Exception as e:
            log(f"No CDP connection: {e}")
            if proc:
                proc.terminate()
            sys.exit(2)

        context = browser.contexts[0]
        page = context.pages[0] if context.pages else context.new_page()

        try:
            if not wait_logged_in(page):
                page.screenshot(path=str(SHOT), full_page=True)
                log("LOGIN_TIMEOUT - screenshot saved")
                sys.exit(2)

            ok = import_pptx(page)
            page.screenshot(path=str(SHOT), full_page=True)
            log("URL: " + page.url)
            log("OK" if ok else "IMPORT_FAILED - see screenshot")
            sys.exit(0 if ok else 2)
        finally:
            browser.close()
            if proc:
                proc.terminate()


if __name__ == "__main__":
    main()
