import React,{useRef,useLayoutEffect,useState} from 'react';
import {PhotoItem,SESSION_INFO} from '../data/galleryData';
import {Heart} from 'lucide-react';
import {justifiedRows} from './justifiedRows.mjs';
export type GalleryView='masonry'|'rows';
interface Props {photos:PhotoItem[];view:GalleryView;onPhotoClick:(id:string)=>void;favorites:Set<string>;onToggleFavorite:(id:string,e:React.MouseEvent)=>void;}
export function GalleryGrid({photos,view,onPhotoClick,favorites,onToggleFavorite}:Props){
 const container=useRef<HTMLDivElement>(null);
 const [width,setWidth]=useState(0);
 const [ratios,setRatios]=useState<Record<string,number>>({});
 useLayoutEffect(()=>{const node=container.current;if(!node)return;const observer=new ResizeObserver(()=>setWidth(node.clientWidth));observer.observe(node);setWidth(node.clientWidth);return()=>observer.disconnect()},[view,photos.length]);
 const card=(photo:PhotoItem,index:number)=><PhotoCard key={photo.id} photo={photo} index={index} view={view} onPhotoClick={onPhotoClick} favorite={favorites.has(photo.id)} onToggleFavorite={onToggleFavorite} onRatio={ratio=>setRatios(prev=>prev[photo.id]===ratio?prev:{...prev,[photo.id]:ratio})}/>;
 const gap=width<640?8:12;
 const rows=justifiedRows(photos.map(p=>ratios[p.id]||2/3),width,gap,width<640?200:280);
 return <section aria-label={`${SESSION_INFO.clientName} photograph collection`} className={`gallery-collection gallery-view-${view}`}>
  {!photos.length?<p className="p-8 text-neutral-500">No photographs to display.</p>:<div ref={container} className={view==='rows'?'justified-grid':'photo-grid'}>
   {view==='rows'?rows.map((row,rowIndex)=><div className="justified-row" key={rowIndex}>{row.indices.map((index:number)=><div key={photos[index].id} style={{width:row.height*(ratios[photos[index].id]||2/3),flexShrink:0}}>{card(photos[index],index)}</div>)}</div>):photos.map(card)}
  </div>}
 </section>;
}
function PhotoCard({photo,index,view,onPhotoClick,favorite,onToggleFavorite,onRatio}:{photo:PhotoItem;index:number;view:GalleryView;onPhotoClick:(id:string)=>void;favorite:boolean;onToggleFavorite:(id:string,e:React.MouseEvent)=>void;onRatio:(ratio:number)=>void;}){
 const ref=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{const node=ref.current;if(!node)return;if(view!=='masonry'){node.style.gridRowEnd='';return}let frame=0;const size=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const grid=node.parentElement!;const style=getComputedStyle(grid);const unit=parseFloat(style.gridAutoRows),gap=parseFloat(style.rowGap);const height=node.getBoundingClientRect().height;node.style.gridRowEnd=`span ${Math.max(1,Math.ceil((height+gap)/(unit+gap)))}`})};const observer=new ResizeObserver(size);observer.observe(node);size();return()=>{observer.disconnect();cancelAnimationFrame(frame)}},[view]);
 return <article ref={ref} data-photo-id={photo.id} className="gallery-photo group">
  <button onClick={()=>onPhotoClick(photo.id)} className="gallery-photo-open" aria-label={`View ${SESSION_INFO.clientName} photograph ${index+1}`}>
   <img src={photo.src} alt={`${SESSION_INFO.clientName} photograph ${index+1}`} loading={index<5?'eager':'lazy'} decoding="async" style={{aspectRatio:'2 / 3'}} onLoad={e=>{const img=e.currentTarget;img.style.aspectRatio=`${img.naturalWidth} / ${img.naturalHeight}`;onRatio(img.naturalWidth/img.naturalHeight)}}/>
  </button>
  <button onClick={e=>onToggleFavorite(photo.id,e)} aria-label={favorite?'Remove favorite':'Add favorite'} aria-pressed={favorite} className={`photo-favorite ${favorite?'is-favorite':''}`}><Heart size={17} fill={favorite?'currentColor':'none'}/></button>
 </article>;
}
