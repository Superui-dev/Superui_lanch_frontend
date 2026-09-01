import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll position to top whenever pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Reset immediately without transition
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
