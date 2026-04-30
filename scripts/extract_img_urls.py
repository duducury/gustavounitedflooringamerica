import re
from pathlib import Path

t = Path(__file__).resolve().parent.parent.joinpath("_tmp_home.html").read_text(
    encoding="utf-8", errors="ignore"
)
out = set()

# filesafe via u_https:// in CSS
for m in re.findall(r"u_https://assets\.cdn\.filesafe\.space/[^\"')\s]+", t):
    out.add("https://" + m[len("u_https://") :])

# direct https with image ext
for m in re.findall(
    r'https://[^"\'\\s<>\)]+?\.(?:jpeg|jpg|png|webp)', t, flags=re.I
):
    out.add(m.rstrip(");,"))

# leadconnector urls that wrap (keep full res)
for m in re.findall(
    r'https://images\.leadconnectorhq\.com/image/[^"\'\)]+', t, flags=re.I
):
    out.add(m.rstrip(");,"))

for u in sorted(out):
    print(u)
