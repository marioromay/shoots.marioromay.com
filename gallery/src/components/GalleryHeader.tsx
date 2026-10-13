import {GalleryView} from './GalleryGrid';
import {ThemeToggle} from '../theme';
import React from 'react';
import {SESSION_INFO,PARENT_GALLERY} from '../data/galleryData';
import {MarioRomayLogo} from './MarioRomayLogo';
import {Play,Download,Heart,Columns3,Rows3,ArrowLeft} from 'lucide-react';
interface GalleryHeaderProps {hasPhotos:boolean;view:GalleryView;onChangeView:(view:GalleryView)=>void;onReturnToCover:()=>void;onStartSlideshow:()=>void;onOpenDownload:()=>void;favoritesCount:number;totalPhotos:number;showFavoritesOnly:boolean;onToggleFavoritesFilter:()=>void;}
export const GalleryHeader:React.FC<GalleryHeaderProps>=({hasPhotos,view,onChangeView,onReturnToCover,onStartSlideshow,onOpenDownload,favoritesCount,totalPhotos,showFavoritesOnly,onToggleFavoritesFilter})=>(
<header className="gallery-header sticky top-0 z-40 bg-[#fafafa]/95 backdrop-blur-md border-b border-neutral-200/80">
 <div className="gallery-toolbar">
  <div className="gallery-brand"><button onClick={onReturnToCover} aria-label={`Return to ${SESSION_INFO.clientName} gallery cover`}><MarioRomayLogo size="sm"/></button><div className="gallery-brand-info"><button onClick={onReturnToCover} className="gallery-brand-title" title={SESSION_INFO.clientName}>{SESSION_INFO.clientName}</button><span className="gallery-brand-details">{SESSION_INFO.date && <span><span className="gallery-date-full">{SESSION_INFO.date}</span><span className="gallery-date-short">{SESSION_INFO.dateShort}</span></span>}<span><span className="photo-count-long">{totalPhotos} photographs</span><span className="photo-count-short">{totalPhotos} photos</span></span></span>{PARENT_GALLERY && <a className="parent-gallery-link" href={'/'+PARENT_GALLERY.path.split('/').map(encodeURIComponent).join('/')+'#gallery'}><ArrowLeft size={12}/><span>Back to {PARENT_GALLERY.title}</span></a>}</div></div>
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
