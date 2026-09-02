import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    branding: {
      logoUrl: '',
      logoText: 'SuperUI',
      showLogo: true,
      showLogoText: true,
      location: 'Telangana, India'
    },
    navbar: {
      menuItems: [
        { label: 'Home', url: '/' },
        { label: 'Products', url: '/products' },
        { label: 'Portfolio', url: '/portfolio' },
        { label: 'Contact', url: '/contact' }
      ]
    },
    footer: {
      copyrightText: '© 2026 SuperUI. All rights reserved.',
      description: 'Premium digital products for modern creators. Websites, templates, e-books, and more.',
      columns: [
        {
          title: 'Products',
          links: [
            { label: 'All Products', url: '/products' },
            { label: 'E-Books', url: '/products?category=ebooks' },
            { label: 'Templates', url: '/products?category=templates' },
            { label: 'Websites', url: '/products?category=websites' }
          ]
        },
        {
          title: 'Portfolio',
          links: [
            { label: 'E-Books', url: '/portfolio?category=ebooks' },
            { label: 'Templates', url: '/portfolio?category=templates' },
            { label: 'Websites', url: '/portfolio?category=websites' },
            { label: 'UI Kits', url: '/portfolio?category=ui-kits' }
          ]
        },
        {
          title: 'Support',
          links: [
            { label: 'Contact', url: '/contact' },
            { label: 'FAQ', url: '/contact' },
            { label: 'Terms', url: '/contact' },
            { label: 'Privacy', url: '/contact' }
          ]
        }
      ]
    },
    contact: {
      email: 'hello.superui@gmail.com',
      phone: '',
      address: '',
      supportHours: ''
    },
    socialLinks: {},
    seo: {
      title: 'SuperUI - Premium Digital Products',
      description: 'Premium digital products for modern creators.',
      keywords: [],
      ogImage: ''
    },
services: [
  {
    title: 'Website Development',
    description: 'Modern, responsive websites built for performance, usability, and business growth.',
    image: 'https://beeimg.com/images/w86857036683.jpg',
    bgImage: '',
    link: '/contact',
    order: 1,
    visible: true,
    code: ''
  },
  {
    title: 'E-commerce Development',
    description: 'Complete online stores with products, cart, checkout, payments, orders, and admin management.',
    image: 'https://beeimg.com/images/o35174122281.jpg',
    bgImage: '',
    link: '/contact',
    order: 2,
    visible: true,
    code: ''
  },
  {
    title: 'SaaS Development',
    description: 'Scalable SaaS applications with authentication, dashboards, APIs, databases, and business workflows.',
    image: 'https://beeimg.com/images/u04927086191.jpg',
    bgImage: '',
    link: '/contact',
    order: 3,
    visible: true,
    code: ''
  },
  {
    title: 'Landing Pages & Admin Dashboards',
    description: 'High-converting landing pages and powerful admin dashboards designed for clarity, speed, and results.',
    // image: 'https://beeimg.com/images/c97481393421.jpg',
    image: 'https://beeimg.com/images/j54848926372.jpg',
    bgImage: '',
    link: '/contact',
    order: 4,
    visible: true,
    code: ''
  },
  {
    title: 'Deployment, Hosting & Maintenance',
    description: 'Reliable deployment, domain setup, SSL, hosting configuration, updates, monitoring, and ongoing support.',
    image: 'https://beeimg.com/images/n70427487082.jpg',
    bgImage: '',
    link: '/contact',
    order: 5,
    visible: true,
    code: ''
  },
  {
    title: 'AI Agents & n8n Automation',
    description: 'AI-powered agents and automated workflows that connect your apps, APIs, databases, and business processes.',
    image: 'https://beeimg.com/images/i14229409713.jpg',
    bgImage: '',
    link: '/contact',
    order: 6,
    visible: true,
    code: ''
  }
]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, servicesRes] = await Promise.allSettled([
          client.get('/api/public/settings', { silent: true, timeout: 5000 }),
          client.get('/api/public/services', { silent: true, timeout: 5000 })
        ]);

        let updated = {};
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.success && settingsRes.value?.data?.data) {
          updated = { ...settingsRes.value.data.data };
        }
        if (servicesRes.status === 'fulfilled' && servicesRes.value?.data?.success && Array.isArray(servicesRes.value?.data?.data)) {
          updated.services = servicesRes.value.data.data;
        }

        setSettings(prev => ({ ...prev, ...updated }));
      } catch (err) {
        // Quiet fallback to default settings
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return { settings: {}, loading: false };
  }
  return context;
};
