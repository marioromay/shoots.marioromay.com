import React,{useEffect,useState} from 'react';
import {ArrowUp} from 'lucide-react';
export function BackToTop({hidden=false}:{hidden?:boolean}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{const update=()=>setVisible(window.scrollY>window.innerHeight*.75);update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[]);
 if(!visible||hidden)return null;
 return <button className="back-to-top" aria-label="Back to top" title="Back to top" onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><ArrowUp size={20}/></button>;
}
