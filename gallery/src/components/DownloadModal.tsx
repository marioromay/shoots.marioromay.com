import { downloadZip } from '../downloadZip';
import React, { useState, useEffect } from 'react';
import { X, Download, Check, ShieldCheck, FileArchive, Heart } from 'lucide-react';
import { PhotoItem, SESSION_INFO } from '../data/galleryData';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  favorites: Set<string>;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  photos,
  favorites,
}) => {
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(()=>{if(!isOpen)return;const before=document.activeElement as HTMLElement;const old=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',onKey);before?.focus()};},[isOpen]);
  if (!isOpen) return null;

  const favoritePhotos = photos.filter((p) => favorites.has(p.id));

  // Trigger download of an image
  const handleDownloadSingle = (photo: PhotoItem) => {
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `${photo.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Downloaded "${photo.title}"`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadZip = async (type: 'all' | 'favorites') => {
    setDownloadingZip(true);setDownloadSuccess(null);
    try {const chosen=type==='all'?photos:favoritePhotos;await downloadZip(chosen,`MarioRomay_${SESSION_INFO.clientName.replace(/[^a-z0-9_-]/gi,'_')}_${type}.zip`);setDownloadSuccess(`Download ready: ${chosen.length} photographs`);}catch(e){setDownloadSuccess((e as Error).message);}finally{setDownloadingZip(false);}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-xl bg-white border border-neutral-200 shadow-2xl rounded-lg overflow-hidden text-neutral-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h3 id="download-title" className="text-base font-semibold text-neutral-950">
              Download Gallery Collection
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {SESSION_INFO.clientName} · {SESSION_INFO.sessionType} ({SESSION_INFO.year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {downloadSuccess && (
            <div className="p-3 bg-neutral-950 text-white text-xs rounded-md flex items-center gap-2 animate-fadeIn">
              <Check size={14} className="text-emerald-400" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Package Download Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Bulk Download Packages
            </h4>

            {/* Option 1: Full Gallery */}
            <div className="p-4 border border-neutral-200 rounded-md hover:border-neutral-400 transition-all flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
                  <FileArchive size={18} className="text-neutral-800" />
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">
                    Complete Gallery Archive
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    All {photos.length} photographs · Original uploaded JPEGs
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadZip('all')}
                disabled={downloadingZip}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-50 shrink-0"
              >
                <Download size={13} />
                <span>{downloadingZip ? 'Packaging...' : 'Download All'}</span>
              </button>
            </div>

            {/* Option 2: Client Selects / Favorites */}
            {favorites.size > 0 && (
              <div className="p-4 border border-neutral-200 rounded-md hover:border-neutral-400 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-rose-50 flex items-center justify-center shrink-0">
                    <Heart size={18} className="text-rose-500 fill-rose-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      My Favorites Package
                    </div>
                    <div className="text-xs text-neutral-500 font-mono">
                      {favoritePhotos.length} selected frames
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadZip('favorites')}
                  disabled={downloadingZip}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50 shrink-0"
                >
                  <Download size={13} />
                  <span>Download ({favorites.size})</span>
                </button>
              </div>
            )}
          </div>

          {/* Individual Frames */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Individual Photographs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 border border-neutral-100 hover:border-neutral-200 rounded-md text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-neutral-400 text-[10px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate font-medium text-neutral-800">{p.title}</span>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(p)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors shrink-0"
                    title={`Download ${p.title}`}
                  >
                    <Download size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Client Rights & Usage statement */}
          <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200/60 flex items-start gap-2.5 text-xs text-neutral-600">
            <ShieldCheck size={16} className="text-neutral-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Downloads contain the original photographs uploaded for this gallery. Favorites are saved only in this browser.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
