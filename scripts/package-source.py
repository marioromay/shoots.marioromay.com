from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
out=root.parent/'Shoots-planning-preview-source.zip'
excluded={'.preview','.hosted','dist','.git','node_modules','.wrangler','__pycache__'}
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
        if p.is_file() and not any(part in excluded for part in p.relative_to(root).parts):
            z.write(p,Path('shoots-planner')/p.relative_to(root))
with ZipFile(out) as z:
    assert not any(any(part in excluded for part in Path(n).parts) for n in z.namelist())
    assert not any('owner-setup-token' in n or 'test-owner-password' in n for n in z.namelist())
    assert z.testzip() is None
print(out)
