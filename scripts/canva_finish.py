# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time

DESIGN_URL = "https://www.canva.com/design/DAHLWJ9PnzM/qLEotlHnXsRg_1Od1IGA3Q/edit"
TITLE = "Truth Behind the Image - La Salle Reus"
SHOT = r"c:\Users\mathi\Downloads\canva-upload-result.png"
CDP = "http://127.0.0.1:9223"

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    page = None
    for ctx in browser.contexts:
        for pg in ctx.pages:
            if "Truth-Behind-the-Image" in (pg.title() or ""):
                page = pg
                break
        if page:
            break
    if not page:
        page = browser.contexts[0].new_page()
        page.goto(DESIGN_URL, wait_until="domcontentloaded", timeout=60000)
    else:
        page.bring_to_front()

    time.sleep(5)
    print("Editor:", page.url)

    try:
        title = page.locator('[contenteditable="true"]').first
        title.click(timeout=8000)
        page.keyboard.press("Control+A")
        page.keyboard.type(TITLE)
        page.keyboard.press("Enter")
        print("Renamed OK")
    except Exception as e:
        print("Rename:", e)

    time.sleep(2)
    page.screenshot(path=SHOT)
    print("Screenshot:", SHOT)
    print("LISTO:", DESIGN_URL)
