import React,{createContext,useContext,useEffect,useState} from 'react';
import {Sun,Moon} from 'lucide-react';
type Theme='dark'|'light';
const ThemeContext=createContext<{theme:Theme;toggle:()=>void}>({theme:'dark',toggle:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [theme,setTheme]=useState<Theme>(()=>{try{return localStorage.getItem('mario_gallery_theme')==='light'?'light':'dark'}catch{return 'dark'}});
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;try{localStorage.setItem('mario_gallery_theme',theme)}catch{}},[theme]);
 return <ThemeContext.Provider value={{theme,toggle:()=>setTheme(t=>t==='dark'?'light':'dark')}}><div className="theme-root" data-theme={theme}>{children}</div></ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
export function ThemeToggle(){const {theme,toggle}=useTheme();return <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} title={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>}
