export interface PhotoItem {id:string;title:string;location:string;orientation:'landscape'|'portrait'|'standard';aspectRatio:string;src:string;exif:{camera:string;lens:string;focalLength:string;aperture:string;shutter:string;iso:string};narrative?:string;tone:string;series:string;}
export const SESSION_INFO={clientName:'Jo',sessionType:'Portrait Session',city:'',year:'',date:'',photographer:'Mario Romay',assistantNotes:'',totalDelivered:0};
export const GALLERY_PATH=decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g,''));
export const FAVORITES_KEY='mario_romay_'+GALLERY_PATH.replaceAll('/','_')+'_favorites';
export let GALLERY_SESSIONS:{path:string;title:string;photoCount:number}[]=[];
export let COVER_PHOTOS:PhotoItem[]=[];
export let GALLERY_PHOTOS:PhotoItem[]=[];
export async function loadGallery(){const response=await fetch('/api/gallery?path='+encodeURIComponent(GALLERY_PATH),{cache:'no-store'});if(!response.ok)throw new Error('The photographs could not be loaded. Please try again.');const data=await response.json();GALLERY_PHOTOS=data.images.map((src:string)=>{const filename=decodeURIComponent(src.split('/').pop()!);return {id:filename,title:filename.replace(/\.jpg$/i,''),location:'',orientation:'standard',aspectRatio:'auto',src,exif:{camera:'—',lens:'—',focalLength:'—',aperture:'—',shutter:'—',iso:'—'},tone:'',series:''}});GALLERY_SESSIONS=data.sessions||[];COVER_PHOTOS=[...GALLERY_PHOTOS,...(data.coverImages||[]).map((src:string)=>({id:src,src} as PhotoItem))];SESSION_INFO.clientName=data.title||'Gallery';document.title=SESSION_INFO.clientName+' | Mario Romay Photography';SESSION_INFO.totalDelivered=data.totalPhotos??GALLERY_PHOTOS.length;
 const years=GALLERY_PHOTOS.flatMap(photo=>{const match=photo.id.match(/-(\d{4})(\d{2})(\d{2})-/);if(!match)return [];const iso=`${match[1]}-${match[2]}-${match[3]}`;const date=new Date(iso);return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===iso?[Number(match[1])]:[]});
 const first=Math.min(...years),last=Math.max(...years);SESSION_INFO.year=data.yearRange||(years.length?(first===last?String(first):`${first}–${last}`):'');SESSION_INFO.date=SESSION_INFO.year;
 return GALLERY_PHOTOS;}
