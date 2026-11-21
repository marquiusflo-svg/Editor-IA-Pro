"""Empaqueta la demo en un único HTML autónomo (CSS, JS e imágenes embebidas).

Uso:  python3 build.py   ->  dist/dleito-boutique-demo.html
Las imágenes se embeben tal cual (base64), sin recomprimir ni editar.
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
data_js = (ROOT / "data.js").read_text(encoding="utf-8")
app_js = (ROOT / "app.js").read_text(encoding="utf-8")

html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
html = html.replace('<script src="data.js"></script>', f"<script>\n{data_js}\n</script>")
html = html.replace('<script src="app.js"></script>', f"<script>\n{app_js}\n</script>")

for img in sorted((ROOT / "assets").glob("*.webp")):
    uri = "data:image/webp;base64," + base64.b64encode(img.read_bytes()).decode()
    html = html.replace(f"assets/{img.name}", uri)

out = ROOT / "dist" / "dleito-boutique-demo.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"OK -> {out} ({out.stat().st_size / 1024 / 1024:.2f} MB)")
