import React, { useEffect, useRef } from 'react';
import client from '../../api/client';

const InspectDetector = () => {
  const alertedRef = useRef(false);

  useEffect(() => {
    let publicIp = '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Fetch WAN public IP from ipify API for 100% accuracy on live sites
    fetch('https://api.ipify.org?format=json', { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        return res.ok ? res.json() : Promise.reject();
      })
      .then(data => {
        if (data && data.ip) publicIp = data.ip;
      })
      .catch(() => {
        clearTimeout(timeoutId);
      });

    const triggerAlert = (details) => {
      // Throttle alerts: max 1 notification per 10 seconds per session
      if (alertedRef.current) return;
      alertedRef.current = true;
      setTimeout(() => { alertedRef.current = false; }, 10000);

      client.post('/api/public/inspect-alert', {
        page: window.location.pathname,
        details: details || 'DevTools / Inspect Element opened on Admin section',
        clientIp: publicIp
      }).catch(() => {});
    };

    // 1. Keyboard shortcuts listener (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toUpperCase() : '';

      if (
        key === 'F12' ||
        (isCmdOrCtrl && isShift && (key === 'I' || key === 'J' || key === 'C')) ||
        (isCmdOrCtrl && key === 'U')
      ) {
        triggerAlert(`Keyboard inspect shortcut pressed (${key})`);
      }
    };

    // 2. Context Menu (Right Click Inspect)
    const handleContextMenu = () => {
      triggerAlert('Right-Click Inspect Context Menu Triggered');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return null;
};

export default InspectDetector;

