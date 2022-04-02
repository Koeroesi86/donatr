import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import App from './components/app';
import {getCookie} from "./utils/cookies";
import {Translations} from "./types";
import {AppState} from "./redux";

declare global {
  interface Window {
    initialTranslations: Translations;
    initialState: AppState;
  }
}

if (typeof window !== 'undefined') {
  if (window.location.hash.indexOf('#/') === 0) {
    const target = new URL(window.location.href);
    target.hash = '';
    target.pathname = window.location.hash.replace('#/', '/');
    window.location.replace(target);
  }
  const initialMode = getCookie('mode');
  render(
    <BrowserRouter>
      <App
        initialLocale={getCookie('language') || navigator.language}
        initialTranslations={window.initialTranslations}
        initialMode={('dark' === initialMode || 'light' === initialMode) ? initialMode : undefined}
      />
    </BrowserRouter>,
    document.getElementById('root')
  );
  document.querySelector('#server-css')?.remove();

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => {
        // Listen for updates:
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          // Listen for when the new worker is ready:
          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  console.log('Updated service worker.');
                }
                break;
            }
          });
        });
      })
      .catch(console.error);
  }
}
