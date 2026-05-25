import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export function LanguageSelector() {
  useEffect(() => {
    // Prevent adding multiple scripts
    if (document.getElementById('google-translate-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { 
          pageLanguage: 'en',
          includedLanguages: 'en,hi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
        },
        'google_translate_element'
      );
    };
  }, []);

  return (
    <div className="flex items-center" style={{ minWidth: '130px' }}>
      <div id="google_translate_element" className="google-translate-container"></div>
    </div>
  );
}
