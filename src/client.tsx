import React from 'react';
import {render} from 'react-dom';
import {HashRouter} from "react-router-dom";
import App from './components/app';

if (window) {
  render(
    <HashRouter>
      <App initialLocale={sessionStorage.getItem('language') || navigator.language} />
    </HashRouter>,
    document.getElementById('root'));
}
