import {GalleryView} from './GalleryGrid';
import {ThemeToggle} from '../theme';
import React from 'react';
import {SESSION_INFO} from '../data/galleryData';
import {MarioRomayLogo} from './MarioRomayLogo';
import {Play,Download,Heart,Columns3,Rows3} from 'lucide-react';
interface GalleryHeaderProps {hasPhotos:boolean;view:GalleryView;onChangeView:(view:GalleryView)=>void;onReturnToCover:()=>void;onStartSlideshow:()=>void;onOpenDownload:()=>void;favoritesCount:number;totalPhotos:number;showFavoritesOnly:boolean;onToggleFavoritesFilter:()=>void;}
export const GalleryHeader:React.FC<GalleryHeaderProps>=({hasPhotos,view,onChangeView,onReturnToCover,onStartSlideshow,onOpenDownload,favoritesCount,totalPhotos,showFavoritesOnly,onToggleFavoritesFilter})=>(
<header className="gallery-header sticky top-0 z-40 bg-[#fafafa]/95 backdrop-blur-md border-b border-neutral-200/80">
 <div className="gallery-toolbar">
  <button onClick={onReturnToCover} className="gallery-brand" aria-label={`Return to ${SESSION_INFO.clientName} gallery cover`}><MarioRomayLogo size="sm"/><span className="gallery-brand-info"><span className="gallery-brand-title" title={SESSION_INFO.clientName}>{SESSION_INFO.clientName}</span><span className="gallery-brand-details">{SESSION_INFO.year && <span>{SESSION_INFO.year}</span>}<span><span className="photo-count-long">{totalPhotos} photographs</span><span className="photo-count-short">{totalPhotos} photos</span></span></span></span></button>
  <div className="gallery-toolbar-actions">
   <div className="gallery-view-switch" role="group" aria-label="Gallery layout">
    <button onClick={()=>onChangeView('masonry')} aria-label="Masonry view" title="Masonry view" aria-pressed={view==='masonry'} className={view==='masonry'?'is-active':''}><Columns3 size={16}/><span>Masonry</span></button>
    <button onClick={()=>onChangeView('rows')} aria-label="Rows view" title="Rows view" aria-pressed={view==='rows'} className={view==='rows'?'is-active':''}><Rows3 size={16}/><span>Rows</span></button>
   </div>
   <ThemeToggle/>
   {favoritesCount>0 && <button onClick={onToggleFavoritesFilter} aria-pressed={showFavoritesOnly} aria-label={`Filter favorites (${favoritesCount})`} title={`Favorites (${favoritesCount})`} className={`gallery-header-action ${showFavoritesOnly?'favorites-active':''}`}><Heart size={16} fill={showFavoritesOnly?'currentColor':'none'}/><span className="action-label">Favorites ({favoritesCount})</span></button>}
   <button disabled={!hasPhotos} onClick={onOpenDownload} className="gallery-header-action" aria-label="Download photographs" title="Download photographs"><Download size={16}/><span className="action-label">Download</span></button>
   <button disabled={!hasPhotos} onClick={onStartSlideshow} className="gallery-header-action slideshow-action" aria-label="View slideshow" title="View slideshow"><Play size={15} fill="currentColor"/><span className="action-label">View Slideshow</span></button>
  </div>
 </div>
</header>);
