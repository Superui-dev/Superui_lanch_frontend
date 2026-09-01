import React, { useEffect } from 'react';

const SEO = ({ title, description, keywords }) => {
  const defaultTitle = "SuperUI | Digital Products, Web Development, UI/UX Design & AI Automation";
  const defaultDesc = "SuperUI by AKHIL THADAKA (Warangal, Telangana, India). Premium Website Templates, SaaS Kits, Custom Development, AI Agents, UI/UX Design & Technical SEO.";
  const defaultKeywords = "Website templates, SaaS starter kits, UI kits, Figma designs, React Next.js templates, Web development, AI chatbot development, n8n automation, UI UX design, Technical SEO, AKHIL THADAKA, Warangal Telangana India";

  useEffect(() => {
    document.title = title ? `${title} | SuperUI` : defaultTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || defaultDesc);
    }

    // Update meta keywords
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) {
      metaKw.setAttribute('content', keywords || defaultKeywords);
    }
  }, [title, description, keywords]);

  return null;
};

export default SEO;
