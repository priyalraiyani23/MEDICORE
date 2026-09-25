import { useEffect } from 'react';

/**
 * SEOHead — Updates document title and meta tags for each page.
 * Uses direct DOM manipulation since React doesn't support <head> updates natively without react-helmet.
 *
 * @param {string} title       — Full page title (shown in browser tab + Google)
 * @param {string} description — Meta description (shown in Google search results, 150-160 chars)
 * @param {string} keywords    — Optional meta keywords
 * @param {string} canonical   — Optional canonical URL for this page
 */
const SEOHead = ({ title, description, keywords, canonical }) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Helper: upsert a <meta> tag by name or property
    const setMeta = (attr, key, value) => {
      if (!value) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Helper: upsert a <link> tag
    const setLink = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);

    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);

    // Twitter
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    // Canonical
    if (canonical) setLink('canonical', canonical);

    return () => {
      // Reset to default on unmount
      document.title = 'MEDICORE — Excellence In Healthcare';
    };
  }, [title, description, keywords, canonical]);

  return null;
};

export default SEOHead;
