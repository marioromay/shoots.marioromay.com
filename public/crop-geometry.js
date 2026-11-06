// Normalized source-image coordinates. The stored image is never changed.
export function normalizeCrop(value){
 if(!value||typeof value!=='object')return null;
 const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
 const x=clamp(value.x,0,.99,0),y=clamp(value.y,0,.99,0);
 const w=clamp(value.w,.01,1-x,1-x),h=clamp(value.h,.01,1-y,1-y);
 if(x===0&&y===0&&w===1&&h===1)return null;
 return {x,y,w,h};
}
export function croppedRatio(ratio,crop){const c=normalizeCrop(crop);return ratio*(c?c.w/c.h:1)}
export function cropSourceRect(width,height,crop){const c=normalizeCrop(crop)||{x:0,y:0,w:1,h:1};return {x:c.x*width,y:c.y*height,w:c.w*width,h:c.h*height}}
