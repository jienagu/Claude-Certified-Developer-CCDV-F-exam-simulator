"""Build a portable single-file HTML app using only the Python standard library."""
from pathlib import Path
root = Path(__file__).resolve().parent
html = (root / 'src/shell.html').read_text()
for marker, name in [('/* STYLES */', 'styles.css'), ('/* QUESTIONS */', 'questions.js'), ('/* APP */', 'app.js')]:
    html = html.replace(marker, (root / 'src' / name).read_text())
(root / 'index.html').write_text(html)
print('Built index.html')
