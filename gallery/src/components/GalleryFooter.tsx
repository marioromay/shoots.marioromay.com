import React from 'react';
import {SESSION_INFO} from '../data/galleryData';
export function GalleryFooter(){return <footer className="gallery-footer"><span>© {new Date().getFullYear()} Mario Romay Photography</span><span>{SESSION_INFO.clientName} · {SESSION_INFO.totalDelivered} photographs</span></footer>}
