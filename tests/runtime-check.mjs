import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
await mkdir('.wrangler',{recursive:true});
const scratch=await mkdtemp(join(process.cwd(),'.wrangler','runtime-'));

await build({entryPoints:['worker/index.js'],outfile:join(scratch,'worker.mjs'),bundle:true,format:'esm',platform:'neutral'});
const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'shoots',modules:true,scriptPath:join(scratch,'worker.mjs'),compatibilityDate:'2026-10-13',compatibilityFlags:['nodejs_compat'],r2Buckets:['SHOOTS'],bindings:{ADMIN_SETUP_TOKEN:'local-test-owner-key'}}]}));
try{
const bucket=await mf.getR2Bucket('SHOOTS');await bucket.put('jo/session/Jo-20261013-001.jpg','photo');
const call=(path,data,cookie)=>mf.dispatchFetch('https://shoots.test'+path,{method:data?'POST':'GET',headers:{Origin:'https://shoots.test',...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
const setup=await call('/api/admin/setup',{setupKey:'local-test-owner-key',password:'local-owner-pass-123'});assert.equal(setup.status,200,await setup.text());const owner=setup.headers.get('Set-Cookie').split(';')[0];
const settings=await (await call('/api/admin/settings?path=jo',undefined,owner)).json();const save=await call('/api/admin/settings',{...settings,access:'private',password:'client-code',title:'Jo Updated',downloads:false},owner);assert.equal(save.status,200,await save.text());
assert.equal((await call('/media/jo/session/Jo-20261013-001.jpg')).status,401);
const unlock=await call('/api/unlock',{path:'jo/session',password:'client-code'});assert.equal(unlock.status,200,await unlock.text());const client=unlock.headers.get('Set-Cookie').split(';')[0];
assert.equal((await call('/media/jo/session/Jo-20261013-001.jpg',undefined,client)).status,200);assert.equal((await call('/api/download/jo/session/Jo-20261013-001.jpg',undefined,client)).status,403);
const data=await (await call('/api/gallery?path=jo/session',undefined,client)).json();assert.equal(data.title,'Jo Updated');assert.equal(data.downloadsAllowed,false);
const stale=await call('/api/admin/settings',{...settings,title:'stale',access:'public'},owner);assert.equal(stale.status,409);
assert.equal((await call('/api/admin/folders')).status,401);
assert.equal((await call('/api/admin/folders',{path:'jo/2026/session'},owner)).status,201);
const emptySettings=await (await call('/api/admin/settings?path=jo/2026/session',undefined,owner)).json();
assert.equal(emptySettings.parentAccess,'private');
assert.equal((await call('/api/admin/settings',{...emptySettings,access:'inherit',downloads:true},owner)).status,200);
const upload=()=>mf.dispatchFetch('https://shoots.test/api/admin/upload?path=jo%2F2026%2Fsession&name=Jo-20261013-new.jpg',{method:'PUT',headers:{Origin:'https://shoots.test',Cookie:owner,'Content-Type':'image/jpeg','Content-Length':'5'},body:'photo'});
let uploaded=await upload();assert.equal(uploaded.status,201,await uploaded.text());assert.equal((await upload()).status,409);
assert.equal((await call('/media/jo/2026/session/Jo-20261013-new.jpg')).status,401);
const root=await (await call('/api/gallery?path=jo',undefined,client)).json();assert.equal(root.totalPhotos,2);assert.equal(root.sessions.find(s=>s.path==='jo/2026').photoCount,1);
const browse=await (await call('/api/admin/folders?path=jo/2026/session',undefined,owner)).json();assert.equal(browse.photos.length,1);
assert.equal((await call('/api/admin/folders',{path:'_admin/secret'},owner)).status,400);
console.log('Workers/R2 runtime checks passed: owner setup, conditional writes, inherited title, private photo access, unlock and download policy.');
}finally{await mf.dispose();await rm(scratch,{recursive:true,force:true})}
