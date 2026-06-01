# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time

TITLE = "Truth Behind the Image - La Salle Reus"
CDP = "http://127.0.0.1:9223"

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    page = next(
        pg
        for ctx in browser.contexts
        for pg in ctx.pages
        if "Truth-Behind-the-Image" in (pg.title() or "")
    )
    page.bring_to_front()
    time.sleep(2)
    # Top bar file name button
    for sel in [
        'button:has-text("Truth-Behind-the-Image")',
        '[aria-label*="Truth"]',
        'span:has-text("Truth-Behind-the-Image")',
    ]:
        loc = page.locator(sel).first
        if loc.count():
            loc.click()
            time.sleep(0.5)
            page.keyboard.press("Control+A")
            page.keyboard.type(TITLE)
            page.keyboard.press("Enter")
            print("Renamed via", sel)
            break
    time.sleep(1)
    print("Title now:", page.title())
