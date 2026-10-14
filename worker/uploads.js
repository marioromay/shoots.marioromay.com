import {isAdmin,reply,AccessError,body} from './access.js';
const types={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif',gif:'image/gif'};
export const MAX_PHOTO_BYTES=50*1024*1024;
export async function uploadRoutes(request,env,{validPath}){
 const url=new URL(request.url),bucket=env.SHOOTS;
 if(request.method!=='GET'&&request.headers.get('Origin')!==url.origin)return reply({error:'Request origin rejected.'},403);
 if(!await isAdmin(request,bucket))return reply({error:'Admin sign-in required.'},401);
 try{
 if(url.pathname==='/api/admin/folders'&&request.method==='GET'){
 const path=url.searchParams.get('path')||'';if(path&&!validPath(path))throw new AccessError('Invalid folder path.');
 const prefix=path?path+'/':'';let cursor;const folders=new Set(),photos=[];
 do{const page=await bucket.list({prefix,delimiter:'/',limit:1000,cursor});for(const child of page.delimitedPrefixes||[]){const value=child.slice(0,-1);if(validPath(value))folders.add(value)}for(const obj of page.objects){if(validPath(obj.key)&&types[obj.key.split('.').at(-1).toLowerCase()])photos.push({key:obj.key,size:obj.size||0})}cursor=page.truncated?page.cursor:undefined}while(cursor);
 return reply({path,folders:[...folders].sort(),photos:photos.sort((a,b)=>a.key.localeCompare(b.key)),maxPhotoBytes:MAX_PHOTO_BYTES});
 }
 if(url.pathname==='/api/admin/folders'&&request.method==='POST'){
 const data=await body(request),path=data.path;if(!validPath(path)||path.split('/').length>12||path.split('/').some(x=>x.startsWith('.')||x.length>120))throw new AccessError('Use a folder name without slashes, dots at the start, or reserved names.');
 const existing=await bucket.list({prefix:path+'/',limit:1});if(existing.objects.length||existing.delimitedPrefixes?.length)throw new AccessError('That folder already exists.',409);
 const result=await bucket.put(path+'/.folder','',{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/octet-stream'}});if(!result)throw new AccessError('That folder already exists.',409);return reply({ok:true,path},201);
 }
 if(url.pathname==='/api/admin/upload'&&request.method==='PUT'){
 const path=url.searchParams.get('path'),name=url.searchParams.get('name');
 if(!validPath(path)||path.split('/').length>12||!name||name.includes('/')||name.startsWith('.')||name.length>200||!validPath(path+'/'+name))throw new AccessError('Invalid photo destination.');
 const contentType=types[name.split('.').at(-1).toLowerCase()];if(!contentType)throw new AccessError('Choose JPEG, PNG, WebP, AVIF, or GIF photographs.',415);
 const size=Number(request.headers.get('Content-Length'));if(!Number.isSafeInteger(size)||size<1||size>MAX_PHOTO_BYTES||!request.body)throw new AccessError('Each photo must be between 1 byte and 50 MB.',413);
 // Stream originals directly to R2; conditional creation prevents racing uploads from overwriting.
 const result=await bucket.put(path+'/'+name,request.body,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType},customMetadata:{uploadedBy:'admin'}});
 if(!result)throw new AccessError('A photo with this filename already exists. Rename your file and retry.',409);
 return reply({ok:true,key:path+'/'+name},201);
 }
 return reply({error:'Method not allowed.'},405);
 }catch(e){if(e instanceof AccessError)return reply({error:e.message},e.status);throw e}
}
