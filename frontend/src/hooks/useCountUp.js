import React, { useEffect, useRef } from 'react';

const useCountUp = (end = 0, duration = 800) => {
  const target = typeof end === 'number' && !isNaN(end) ? end : 0;
  const [count, setCount] = React.useState(target);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = null;
    let raf;

    const animate = (timestamp) => {
      if (timestamp === undefined || timestamp === null) return;
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - (startTime.current || timestamp);
      const progress = Math.min(elapsed / (duration || 800), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return count;
};

export default useCountUp;
