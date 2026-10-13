import {ThemeProvider} from './theme';
import React, { useState, useEffect } from 'react';
import { GALLERY_PHOTOS, GALLERY_PATH, GALLERY_SESSIONS, COVER_PHOTOS, FAVORITES_KEY, SESSION_INFO, PhotoItem, loadGallery } from './data/galleryData';
import { MarioRomayLogo } from './components/MarioRomayLogo';
import { ThemeToggle } from './theme';
import { GalleryEntrance } from './components/GalleryEntrance';
import { GalleryHeader } from './components/GalleryHeader';
import { GalleryGrid, GalleryView } from './components/GalleryGrid';
import { SlideshowModal } from './components/SlideshowModal';
import { DownloadModal } from './components/DownloadModal';
import { BackToTop } from './components/BackToTop';
import { GalleryFooter } from './components/GalleryFooter';

function GalleryApp() {
  const [view,setView]=useState<GalleryView>('masonry');
  const changeView=(next:GalleryView)=>{
    if(next===view)return;
    const headerBottom=document.querySelector('header')?.getBoundingClientRect().bottom||0;
    const anchor=Array.from(document.querySelectorAll<HTMLElement>('[data-photo-id]')).find(node=>node.getBoundingClientRect().bottom>headerBottom);
    const id=anchor?.dataset.photoId,offset=anchor?.getBoundingClientRect().top||0;
    setView(next);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const target=Array.from(document.querySelectorAll<HTMLElement>('[data-photo-id]')).find(node=>node.dataset.photoId===id);if(target)window.scrollBy({top:target.getBoundingClientRect().top-offset,behavior:'instant'});}));
  };
  const [loaded,setLoaded]=useState(false);
  const [error,setError]=useState('');
  const [entered,setEntered]=useState(()=>location.hash==='#gallery');
  useEffect(()=>{const sync=()=>{setEntered(location.hash==='#gallery');window.scrollTo(0,0)};window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  const enterGallery=()=>{setEntered(true);location.hash='gallery';window.scrollTo(0,0)};
  const returnToCover=()=>{setEntered(false);history.pushState(null,'',location.pathname+location.search);window.scrollTo(0,0)};
  useEffect(()=>{if(!GALLERY_PATH)return;loadGallery().then(()=>setLoaded(true)).catch(e=>setError(e.message));},[]);
  // Slideshow modal state
  const [slideshowOpen, setSlideshowOpen] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const [startWithIntro,setStartWithIntro]=useState(false);
  // Download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);

  // Client Favorites State (Persisted in localStorage for convenience)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Filter state
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Toggle favorite on an image
  const toggleFavorite = (photoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      try {
        localStorage.setItem(
          FAVORITES_KEY,
          JSON.stringify(Array.from(next))
        );
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Open slideshow at specific photo id or first photo
  const handleOpenSlideshow = (photoId?: string) => {
    setStartWithIntro(!photoId);
    if (photoId) {
      const foundIdx = GALLERY_PHOTOS.findIndex((p) => p.id === photoId);
      if (foundIdx !== -1) {
        setActivePhotoIndex(foundIdx);
      } else {
        setActivePhotoIndex(0);
      }
    } else {
      setActivePhotoIndex(0);
    }
    setSlideshowOpen(true);
  };

  const handleCloseSlideshow = () => {
    setSlideshowOpen(false);
  };

  // Filter photos if favorites filter is active
  const displayedPhotos: PhotoItem[] = showFavoritesOnly
    ? GALLERY_PHOTOS.filter((p) => favorites.has(p.id))
    : GALLERY_PHOTOS;


  if(!GALLERY_PATH)return <main className="gallery-entrance"><div className="entrance-theme"><ThemeToggle/></div><div className="entrance-copy"><MarioRomayLogo size="lg" className="entrance-logo"/><h1>Portrait galleries</h1><p style={{textTransform:'none',letterSpacing:0,lineHeight:1.8}}>Open your gallery using the personal link Mario shared with you.</p></div></main>;
  if(!loaded) return <div className="min-h-screen grid place-items-center bg-[#fafafa] text-neutral-700"><div role="status">{error || 'Loading your photographs…'}{error && <button className="block mt-4 underline" onClick={()=>location.reload()}>Try again</button>}</div></div>;

  if(!entered) return <GalleryEntrance photos={COVER_PHOTOS} photoCount={SESSION_INFO.totalDelivered} onEnter={enterGallery}/>;
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* 1. Gallery Header */}
      <GalleryHeader
        view={view}
        onChangeView={changeView}
        onReturnToCover={returnToCover}
        onStartSlideshow={() => handleOpenSlideshow()}
        onOpenDownload={() => setDownloadModalOpen(true)}
        favoritesCount={favorites.size}
        totalPhotos={SESSION_INFO.totalDelivered}
        hasPhotos={GALLERY_PHOTOS.length>0}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((prev) => !prev)}
      />

      {/* 2. Main Gallery Page */}
      <main className="flex-1">
        {GALLERY_SESSIONS.length>0 && <nav className="session-list" aria-label="Portrait sessions"><h2>Sessions</h2><div>{GALLERY_SESSIONS.map(session=><a key={session.path} href={'/'+session.path.split('/').map(encodeURIComponent).join('/')}><span>{session.title}</span><span>{session.photoCount?`${session.photoCount} photographs`:'View session'} →</span></a>)}</div></nav>}
        {/* Favorites Filter Notice if Active */}
        {showFavoritesOnly && (
          <div className="w-full px-3 sm:px-5 lg:px-8 pt-5 pb-2">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light text-neutral-950 uppercase tracking-tight">
                  {SESSION_INFO.clientName}’s Selected Favorites
                </h1>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  {favorites.size} of {GALLERY_PHOTOS.length} photographs selected for review & print
                </p>
              </div>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline font-medium"
              >
                View All Photographs
              </button>
            </div>
          </div>
        )}

        {/* Responsive Gallery Grid */}
        {GALLERY_PHOTOS.length>0 && <GalleryGrid
          view={view}
          photos={displayedPhotos}
          onPhotoClick={handleOpenSlideshow}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />}
      </main>

      {/* 3. Editorial Footer */}
      <GalleryFooter />

      <BackToTop hidden={slideshowOpen || downloadModalOpen}/>

      {/* 4. Full-Screen Slideshow View Modal */}
      <SlideshowModal
        startWithIntro={startWithIntro}
        photos={GALLERY_PHOTOS}
        currentIndex={activePhotoIndex}
        isOpen={slideshowOpen}
        onClose={handleCloseSlideshow}
        onSelectIndex={(idx) => setActivePhotoIndex(idx)}
        favorites={favorites}
        onToggleFavorite={(id) => toggleFavorite(id)}
      />

      {/* 5. Download Client Package Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        photos={GALLERY_PHOTOS}
        favorites={favorites}
      />
    </div>
  );
}

export default function App(){return <ThemeProvider><GalleryApp/></ThemeProvider>}
