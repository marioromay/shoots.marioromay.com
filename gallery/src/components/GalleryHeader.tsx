import {GalleryView} from './GalleryGrid';
import {ThemeToggle} from '../theme';
import React from 'react';
import {SESSION_INFO} from '../data/galleryData';
import {MarioRomayLogo} from './MarioRomayLogo';
import {Play,Download,Heart} from 'lucide-react';
interface GalleryHeaderProps {hasPhotos:boolean;view:GalleryView;onChangeView:(view:GalleryView)=>void;onReturnToCover:()=>void;onStartSlideshow:()=>void;onOpenDownload:()=>void;favoritesCount:number;totalPhotos:number;showFavoritesOnly:boolean;onToggleFavoritesFilter:()=>void;}
export const GalleryHeader:React.FC<GalleryHeaderProps>=({hasPhotos,view,onChangeView,onReturnToCover,onStartSlideshow,onOpenDownload,favoritesCount,totalPhotos,showFavoritesOnly,onToggleFavoritesFilter})=>(
<header className="sticky top-0 z-40 bg-[#fafafa]/95 backdrop-blur-md border-b border-neutral-200/80">
 <div className="gallery-toolbar">
  <button onClick={onReturnToCover} className="gallery-brand" aria-label={`Return to ${SESSION_INFO.clientName} gallery cover`}><MarioRomayLogo size="sm"/><span className="gallery-brand-info"><span className="gallery-brand-title">{SESSION_INFO.clientName}</span><span className="gallery-brand-details"><span>{SESSION_INFO.sessionType}</span>{SESSION_INFO.year && <span>{SESSION_INFO.year}</span>}<span>{totalPhotos} photographs</span></span></span></button>
  <div className="gallery-toolbar-actions">
   <button disabled={!hasPhotos} onClick={onStartSlideshow} className="slideshow-action inline-flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"><Play size={13} className="fill-white"/><span>View Slideshow</span></button>
   <div className="gallery-secondary-actions">
    <ThemeToggle/>
    {favoritesCount>0 && <button onClick={onToggleFavoritesFilter} aria-pressed={showFavoritesOnly} aria-label="Filter favorites" className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs ${showFavoritesOnly?'bg-neutral-900 text-white':'text-neutral-600 hover:bg-neutral-100'}`}><Heart size={14}/><span>Favorites ({favoritesCount})</span></button>}
    <button disabled={!hasPhotos} onClick={onOpenDownload} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs text-neutral-600 hover:bg-neutral-100" aria-label="Download photographs"><Download size={14}/><span>Download</span></button>
   </div>
  </div>
 </div>
 <div className="gallery-view-bar"><div className="gallery-view-switch" role="group" aria-label="Gallery layout">{(['masonry','rows','large'] as GalleryView[]).map(option=><button key={option} onClick={()=>onChangeView(option)} aria-pressed={view===option} className={view===option?'is-active':''}>{option==='rows'?'Rows':option==='large'?'Large':'Masonry'}</button>)}</div></div>
</header>);
