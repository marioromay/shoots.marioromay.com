import React,{useEffect,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {MarioRomayLogo} from './MarioRomayLogo';
import {ThemeToggle} from '../theme';
import {PhotoItem,SESSION_INFO} from '../data/galleryData';
export function GalleryEntrance({photos,photoCount=photos.length,onEnter}:{photos:PhotoItem[];photoCount?:number;onEnter:()=>void}){
 const [index,setIndex]=useState(()=>Math.floor(Math.random()*photos.length));
 const [previousIndex,setPreviousIndex]=useState<number|null>(null);
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [visible,setVisible]=useState(()=>!document.hidden);
 useEffect(()=>{const sync=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync)},[]);
 useEffect(()=>{if(paused||!visible||photos.length<2)return;let cancelled=false;const offset=1+Math.floor(Math.random()*(photos.length-1));const next=(index+offset)%photos.length;const preload=new Image();preload.src=photos[next].src;const timer=setTimeout(async()=>{try{await preload.decode();if(!cancelled){setPreviousIndex(index);setIndex(next)}}catch{}},4000);return()=>{cancelled=true;clearTimeout(timer)}},[index,paused,visible,photos]);
 const photo=photos[index];
 return <main className="gallery-entrance">
  <div className="entrance-photo" aria-hidden="true">
   {previousIndex!==null && <img className="previous-featured-photo" src={photos[previousIndex].src} alt=""/>}
   {photo && <img key={photo.id} className="featured-photo" src={photo?.src} alt="" loading="eager" fetchPriority="high"/>}
  </div>
  <div className="entrance-theme"><ThemeToggle/></div>
  <section className="entrance-intro" aria-labelledby="entrance-title">
   <div className="entrance-copy">
    <MarioRomayLogo size="lg" className="entrance-logo"/>
    <h1 id="entrance-title">{SESSION_INFO.clientName}</h1>
    <div className="entrance-details">{SESSION_INFO.year && <span>{SESSION_INFO.year}</span>}<span>{photoCount} photographs</span></div>
    <button onClick={onEnter} className="entrance-button">View Gallery</button>
   </div>
  </section>
  {photos.length>1 && <button className="rotation-toggle" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Resume photo rotation':'Pause photo rotation'} title={paused?'Resume photo rotation':'Pause photo rotation'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}
 </main>;
}
