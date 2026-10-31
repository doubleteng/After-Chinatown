"""Compile inspectable source and an explicitly selected dataset to Apps Script files."""
from pathlib import Path
import argparse,base64,gzip,json,re,shutil
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--data-dir',default='data/example');args=p.parse_args()
data_dir=(ROOT/args.data_dir).resolve()
names={'ARCHIVE':'archive','HOVER':'hover','EVIDENCE':'evidence','TIMELINE':'timeline','SPATIAL':'spatial','ACTIVITY':'activity','RASTERS':'rasters'}
data={key:json.loads((data_dir/(name+'.json')).read_text()) for key,name in names.items()}
data['ADDRESS_REVIEW']={'schema':'public-example','records':[],'outside_queue':[],'rules':[]}
def js(value):return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
def fill(text):
 for key,value in data.items():text=text.replace('__DATA_'+key+'__',js(value))
 return text
out=ROOT/'build';out.mkdir(exist_ok=True)
pages={}
for name in ['map','archive']:
 text=(ROOT/'src/web'/f'{name}.html.in').read_text()
 text=re.sub(r'__SCRIPT_([^\s]+?)__',lambda m:(ROOT/'src/web/scripts'/m[1]).read_text(),text)
 text=fill(text)
 if data_dir==ROOT/'data/example':
  text=text.replace('</body>','<aside style="position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:5px;background:#fff2ba;color:#222;text-align:center;font:12px sans-serif">Teaching fixture — synthetic sample data; not historical evidence.</aside></body>')
 pages[name]=text;(out/(name+'.html')).write_text(text)
code=fill((ROOT/'src/server/Code.gs.in').read_text())
for key in ['SPATIAL','ACTIVITY']:
 payload=base64.b64encode(gzip.compress(js(data[key]).encode(),mtime=0)).decode()
 code=code.replace('__GZIP_'+key+'__',js(payload))
for key,name in [('MAP','map'),('ARCHIVE','archive')]:code=code.replace('__HTML_'+key+'__',js(pages[name]))
assert not re.search(r'__(?:DATA|GZIP|HTML|SCRIPT)_[A-Z_a-z0-9.]+__',code),'Unresolved build token'
(out/'Code.gs').write_text(code)
for name in ['StreetGeneration102.gs','PhotoAdapters.gs','appsscript.json']:shutil.copyfile(ROOT/'src/server'/name,out/name)
# Reuse the original street regression suite against the compiled HTML.
(ROOT/'src/street/page102.html').write_text(pages['map'].replace(' type="module"','').replace('__APP_CONFIG__','{}'))
print('Built Apps Script source in build/ using',data_dir.relative_to(ROOT) if data_dir.is_relative_to(ROOT) else data_dir)
