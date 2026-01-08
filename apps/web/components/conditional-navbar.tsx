'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on map viewer and embed pages
  const hideNavbar = pathname?.startsWith('/maps/') && !pathname?.startsWith('/maps?') || pathname?.startsWith('/embed/');
  
  if (hideNavbar) {
    return null;
  }
  
  return <Navbar />;
}
