import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from '../motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Maximize,
  Minimize,
  Info,
  Clock,
  Heart,
  Camera,
  MapPin,
} from 'lucide-react';
import { PhotoItem, SESSION_INFO } from '../data/galleryData';
import { MarioRomayLogo } from './MarioRomayLogo';

interface SlideshowModalProps {
  startWithIntro?:boolean;
  photos: PhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  favorites: Set<string>;
  onToggleFavorite: (photoId: string) => void;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  startWithIntro=false,
  photos,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  favorites,
  onToggleFavorite,
}) => {
  const [phase,setPhase]=useState<'logo'|'name'|'photos'|'end'>('photos');
  // Slideshow playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(5); // default 5 seconds
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [progressKey, setProgressKey] = useState<number>(0);

  // Inactivity autohide timer ref
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch tracking for mobile swipe navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentPhoto = photos[currentIndex] || photos[0];
  const totalCount = photos.length;
  const isFavorite = currentPhoto ? favorites.has(currentPhoto.id) : false;

  // Reveal controls and reset autohide timer
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Autohide after 3.8s of no activity
    inactivityTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3800);
  }, []);

  // Next / Prev navigation
  const handleNext = useCallback(() => {
    if(currentIndex===totalCount-1){setIsPlaying(false);setPhase('end');return;}
    onSelectIndex(currentIndex + 1);
    setProgressKey((prev) => prev + 1);
    resetInactivityTimer();
  }, [currentIndex, totalCount, onSelectIndex, resetInactivityTimer]);

  const handlePrev = useCallback(() => {
    setPhase('photos');
    onSelectIndex(Math.max(0,currentIndex - 1));
    setProgressKey((prev) => prev + 1);
    resetInactivityTimer();
  }, [currentIndex, totalCount, onSelectIndex, resetInactivityTimer]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        setProgressKey((k) => k + 1);
      }
      return next;
    });
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Slideshow interval timer
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      return;
    }

    slideTimerRef.current = setInterval(() => {
      handleNext();
    }, slideDuration * 1000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isOpen, isPlaying, slideDuration, handleNext]);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Listen for fullscreen change events (e.g. user pressed Esc on browser)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetInactivityTimer();

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrev();
          break;
        case ' ': // Space for play/pause
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowInfo((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, togglePlay, onClose, toggleFullscreen, resetInactivityTimer]);

  useEffect(()=>{if(!isOpen){setIsPlaying(false);return;}setPhase(startWithIntro?'logo':'photos');const before=document.activeElement as HTMLElement;const old=document.body.style.overflow;document.body.style.overflow='hidden';const titleTimer=startWithIntro?setTimeout(()=>setPhase('name'),1600):undefined;const photoTimer=startWithIntro?setTimeout(()=>{setPhase('photos');setIsPlaying(true);},3000):undefined;containerRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close slideshow"]')?.focus();return()=>{clearTimeout(titleTimer);clearTimeout(photoTimer);document.body.style.overflow=old;clearTimeout(inactivityTimerRef.current!);before?.focus()};},[isOpen]);
  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    resetInactivityTimer();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // Detect horizontal swipe if deltaX is significantly larger than vertical delta
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Click on background or center to toggle controls visibility
  const handleCenterTap = (e: React.MouseEvent) => {
    // Only toggle if not clicking on an interactive button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    setControlsVisible((prev) => !prev);
  };

  if (!isOpen) return null;

  const displayCount = `${String(currentIndex + 1).padStart(2, '0')} / ${String(
    totalCount
  ).padStart(2, '0')}`;

  return (
    <div
      role="dialog" aria-modal="true" aria-label={`${SESSION_INFO.clientName} slideshow`}
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between select-none overflow-hidden"
      onMouseMove={resetInactivityTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleCenterTap}
      style={{ cursor: controlsVisible ? 'default' : 'none' }}
    >
      {(phase==='logo'||phase==='name') && <div className="absolute inset-0 z-50 bg-black grid place-items-center"><button className="absolute right-6 top-6 text-xs text-neutral-400" onClick={onClose}>Close</button>{phase==='logo'?<MarioRomayLogo variant="dark" size="lg"/>:<div className="text-6xl uppercase font-light tracking-tight">{SESSION_INFO.clientName}</div>}</div>}
      {phase==='end'  && <div className="absolute inset-0 z-50 bg-black grid place-items-center"><div className="flex flex-col items-center gap-10"><MarioRomayLogo variant="dark" size="lg"/><div className="text-4xl font-light uppercase">{SESSION_INFO.clientName}</div><div className="flex gap-6"><button onClick={()=>{onSelectIndex(0);setPhase('photos');setIsPlaying(true)}}>View again</button><button onClick={onClose}>Back to gallery</button></div></div></div>}
      {/* 1. TOP CONTROLS BAR (Minimal, disappearing) */}
      <header
        className={`absolute top-0 left-0 right-0 z-30 transition-all duration-300 pointer-events-auto ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Photographer Brand Mark */}
          <div className="flex items-center gap-3">
            <MarioRomayLogo variant="dark" size="sm" />
            <span className="hidden sm:inline-block text-[11px] text-neutral-400 font-mono tracking-wider">
              {SESSION_INFO.clientName} · Portrait Collection
            </span>
          </div>

          {/* Right Action Island: Counter, Info, Fullscreen, Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Image Counter */}
            <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-xs font-mono tabular-nums text-xs text-white/90 tracking-widest">
              {displayCount}
            </div>

            {/* Favorite Toggle */}
            <button
              onClick={() => onToggleFavorite(currentPhoto.id)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              title={isFavorite ? 'Remove from client favorites' : 'Mark as favorite'}
              aria-label="Toggle favorite"
            >
              <Heart size={15} className={isFavorite ? 'fill-white' : ''} />
            </button>

            {/* Technical EXIF / Info toggle */}
            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                showInfo ? 'bg-white text-neutral-950' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              title="View photograph filename"
              aria-label="Toggle photograph details"
            >
              <Info size={15} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-md transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
              aria-label="Full screen"
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>

            {/* Close / Return to Gallery */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-95"
              title="Close slideshow (Esc)"
              aria-label="Close slideshow"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN PHOTOGRAPH STAGE (Centered, largest possible without cropping) */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.008 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-full max-w-full flex items-center justify-center"
          >
            <img
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className="max-h-[86vh] sm:max-h-[88vh] max-w-[94vw] w-auto h-auto object-contain drop-shadow-2xl select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Side Arrow Controls (Disappearing with hover) */}
        <div
          className={`absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-6 pointer-events-none transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handlePrev}
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
            title="Previous photograph (Left Arrow)"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div
          className={`absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-6 pointer-events-none transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleNext}
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
            title="Next photograph (Right Arrow)"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Optional EXIF Drawer Overlay on right */}
        {showInfo && (
          <div className="absolute bottom-20 right-4 sm:right-8 max-w-xs sm:max-w-sm bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-4 sm:p-5 text-left rounded-md shadow-2xl z-40 transition-all">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  {currentPhoto.title}
                </h4>

              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {currentPhoto.narrative && (
              <p className="text-xs text-neutral-300 italic py-3 border-b border-white/10 leading-relaxed">
                "{currentPhoto.narrative}"
              </p>
            )}

            <p className="pt-3 text-xs text-neutral-400">Original filename: {currentPhoto.id}</p>
          </div>
        )}
      </main>

      {/* 3. BOTTOM CONTROLS & CAPTION BAR (Disappearing, sleek) */}
      <footer
        className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 pointer-events-auto ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 sm:px-8 py-4 sm:py-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Photograph Title & Location Info */}
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-medium tracking-wide text-white/95">
              {currentPhoto.title}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Original uploaded photograph
            </p>
          </div>

          {/* Slideshow Player Center Controls: Play/Pause, Timing Selector (3s / 5s / 8s) */}
          <div className="flex items-center gap-3 self-center sm:self-auto bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-colors flex items-center justify-center"
              title={isPlaying ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current translate-x-0.5" />}
            </button>

            {/* Timing Selector: 3 sec / 5 sec / 8 sec */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 pl-1 border-l border-white/10">
              <Clock size={11} className="text-neutral-500 mr-1" />
              {[3, 5, 8].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setSlideDuration(sec);
                    setProgressKey((k) => k + 1);
                    resetInactivityTimer();
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    slideDuration === sec
                      ? 'bg-white/20 text-white font-semibold'
                      : 'hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Keyboard Hints (subtle) */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-neutral-500">
            <span>[← / →] Navigate</span>
            <span>[Space] {isPlaying ? 'Pause' : 'Play'}</span>
            <span>[F] Fullscreen</span>
            <span>[Esc] Exit</span>
          </div>
        </div>

        {/* Subtle timer progress bar when auto-playing */}
        {isPlaying && (
          <div className="w-full h-0.5 bg-white/10 overflow-hidden">
            <motion.div
              key={progressKey}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: slideDuration, ease: 'linear' }}
              className="h-full bg-white/70"
            />
          </div>
        )}
      </footer>
    </div>
  );
};
