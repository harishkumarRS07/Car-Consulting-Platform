import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Method 1: requestAnimationFrame for next frame
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    // Method 2: Immediate scroll
    window.scrollTo(0, 0);

    // Method 3: Double check with timeout
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, [pathname]);

  return null;
}
