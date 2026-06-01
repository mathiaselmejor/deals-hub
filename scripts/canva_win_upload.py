# -*- coding: utf-8 -*-
"""Upload PPTX to Canva using the user's open browser window (Windows UI)."""
from pathlib import Path
import subprocess
import sys
import time

PPTX = Path(r"c:\Users\mathi\Downloads\Truth-Behind-the-Image-Canva.pptx")

try:
    from pywinauto import Desktop
    import pyautogui
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pywinauto", "pyautogui", "-q"])
    from pywinauto import Desktop
    import pyautogui

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.4


def log(msg: str) -> None:
    print(msg.encode("ascii", errors="replace").decode())


def find_canva_window():
    patterns = [
        ".*Canva.*",
        ".*canva.*",
        ".*Truth Behind.*",
        ".*Presentaci.*",
    ]
    for backend in ("uia", "win32"):
        try:
            desk = Desktop(backend=backend)
            for pat in patterns:
                wins = desk.windows(title_re=pat, visible_only=True)
                for w in wins:
                    t = w.window_text()
                    if t and "Cursor" not in t and "Visual Studio" not in t:
                        return w, t
        except Exception:
            continue
    return None, None


def focus_canva():
    win, title = find_canva_window()
    if not win:
        return None, None
    try:
        win.restore()
        win.set_focus()
    except Exception:
        pass
    time.sleep(1)
    return win, title


def upload_via_dialog():
    """Ctrl+O rarely works; use shell to open file picker path via keyboard."""
    pyautogui.hotkey("ctrl", "l")  # focus address bar if browser
    time.sleep(0.3)
    # Go to Canva projects uploads via URL
    pyautogui.write("https://www.canva.com/projects", interval=0.02)
    pyautogui.press("enter")
    time.sleep(5)


def upload_with_powershell_file_dialog():
    """Open Canva in default browser + automated file upload via PowerShell."""
    subprocess.Popen(
        ["cmd", "/c", "start", "", "https://www.canva.com/projects"],
        shell=False,
    )
    time.sleep(6)
    win, title = focus_canva()
    if not title:
        log("No Canva window found. Open Canva in Edge/Chrome.")
        return False
    log("Found window: " + title)

    # Try common shortcuts / tab to upload
    pyautogui.hotkey("alt", "tab")
    time.sleep(0.5)
    win.set_focus()
    time.sleep(0.5)

    # Windows: open file dialog with keyboard - many sites use hidden input
    # Use pywinauto on active window children for "Subir"
    try:
        dlg = win
        upload = dlg.child_window(title_re=".*Subir.*", control_type="Button")
        if upload.exists(timeout=3):
            upload.click_input()
            time.sleep(1)
            # File dialog
            fd = Desktop(backend="uia").window(title_re=".*Abrir.*|.*Open.*|.*Explorador.*")
            if fd.exists(timeout=8):
                fd.Edit.set_edit_text(str(PPTX))
                time.sleep(0.5)
                fd.child_window(title_re=".*Abrir.*|.*Open.*", control_type="Button").click()
                log("Selected file in dialog")
                time.sleep(40)
                return True
    except Exception as e:
        log("Button upload failed: " + str(e))

    return False


def main():
    if not PPTX.exists():
        log("Missing PPTX")
        sys.exit(1)

    win, title = focus_canva()
    if win:
        log("Using open window: " + title)
        ok = upload_with_powershell_file_dialog()
    else:
        log("Opening Canva projects...")
        ok = upload_with_powershell_file_dialog()

    if ok:
        log("SUCCESS - check Canva for imported presentation")
        sys.exit(0)
    log("PARTIAL - drag file manually: " + str(PPTX))
    subprocess.Popen(["explorer", "/select,", str(PPTX)])
    sys.exit(2)


if __name__ == "__main__":
    main()
