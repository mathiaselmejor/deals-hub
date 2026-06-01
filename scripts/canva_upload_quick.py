# -*- coding: utf-8 -*-
"""Import PowerPoint into logged-in Canva (Edge profile)."""
from pathlib import Path
import subprocess
import time
from playwright.sync_api import sync_playwright

PPTX = Path(r"c:\Users\mathi\Downloads\Truth-Behind-the-Image-Canva.pptx")
PROFILE = Path(r"c:\Users\mathi\Downloads\.canva-edge-upload")
EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
CDP = "http://127.0.0.1:9223"
SHOT = Path(r"c:\Users\mathi\Downloads\canva-upload-result.png")
TITLE = "Truth Behind the Image - La Salle Reus"

proc = subprocess.Popen(
    [str(EDGE), "--remote-debugging-port=9223", f"--user-data-dir={PROFILE}", "https://www.canva.com/"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
time.sleep(5)

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    page = browser.contexts[0].pages[0]
    page.goto("https://www.canva.com/", wait_until="networkidle", timeout=120000)
    time.sleep(3000)

    uploaded = False
    upload_btn = page.get_by_role("button", name="Subir Subir archivos")
    if not upload_btn.count():
        upload_btn = page.locator('button:has-text("Subir archivos")')
    if not upload_btn.count():
        upload_btn = page.get_by_role("button", name="Subir")

    if upload_btn.count():
        with page.expect_file_chooser(timeout=30000) as fc:
            upload_btn.first.click()
        fc.value.set_files(str(PPTX))
        print("UPLOADED")
        uploaded = True
        time.sleep(45000)
    else:
        # fallback: Crear > Importar
        for label in ["Crear un diseño", "Crear un diseno"]:
            b = page.get_by_role("button", name=label)
            if b.count():
                b.first.click()
                time.sleep(2)
                break
        for label in ["Importar archivo", "Import file"]:
            t = page.get_by_text(label, exact=False)
            if t.count():
                with page.expect_file_chooser(timeout=30000) as fc:
                    t.first.click()
                fc.value.set_files(str(PPTX))
                print("UPLOADED_FALLBACK")
                uploaded = True
                time.sleep(45000)
                break

    if uploaded:
        # Open imported presentation from recents
        link = page.locator(f'text={PPTX.stem}').first
        if not link.count():
            link = page.locator('a[href*="/design/"]').first
        if link.count():
            link.click()
            time.sleep(8000)
            try:
                title = page.locator('[contenteditable="true"]').first
                if title.count():
                    title.click()
                    page.keyboard.press("Control+A")
                    page.keyboard.type(TITLE)
                    page.keyboard.press("Enter")
            except Exception:
                pass

    page.screenshot(path=str(SHOT), full_page=True)
    print("URL:", page.url)
    print("OK" if uploaded else "FAILED")
    browser.close()
proc.terminate()
