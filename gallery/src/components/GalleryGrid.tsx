import React,{useRef,useLayoutEffect,useState} from 'react';
import {PhotoItem,SESSION_INFO} from '../data/galleryData';
import {Heart} from 'lucide-react';
import {justifiedRows} from './justifiedRows.mjs';
export type GalleryView='masonry'|'rows';
interface Props {photos:PhotoItem[];view:GalleryView;onPhotoClick:(id:string)=>void;favorites:Set<string>;onToggleFavorite:(id:string,e:React.MouseEvent)=>void;}
export function GalleryGrid({photos,view,onPhotoClick,favorites,onToggleFavorite}:Props){
 const container=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const grid=container.current;if(!grid||view!=='masonry')return;let frame=0;
  const layout=()=>{
   const style=getComputedStyle(grid),columns=style.gridTemplateColumns.split(' ').filter(Boolean).length,gap=parseFloat(style.columnGap)||0;
   const width=(grid.getBoundingClientRect().width-gap*(columns-1))/columns;if(width<=0)return;
   const cards=Array.from(grid.children) as HTMLElement[],heights=Array(columns).fill(0);
   for(const card of cards)card.style.width=width+'px';
   grid.dataset.waterfall='true';
   for(const card of cards){const column=heights.indexOf(Math.min(...heights)),top=heights[column];card.style.transform=`translate(${column*(width+gap)}px, ${top}px)`;heights[column]=top+card.getBoundingClientRect().height+gap;}
   const height=Math.max(0,...heights)- (cards.length?gap:0);const value=height+'px';if(grid.style.height!==value)grid.style.height=value;
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(layout)};
  const observer=new ResizeObserver(schedule);observer.observe(grid);for(const card of grid.children)observer.observe(card);
  grid.addEventListener('load',schedule,true);layout();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();grid.removeEventListener('load',schedule,true);delete grid.dataset.waterfall;grid.style.height='';for(const card of grid.children){const node=card as HTMLElement;node.style.width='';node.style.transform=''}};
 },[photos,view]);

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
 return <article data-photo-id={photo.id} className="gallery-photo group">
  <button onClick={()=>onPhotoClick(photo.id)} className="gallery-photo-open" aria-label={`View ${SESSION_INFO.clientName} photograph ${index+1}`}>
   <img src={photo.src} alt={`${SESSION_INFO.clientName} photograph ${index+1}`} loading={index<5?'eager':'lazy'} decoding="async" style={{aspectRatio:'2 / 3'}} onLoad={e=>{const img=e.currentTarget;img.style.aspectRatio=`${img.naturalWidth} / ${img.naturalHeight}`;onRatio(img.naturalWidth/img.naturalHeight)}}/>
  </button>
  <button onClick={e=>onToggleFavorite(photo.id,e)} aria-label={favorite?'Remove favorite':'Add favorite'} aria-pressed={favorite} className={`photo-favorite ${favorite?'is-favorite':''}`}><Heart size={17} fill={favorite?'currentColor':'none'}/></button>
 </article>;
}
