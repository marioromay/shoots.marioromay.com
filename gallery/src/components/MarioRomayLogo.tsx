import React from 'react';
import {useTheme} from '../theme';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';
interface MarioRomayLogoProps {variant?:'dark'|'light';size?:'sm'|'md'|'lg';showText?:boolean;className?:string;}
export const MarioRomayLogo:React.FC<MarioRomayLogoProps>=({variant,size='md',className=''})=>{const {theme}=useTheme();return <img src={(variant||theme)==='dark'?logoDark:logoLight} alt="Mario Romay Photography" className={`photography-logo photography-logo-${size} ${className}`} />;};
