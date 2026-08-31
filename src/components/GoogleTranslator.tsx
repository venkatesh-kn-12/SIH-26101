'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslator() {
  useEffect(() => {
    // Add Google Translate Script dynamically
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,kn,te,ta,mr,bn,gu,ml,or,pa',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  return (
    <div id="google-translate-element" style={{ display: 'none' }} />
  );
}

/**
 * Programmatically triggers Google Translate for 100% full-module DOM translation
 */
export function changeModuleLanguage(langCode: string) {
  if (typeof window === 'undefined') return;

  const cookieVal = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  
  // Reload to force Google Translate to translate 100% of DOM content across all modules
  window.location.reload();
}
