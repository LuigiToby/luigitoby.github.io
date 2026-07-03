#!/usr/bin/env python3
"""
Extract the Reading Heatmap and Reading Challenge widgets
from an Obsidian HTML export.

Usage:
    python extract_widgets.py ReadingChallenge2026.html

Outputs:
    reading-heatmap.html
    reading-challenge.html
"""

from pathlib import Path
from bs4 import BeautifulSoup
import sys

if len(sys.argv) != 2:
    print("Usage: python extract_widgets.py <exported.html>")
    sys.exit(1)

input_file = Path(sys.argv[1])

if not input_file.exists():
    print(f"File not found: {input_file}")
    sys.exit(1)

html = input_file.read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")

widgets = soup.find_all("div", class_="block-language-dataviewjs")

heatmap = None
challenge = None

for widget in widgets:
    text = widget.get_text(" ", strip=True)

    if "reading - 2026" in text.lower():
        heatmap = widget

    elif "READING CHALLENGE - 2026" in text.upper():
        challenge = widget

if heatmap is None:
    raise RuntimeError("Could not locate Reading Heatmap widget.")

if challenge is None:
    raise RuntimeError("Could not locate Reading Challenge widget.")

Path("reading-heatmap.html").write_text(
    str(heatmap),
    encoding="utf-8"
)

Path("reading-challenge.html").write_text(
    str(challenge),
    encoding="utf-8"
)

print("✓ reading-heatmap.html")
print("✓ reading-challenge.html")


# python bookshelf\reading-2026\extract_widgets.py "bookshelf\reading-2026\reading-challenge-2026.html" < How to use it