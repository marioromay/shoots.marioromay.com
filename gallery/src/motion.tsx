import React from 'react';
export const AnimatePresence=({children}:any)=>children;
export const motion={div:({initial,animate,exit,transition,style,...props}:any)=><div {...props} style={{...style,...(animate?.width?{width:animate.width,animation:`slideProgress ${transition.duration}s linear`}:{}),animationName:animate?.width?'slideProgress':'photoFade'}}/>};
