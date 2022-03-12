import React from 'react';
import {hydrate, render} from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import App from './components/app';

if (typeof window !== 'undefined') {
  if (window.location.hash.indexOf('#/') === 0) {
    const target = new URL(window.location.href);
    target.hash = '';
    target.pathname = window.location.hash.replace('#/', '/');
    window.location.replace(target);
  }
  render(
    <BrowserRouter>
      <App initialLocale={sessionStorage.getItem('language') || navigator.language} />
    </BrowserRouter>,
    document.getElementById('root')
  );
}
