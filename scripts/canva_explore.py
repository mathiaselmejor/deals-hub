# -*- coding: utf-8 -*-
import subprocess, time
from playwright.sync_api import sync_playwright

PROFILE = r"c:\Users\mathi\Downloads\.canva-edge-upload"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
proc = subprocess.Popen([EDGE, "--remote-debugging-port=9223", f"--user-data-dir={PROFILE}", "https://www.canva.com/"])
time.sleep(5)
with sync_playwright() as p:
    page = p.chromium.connect_over_cdp("http://127.0.0.1:9223").contexts[0].pages[0]
    page.goto("https://www.canva.com/", wait_until="networkidle")
    time.sleep(2)
    for b in page.locator("button").all()[:40]:
        t = b.inner_text().strip().replace("\n", " ")[:80]
        if t:
            print("BTN:", repr(t))
    print("--- links ---")
    for a in page.locator("a").all()[:30]:
        t = a.inner_text().strip().replace("\n", " ")[:80]
        if t:
            print("A:", repr(t))
    proc.terminate()
