import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSiteUrl } from '@/lib/siteUrl';
import { getSeoForPath, SEO_DEFAULT_OG_IMAGE } from '@/lib/seoConfig';
import { getBlogPageSeo } from '@/lib/blogSeoData';

function setMeta(attrName, value, useProperty = false) {
  const attr = useProperty ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${attrName}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, attrName);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeJsonLd() {
  document.head.querySelectorAll('script[data-fr-seo-jsonld]').forEach((n) => n.remove());
}

function injectJsonLd(id, json) {
  removeJsonLd();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-fr-seo-jsonld', id);
  script.textContent = JSON.stringify(json);
  document.head.appendChild(script);
}

export default function Seo() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const base = getSiteUrl();
    const pathOnly = pathname.split('?')[0] || '/';
    const canonicalPath = pathOnly.endsWith('/') && pathOnly.length > 1 ? pathOnly.slice(0, -1) : pathOnly;
    const canonical = base ? `${base}${canonicalPath === '/' ? '/' : canonicalPath}` : '';

    const seo = getBlogPageSeo(canonicalPath) || getSeoForPath(pathname);

    document.title = seo.title;

    setMeta('description', seo.description);
    setMeta('robots', seo.robots || 'index, follow');

    const ogUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '');
    const ogImage = base ? `${base}${SEO_DEFAULT_OG_IMAGE}` : '';

    setMeta('og:title', seo.title, true);
    setMeta('og:description', seo.description, true);
    setMeta('og:type', 'website', true);
    if (ogUrl) setMeta('og:url', ogUrl, true);
    setMeta('og:locale', seo.ogLocale || 'fr_CH', true);
    if (ogImage) setMeta('og:image', ogImage, true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    if (ogImage) setMeta('twitter:image', ogImage);

    if (canonical) {
      setLink('canonical', canonical);
    }

    if (seo.jsonLd === 'home' && base) {
      injectJsonLd('home', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${base}/#organization`,
            name: 'FreshRescue',
            url: base,
            logo: `${base}/logo512.png`,
            description: seo.description,
            areaServed: { '@type': 'Country', name: 'Switzerland' },
          },
          {
            '@type': 'WebSite',
            '@id': `${base}/#website`,
            url: base,
            name: 'FreshRescue',
            publisher: { '@id': `${base}/#organization` },
            inLanguage: 'fr-CH',
          },
        ],
      });
    } else {
      removeJsonLd();
    }
  }, [pathname]);

  return null;
}
