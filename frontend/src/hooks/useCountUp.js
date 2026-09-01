import React, { useEffect, useRef } from 'react';

const useCountUp = (end, duration = 800) => {
  const [count, setCount] = React.useState(end);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = null;
    let raf;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return count;
};

export default useCountUp;
