import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),out=path.join(root,'dist');await mkdir(out,{recursive:true});
const files={};for(const name of ['index.html','app.js','style.css','favicon.svg','logoDark.webp','logoLight.webp','crop-geometry.js']){const bytes=await readFile(path.join(root,'public',name));const binary=name.endsWith('.webp');files['/'+name]={body:binary?bytes.toString('base64'):bytes.toString(),binary,type:binary?'image/webp':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8'}}
await writeFile(path.join(out,'core.mjs'),(await readFile(path.join(root,'worker','index.mjs'),'utf8')).replace("'../public/crop-geometry.js'","'./crop-geometry.mjs'"));
await writeFile(path.join(out,'crop-geometry.mjs'),await readFile(path.join(root,'public','crop-geometry.js')));
await writeFile(path.join(out,'static.mjs'),'export default '+JSON.stringify(files)+';');
await writeFile(path.join(out,'entry.mjs'),`import core from './core.mjs';import files from './static.mjs';export default {fetch(request,env,ctx){const ASSETS={async fetch(req){const file=files[new URL(req.url).pathname];if(!file)return new Response('Not found',{status:404});const data=file.binary?Uint8Array.from(atob(file.body),c=>c.charCodeAt(0)):file.body;return new Response(data,{headers:{'Content-Type':file.type}})}};return core.fetch(request,{...env,ASSETS},ctx)}};`);
console.log('Built Worker modules with bundled public assets. No local demo routes included.');
