import React,{useEffect,useState} from 'react';
import {ArrowUpRight,Pause,Play,Folder} from 'lucide-react';
import {GallerySession} from '../data/galleryData';
export function SessionCards({sessions}:{sessions:GallerySession[]}){
 const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 return <nav className="session-cards" aria-label="Gallery sessions"><div className="session-cards-heading"><h2>Sessions</h2>{sessions.some(s=>s.previewImages.length>1)&&<button className="session-preview-toggle" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Resume thumbnail rotation':'Pause thumbnail rotation'}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Resume previews':'Pause previews'}</span></button>}</div><div className="session-cards-grid">{sessions.map((session,i)=><SessionCard key={session.path} session={session} paused={paused} stagger={i}/>)}</div></nav>;
}
function SessionCard({session,paused,stagger}:{session:GallerySession;paused:boolean;stagger:number}){
 const images=session.previewImages;
 const [index,setIndex]=useState(()=>Math.floor(Math.random()*images.length));
 const [previous,setPrevious]=useState<number|null>(null);
 const [visible,setVisible]=useState(()=>!document.hidden);
 useEffect(()=>{const update=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);
 useEffect(()=>{if(paused||!visible||images.length<2)return;let cancelled=false;const next=(index+1+Math.floor(Math.random()*(images.length-1)))%images.length;const preload=new Image();preload.src=images[next];const timer=setTimeout(async()=>{try{await preload.decode();if(!cancelled){setPrevious(index);setIndex(next)}}catch{}},4000+stagger*250);return()=>{cancelled=true;clearTimeout(timer)}},[index,paused,visible,images,stagger]);
 const label=`${session.title}${session.dateRange?' — '+session.dateRange:''}, ${session.photoCount} photographs`;
 return <a className="session-card" href={'/'+session.path.split('/').map(encodeURIComponent).join('/')} aria-label={`View ${label}`}><div className="session-card-image" aria-hidden="true">{previous!==null&&images[previous]&&<img src={images[previous]} alt=""/>}{images[index]?<img key={images[index]} className="session-current-image" src={images[index]} alt="" loading="lazy" decoding="async"/>:<div className="session-card-placeholder"><Folder size={32}/></div>}</div><div className="session-card-caption"><span className="session-card-name">{session.title}<ArrowUpRight size={16}/></span>{session.dateRange&&<span className="session-card-date">{session.dateRange}</span>}<span className="session-card-count">{session.photoCount} photographs</span></div></a>;
}
